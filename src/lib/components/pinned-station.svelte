<script lang="ts">
	import { type definitions } from '$lib/types/api';
	import { ArrowUpRight, PinOff } from 'lucide-svelte';

	let { crs } = $props();

	let stationData = new Promise<definitions['StationBoard']>((resolve) => {
		fetch(`/api/dept/${crs}/0/0`).then((r) => {
			r.json().then((j) => {
				resolve(j);
			});
		});
	});
</script>

<div
	class="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-zinc-600 drop-shadow-sm"
>
	{#await stationData then data}
		<div class="flex-grow">
			<div class="text-xl font-medium">{data.locationName}</div>
			<div class="text-sm">{crs}</div>
		</div>
	{/await}
	<button
		class="h-max rounded-lg bg-zinc-300 px-4 py-2 text-center text-zinc-600 drop-shadow-xl transition-all duration-300 hover:brightness-105"
		><PinOff size={22} /></button
	>
	<a
		href="/dept/{crs}"
		class="h-max rounded-lg bg-blue-500 px-4 py-2 text-center text-white drop-shadow-xl transition-all duration-300 hover:brightness-105"
		><ArrowUpRight size={22} /></a
	>
</div>
