<script lang="ts">
	import {
		afterNavigate,
		beforeNavigate,
		goto,
		invalidate,
		invalidateAll,
		pushState
	} from '$app/navigation';
	import { navigating, page } from '$app/state';
	import PaneContent from '$lib/components/board/pane-content.svelte';
	import TrainCard from '$lib/components/train/train-card.svelte';
	import type { Train } from '$lib/types/train';
	import { Spring } from 'svelte/motion';
	import { scrollY } from 'svelte/reactivity/window';
	import { crossfade, fade, fly, scale, slide } from 'svelte/transition';

	import Swipable from '$lib/components/ui/swipable.svelte';
	import type { PageData } from './$types';
	import { operatorList } from '$lib/data/operators';
	import {
		ArrowDown,
		ArrowUp,
		Bookmark,
		ChevronLeft,
		Clock,
		Edit,
		Ellipsis,
		EllipsisVertical,
		Pencil,
		Plus,
		Tv,
		X
	} from 'lucide-svelte';
	import StationSearch from '$lib/components/ui/station-search.svelte';
	import { onDestroy, onMount, tick, untrack, type Snippet } from 'svelte';
	import dayjs from 'dayjs';
	import Refreshbar from '$lib/components/ui/refreshbar.svelte';
	import type { BoardDetails } from '$lib/types';
	import Skeleton from '$lib/components/ui/skeleton.svelte';
	import SkeletonTrainCard from '$lib/components/train/skeleton-train-card.svelte';
	import { flip } from 'svelte/animate';
	import SaveToggle from '$lib/components/board/save-toggle.svelte';
	import { DropdownMenu } from 'bits-ui';
	import TimeDropdown from '$lib/components/ui/time-dropdown.svelte';
	import { quadInOut, quadOut, quartInOut, quartOut } from 'svelte/easing';
	import TrainSaveToggle from '$lib/components/train/train-save-toggle.svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { pan, swipe, type PanCustomEvent } from 'svelte-gestures';
	import { dontMove } from '$lib/state/dont-move.svelte';
	import { refresher } from '$lib/state/refresh.svelte';

	const [titleSend, titleReceive] = crossfade({ duration: 250, easing: quadInOut });
	const [send, receive] = crossfade({ duration: 400, easing: quartOut });

	let { data, children }: { data: PageData; children: Snippet } = $props();

	let pageElmRef: HTMLDivElement | undefined = $state(undefined);
	let headerExpanded = $state(true);
	let refreshing = $state(true);
	let scrollYLocked = $state(0);
	let lastUpdated = $state(dayjs());
	let timeout: { cleared: boolean; clear: () => void };

	let details: BoardDetails | null = $state(null);
	let trains: Train[] | null = $state(null);

	const md = new MediaQuery('(min-width: 768px)');

	class Timeout {
		private id: number;
		public cleared: boolean;

		constructor(fn: () => void, interval: number) {
			this.id = setTimeout(fn, interval);
			this.cleared = false;
		}

		clear(): void {
			this.cleared = true;
			clearTimeout(this.id);
		}
	}

	$effect(() => {
		refreshing = true;
		data.board.then((b) => {
			refreshing = false;

			lastUpdated = dayjs();
			details = b.details;
			trains = b.trains;
			timeout?.clear();
			timeout = new Timeout(refresh, 10000);
		});
	});

	$effect(() => {
		if (page.data.id && !md.current) {
			untrack(() => {
				document.body.style.position = 'fixed';
				document.body.style.top = `-${scrollYLocked}px`;
			});
		} else {
			untrack(() => {
				const scrollY = document.body.style.top;
				document.body.style.position = '';
				document.body.style.top = '';
				window.scrollTo(0, parseInt(scrollY || '0') * -1);
			});
		}
	});

	$effect(() => {
		if (scrollYLocked > 80) {
			untrack(() => {
				headerExpanded = false;
			});
		} else {
			untrack(() => {
				headerExpanded = true;
			});
		}
	});

	async function refresh() {
		refreshing = true;
		timeout?.clear();
		const res = await fetch(
			`/api/board/${page.params.crs}/${data.to ?? 'null'}/${data.time ?? 'null'}/${data.toc ?? 'null'}`
		);
		const newData = await res.json();
		trains = newData.trains;
		details = newData.details;
		setTimeout(() => {
			timeout = new Timeout(refresh, 10000);
			lastUpdated = dayjs();
			refreshing = false;
		}, 500);
	}

	function adjust(from: string, to: string | null, time: string | null, toc: string | null = null) {
		refreshing = true;
		timeout?.clear();

		console.log(time);

		let pathname = page.url.pathname;

		if (data.crs !== from) {
			pathname = `/board/${from}`;
		}

		const params = new URLSearchParams();
		if (to) {
			params.set('to', to);
		}
		if (time) {
			params.set('time', time.replace(':', ''));
		}
		if (toc) {
			params.set('toc', toc);
		}

		goto(pathname + '?' + params.toString(), { replaceState: true });
	}

	onDestroy(() => {
		timeout?.clear();
	});

	$effect(() => {});

	const coords = new Spring({ x: 0, y: 0, scale: 1 });
	let startX = $state(0);
	let startY = $state(0);

	function handlePan(e: PanCustomEvent) {
		if (!md.current && !dontMove.current) {
			const x = Math.max(-35, e.detail.x - startX);
			const y = Math.max(-5, e.detail.y - startY);
			coords.set({ x, y, scale: 1 });
			if (Math.sqrt(x * x + y * y) > 250) {
				goto(data.url + '?' + data.searchParams, { noScroll: true });
			}
		}
	}

	onMount(() => {
		const refresh = refresher.add(async () => {
			console.log('refreshing trains');
			refreshing = true;
			timeout?.clear();
			const res = await fetch(
				`/api/board/${page.params.crs}/${data.to ?? 'null'}/${data.time ?? 'null'}/${data.toc ?? 'null'}`
			);
			const newData = await res.json();
			trains = newData.trains;
			details = newData.details;
			setTimeout(() => {
				refreshing = false;
			}, 500);
		});
		return () => {
			refresher.remove(refresh);
		};
	});
