<script lang="ts">
	import Fuse from 'fuse.js';
	import format from 'format-fuse.js';
	import AllStationsJSON, { type StationData } from 'uk-railway-stations';
	import ExtraSuggestion from './extra-suggestion.svelte';
	import { ArrowUpRight, Check, Locate, Pencil, X } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import Highlighter from './highlighter.svelte';
	import { onDestroy, onMount, tick } from 'svelte';
	import StationsListJSON from 'uk-railway-stations';
	import { distance } from '$lib/utils';
	import ClosestSuggestion from './closest-suggestion.svelte';
	import { crossfade, fade, fly, scale } from 'svelte/transition';
	import { quadInOut, quadOut, quintInOut } from 'svelte/easing';
	import { MediaQuery } from 'svelte/reactivity';

	let { drawer = false, crs = $bindable(null), clearable = false } = $props();

	let isSelected = $state(false);
	const selected = $derived(AllStationsJSON.find((s) => s.crsCode === crs) ?? null);

	let input: HTMLInputElement;
	let submitBtn: HTMLButtonElement | null = $state(null);

	const [send, recieve] = crossfade({ duration: 200, easing: quadOut });

	const fuzzySearch = new Fuse(AllStationsJSON, {
		keys: ['stationName', 'crsCode'],
		includeMatches: true
	});

	const md = new MediaQuery('min-width: 768px');

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
			const withDistance = AllStationsJSON.map((s) => {
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

	let interval: ReturnType<typeof setInterval>;

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

	function select(station: StationData | null) {
		console.log(station);
		if (station) {
			crs = station.crsCode;
		} else {
			crs = selected?.crsCode ?? null;
		}
		setTimeout(() => {
			focused = false;
			value = '';
		}, 10);
	}

	let focused = $state(false);
</script>

{#snippet main()}
	<form
		onsubmit={(e) => {
			e.preventDefault();
			console.log(formatted, select);
			select(results[0].item);
		}}
	>
		<div
			class="z-50 flex transform-gpu overflow-hidden rounded-t-lg border-b bg-card drop-shadow"
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
				onblur={() => {
					if (md.current) {
						focused = false;
						value = '';
					}
				}}
				bind:this={input}
				type="text"
				placeholder="Find a station..."
				bind:value
				class="z-30 w-full rounded-t-lg bg-card p-4 -outline-offset-1 outline-blue-100/80"
			/>
			<button class="px-2 pr-4 text-zinc-400" type="button" onclick={() => select(null)}
				>Cancel</button
			>
		</div>

		<div class="h-[350px] md:rounded-b-lg md:border md:bg-card">
			<pre></pre>
			{#if formatted.length > 0}
				<div class="flex flex-col">
					{#each formatted as result, i}
						<button
							onmousedown={() => () => select(results[i].item)}
							class="flex w-full items-center gap-2 border-b px-4 py-2 text-left text-zinc-800 last:border-none"
						>
							<div class="min-w-0 flex-grow">
								<div class="overflow-hidden text-ellipsis text-nowrap text-xl font-medium">
									<Highlighter value={result.stationName} />
								</div>
								<div class="text-xs">
									<Highlighter value={result.crsCode} />
								</div>
							</div>
							<div
								class="h-max rounded-lg bg-blue-500 px-4 py-2 text-center text-white transition-all duration-300 hover:brightness-105"
							>
								<Check size={22} />
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
						type="button"
						class="flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-200 px-4 drop-shadow"
						onclick={updateLocation}><Locate size={20} /> Update location</button
					>
				</div>
			{/if}
		</div>
	</form>
{/snippet}

<div class={['relative h-full min-h-16 flex-grow transition-all']}>
	{#if focused}
		<div
			class={[
				'fixed inset-0 z-40 rounded-t-lg bg-card md:absolute md:rounded-lg md:border',
				!drawer && 'pt-ios-top md:pt-0'
			]}
			in:fly={{ duration: 200, y: 20, opacity: 0 }}
			out:fly={{ duration: 200, y: 20, opacity: 0 }}
		>
			{@render main()}
		</div>
	{:else}
		<button
			in:recieve|global={{ key: 'input' }}
			out:send|global={{ key: 'input' }}
			class="absolute bottom-0 left-0 right-0 top-0 flex w-full items-center gap-2 rounded-lg border bg-card px-4 py-2 text-left drop-shadow"
			onclick={() => (clearable && crs !== null ? (crs = null) : (focused = true))}
		>
			{#if crs && selected}
				<div class="min-w-0 flex-grow">
					<div class="overflow-hidden text-ellipsis text-nowrap text-xl font-semibold">
						{selected.stationName}
					</div>
					<div class="text-sm">{selected.crsCode}</div>
				</div>
				<div class="rounded-lg bg-zinc-200 px-4 py-2">
					{#if clearable}
						<X size={18} />
					{:else}
						<Pencil size={18} />
					{/if}
				</div>
			{:else}Find a station...{/if}
		</button>
	{/if}
</div>
