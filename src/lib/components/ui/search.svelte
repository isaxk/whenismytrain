<script lang="ts">
	import Fuse from 'fuse.js';
	import format from 'format-fuse.js';
	import { scale } from 'svelte/transition';
	import AllStationsJSON from '$lib/data/stations.json';
	import { browser } from '$app/environment';
	import Highlight from './highlight.svelte';
	import { X } from 'lucide-svelte';

	let { selected = $bindable(null), to = false } = $props();

	let focused = $state(false);
	let value = $state('');

	const fuzzySearch = new Fuse(AllStationsJSON, {
		keys: ['stationName', 'crsCode'],
		includeMatches: true,
		includeScore: true
	});

	const selectedStation = $derived(
		selected ? AllStationsJSON.find((station) => station.crsCode === selected) : null
	);

	const results = $derived(fuzzySearch.search(value).slice(0, 5));
	const formatted = $derived(browser ? format(results) : []);

	function submit(crs: string) {
		selected = crs;
		focused = false;
		value = '';
	}

	$effect(() => {
		if (focused) {
			input.focus();
		}
	});

	let input: HTMLInputElement;
</script>

<button
	class="border-border bg-background flex min-h-16 flex-grow transform-gpu items-center rounded-lg border px-4 text-left drop-shadow-xs"
	onclick={() => (focused = true)}
	>{#if selectedStation}
		<div class="flex h-max flex-col">
			<div class="text-lg font-medium">
				{selectedStation.stationName}
			</div>
			<div class="pb-1 text-xs/2">{selectedStation.crsCode}</div>
		</div>
	{/if}
	{#if !selectedStation}
		Find a station {#if to}(optional){/if}
	{/if}
</button>

{#if focused}
	<form
		onsubmit={(e) => e.preventDefault()}
		class="bg-background fixed inset-0 z-[1000] md:absolute"
		transition:scale={{ start: 0.8, duration: 200 }}
	>
		<div class="flex items-center">
			<input
				bind:this={input}
				bind:value
				type="text"
				class="w-full p-4"
				autofocus
				placeholder="Find a station..."
			/>
			<button
				type="button"
				class="flex h-full items-center justify-center p-4"
				onclick={() => {
					focused = false;
					value = '';
				}}><X /></button
			>
		</div>
		<div class="pt-2"></div>
		{#each formatted as result, i (results[i].item.crsCode)}
			<button
				type={i === 0 ? 'submit' : 'button'}
				onclick={() => submit(results[i].item.crsCode)}
				class="border-border flex h-14 w-full items-center border-b px-4 text-left last:border-none"
			>
				<div>
					<div class="text-xl">
						<Highlight value={result.stationName} />
					</div>
					<div class="text-xs">
						<Highlight value={result.crsCode} />
					</div>
				</div>
			</button>
		{/each}
	</form>
{/if}
