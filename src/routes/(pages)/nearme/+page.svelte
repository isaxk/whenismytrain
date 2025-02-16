<script lang="ts">
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/spinner.svelte';
	import { localStore } from '$lib/data/saved.svelte';
	import { distance } from '$lib/utils';
	import { ArrowUpRight } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import AllStationsJSON from 'uk-railway-stations';

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
	let loading = $state(false);

	$inspect(closestStation);

	function updateLocation() {
		loading = true;
		if (localStorage.coords) {
			coords = JSON.parse(localStorage.coords);
		}
		navigator.geolocation.getCurrentPosition((t) => {
			loading = false;
			coords = t.coords ?? null;
			localStorage.coords = JSON.stringify(coords);
		});
	}

	onMount(updateLocation);
</script>

<div class="sticky top-0 z-40 flex items-center bg-zinc-50 p-4 text-3xl font-semibold">
	<div class="pt-ios-top">Near me</div>
</div>
<div>
	{#if geoStations}
		{#each geoStations.slice(0, 20) as station, i}
			<a
				in:fade|global={{ duration: 200 }}
				class="flex h-16 items-center border-t px-4 first:border-none"
				href="/board/dept/{station.crsCode}"
			>
				<div class="flex-grow">
					<div class="text-xl font-semibold">{station.stationName}</div>
					<div class="-mt-1 text-sm">{station.crsCode} - {station.distance.toFixed(2)}km</div>
				</div>
				<button class="h-10 rounded-lg bg-blue-500 px-4 text-white drop-shadow"
					><ArrowUpRight size={22} /></button
				>
			</a>
		{/each}
	{:else}
		Could not locate
	{/if}
</div>
