<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { flip } from 'svelte/animate';

	import { fade, slide } from 'svelte/transition';
	import { onMount, untrack, type Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { scrollY } from 'svelte/reactivity/window';
	import dayjs from 'dayjs';

	import {
		ArrowDown,
		ArrowUp,
		ChevronDown,
		Info,
		MailWarning,
		TimerReset,
		TriangleAlert
	} from 'lucide-svelte';

	import SkeletonTrainCard from '$lib/components/train/skeleton-train-card.svelte';
	import TrainCard from '$lib/components/train/train-card.svelte';
	import SwipablePane from '$lib/components/board/swipable-pane.svelte';
	import Header from '$lib/components/board/header.svelte';

	import { operatorList } from '$lib/data/operators';
	import { refresher } from '$lib/state/refresh.svelte';
	import { NoticeSeverity, type BoardDetails, type NoticeType } from '$lib/types';
	import type { Train } from '$lib/types/train';
	import type { PageData } from './$types';
	import Notice from '$lib/components/board/notice.svelte';
	import { Accordion } from 'bits-ui';

	let { data, children }: { data: PageData; children: Snippet } = $props();

	const md = new MediaQuery('(min-width: 768px)');

	let scrollYLocked = $state(0);
	let details: BoardDetails | null = $state(null);
	let trains: Train[] | null = $state(null);
	let notices: NoticeType[] = $state([]);

	let mostSevereNotice = $derived(
		notices.reduce((max, notice) => Math.max(max, notice.severity), 0)
	);

	$effect(() => {
		data.board.then((b) => {
			details = b.details;
			trains = b.trains;
			notices = b.notices;
		});
	});

	// prevent background scroll when swipable pane is open
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

	function adjust(from: string, to: string | null, time: string | null, toc: string | null = null) {
		let pathname = page.url.pathname;
		const params = new URLSearchParams();

		if (data.crs !== from) pathname = `/board/${from}`;
		if (to) params.set('to', to);
		if (time) params.set('time', time.replace(':', ''));
		if (toc) params.set('toc', toc);
		params.set('history', data.history);

		goto(pathname + '?' + params.toString(), { replaceState: true });
	}

	onMount(() => {
		const refresh = refresher.add(async () => {
			const res = await fetch(
				`/api/board/${page.params.crs}/${data.to ?? 'null'}/${data.time ?? 'null'}/${data.toc ?? 'null'}`
			);
			const newData = await res.json();
			trains = newData.trains;
			details = newData.details;
		});
		return () => {
			refresher.remove(refresh);
		};
	});

	function later() {
		const lastTrain = trains ? trains[trains!.length - 1] : null;
		let time = dayjs(lastTrain?.estimated ?? lastTrain?.scheduled ?? dayjs().toISOString());
		if (time.format('HHmm') === data.time) {
			time = dayjs()
				.set('hour', parseInt(data.time.substring(0, 2)))
				.set('minute', parseInt(data.time.substring(2, 4)))
				.add(20, 'minutes');

			if (time.diff(dayjs().add(1, 'day').set('hour', 0).set('minute', 0), 'minute') < 0) {
				return;
			}
		}

		adjust(data.crs, data.to, time.format('HHmm'), data.toc);
	}

	function earlier() {
		const time = data.time
			? dayjs()
					.set('hour', parseInt(data.time.substring(0, 2)))
					.set('minute', parseInt(data.time.substring(2, 4)))
					.subtract(30, 'minute')
					.format('HHmm')
			: dayjs().subtract(30, 'minute').format('HHmm');
		adjust(data.crs, data.to, time, data.toc);
	}
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
			class={[
				'bg-background border-border flex h-full w-full flex-col overflow-hidden transition-all duration-300 md:max-w-[500px] md:rounded-lg md:border'
			]}
		>
			<Header {scrollYLocked} {details} {adjust} />

			<div class="pt-safe md:hidden"></div>
			<div class="h-[170px] md:hidden"></div>

			{#if notices.length > 0}
				<div class="px-4 pt-4 pb-1">
					<Accordion.Root type="single">
						<Accordion.Item
							class={[
								'bg-background w-full overflow-hidden rounded-lg border drop-shadow transition-all data-[state=open]:border-neutral-300',
								mostSevereNotice === NoticeSeverity.Major && 'border-red-500',
								mostSevereNotice === NoticeSeverity.Minor && 'border-yellow-500',
								mostSevereNotice === NoticeSeverity.Normal && 'border-blue-500',
								mostSevereNotice === NoticeSeverity.Severe && 'border-red-950'
							]}
						>
							<Accordion.Trigger
								class={[
									'data-[state=open]:bg-background group flex w-full items-center gap-2 overflow-hidden py-3 pr-2 pl-4 text-left transition-all',
									mostSevereNotice === NoticeSeverity.Major && 'bg-red-100',
									mostSevereNotice === NoticeSeverity.Severe && 'bg-red-100',
									mostSevereNotice === NoticeSeverity.Minor && 'bg-yellow-100',
									mostSevereNotice === NoticeSeverity.Normal && 'bg-blue-100'
								]}
							>
								{#if mostSevereNotice === NoticeSeverity.Normal}
									<Info size={20} />
								{:else}
									<TriangleAlert size={20} />
								{/if}
								<div class="flex-grow">
									{#if mostSevereNotice === NoticeSeverity.Minor}
										Minor
									{:else if mostSevereNotice === NoticeSeverity.Major}
										Major
									{:else if mostSevereNotice === NoticeSeverity.Severe}
										Severe
									{/if}
									Status Updates
								</div>
								<div
									class="flex h-6 w-6 items-center justify-center transition-all group-data-[state=open]:rotate-180"
								>
									<ChevronDown size={21} />
								</div>
							</Accordion.Trigger>
							<Accordion.Content class="flex flex-col gap-4 border-t border-neutral-200 p-3">
								{#each notices as notice, i (notice.html + i)}
									<Notice {notice} />
								{/each}
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</div>
			{/if}

			{#if trains !== null}
				<div
					in:fade|global={{ duration: 400 }}
					class="md:border-border flex flex-grow flex-col overflow-y-scroll overscroll-y-auto"
				>
					<div class="flex">
						<button onclick={earlier} class="flex items-center gap-1 p-4 text-left"
							><ArrowUp size={16} /> Earlier trains</button
						>
						<div class="flex-grow"></div>
						{#if data.time !== null}
							<button
								onclick={() => {
									adjust(data.crs, data.to, null, data.toc);
								}}
								class="flex items-center gap-1 p-4 text-left"
								>Back to now <TimerReset size={16} />
							</button>
						{/if}
					</div>
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

							<button
								transition:fade={{ duration: 200, delay: 100 }}
								onclick={() => {
									goto(`/board/${data.crs}/train/${train.id}?${data.searchParams}`, {
										replaceState: true
									});
								}}
								class="flex-grow text-left"
							>
								<TrainCard {train} fixedWidthTime />
							</button>
						</div>
					{/each}
					<button onclick={later} class="flex items-center gap-1 p-4 text-left"
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
			<SwipablePane url={data.url} searchParams={data.searchParams}>
				{@render children()}
			</SwipablePane>
		{/if}
	</div>
</div>
