<script lang="ts">
	import { browser } from '$app/environment';
	import type { ServiceDetailsLocation } from '$lib/types/extentions';
	import { Map, TileLayer, Marker, Polyline, Popup } from 'sveaflet';
	import { icon } from 'leaflet';
	import { Status } from '$lib/types';
	import { Tween } from 'svelte/motion';
	import { MaptilerLayer } from '@maptiler/leaflet-maptilersdk';

	let {
		color,
		locations,
		current,
		expanded = true
	}: {
		color: string;
		expanded: boolean;
		locations: { l: ServiceDetailsLocation; coords: [number, number] }[];
		current: number;
	} = $props();

	let map = $state();

	const currentPosCoords: [number, number] = $derived.by(() => {
		if (current) {
			const a = locations[current];
			console.log(a);
			console.log(a.l.state, Status.DEPARTED);
			if (a.l.state !== Status.DEPARTED) {
				return a.coords;
			} else {
				const next = locations[current + 1];
				return [(a.coords[0] + next.coords[0]) / 2, (a.coords[1] + next.coords[1]) / 2];
			}
		} else {
			return locations[0].coords;
		}
	});

	const tweenedX = new Tween(0);
	const tweenedY = new Tween(0);

	$effect(() => {
		tweenedX.set(currentPosCoords[0]);
		tweenedY.set(currentPosCoords[1]);
	});

	const pointIcon = icon({
		iconUrl: `/api/icons/${color.replace('#', '')}/pin`,
		iconSize: [25, 25],
		iconAnchor: [12, 12]
	});

	const passedIcon = icon({
		iconUrl: `/api/icons/${color.replace('#', '')}/done`,
		iconSize: [25, 25],
		iconAnchor: [12, 12]
	});

	const trainIcon = icon({
		iconUrl: `/api/icons/${color.replace('#', '')}/train`,
		iconSize: [25, 25],
		iconAnchor: [12, 12]
	});
</script>

{#if browser}
	<div class={['h-[150px] w-full']}>
		<Map
			options={{
				center: currentPosCoords,
				zoom: 11
			}}
		>
			<TileLayer url={`https://tile.openstreetmap.org/{z}/{x}/{y}.png`} />
			{#each locations.filter((l) => !l.l.isPass && l.l.crs) as location, i (location.coords)}
				<Marker
					latLng={location.coords}
					options={{ icon: location.l.state === Status.DEPARTED ? passedIcon : pointIcon }}
				>
					<Popup options={{ content: location.l.name }} />
				</Marker>
			{/each}
			{#if current}
				<Marker
					latLng={[tweenedX.current, tweenedY.current]}
					options={{ icon: trainIcon, zIndexOffset: 1000 }}
				></Marker>
			{/if}
			<Polyline
				latLngs={locations.map((l) => l.coords)}
				options={{
					smoothFactor: 1,
					weight: 5,
					color
				}}
			/>
		</Map>
	</div>
{/if}
