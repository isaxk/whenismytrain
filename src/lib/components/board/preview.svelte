<script lang="ts">
	import type { definitions } from '$lib/types/api';
	import { getTrainServices } from '$lib/utils/api';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';
	import TimeDisplay from '../time-display.svelte';
	import { ArrowRight, ArrowUpRight } from 'lucide-svelte';
	import dayjs from 'dayjs';
	import { goto } from '$app/navigation';
	import { operatorList } from '$lib/data/operators';

	let { crs, date, destCrs } = $props();

	let data: SvelteMap<string, definitions['ServiceItem']> = $state(new SvelteMap([]));

	onMount(async () => {
		const newDate = dayjs(date).add(2, 'minutes');
		const response = await getTrainServices(crs, newDate.toISOString(), 8);
		data = new SvelteMap(response.filter(([, t]) => t.destination![0].crs !== destCrs));
	});
</script>

<a href="/dept/{crs}" class="flex h-40 flex-col rounded-md border bg-zinc-100 drop-shadow-sm">
	<div class="flex px-2 py-2">
		<div class="flex-grow font-medium">Transfer departures:</div>
		<div class="rounded bg-blue-500 p-1 text-white"><ArrowUpRight size={16} /></div>
	</div>
	<div class="grid flex-grow grid-rows-5 text-sm">
		{#each Array.from(data).slice(0, 5) as [, train], i}
			<div
				in:fade={{ duration: 200 }}
				class={['flex w-full items-center py-0.5 pl-0.5 pr-2', i % 2 === 0 && 'bg-zinc-200/50']}
			>
				<div class="h-full w-1 rounded-sm" style:background={operatorList[train.operatorCode].bg}></div>
				<div class="w-2"></div>
				<div class="flex-grow">
					{train.destination![0].locationName ?? ''}
				</div>
				<TimeDisplay
					small
					preview
					et={train.atd ?? train.etd ?? train.std!}
					st={train.std}
					isCancelled={train.isCancelled}
				/>
			</div>
		{/each}
	</div>
</a>
<div class="h-2"></div>
