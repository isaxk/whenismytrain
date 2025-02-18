<script>
	//@ts-nocheck

	import { Status } from '$lib/types';

	import { onMount, onDestroy } from 'svelte';

	let { locations, current } = $props();

	let mapElement;
	let map = $state();
	let leaflet = $state();
	let posIndicator = null;

	function connectTheDots(data) {
		return data.map((l) => l.coords).concat(data.toReversed().map((l) => l.coords));
	}

	onMount(async () => {
		leaflet = await import('leaflet');

		map = leaflet.map(mapElement).setView([51.505, -0.09], 13);
		leaflet
			.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			})
			.addTo(map);
		locations
			.filter((l) => !l.l.isPass)
			.forEach((location) => {
				leaflet.marker(location.coords).addTo(map).bindPopup(location.l.name);
			});
	});

	$effect(() => {
		if (leaflet && map) {
			var greenIcon = new leaflet.Icon({
				iconUrl: '/tram-front.png',
				iconSize: [25, 25],
				iconAnchor: [12, 12],
				popupAnchor: [1, -34],
				shadowSize: [41, 41]
			});

			let coords = locations[current].coords;
			if (locations[current].l.state === Status.DEPARTED) {
				let next = locations[current + 1].coords;
				console.log(coords, next);
				coords = [(coords[0] + next[0]) / 2, (coords[1] + next[1]) / 2];
			}

			if (posIndicator) {
				posIndicator.setLatLng(coords);
			} else {
				posIndicator = leaflet
					.marker(coords, { icon: greenIcon })
					.addTo(map)
					.bindPopup(locations[current].l.name);
				map.setView(coords, 13);
			}

			leaflet.polygon(connectTheDots(locations)).addTo(map);
		}
	});

	onDestroy(async () => {
		if (map) {
			console.log('Unloading Leaflet map.');
			map.remove();
		}
	});
</script>

<div class="h-[200px]">
	<main class="h-[200px] w-full">
		<div bind:this={mapElement}></div>
	</main>
</div>

<style>
	main div {
		height: 200px;
	}
</style>
