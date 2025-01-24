<script lang="ts">
	import type { definitions } from '$lib/types/api';
	import { getTrainServices } from '$lib/utils/api';
	import { duration } from 'dayjs';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';
	import TimeDisplay from '../time-display.svelte';

	let { crs, date } = $props();

	let data: SvelteMap<string, definitions['ServiceItem']> = $state(new SvelteMap([]));

	onMount(async () => {
		data = new SvelteMap(await getTrainServices(crs, date, 5));
	});
</script>

<div class="h-32 rounded-md bg-zinc-200 px-2 py-1">
	<div class="font-medium">Transfer departures:</div>
	<div class="flex flex-col text-sm">
		{#each data as [, train]}
			<div in:fade={{ duration: 200 }} class="flex w-full">
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
</div>
<div class="h-2"></div>
