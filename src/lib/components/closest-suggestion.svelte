<script lang="ts">
	import { ArrowUpRight } from 'lucide-svelte';

	let { stationName, crsCode, distance } = $props();
</script>

<div class="row-span-3 flex flex-col rounded-lg border bg-white p-4 drop-shadow">
	<div class="font-semibold">Closest Station:</div>
	<div class="flex flex-grow flex-col gap-2 pt-2">
		<div class="flex flex-grow items-center">
			<div class="flex-grow">
				<div class="text-extralight -mb-1 text-xl">{crsCode}</div>
				<div class="text-4xl font-bold">
					{stationName}
				</div>
			</div>
			<div class="text-xl"><span class="font-medium">{distance.toFixed(2)}</span> km</div>
		</div>
		<a
			href="/dept/{crsCode}"
			class="flex h-11 items-center justify-center rounded-lg bg-blue-500 text-center text-white placeholder-gray-300 drop-shadow-xl transition-all duration-300 hover:brightness-105"
			><ArrowUpRight size={24} /></a
		>
	</div>
</div>
