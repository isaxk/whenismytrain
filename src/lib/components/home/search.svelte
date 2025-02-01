<script lang="ts">
	import Fuse from 'fuse.js';
	import format from 'format-fuse.js';
	import AllStationsJSON, { type StationData } from 'uk-railway-stations';
	import ExtraSuggestion from '../extra-suggestion.svelte';
	import { goto } from '$app/navigation';
	import { ArrowUpRight, Locate, Pencil, X } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import Highlighter from './highlighter.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import StationsListJSON from 'uk-railway-stations';
	import { distance } from '$lib/utils';
	import ClosestSuggestion from '../closest-suggestion.svelte';
	import { crossfade, fade, fly, scale } from 'svelte/transition';
	import { quadInOut, quintInOut } from 'svelte/easing';

	let { drawer = false, crs = $bindable(null) } = $props();

	let selected: StationData | null = $state(
		crs ? (StationsListJSON.find((t) => t.crsCode === crs) ?? null) : null
	);
	let isSelected = $state(false);

	let input: HTMLInputElement;
	let submitBtn: HTMLButtonElement | null = $state(null);

	const [send, recieve] = crossfade({ duration: 200 });

	const fuzzySearch = new Fuse(AllStationsJSON, {
		keys: ['stationName', 'crsCode'],
		includeMatches: true
	});

	let value = $state('');
	const results = $derived(fuzzySearch.search(value).slice(0, 5));
	const formatted = $derived(
		browser
			? format<{
					crsCode: string;
					stationName: string;
				}>(results)
			: []
	);

	let coords: GeolocationCoordinates | null = $state(null);
	let geoStations = $derived.by(() => {
		if (coords !== null) {
			const withDistance = StationsListJSON.map((s) => {
				return {
					...s,
					distance: distance(coords!.latitude, coords!.longitude, s.lat, s.long, 'K')
				};
			});
			return withDistance.toSorted((a, b) => a.distance - b.distance);
		} else {
			return [];
		}
	});

	const closestStation = $derived(geoStations[0] ?? null);

	$inspect(closestStation);

	function updateLocation() {
		navigator.geolocation.getCurrentPosition((t) => {
			coords = t.coords ?? null;
			localStorage.coords = JSON.stringify(coords);
		});
	}

	let interval: number;

	onMount(() => {
		if (localStorage.coords) {
			coords = JSON.parse(localStorage.coords);
		}
		interval = setInterval(() => {
			if (focused) {
				window.scrollTo({ top: 0 });
			}
		});
		updateLocation();
	});

	onDestroy(() => {
		clearInterval(interval);
	});

	$effect(() => {
		crs = selected?.crsCode ?? null;
		if (focused) {
			input.focus();
		}
	});

	function select(station: StationData) {
		focused = false;
		selected = station;

		value = '';
	}

	let focused = $state(false);
</script>

{#snippet main()}
	<form onsubmit={() => select(results[0].item)}>
		<div
			class="flex overflow-hidden rounded-t-lg border-b z-50 bg-white drop-shadow"
			in:recieve|global={{ key: 'input' }}
			out:send|global={{ key: 'input' }}
		>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				autofocus
				autocorrect="off"
				onfocus={() => {
					focused = true;
				}}
				bind:this={input}
				type="text"
				placeholder="Find a station..."
				bind:value
				class="z-30 w-full rounded-t-lg bg-white p-4 -outline-offset-1 outline-blue-100/80"
			/>
			<button class="px-2 text-zinc-400" onclick={() => (focused = false)}>Cancel</button>
		</div>

		<div class="h-[350px] md:rounded-b-lg md:border md:bg-white">
			{#if formatted.length > 0}
				<div class="flex flex-col">
					{#each formatted as result, i}
						{#if i === 0}
							<button bind:this={submitBtn} onclick={() => select(results[0].item)} class="hidden"
								>Go</button
							>
						{/if}
						<button
							onclick={() => select(results[i].item)}
							class="flex w-full items-center gap-2 border-b px-4 py-2 text-left text-zinc-800 last:border-none"
						>
							<div class="flex-grow">
								<div class="text-xl font-medium">
									<Highlighter value={result.stationName} />
								</div>
								<div class="text-xs">
									<Highlighter value={result.crsCode} />
								</div>
							</div>
							<div
								class="h-max rounded-lg bg-blue-500 px-4 py-2 text-center text-white transition-all duration-300 hover:brightness-105"
							>
								<ArrowUpRight size={22} />
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<div class="h-[275px]">
					{#if closestStation && geoStations.length > 0}
						<div class="z-0 flex flex-grow flex-col pt-1">
							<ClosestSuggestion
								{drawer}
								{...closestStation}
								onSelect={(c: string) => select(StationsListJSON.find((t) => t.crsCode === c)!)}
							/>
							{#each geoStations.slice(1, 4) as extra}
								<ExtraSuggestion
									{...extra}
									onSelect={(c: string) => select(StationsListJSON.find((t) => t.crsCode === c)!)}
								/>
							{/each}
						</div>
					{:else}{/if}
				</div>
				<div class="-mt-1 flex h-24 items-center px-4 pb-4">
					<button
						class="flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-200 px-4 drop-shadow"
						onclick={updateLocation}><Locate size={20} /> Update location</button
					>
				</div>
			{/if}
		</div>
	</form>
{/snippet}

<div class={['relative h-full flex-grow transition-all']}>
	{#if focused}
		<div
			class={["fixed inset-0 z-40 rounded-t-lg bg-white md:absolute md:rounded-lg md:border", !drawer && 'pt-ios-top md:pt-0']}
			in:fly={{ duration: 200, y: 20, opacity: 0}}
			out:fly={{ duration: 200, y: 20, opacity: 0 }}
		>
			{@render main()}
		</div>
	{:else}
		<div>
			{#if selected}
				<button
					in:recieve|global={{ key: 'input' }}
					out:send|global={{ key: 'input' }}
					class="absolute left-0 right-0 top-0 flex w-full items-center gap-2 rounded-lg border bg-white px-4 py-2 text-left drop-shadow"
					onclick={() => (focused = true)}
				>
					<div class="flex-grow">
						<div class="text-xl font-semibold">
							{selected.stationName}
						</div>
						<div class="text-sm">{selected.crsCode}</div>
					</div>
					<div class="rounded-lg bg-zinc-200 px-4 py-2"><Pencil size={18}/></div>
				</button>
			{:else}
				<button
					in:recieve|global={{ key: 'input' }}
					out:send|global={{ key: 'input' }}
					onclick={() => (focused = true)}
					class="z-30 w-full rounded-t-lg border-b bg-white p-4 text-left text-zinc-400 drop-shadow"
					>Find a station...</button
				>
			{/if}
		</div>
	{/if}
</div>