</script>

<svelte:window
	onscroll={() => {
		scrollYLocked =
			document.body.style.position === 'fixed' ? scrollYLocked : (scrollY.current ?? 0);
	}}
/>

<div class={['bg-muted w-screen md:h-screen']}>
	<div class="bg-muted mx-auto flex w-full max-w-screen-xl md:h-screen md:gap-4 md:p-4">
		<div
			bind:this={pageElmRef}
			class={[
				'bg-background border-border flex h-full w-full flex-col overflow-hidden transition-all duration-300 md:max-w-[500px] md:rounded-lg md:border'
			]}
		>
			<div
				class={[
					'bg-background pt-safe border-border fixed top-0 left-0 z-20 w-full transition-all md:static md:w-full',
					scrollYLocked > 10 && !md.current && 'border-b drop-shadow-sm'
				]}
			>
				<div class="border-border flex h-[50px] items-center pb-3">
					<a href="/" class="flex h-full w-14 items-center justify-center"><ChevronLeft /></a>
					<button
						class="flex flex-grow flex-col items-center justify-center text-center font-medium"
						onclick={() => (headerExpanded = true)}
					>
						{navigating.to?.url.pathname.includes('board')}
						{navigating.from?.url.pathname.includes('board')}
						{#if details}
							{#if !headerExpanded && !md.current}
								<div
									class="flex flex-col items-center justify-center"
									in:titleReceive|global={{ key: 'title' }}
									out:titleSend|global={{ key: 'title' }}
								>
									<div class="flex">
										<div class="h-max w-max font-semibold backface-hidden">
											{details.name}
										</div>
										<div class="h-1 w-1"></div>
									</div>
									<div class="-mt-0.5 flex gap-2">
										<div class="text-foreground-muted flex items-center gap-1 text-xs font-light">
											to {details?.to ?? 'anywhere'}
										</div>
										<div class="flex items-center gap-1 text-xs">
											<Clock size={12} />
											{data.time ?? 'now'}
										</div>
									</div>
								</div>
							{/if}
						{/if}
					</button>
					<div class="flex w-14 justify-center">
						{#if details}
							<SaveToggle from={data.crs} to={data.to} time={data.time} />
						{/if}
					</div>
				</div>
				<div
					class={[
						'flex w-full items-start px-4 transition-all duration-300',
						headerExpanded || md.current ? 'h-[85px] duration-300' : 'h-0 delay-100'
					]}
				>
					{#if details}
						<div in:fade|global={{ duration: 300 }} class="h-[90px]">
							{#if headerExpanded || md.current}
								<div
									class="h-[90px] w-full pb-1"
									in:titleReceive|global={{ key: 'title' }}
									out:titleSend|global={{ key: 'title' }}
								>
									<StationSearch
										hidden={data.to}
										class="w-full"
										onselect={(s) => adjust(s, data.to, data.time)}
									>
										{#snippet children(selected)}
											<div
												class="border-border/90 hover:bg-muted bg-card flex h-max w-max items-center gap-1 rounded-md border px-2.5 py-1 text-3xl font-semibold drop-shadow-xs transition-all"
											>
												<div class="z-30 w-max text-3xl font-semibold text-nowrap backface-hidden">
													{selected ?? details?.name}
												</div>
											</div>
										{/snippet}
									</StationSearch>
									<div class="flex items-center gap-1.5 pt-1.5">
										<div class="flex">
											<StationSearch
												hidden={data.crs}
												selected={data.to}
												onselect={(s) => adjust(data.crs, s, data.time)}
											>
												{#snippet children(selected)}
													<div
														class={[
															'bg-card hover:bg-muted border-border/90 flex w-max items-center gap-2 rounded-l-md border px-1.5 py-0.5 text-sm drop-shadow-xs transition-all',
															!selected && !details?.to ? 'rounded-r-md opacity-80' : ''
														]}
													>
														{#if selected}
															to {selected}
														{:else if details?.to}
															to {details?.to}
														{:else}
															<div class="text-foreground-muted flex items-center gap-0.5">
																<Plus size={16} /> Add destination
															</div>
														{/if}
													</div>
												{/snippet}
											</StationSearch>
											{#if details?.to}
												<button
													onclick={() => {
														if (details && details.to) {
															details.to = null;
														}

														adjust(data.crs, null, data.time);
													}}
													class="bg-card border-border hover:bg-muted flex aspect-square h-[26px] items-center justify-center rounded-r border border-l-0 drop-shadow-xs transition-all"
												>
													<X size={14} />
												</button>
											{/if}
										</div>
										<div>
											<TimeDropdown
												time={data.time}
												onselect={(s) => adjust(data.crs, data.to, s)}
											/>
										</div>
									</div>
								</div>
							{/if}
						</div>
					{:else}
						<div class="flex h-[80px] flex-col justify-end gap-2 pb-2">
							<Skeleton class="h-[30px] w-72" />
							<div class="flex gap-2">
								<Skeleton class="h-[20px] w-[135px]" />
								<Skeleton class="h-[20px] w-[50px]" />
							</div>
						</div>
					{/if}
				</div>
				{#if details}
					<div
						in:fade|global={{ duration: 300 }}
						class="flex w-full flex-nowrap gap-1 overflow-x-scroll px-4 pb-2"
					>
						{#each details.operators as op (op)}
							<div
								animate:flip={{ duration: 200 }}
								class="flex transform-gpu rounded-md drop-shadow"
								transition:fade={{ duration: 150 }}
							>
								<button
									onclick={() => {
										if ((details?.operators?.length ?? 0) > 1) {
											adjust(data.crs, data.to, data.time, data.toc ? null : op);
											data.toc = data.toc ? null : op;
										}
									}}
									class={[
										'relative flex h-[26px] items-center overflow-hidden px-2 py-0.5 text-sm text-nowrap transition-all duration-200 ease-in-out',
										data.toc === op ? 'rounded-l-md' : 'rounded-md'
									]}
									style:background={operatorList[op].bg}
									style:color={operatorList[op].text}
								>
									{operatorList[op].name}
								</button>
								<div
									class={[
										'h-[26px] overflow-hidden transition-all duration-200',
										data.toc === op ? 'min-w-[26px]' : 'min-w-0'
									]}
								>
									{#if data.toc === op}
										<button
											class="border-border bg-card flex aspect-square h-[26px] min-w-[26px] items-center justify-center rounded-r-md border"
											onclick={() => {
												data.toc = null;
												adjust(data.crs, data.to, data.time, null);
											}}><X size={14} /></button
										>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="flex gap-2 px-4 pb-2">
						<Skeleton class="h-[25px] w-72" />
						<Skeleton class="h-[25px] w-72" />
					</div>
				{/if}
				<Refreshbar />
			</div>

			<div class="pt-safe md:hidden"></div>
			<div class="h-[170px] md:hidden"></div>
			{#if trains !== null}
				<div
					in:fade|global={{ duration: 400 }}
					class="md:border-border flex flex-grow flex-col overflow-y-scroll overscroll-y-auto"
				>
					<button
						onclick={() => {
							const time = data.time
								? dayjs()
										.set('hour', parseInt(data.time.substring(0, 2)))
										.set('minute', parseInt(data.time.substring(2, 4)))
										.subtract(30, 'minute')
										.format('HHmm')
								: dayjs().subtract(30, 'minute').format('HHmm');
							adjust(data.crs, data.to, time, data.toc);
						}}
						class="flex items-center gap-1 p-4 text-left"
						><ArrowUp size={16} /> Earlier trains</button
					>
					{#each trains as train, i (train.id)}
						<div
							class={['group relative flex h-20', i % 2 === 0 ? 'bg-muted' : 'bg-card']}
							animate:flip={{ duration: 200 }}
							out:slide={{ duration: 200 }}
						>
							<div
								class="z-10 h-full w-1.5"
								style:background={operatorList[train.operator].bg}
							></div>

							<a
								transition:fade={{ duration: 200, delay: 100 }}
								href="{data.url}/train/{train.id}?{data.searchParams}"
								class="flex-grow"
							>
								<TrainCard {train} />
							</a>
						</div>
					{/each}
					<button
						onclick={() => {
							const lastTrain = trains ? trains[trains!.length - 1] : null;
							let time = dayjs(
								lastTrain?.estimated ?? lastTrain?.scheduled ?? dayjs().toISOString()
							);
							if (time.format('HHmm') === data.time) {
								time = dayjs()
									.set('hour', parseInt(data.time.substring(0, 2)))
									.set('minute', parseInt(data.time.substring(2, 4)))
									.add(20, 'minutes');
								console.log(
									time.diff(dayjs().add(1, 'day').set('hour', 0).set('minute', 0)),
									'minute'
								);
								if (
									time.diff(dayjs().add(1, 'day').set('hour', 0).set('minute', 0), 'minute') < 0
								) {
									return;
								}
							}

							adjust(data.crs, data.to, time.format('HHmm'), data.toc);
						}}
						class="flex items-center gap-1 p-4 text-left"
						><ArrowDown size={16} /> Later trains</button
					>
				</div>
			{:else}
				<div class="flex flex-col" in:fade={{ duration: 200 }}>
					{#each Array(10)}
						<SkeletonTrainCard />
					{/each}
				</div>
			{/if}
		</div>
		{#if md.current || page.data.id}
			<div
				use:pan={() => ({ delay: 50 })}
				use:swipe={() => ({ timeframe: 500, minSwipeDistance: 20 })}
				onpandown={(e) => {
					startX = e.detail.x;
					startY = e.detail.y;
				}}
				onpan={handlePan}
				onpanup={() => {
					coords.set({ x: 0, y: 0, scale: 1 });
				}}
				onswipe={(e) => {
					if (
						(e.detail.direction === 'right' || e.detail.direction === 'bottom') &&
						!md.current &&
						!dontMove.current
					) {
						goto(data.url + '?' + data.searchParams, { noScroll: true });
					}
				}}
				out:fly={{ duration: 200, y: 500 }}
				in:fly={{ duration: 200, y: 500 }}
				style:transform="translate({coords.current.x}px, {coords.current.y}px)"
				class="fixed inset-0 z-50 flex h-full min-w-0 flex-grow flex-col overflow-y-scroll md:static"
			>
				<div class="h-full w-full">
					{@render children()}
				</div>
			</div>
		{/if}
	</div>
</div>
