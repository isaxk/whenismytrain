<script lang="ts">
	import { dontMove } from '$lib/state/dont-move.svelte';
	import { Status, type ServiceLocation } from '$lib/types/train';
	import { Icon, Map, Marker, Polyline, TileLayer } from 'sveaflet';
	import { untrack } from 'svelte';
	import { Tween } from 'svelte/motion';

	let {
		focusedStation,
		locations,
		color,
		focus,
		zoom,
		onSelect
	}: {
		focusedStation: string | undefined;
		locations: ServiceLocation[];
		color: string;
		focus: string | null;
		zoom: number;
		onSelect: (tiploc: string) => void;
	} = $props();

	$inspect(locations);

	const commonIconOptions = {
		iconSize: [25, 25],
		iconAnchor: [12, 12]
	};

	const stationIconOptions = $derived({
		...commonIconOptions,
		iconUrl: `/api/icons/${color.replace('#', '')}/pin`
	});

	const focusIconOptions = $derived({
		...commonIconOptions,
		iconUrl: `/api/icons/${color.replace('#', '')}/focus`
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

	const tween = new Tween([0, 0]);

	$effect(() => {});

	const coords = $derived.by(() => {
		const { i, current } = currentLoc;
		if (!current) return [locations[0].coords[0], locations[0].coords[1]];
		if (current.status === Status.ARRIVED) {
			return current.coords;
		} else {
			const next = locations[i + 1];
			if (!next) return current.coords;
			const x = current.coords[0] + (next.coords[0] - current.coords[0]) * current.progress;
			const y = current.coords[1] + (next.coords[1] - current.coords[1]) * current.progress;
			return [x, y];
		}
	});
	$effect(() => {
		tween.set(coords);
	});
	let init = false;
	let focusCoords = $state([locations[0].coords[0], locations[0].coords[1]]);
	$effect(() => {
		if (tween.target[0] !== 0 && tween.target[1] !== 0 && !init) {
			focusCoords = tween.target;
			init = true;
		}
	});

	$effect(() => {
		if (focus) {
			focusCoords = locations.find((l) => l.tiploc === focus)?.coords ?? [
				locations[0].coords[0],
				locations[0].coords[1]
			];
		} else {
			focusCoords = untrack(() => tween.target);
		}
	});
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
	<Map options={{ center: focusCoords, zoom }}>
		<TileLayer url={'https://tile.openstreetmap.org/{z}/{x}/{y}.png'} />
		{#each locations.filter((l) => l.isCallingPoint && !l.isCancelled) as l (l.tiploc)}
			<Marker latLng={l.coords} onclick={() => onSelect(l.tiploc)}>
				{#key color && focus}
					{#if focusedStation == l.tiploc}
						<Icon options={focusIconOptions} />
					{:else if l.status === Status.DEPARTED}
						<Icon options={doneIconOptions} />
					{:else}
						<Icon options={stationIconOptions} />
					{/if}
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
		{/key}
	</Map>
</div>
