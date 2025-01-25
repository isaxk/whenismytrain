<script lang="ts">
	import { goto } from '$app/navigation';
	import ClosestSuggestion from '$lib/components/closest-suggestion.svelte';
	import ExtraSuggestion from '$lib/components/extra-suggestion.svelte';
	import Search from '$lib/components/home/search.svelte';
	import PinnedStation from '$lib/components/pinned-station.svelte';
	import { distance } from '$lib/utils';
	import { Locate } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import StationsListJSON from 'uk-railway-stations';

	

	let pins = $state(new SvelteSet([]));

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

	onMount(async () => {
		if (localStorage.coords) {
			coords = JSON.parse(localStorage.coords);
		}
		if (localStorage.pins) {
			pins = new SvelteSet(JSON.parse(localStorage.pins));
		}
		updateLocation();
	});

	let value = $state('');
</script>

<div class="full mx-auto flex max-w-screen-md flex-col justify-center px-4 pt-ios-top">
	<div class="py-8 text-3xl font-bold">When is my train?</div>

	<Search>
		{#snippet whenEmpty()}
			{#if closestStation && geoStations.length > 0}
				<div class="flex h-[400px] flex-grow flex-col gap-2">
					<ClosestSuggestion {...closestStation} />
					{#each geoStations.slice(1, 4) as extra}
						<ExtraSuggestion {...extra} />
					{/each}
				</div>
			{:else}{/if}
			<button
				class="my-2 flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-200 px-4 drop-shadow"
				onclick={updateLocation}><Locate size={20} /> Update location</button
			>
		{/snippet}
	</Search>

	<div class="pt-6"></div>
</div>
