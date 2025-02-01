<script lang="ts">
	import { goto } from '$app/navigation';
	import Switcher from '$lib/components/board/switcher.svelte';
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

<div class="full mx-auto flex min-h-screen max-w-screen-md flex-col justify-center px-4 pt-ios-top">
	<div class="py-8">
		<div class="text-3xl font-bold">When is my train?</div>
		<div class="text-xl">The convinient UK Train times app</div>
	</div>

	<Switcher drawer={false} />

	<div class="pt-6"></div>
</div>
