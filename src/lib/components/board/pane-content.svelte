<script lang="ts">
	import { preloadData } from '$app/navigation';
	import type { Train } from '$lib/types/train';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import TrainCard from '../train/train-card.svelte';
	import { receive, send } from '$lib/utils/transitions';
	import { fade, scale } from 'svelte/transition';
	import Skeleton from '../ui/skeleton.svelte';
	import { operatorList } from '$lib/data/operators';
	import Map from '../train/map.svelte';
	import { Accordion } from 'bits-ui';
	import CallingPoint from '../train/calling-point.svelte';
	import Disruption from '../ui/disruption.svelte';
	import dayjs from 'dayjs';
	import Refreshbar from '../ui/refreshbar.svelte';

	let { train, crs }: { train: Train; crs: string } = $props();

	let trainCard = $state(null);
	let service: any | null = $state(null);
	let refreshing = $state(false);
	let lastUpdated = $state(dayjs());

	let timeout: ReturnType<typeof setTimeout>;

	function refresh() {
		clearTimeout(timeout);
		refreshing = true;
		setTimeout(async () => {
			const response = await fetch(`/api/service/${train.id}/${crs}`);
			service = await response.json();
			refreshing = false;
			lastUpdated = dayjs();
			timeout = setTimeout(refresh, 10000);
		}, 500);
	}

	onMount(() => {
		refresh();
	});

	onDestroy(() => {
		clearTimeout(timeout);
	});
</script>

<div class="flex h-full flex-col">
	<TrainCard train={trainCard ?? train} />
	<div class="-mt-2 pb-2 pl-5" transition:fade|global={{ duration: 200 }}>
		<div
			class="w-max rounded-lg px-2.5 py-1 text-sm"
			style:color={operatorList[train.operator].text}
			style:background={operatorList[train.operator].bg}
		>
			{operatorList[train.operator].name}
		</div>
	</div>

	{#if service !== null}
		<Refreshbar
			interval={10000}
			{lastUpdated}
			{refreshing}
			color={operatorList[train.operator].bg}
		/>
		{#if service.cancelReason || service.delayReason}
			<div class="border-border border-t px-5 pt-2 pb-2">
				<Disruption
					isCancelled={service.focus.isCancelled}
					code={service.cancelReason ?? service.delayReason ?? null}
				/>
			</div>
		{/if}
		<Map locations={service.locations} color={operatorList[service.trainCard.operator].bg} />

		<Accordion.Root
			class="border-border min-h-0 flex-grow overflow-y-scroll border-t py-4"
			type="single"
			value={undefined}
		>
			<div class="h-full" transition:fade|global={{ duration: 200 }}>
				{#each service.callingPoints as location, i (location.tiploc)}
					<CallingPoint
						{i}
						{location}
						length={service.callingPoints.length}
						operator={service.trainCard.operator}
					/>
				{/each}
			</div>
		</Accordion.Root>
	{:else}
		<div class="border-border flex flex-col gap-0.5 border-t py-4">
			{#each Array(10)}
				<Skeleton class="h-14 w-full" />
			{/each}
		</div>
	{/if}
</div>
