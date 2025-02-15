<script lang="ts">
	import { goto } from '$app/navigation';
	import Switcher from '$lib/components/board/switcher.svelte';
	import ClosestSuggestion from '$lib/components/closest-suggestion.svelte';
	import ExtraSuggestion from '$lib/components/extra-suggestion.svelte';
	import Search from '$lib/components/home/search.svelte';
	import PinnedStation from '$lib/components/pinned-station.svelte';
	import { distance } from '$lib/utils';
	import {
		ArrowUpRight,
		Bug,
		Code,
		Code2,
		Github,
		HeartHandshake,
		Locate,
		User
	} from 'lucide-svelte';
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

<div class="full mx-auto min-h-screen max-w-screen-sm justify-center px-4 pt-ios-top">
	<div class="flex flex-col justify-center py-4">
		<div class="text-3xl font-bold">When is my train?</div>
		<div class="text-sm font-medium">The simple train times app powered by National Rail</div>
	</div>

	<div class="flex items-center gap-3 border-b border-zinc-200 pb-3 text-zinc-700">
		<a
			href="https://github.com/isaxk/whenismytrain/issues"
			class="flex items-center gap-1 transition-all hover:text-black"
		>
			<Bug size={18} /> Report Issues
		</a>
		<a
			href="https://github.com/isaxk/whenismytrain"
			class="flex items-center gap-1 transition-all hover:text-black"
		>
			<HeartHandshake size={18} /> Contribute
		</a>
		<a href="https://www.isaxk.com" class="flex items-center gap-1 transition-all hover:text-black">
			<User size={18} /> by isaxk
		</a>
	</div>

	<div class="h-5"></div>

	<Switcher drawer={false}>
		{#snippet suggestions()}
			<div class="mt-2 border-t pt-4">
				{#if closestStation}
					<div class="flex items-center rounded-lg border bg-white p-4 drop-shadow-sm">
						<div class="flex-grow">
							<div class="text-sm font-bold">Closest Station</div>
							<div class="text-3xl font-semibold">
								{closestStation.stationName}
							</div>
							<div>
								{closestStation.crsCode} - {closestStation.distance.toFixed(2)}km
							</div>
						</div>
						<a
							href="/board/dept/{closestStation.crsCode}"
							class="flex h-11 items-center gap-1 rounded-lg bg-blue-500 px-4 text-white drop-shadow"
							><ArrowUpRight size={22} /></a
						>
					</div>
				{/if}
			</div>
		{/snippet}
	</Switcher>

	<div class="pt-6"></div>
</div>
