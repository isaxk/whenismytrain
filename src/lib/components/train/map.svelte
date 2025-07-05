<script lang="ts">
	import { operatorList } from '$lib/data/operators';
	import type { CallingPoint, Location } from '$lib/types/train';
	import type { Feature } from 'geojson';
	import tinycolor from 'tinycolor2';
	import { LineLayer, MapLibre, GeoJSON, Marker, Popup, NavigationControl } from 'svelte-maplibre';
	import { Position } from '$lib/types';
	import { Album, Train } from 'lucide-svelte';
	import bbox from '@turf/bbox';
	import type { Map, LngLatBoundsLike } from 'maplibre-gl';
	import { onMount, untrack } from 'svelte';
	import { Tween } from 'svelte/motion';

	let {
		locations,
		operator,
		focus,
		filter,
		focusedCallingPoints,
		expanded
	}: {
		locations: Location[];
		operator: string;
		focus: string;
		filter: string | null;
		focusedCallingPoints: CallingPoint[];
		expanded: boolean;
	} = $props();

	function desaturateHex(hex: string, percentage: number): string {
		return tinycolor(hex).desaturate(percentage).toHexString();
	}

	const coordinates = $derived(locations.filter((c) => !c.isCancelled).map((l) => l.coordinates));
	const toBoundsCoords = $derived(focusedCallingPoints.map((l) => l.coordinates));

	const data: Feature = $derived({
		type: 'Feature',
		properties: {
			name: 'train-route'
		},
		geometry: {
			type: 'LineString',
			coordinates: coordinates
		}
	});

	const trainPos: [number, number] | null = $derived.by(() => {
		const lastLocIndex = locations.findLastIndex((l) =>
			[Position.ARRIVED, Position.DEPARTED].includes(l.trainRelativePosition)
		);

		const lastLoc = locations[lastLocIndex];
		if (lastLoc && lastLoc.trainRelativePosition === Position.ARRIVED) {
			console.log(lastLoc.progress);
			return lastLoc.coordinates;
		} else if (lastLoc && lastLoc.trainRelativePosition === Position.DEPARTED) {
			console.log(lastLoc.progress);
			const next = locations[lastLocIndex + 1];
			const lat =
				lastLoc.coordinates[0] + (next.coordinates[0] - lastLoc.coordinates[0]) * lastLoc.progress;
			const lng =
				lastLoc.coordinates[1] + (next.coordinates[1] - lastLoc.coordinates[1]) * lastLoc.progress;
			return [lat, lng];
		} else return null;
	});

	const toBounds: Feature = $derived({
		type: 'Feature',
		properties: {
			name: 'train-route'
		},
		geometry: {
			type: 'LineString',
			coordinates: trainPos ? [trainPos, ...toBoundsCoords] : toBoundsCoords
		}
	});

	const formattedPrimaryLineBbox: LngLatBoundsLike | undefined = $derived.by(() => {
		const bboxResult = bbox(expanded ? data : toBounds);
		if (bboxResult && (bboxResult.length === 4 || bboxResult.length === 6)) {
			if (bboxResult.length === 6) {
				// If it's a 6-element bbox, take the 2D part (first 4 elements)
				return [
					bboxResult[0], // minX (west)
					bboxResult[1], // minY (south)
					bboxResult[3], // maxX (east)
					bboxResult[4] // maxY (north)
				] as [number, number, number, number];
			} else {
				// bboxResult.length === 4
				return bboxResult as [number, number, number, number];
			}
		}
		return undefined; // Return undefined if bbox calculation fails or is empty
	});

	let mapObj: Map | undefined = $state(undefined);

	function setBounds(bbox?: LngLatBoundsLike) {
		if (mapObj && bbox) {
			mapObj.fitBounds(bbox, {
				padding: {
					top: expanded ? 50 : 20,
					bottom: expanded ? 60 : 35,
					left: expanded ? 50 : 60,
					right: expanded ? 50 : 20
				}
			});
		}
	}

	let oldBox: string | undefined = undefined;
	let once = $state(false);
	let oldExpanded = false;

	$effect(() => {
		console.log(mapObj, expanded);
		if (expanded !== oldExpanded) {
			oldExpanded = expanded;
			setTimeout(() => {
				setBounds(formattedPrimaryLineBbox);
			}, 100);
		}
		if (mapObj && formattedPrimaryLineBbox && untrack(() => !once)) {
			setBounds(formattedPrimaryLineBbox);
			once = true;
		}
	});

	const coords = new Tween(locations[0].coordinates);

	$effect(() => {
		if (trainPos) {
			coords.set(trainPos);
		}
	});

	console.log('location', locations);
