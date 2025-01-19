<script lang="ts">
	import ClosestSuggestion from '$lib/components/closest-suggestion.svelte';
	import ExtraSuggestion from '$lib/components/extra-suggestion.svelte';
	import PinnedStation from '$lib/components/pinned-station.svelte';
	import { Locate } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import StationsListJSON from 'uk-railway-stations';

	function distance(lat1: number, lon1: number, lat2: number, lon2: number, unit: 'K' | 'N') {
		var radlat1 = (Math.PI * lat1) / 180;
		var radlat2 = (Math.PI * lat2) / 180;
		var theta = lon1 - lon2;
		var radtheta = (Math.PI * theta) / 180;
		var dist =
			Math.sin(radlat1) * Math.sin(radlat2) +
			Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = (dist * 180) / Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit == 'K') {
			dist = dist * 1.609344;
		}
		if (unit == 'N') {
			dist = dist * 0.8684;
		}
		return dist;
	}

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
</script>

<div class="full mx-auto flex max-w-screen-md flex-col justify-center px-4">
	<div class="py-8 text-3xl font-bold">When is my train?</div>
	<button
		class="mb-2 flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-200 px-4 drop-shadow"
		onclick={updateLocation}><Locate size={20} /> Update location</button
	>
	{#if closestStation && geoStations.length > 0}
		<div class="flex h-[400px] flex-grow flex-col gap-2">
			<ClosestSuggestion {...closestStation} />
			{#each geoStations.slice(1, 4) as extra}
				<ExtraSuggestion {...extra} />
			{/each}
		</div>
	{:else}{/if}
	<div class="pt-6">
		<div class="pb-2 text-xl font-medium text-black">Pinned stations:</div>
		<div class="flex flex-col gap-2">
			{#each pins as pin}
				<PinnedStation crs={pin} />
			{/each}
		</div>
	</div>
</div>

<input type="text" />
