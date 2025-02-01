<script lang="ts">
	import { ArrowUpRight } from 'lucide-svelte';

	let { stationName, crsCode, distance, onSelect } = $props();
</script>

<button
	onclick={()=>onSelect(crsCode)}
	class="flex items-center text-left w-full gap-2 border-b last:border-none bg-white px-4 py-2 text-zinc-600 drop-shadow-sm"
>
	<div class="flex-grow">
		<div class="text-xl font-medium">{stationName}</div>
		<div class="text-sm">
			{crsCode}{#if distance}
				- {distance.toFixed(2)}km{/if}
		</div>
	</div>
	<div
		class="h-max rounded-lg bg-blue-500 px-4 py-2 text-center text-white drop-shadow-xl transition-all duration-300 hover:brightness-105"
		><ArrowUpRight size={22} /></div
	>
</button>
