<script lang="ts">
	import { operatorList } from '$lib/data/operators';
	import type { Location } from '$lib/types/train';
	import type { Feature } from 'geojson';
	import tinycolor from 'tinycolor2';
	import { LineLayer, MapLibre, GeoJSON, Marker, Popup, NavigationControl } from 'svelte-maplibre';
	import { Position } from '$lib/types';
	import { Train } from 'lucide-svelte';
	import bbox from '@turf/bbox';
	import type { Map, LngLatBoundsLike } from 'maplibre-gl';
	import { onMount, untrack } from 'svelte';
	import { Tween } from 'svelte/motion';

	let {
		locations,
		operator,
		focus,
		filter
	}: { locations: Location[]; operator: string; focus: string; filter: string | null } = $props();

	function desaturateHex(hex: string, percentage: number): string {
		return tinycolor(hex).desaturate(percentage).toHexString();
	}

	const coordinates = $derived(locations.map((l) => l.coordinates));

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

	const secondaryData: Feature | null = $derived.by(() => {
		const division = locations.find((l) => l.division !== null);
		if (division && division.division) {
			return {
				type: 'Feature',
				properties: {
					name: 'train-route-division'
				},
				geometry: {
					type: 'LineString',
					coordinates: division.division?.locations.map((l) => l.coordinates) ?? []
				}
			};
		} else {
			return null;
		}
	});

	const trainPos: [number, number] | null = $derived.by(() => {
		const lastLocIndex = locations.findLastIndex((l) =>
			[Position.ARRIVED, Position.DEPARTED].includes(l.trainRelativePosition)
		);
		const lastLoc = locations[lastLocIndex];
		if (lastLoc && lastLoc.trainRelativePosition === Position.ARRIVED) {
			return lastLoc.coordinates;
		} else if (lastLoc && lastLoc.trainRelativePosition === Position.DEPARTED) {
			const next = locations[lastLocIndex + 1];
			const lat =
				lastLoc.coordinates[0] + (next.coordinates[0] - lastLoc.coordinates[0]) * lastLoc.progress;
			const lng =
				lastLoc.coordinates[1] + (next.coordinates[1] - lastLoc.coordinates[1]) * lastLoc.progress;
			return [lat, lng];
		} else return null;
	});

	const formattedPrimaryLineBbox: LngLatBoundsLike | undefined = $derived.by(() => {
		const bboxResult = bbox(data);
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
				padding: 25
			});
		}
	}

	let oldBox: string | undefined = undefined;
	let once = $state(false);

	$effect(() => {
		console.log(mapObj);
		if (mapObj && formattedPrimaryLineBbox && untrack(() => !once)) {
			setBounds(formattedPrimaryLineBbox);
			once = true;
		}
	});

	const coords = Tween.of(() => trainPos);
</script>

<MapLibre
	onload={() => {
		setBounds(formattedPrimaryLineBbox);
		once = true;
	}}
	style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
	class="relative h-42 max-h-42 min-h-42 w-full sm:aspect-video sm:max-h-full"
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
		{#if secondaryData}
			<GeoJSON id="train-route-division" data={secondaryData}>
				<LineLayer
					layout={{ 'line-cap': 'round', 'line-join': 'round' }}
					paint={{
						'line-width': 5,
						'line-color': operatorList[operator].bg,
						'line-opacity': 1
					}}
				/>
			</GeoJSON>
		{/if}
		{#each locations.filter((l) => l.isCallingPoint) as { coordinates, crs, tiploc, name, division, trainRelativePosition: pos, progress }, i (tiploc + i)}
			{#if division && division.callingPoints}
				{#each division.callingPoints as { coordinates, name, crs }, i (tiploc + i + 'division')}
					<Marker lngLat={coordinates} zIndex={0} class="h-7 w-7 bg-transparent">
						<div
							class="flex h-full w-full items-center justify-center rounded-full text-[10px]"
							style:background={crs === filter || crs === focus
								? operatorList[operator].bg
								: desaturateHex(operatorList[operator].bg, 50)}
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
						: desaturateHex(operatorList[operator].bg, 10)}
					style:color={crs === filter || crs === focus ? '#fff' : '#ffffff99'}
				>
					{crs}
				</div>
				<Popup openOn="hover" offset={[0, -10]} popupClass="z-[2000]">
					<div class="font-sans text-sm font-bold">{name}</div>
				</Popup>
			</Marker>
		{/each}
		{#if trainPos && coords.current}
			<Marker
				lngLat={coords.current}
				class="flex size-8 items-center justify-center bg-transparent"
				zIndex={3}
			>
				<div
					class={['flex items-center justify-center rounded-full border-2', 'size-7 text-[9px]']}
					style:background="white"
					style:color={operatorList[operator].bg}
					style:border-color={operatorList[operator].bg}
				>
					<Train size={18} />
				</div>
			</Marker>
		{/if}
	{/snippet}
</MapLibre>
