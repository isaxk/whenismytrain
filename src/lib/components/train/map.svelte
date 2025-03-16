<script lang="ts">
	import { dontMove } from '$lib/state/dont-move.svelte';
	import { Status, type ServiceLocation } from '$lib/types/train';
	import { Icon, Map, Marker, Polyline, TileLayer } from 'sveaflet';
	import { Tween } from 'svelte/motion';

	let { locations, color }: { locations: ServiceLocation[]; color: string } = $props();

	const commonIconOptions = {
		iconSize: [25, 25],
		iconAnchor: [12, 12]
	};

	const stationIconOptions = $derived({
		...commonIconOptions,
		iconUrl: `/api/icons/${color.replace('#', '')}/pin`
	});

	const cancelledIconOptions = $derived({
		...commonIconOptions,
		iconUrl: `/api/icons/71717a/pin`
	});

	const doneIconOptions = $derived({
		...commonIconOptions,
		iconUrl: `/api/icons/${color.replace('#', '')}/done`
	});

	const trainIconOptions = $derived({
		...commonIconOptions,
		iconUrl: `/api/icons/${color.replace('#', '')}/train`
	});

	const currentLoc = $derived.by(() => {
		const i = locations.findLastIndex(
			(l) => l.status === Status.ARRIVED || l.status === Status.DEPARTED
		);
		const current: ServiceLocation | null = locations[i] ?? null;
		return { i, current };
	});

	const coords = $derived.by(() => {
		const { i, current } = currentLoc;
		if (!current) return [locations[0].coords[0], locations[0].coords[1]];
		if (current.status === Status.ARRIVED) {
			return current.coords;
		} else {
			const next = locations[i + 1];
			if (!next) return current.coords;
			return [(current.coords[0] + next.coords[0]) / 2, (current.coords[1] + next.coords[1]) / 2];
		}
	});
	$effect(() => {
		tween.set(coords);
	});
	const tween = new Tween([0, 0]);

	console.log(locations.map((l) => l.coords));
</script>

<svelte:window
	onmouseup={() => (dontMove.current = false)}
	ontouchend={() => (dontMove.current = false)}
/>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="z-0 h-[150px] min-h-[150px] w-full"
	onmousedown={(e) => {
		e.stopPropagation();
		dontMove.current = true;
	}}
	ontouchstart={(e) => {
		e.stopPropagation();
		dontMove.current = true;
	}}
>
	<Map options={{ center: tween.current, zoom: 9 }}>
		<TileLayer url={'https://tile.openstreetmap.org/{z}/{x}/{y}.png'} />
		{#each locations.filter((l) => l.isCallingPoint && !l.isCancelled) as l (l.tiploc)}
			<Marker latLng={l.coords}>
				{#key color}
					{#if l.status === Status.DEPARTED}
						<Icon options={doneIconOptions} />
					{:else}
						<Icon options={stationIconOptions} />
					{/if}
				{/key}
			</Marker>
		{/each}
		{#each locations.filter((l) => l.isCallingPoint && l.isCancelled) as l (l.tiploc)}
			<Marker latLng={l.coords}>
				{#key color}
					<Icon options={cancelledIconOptions} />
				{/key}
			</Marker>
		{/each}
		{#if currentLoc.current}
			<Marker latLng={tween.current} options={{ zIndexOffset: 1000 }}>
				{#key color}
					<Icon options={trainIconOptions} />
				{/key}
			</Marker>
		{/if}
		{#key locations}
			<Polyline
				latLngs={locations.filter((l) => !l.isCancelled).map((l) => l.coords)}
				options={{
					smoothFactor: 1,
					weight: 5,
					color
				}}
			/>
			<Polyline
				latLngs={locations.filter((l) => l.isCancelled).map((l) => l.coords)}
				options={{
					smoothFactor: 1,
					weight: 5,
					color: '#71717a'
				}}
			/>
		{/key}
	</Map>
</div>
