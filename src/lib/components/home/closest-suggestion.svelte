<script lang="ts">
	import { ArrowUpRight } from 'lucide-svelte';

	let { stationName, crsCode, distance, drawer = false, onSelect } = $props();
</script>

<button
	onclick={() => onSelect(crsCode)}
	class="bg-card z-10 row-span-3 flex w-full flex-col border-b px-4 py-2 text-left drop-shadow-sm"
>
	<div class="flex w-full items-center gap-2">
		<div class="flex flex-grow items-center">
			<div class="flex-grow">
				<div class="text-xl font-bold">
					{stationName}
				</div>
				<div class="text-extralight -mt-1 text-lg">
					{crsCode} - <span class="font-medium">{distance.toFixed(2)}</span> km
				</div>
			</div>
		</div>
		<div
			class="flex h-10 items-center justify-center rounded-lg bg-blue-500 px-4 text-center text-white placeholder-gray-300 drop-shadow-xl transition-all duration-300 hover:brightness-105"
		>
			<ArrowUpRight size={22} />
		</div>
	</div>
</button>
