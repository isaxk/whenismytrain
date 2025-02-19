<script>
	//@ts-nocheck

	import { Status } from '$lib/types';
	import { smoothLine } from '$lib/utils/bezier';

	import { onMount, onDestroy } from 'svelte';

	let { locations, current, color } = $props();

	$inspect(locations);

	let mapElement;
	let map = $state();
	let leaflet = $state();
	let posIndicator = null;

	function connectTheDots(data) {
		console.log(
			smoothLine(
				data.map((l) => {
					return { x: l.coords[0], y: l.coords[1] };
				})
			)
		);
		return data.map((l) => l.coords);
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
		var mapPin = new leaflet.Icon({
			iconUrl: `/api/icons/${color.replace('#', '')}/pin`,
			iconSize: [25, 25],
			iconAnchor: [12, 12],
			popupAnchor: [1, -25],
			shadowSize: [41, 41]
		});
		var donePin = new leaflet.Icon({
			iconUrl: `/api/icons/${color.replace('#', '')}/done`,
			iconSize: [25, 25],
			iconAnchor: [12, 12],
			popupAnchor: [1, -25],
			shadowSize: [41, 41]
		});
		locations
			.filter((l) => !l.l.isPass)
			.forEach((location) => {
				leaflet
					.marker(location.coords, {
						icon: location.l.state === Status.DEPARTED ? donePin : mapPin
					})
					.addTo(map)
					.bindPopup(location.l.name);
			});
		leaflet.polyline(connectTheDots(locations), { color: color, weight: 5 }).addTo(map);
	});

	$effect(() => {
		if (leaflet && map) {
			var trainIcon = new leaflet.Icon({
				iconUrl: `/api/icons/${color.replace('#', '')}/train`,
				iconSize: [25, 25],
				iconAnchor: [12, 12],
				popupAnchor: [1, -25],
				shadowSize: [41, 41]
			});

			if (current) {
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
						.marker(coords, { icon: trainIcon })
						.addTo(map)
						.bindPopup(locations[current].l.name);
					map.setView(coords, 13);
				}
			} else {
				map.setView(locations[0].coords, 13);
			}
		}
	});

	onDestroy(async () => {
		if (map) {
			console.log('Unloading Leaflet map.');
			map.remove();
		}
	});
</script>

<main class="z-0 h-full w-full overflow-y-hidden object-cover">
	<div bind:this={mapElement}></div>
</main>

<style>
	main div {
		height: 200px;
		z-index: 0 !important;
	}
	:global(.leaflet-control-attribution) {
		bottom: 8px;
	}
</style>
