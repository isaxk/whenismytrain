<script lang="ts">
	import { ArrowUpRight } from 'lucide-svelte';

	let { stationName, crsCode, distance, drawer = false, onSelect } = $props();
</script>

<button
	onclick={()=>onSelect(crsCode)}
	class="z-10 row-span-3 flex flex-col border-b bg-white w-full text-left px-4 py-2 drop-shadow-sm"
>
	<div class="flex gap-2 items-center w-full">
		<div class="flex items-center flex-grow">
			<div class="flex-grow">
				<div class="text-3xl font-bold">
					{stationName}
				</div>
				<div class="text-extralight -mt-1 text-lg">
					{crsCode} - <span class="font-medium">{distance.toFixed(2)}</span> km
				</div>
			</div>
		</div>
		<div
			class="flex h-10 px-4 items-center justify-center rounded-lg bg-blue-500 text-center text-white placeholder-gray-300 drop-shadow-xl transition-all duration-300 hover:brightness-105"
			><ArrowUpRight size={22} /></div
		>
	</div>
</button>
