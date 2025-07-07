<script lang="ts">
	import { MediaQuery, SvelteMap } from 'svelte/reactivity';
	import '../app.css';
	import { navigating, page } from '$app/state';
	import Search from '$lib/components/ui/search.svelte';
	import { fade } from 'svelte/transition';
	import { Bookmark, ChevronRight, Train, X } from 'lucide-svelte';
	import { cancelVt, expandedMap, saved } from '$lib/data/saved.svelte';
	import SavedTrain from '$lib/components/train/saved-train.svelte';
	import { goto, onNavigate, preloadData } from '$app/navigation';
	import { onMount, untrack } from 'svelte';
	import { browser } from '$app/environment';
	import { refresher, refreshing } from '$lib/data/refresh.svelte';
	import { Tooltip } from 'bits-ui';
	import dayjs from 'dayjs';
	import { flip } from 'svelte/animate';
	import { localStore } from '$lib/utils/localStore.svelte';
	import TimeInput from '$lib/components/ui/time-input.svelte';
	import { terminalGroups } from '$lib/data/terminal-groups';

	let { children, data } = $props();

	const md = new MediaQuery('(min-width: 768px)');

	let from = $state(page.data.from ?? null);
	let to = $state(page.data.to ?? null);
	let time: string | null = $state(page.data.time ?? null);
	let tomorrow: boolean = $state(false);
	let isIOSSwipeGesture = false;

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		if (cancelVt.current || isIOSSwipeGesture) {
			cancelVt.current = false;
			isIOSSwipeGesture = false;
			return;
		}
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	onMount(() => {
		if (!browser) return;

		const clear = refresher.init(10000);

		// Check if we're on iOS
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

		if (isIOS) {
			let touchStartX = 0;
			const edgeThreshold = 20; // px from edge

			// Track touch start position
			document.addEventListener('touchstart', (e) => {
				touchStartX = e.touches[0].screenX;

				// Only consider touches near the left edge
				if (touchStartX <= edgeThreshold) {
					// This might be an edge swipe starting
					isIOSSwipeGesture = true;

					// Reset after a delay if no navigation occurred
					setTimeout(() => {
						isIOSSwipeGesture = false;
					}, 1000);
				}
			});
		}

		return () => {
			clear();
		};
	});

	let toFillTime = $state(page.data.time ?? null);

	$effect(() => {
		if (page.data.crs) {
			from = page.data.crs;
		}
		if (page.data.filter) {
			to = page.data.filter;
		}
		if (page.data.time) {
			console.log(page.data.time);
			toFillTime = page.data.time;
			time = page.data.time;
		}
		if (page.data.tomorrow == 'true') {
			tomorrow = true;
		}
	});

	const submitUrl = $derived.by(() => {
		const timeQ = time ? time.replace(':', '') : null;
		if (from && (!terminalGroups.some((g) => g.crs === from) || to) && from !== to) {
			const fGroup = terminalGroups.find((g) => g.crs === from);
			const tGroup = terminalGroups.find((g) => g.crs === to);
			if (
				(fGroup && to && fGroup.stations.includes(to)) ||
				(tGroup && from && tGroup.stations.includes(from))
			) {
				return null;
			}
			if (to) {
				return `/board/${from}?to=${to ?? ''}${timeQ ? `&time=${timeQ}` : ''}&tomorrow=${tomorrow ?? false}`;
			} else {
				return `/board/${from}${timeQ ? `?time=${timeQ}&tomorrow=${tomorrow ?? false}` : `?tomorrow=${tomorrow}`}`;
			}
		} else {
			return null;
		}
	});

	$effect(() => {
		if (submitUrl) {
			preloadData(submitUrl);
		}
	});

	let savedTrainsTimes = localStore<{ id: string; time: string }[]>('saved-trains-times', []);

	$effect(() => {
		console.log(savedTrainsTimes.value);
		untrack(() => {
			saved.value = saved.value.toSorted((a, b) => {
				const aSaved = savedTrainsTimes.value.find((saved) => saved.id === a.id);
				const bSaved = savedTrainsTimes.value.find((saved) => saved.id === b.id);
				const aTime = aSaved ? dayjs(aSaved.time).unix() : Infinity;
				const bTime = bSaved ? dayjs(bSaved.time).unix() : Infinity;
				return aTime - bTime;
			});
		});
	});
