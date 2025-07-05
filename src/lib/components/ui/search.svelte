<script lang="ts">
	import Fuse from 'fuse.js';
	import format from 'format-fuse.js';
	import { crossfade, scale } from 'svelte/transition';
	import { browser } from '$app/environment';
	import Highlight from './highlight.svelte';
	import { X } from 'lucide-svelte';

	let {
		selected = $bindable(null),
		to = false,
		stations
	}: {
		selected: string | null;
		to?: boolean;
		stations: Promise<{ crs: string; Value: string }[]>;
	} = $props();

	let focused = $state(false);
	let value = $state('');
	let stationsData: { crs: string; Value: string }[] = $state([]);

	stations.then((data) => {
		stationsData = data;
	});

	$inspect(stationsData);

	const fuzzySearch = $derived(
		new Fuse(stationsData, {
			keys: ['Value', 'crs'],
			includeMatches: true,
			includeScore: true
		})
	);

	const selectedStation = $derived(
		selected ? stationsData.find((station) => station.crs === selected) : null
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

	const [send, receive] = crossfade({ duration: 200 });

	const popular = [
		{ crs: 'WAT', name: 'London Waterloo' },
		{ crs: 'VIC', name: 'London Victoria' },
		{ crs: 'KGX', name: 'London Kings Cross' },
		{ crs: 'LST', name: 'London Liverpool Street' },
		{ crs: 'EUS', name: 'London Euston' },
		{ crs: 'PAD', name: 'London Paddington' },
		{ crs: 'BHM', name: 'Birmingham New Street' },
		{ crs: 'MAN', name: 'Manchester Piccadilly' }
	];
</script>

<div class="h-16 w-full min-w-0 flex-grow">
	{#if focused}
		<form
			onsubmit={(e) => e.preventDefault()}
			class="bg-background fixed inset-0 z-[1000] md:absolute"
			transition:scale={{ start: 0.8, duration: 200 }}
		>
			<div class="flex items-center">
				<input
					in:receive={{ key: 'stationsearch' + to }}
					out:send={{ key: 'stationsearch' + to }}
					bind:this={input}
					bind:value
					type="text"
					class="w-full p-4"
					placeholder="Find a station..."
					autofocus
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
			{#if formatted.length}
				{#each formatted as result, i (results[i].item.crs)}
					<button
						type={i === 0 ? 'submit' : 'button'}
						onclick={() => submit(results[i].item.crs)}
						class="border-border flex h-14 w-full items-center border-b px-4 text-left last:border-none"
					>
						<div>
							<div class="text-xl">
								<Highlight value={result.Value} />
							</div>
							<div class="text-xs">
								<Highlight value={result.crs} />
							</div>
						</div>
					</button>
				{/each}
			{:else}
				{#each popular as result, i (result.crs)}
					<button
						type={i === 0 ? 'submit' : 'button'}
						onclick={() => submit(result.crs)}
						class="border-border flex h-14 w-full items-center border-b px-4 text-left last:border-none"
					>
						<div>
							<div class="text-xl">
								{result.name}
							</div>
							<div class="text-xs">
								{result.crs}
							</div>
						</div>
					</button>
				{/each}
			{/if}
		</form>
	{:else}
		<button
			in:receive={{ key: 'stationsearch' + to }}
			out:send={{ key: 'stationsearch' + to }}
			type="button"
			class={[
				'border-border bg-background flex h-16 w-full min-w-0 flex-grow transform-gpu items-center px-4 py-4 text-left drop-shadow-xs',
				to && selected ? 'rounded-l-lg border border-r-0' : 'rounded-lg border'
			]}
			onclick={() => (focused = true)}
			>{#if selectedStation}
				<div class="flex h-max w-full flex-col">
					<div class="text-2xl/6 font-medium">{selectedStation.crs}</div>
					<div class="truncate text-xs/4">
						{selectedStation.Value}
					</div>
				</div>
			{/if}
			{#if !selectedStation}
				{#if to}
					to <span class="text-foreground-muted pl-1"> (optional)</span>
				{:else}
					from
				{/if}
			{/if}
		</button>
	{/if}
</div>
