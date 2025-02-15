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
	import Skeleton from '../skeleton.svelte';
	import type { TrainService } from '$lib/types';

	let { crs, date, destCrs } = $props();

	let data: SvelteMap<string, TrainService> | null = $state(null);

	let elm: HTMLAnchorElement;

	onMount(async () => {
		const newDate = dayjs(date).add(2, 'minutes');
		const response = await getTrainServices(crs, null, newDate.toISOString(), 10);
		data = new SvelteMap(
			response.filter(
				([, t]) => t.destination.crs !== destCrs && (t.estimated ?? t.scheduled ?? '') > date
			)
		);
	});
</script>

<a
	bind:this={elm}
	href="/board/dept/{crs}/{dayjs(date).format('HH:mm')}"
	class="flex h-40 flex-col border-b border-zinc-300 pb-2"
>
	<div class="flex items-center px-1 pb-2">
		<div class="flex-grow text-sm font-medium">
			Transfer departures:
			<div class="text-xs text-zinc-700">(from {dayjs(date).format('HH:mm')})</div>
		</div>
		<div class="rounded bg-blue-500 p-1 text-white"><ArrowUpRight size={14} /></div>
	</div>

	<div class={['grid flex-grow grid-rows-5 text-sm', !data && 'gap-0.5']}>
		{#if data}
			{#each Array.from(data).slice(0, 5) as [, train], i}
				<div
					in:fade|global={{ duration: 200 }}
					class={['flex w-full items-center py-0.5 pl-0.5 pr-2', i % 2 === 0 && 'bg-zinc-200/50']}
				>
					<div
						class="h-full w-1 rounded-sm"
						style:background={operatorList[train.operator].bg}
					></div>
					<div class="w-2"></div>
					<div class="flex-grow">
						{train.destination.name ?? ''}
					</div>
					<TimeDisplay
						small
						preview
						et={train.actual ?? train.estimated ?? 'Delayed'}
						st={train.scheduled}
						isCancelled={train.isCancelled}
					/>
				</div>
			{/each}
		{:else}
			{#each Array(5)}
				<Skeleton class="h-full w-full bg-zinc-200" />
			{/each}
		{/if}
	</div>
</a>
<div class="h-2"></div>
