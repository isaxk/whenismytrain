<script lang="ts">
	import { ArrowUpRight } from 'lucide-svelte';

	let { stationName, crsCode, distance, onSelect } = $props();
</script>

<button
	onclick={() => onSelect(crsCode)}
	class="bg-card flex w-full items-center gap-2 border-b px-4 py-2 text-left text-zinc-600 drop-shadow-sm last:border-none"
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
	>
		<ArrowUpRight size={22} />
	</div>
</button>