</script>

<div
	class="flex min-h-screen w-screen items-center justify-center bg-zinc-50 p-0 md:h-screen md:p-4"
>
	<div
		class={['flex h-full w-full max-w-screen-xl gap-4', expandedMap.current && 'md:justify-center']}
	>
		<form
			onsubmit={(e) => e.preventDefault()}
			class={[
				(!md.current && page.data.crs) || expandedMap.current ? 'hidden' : 'flex',
				'bg-background md:border-border h-full min-h-screen w-full flex-col p-4 md:relative md:min-h-auto md:w-[400px] md:min-w-[400px] md:rounded-lg md:border'
			]}
		>
			<div class="p-2 text-3xl font-semibold">When is my train?</div>

			<TimeInput
				value={toFillTime ?? null}
				onChange={(v: string | null) => (time = v)}
				bind:tomorrow
			/>
			<div class="flex w-full items-center pt-0 pb-4">
				<div class="w-full min-w-0 flex-grow text-right">
					<Search bind:selected={from} to={false} stations={data.stations} />
				</div>
				<div class="px-2">
					<ChevronRight size={22} />
				</div>
				<div class="w-full min-w-0 flex-grow text-right">
					<Search bind:selected={to} to stations={data.stations} />
				</div>
				{#if to}
					<button
						class="bg-background border-border flex aspect-square h-16 w-10 items-center justify-center rounded-r-lg border drop-shadow-xs"
						onclick={() => (to = null)}><X /></button
					>
				{/if}
			</div>

			{#if submitUrl}
				<a
					type="submit"
					in:fade={{ duration: 200 }}
					href={submitUrl}
					class="flex w-full transform-gpu justify-center rounded-lg bg-blue-500 px-3 py-2 font-medium text-white drop-shadow-sm"
					>Go</a
				>
				<button
					type="submit"
					class="hidden"
					onclick={() => {
						if (submitUrl) {
							goto(submitUrl);
						}
					}}>Submit</button
				>
			{:else}
				<div
					class="bg-muted text-foreground-muted/40 flex w-full transform-gpu justify-center rounded-lg px-3 py-2 font-medium"
				>
					Go
				</div>
			{/if}

			<div class="flex items-center gap-1 pt-10 pb-2 text-lg font-semibold">
				<Train size={20} />
				<div class="pr-2">Saved</div>
				<div class="bg-border h-0.5 flex-grow"></div>
			</div>
			<div class="flex-grow overflow-y-scroll">
				<Tooltip.Provider>
					{#if saved.value.length}
						{#each saved.value as { id, filter, focus }, i (id + filter + focus)}
							<div animate:flip={{ duration: 200 }}>
								<svelte:boundary>
									<SavedTrain
										onTime={(t) => {
											if (savedTrainsTimes.value.find((t) => t.id === id)) {
												savedTrainsTimes.value = [
													...savedTrainsTimes.value.filter((item) => item.id !== id),
													{ id, time: t }
												];
											} else {
												savedTrainsTimes.value = [...savedTrainsTimes.value, { id, time: t }];
											}
										}}
										{i}
										{id}
										{filter}
										{focus}
									/>
									{#snippet failed(error)}
										{error}
									{/snippet}
								</svelte:boundary>
							</div>
						{/each}
					{:else}
						<div class="font-medium">No saved trains</div>
						<div class="flex items-center gap-1 text-sm">
							Tap the <Bookmark size={16} /> icon on a train to save it here!.
						</div>
					{/if}
				</Tooltip.Provider>
			</div>
		</form>
		{@render children()}
	</div>
</div>

{#if refreshing.value || navigating.to}
	<div
		in:fade={{ duration: 100, delay: 100 }}
		out:fade={{ duration: 100 }}
		class="fixed top-0 right-0 left-0 z-[1000] h-0.5 animate-pulse bg-blue-500/60"
	></div>
{/if}