</script>

<div class={['h-full w-full']}>
	<MapLibre
		onload={() => {
			setBounds(formattedPrimaryLineBbox);
			once = true;
		}}
		center={untrack(() => locations.find((l) => l.crs === focus)?.coordinates ?? [0, 52])}
		zoom={10}
		style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
		class="relative h-full w-full"
		bind:map={mapObj}
	>
		{#snippet children({ map })}
			<NavigationControl position="top-left" />
			<GeoJSON id="train-route" {data}>
				<LineLayer
					layout={{ 'line-cap': 'round', 'line-join': 'round' }}
					paint={{
						'line-width': 5,
						'line-color': operatorList[operator].bg,
						'line-opacity': 1
					}}
				/>
			</GeoJSON>

			{#each locations.filter((l) => l.isCallingPoint) as { coordinates, crs, isCancelled, tiploc, name, division, trainRelativePosition: pos, progress }, i (tiploc + i)}
				{#if division && division.callingPoints}
					{#each division.callingPoints as { coordinates, name, crs }, i (tiploc + i + 'division')}
						<Marker lngLat={coordinates} zIndex={0} class="h-7 w-7 bg-transparent">
							<div
								class="flex h-full w-full items-center justify-center rounded-full text-[10px]"
								style:background={desaturateHex(operatorList[operator].bg, 80)}
								style:color={crs === filter || crs === focus ? '#fff' : '#ffffff99'}
							>
								{crs}
							</div>
							<Popup openOn="hover" offset={[0, -10]}>
								<div class="font-sans text-sm font-bold">{name}</div>
							</Popup>
						</Marker>
					{/each}
				{/if}
				<Marker
					lngLat={coordinates}
					class="flex size-8 items-center justify-center bg-transparent"
					zIndex={crs === filter || crs === focus ? 2 : 1}
				>
					<div
						class={[
							'flex items-center justify-center rounded-full',
							crs === filter || crs === focus
								? 'size-7 text-[10px] font-medium drop-shadow-xl'
								: 'size-7 text-[9px]'
						]}
						style:background={crs === filter || crs === focus
							? operatorList[operator].bg
							: desaturateHex(operatorList[operator].bg, isCancelled ? 50 : 10)}
						style:color={crs === filter || crs === focus
							? operatorList[operator].text
							: `${operatorList[operator].text}E4`}
					>
						{crs}
					</div>
					<Popup openOn="hover" offset={[0, -10]} popupClass="z-[2000]">
						<div class="font-sans text-sm font-bold">{name}</div>
					</Popup>
				</Marker>
			{/each}
			{#key locations}
				{#if trainPos && coords.current}
					<Marker
						lngLat={coords.current}
						class="flex size-8 items-center justify-center bg-transparent"
						zIndex={3}
					>
						<div
							class={[
								'flex items-center justify-center rounded-full border-2',
								'size-7 text-[9px]'
							]}
							style:background="white"
							style:color={operatorList[operator].bg}
							style:border-color={operatorList[operator].bg}
						>
							<Train size={18} />
						</div>
					</Marker>
				{/if}
			{/key}
		{/snippet}
	</MapLibre>
</div>
