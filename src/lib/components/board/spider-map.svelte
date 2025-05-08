<script lang="ts">
	import type { SpiderMap } from '$lib/types/board';
	import { MapLibre, GeoJSON, LineLayer } from 'svelte-maplibre';

	let { spiderMap }: { spiderMap: SpiderMap[] } = $props();

	const lines = $derived(
		spiderMap.map((s, i) => {
			return {
				type: 'Feature',
				properties: {
					name: (i + Date.now() * Math.random()).toString(),
					color: s.color
				},
				geometry: {
					type: 'LineString',
					coordinates: s.coordsList.map((l) => l.coords)
				}
			};
		})
	);
</script>

<MapLibre
	zoom={10}
	style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
	class="relative h-52 w-60"
>
	{#each lines as line, i (i + Date.now() * Math.random())}
		<GeoJSON id={line.properties.name} data={line}>
			<LineLayer
				layout={{ 'line-cap': 'round', 'line-join': 'round' }}
				paint={{
					'line-width': 5,
					'line-color': line.properties.color,
					'line-opacity': 1
				}}
			/>
		</GeoJSON>
	{/each}
</MapLibre>
