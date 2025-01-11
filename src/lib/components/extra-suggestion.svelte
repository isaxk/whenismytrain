<script lang="ts">
	import { ArrowUpRight } from 'lucide-svelte';

	let { stationName, crsCode, distance } = $props();
</script>

<div
	class="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-zinc-600 drop-shadow-sm"
>
	<div class="flex-grow">
		<div class="text-xl font-medium">{stationName}</div>
		<div class="text-sm">{crsCode} - {distance.toFixed(2)}km</div>
	</div>
	<a
		href="/dept/{crsCode}"
		class="h-max rounded-lg bg-blue-500 px-4 py-2 text-center text-white drop-shadow-xl transition-all duration-300 hover:brightness-105"
		><ArrowUpRight size={22} /></a
	>
</div>
