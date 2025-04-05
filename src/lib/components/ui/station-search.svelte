<script lang="ts">
	import { crossfade, scale } from 'svelte/transition';
	import Fuse from 'fuse.js';
	import format from 'format-fuse.js';
	import AllStationsJSON from '$lib/data/stations.json';
	import { browser } from '$app/environment';
	import { Check } from 'lucide-svelte';
	import Highlight from './highlight.svelte';
	import type { Snippet } from 'svelte';
	import { getGeoStations } from '$lib/data/location.svelte';
	import { Portal } from 'bits-ui';
	import MobileOnlyPortal from './mobile-only-portal.svelte';

	let open = $state();

	let {
		children,
		class: className = '',
		hidden = null,
		onselect = () => {},
		selected = $bindable(null)
	}: {
		children: Snippet<[string | null, string | null]>;
		class?: string;
		hidden?: string | null;
		onselect?: (val: string) => void;
		selected?: string | null;
	} = $props();

	let value = $state('');
	let input: HTMLInputElement | undefined = $state();

	const selectedStation = $derived(
		selected ? AllStationsJSON.find((t) => t.crsCode === selected) : null
	);

	const geoStations = $derived(getGeoStations());
	$inspect(geoStations);

	const fuzzySearch = new Fuse(AllStationsJSON, {
		keys: ['stationName', 'crsCode'],
		includeMatches: true,
		includeScore: true,
		sortFn: (a, b) => {
			// Convert Fuse's search results to normalized scores
			const scoreA = a.score || 0;
			const scoreB = b.score || 0;

			// Get popularity scores
			const popularityA = a.item.popularity || 0;
			const popularityB = b.item.popularity || 0;

			// Adjust these weights to balance relevance vs popularity
			const weightSearch = 0.7;
			const weightPopularity = 0.3;

			// Calculate combined scores (lower is better)
			const combinedScoreA = scoreA * weightSearch - popularityA * weightPopularity;
			const combinedScoreB = scoreB * weightSearch - popularityB * weightPopularity;

			// Sort by combined score
			return combinedScoreA - combinedScoreB;
		}
	});

	const results = $derived(fuzzySearch.search(value).slice(0, 5));
	const formatted = $derived(
		browser
			? format<{
					crsCode: string;
					stationName: string;
				}>(results)
			: []
	);

	$effect(() => {
		if (open) {
			input?.focus();
		}
	});
</script>

<div class="w-full md:relative">
	<MobileOnlyPortal>
		{#if open}
			<form
				onsubmit={() => {
					if (results.length > 0) {
						selected = results[0].item.crsCode;
						open = false;
						setTimeout(() => {
							onselect(results[0].item.crsCode);
							value = '';
						}, 200);
					}
				}}
				class="bg-background pt-safe border-border fixed inset-0 top-0 right-0 bottom-0 left-0 z-50 flex h-full transform-gpu flex-col md:absolute md:-right-3 md:bottom-auto md:-left-3 md:h-max md:min-w-[400px] md:rounded-lg md:border md:bg-white md:p-3 md:drop-shadow-md"
				transition:scale|global={{ duration: 200, start: 0.9 }}
			>
				<div class="bg-background h-full w-full md:h-fit">
					<div class="flex items-center gap-2 bg-white">
						<input
							bind:this={input}
							placeholder="Search for a train station..."
							bind:value
							class="w-full p-4 text-lg"
							onblur={() => {
								setTimeout(() => {
									open = false;
								}, 200);
							}}
						/>
						<button onclick={() => (open = false)} class="text-foreground-muted px-2">Cancel</button
						>
					</div>
					<div class="bg-background flex-grow">
						{#if value.length > 1 && formatted.length > 0}
							{#each formatted as result, i (results[i].item.crsCode)}
								{#if results[i].item.crsCode !== hidden}
									<button
										type="button"
										onclick={() => {
											selected = results[i].item.crsCode;
											open = false;
											setTimeout(() => {
												onselect(results[i].item.crsCode);
												value = '';
											}, 200);
										}}
										class="border-border flex w-full items-center gap-2 border-b px-4 py-2 text-left text-zinc-800 last:border-none"
									>
										<div class="min-w-0 flex-grow">
											<div class="overflow-hidden text-xl font-medium text-nowrap text-ellipsis">
												<Highlight value={result.stationName} />
											</div>
											<div class="text-xs">
												<Highlight value={result.crsCode} />
											</div>
										</div>
										<div class="">
											<Check size={22} />
										</div>
									</button>
								{/if}
							{/each}
						{:else if geoStations.length > 0}
							{#each geoStations.slice(0, 5) as geo (geo.crsCode)}
								{#if geo.crsCode !== hidden}
									<button
										onclick={() => {
											selected = geo.crsCode;
											open = false;
											setTimeout(() => {
												onselect(geo.crsCode);
												value = '';
											}, 200);
										}}
										type="button"
										class="border-border flex w-full items-center gap-2 border-b px-4 py-2 text-left text-zinc-800 last:border-none"
									>
										<div class="min-w-0 flex-grow">
											<div class="overflow-hidden text-xl font-medium text-nowrap text-ellipsis">
												{geo.stationName}
											</div>
											<div class="text-xs">
												{geo.crsCode} - {geo.distance.toFixed(2)}km
											</div>
										</div>
										<div class="">
											<Check size={22} />
										</div>
									</button>
								{/if}
							{/each}
						{/if}
					</div>
				</div>
			</form>
		{/if}
	</MobileOnlyPortal>
	<button class={['contents', className]} onclick={() => (open = true)}>
		{@render children(selectedStation?.stationName ?? null, selectedStation?.crsCode ?? null)}
	</button>
</div>
