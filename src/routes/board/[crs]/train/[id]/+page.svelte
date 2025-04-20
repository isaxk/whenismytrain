<script lang="ts">
	import { onMount } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Accordion } from 'bits-ui';
	import { X } from 'lucide-svelte';

	import CallingPoint from '$lib/components/train/calling-point/calling-point.svelte';
	import Map from '$lib/components/train/map.svelte';
	import TrainCard from '$lib/components/train/train-card.svelte';
	import TrainSaveToggle from '$lib/components/train/train-save-toggle.svelte';
	import Disruption from '$lib/components/ui/disruption.svelte';
	import Refreshbar from '$lib/components/ui/refreshbar.svelte';
	import Skeleton from '$lib/components/ui/skeleton.svelte';
	import { operatorList } from '$lib/data/operators.js';
	import { refresher } from '$lib/state/refresh.svelte.js';
	import { type ServiceDetails } from '$lib/types/train.js';

	let { data } = $props();

	const md = new MediaQuery('(min-width: 768px)');

	let service: ServiceDetails | null = $state(null);
	let zoom = $state(10);
	let focusedStation: string | undefined = $state(undefined);

	let mapFocus: [number, number] | null = $derived.by(() => {
		if (!service) return null;
		const found = service?.callingPoints.find((point) => point.tiploc === focusedStation);
		return found?.coords || null;
	});

	onMount(() => {
		const refresh = refresher.add(async () => {
			const res = await fetch(`/api/service/${data.id}/${data.crs}`);
			const newData = await res.json();
			service = newData;
		});
		return () => {
			refresher.remove(refresh);
		};
	});

	$effect(() => {
		service = null;
		data.service.then((d) => {
			service = d;
		});
	});
</script>

<div class="border-border bg-background flex h-full flex-col overflow-hidden rounded-t-xl border">
	{#if service}
		<div class={['bg-background top-0 z-50 w-full md:flex md:flex-col']}>
			<div class="pt-4">
				<div class="border-border flex h-[40px] items-center overflow-hidden pb-0">
					<button
						data-sveltekit-noscroll
						onclick={() => goto(`/board/${data.crs}?${data.searchParams}`, { replaceState: true })}
						class="flex w-14 justify-center"><X /></button
					>
					<div class="flex-grow text-center font-medium"></div>
					<div class="flex w-14 justify-center">
						<TrainSaveToggle
							id={data.id}
							focus={data.crs}
							destination={service.trainCard.destination.name}
							date={service.trainCard.scheduled}
						/>
					</div>
				</div>
			</div>
			<div style:view-transition-name={data.id} class="h-20" in:fade|global={{ duration: 200 }}>
				<TrainCard train={service.trainCard} />
			</div>

			<div class="-mt-2 pb-2 pl-5" in:fade|global={{ duration: 200 }}>
				<div
					class="w-max rounded-lg px-2 py-1 text-xs"
					style:color={operatorList[service.trainCard.operator].text}
					style:background={operatorList[service.trainCard.operator].bg}
				>
					{operatorList[service.trainCard.operator].name}
				</div>
			</div>

			{#if service.cancelReason || service.delayReason}
				<div class="border-border border-t px-5 pt-2 pb-2">
					<Disruption
						isCancelled={service.focus.isCancelled}
						code={service.cancelReason ?? service.delayReason ?? null}
					/>
				</div>
			{/if}
		</div>
		{#if !md.current}
			<Refreshbar />
		{/if}

		{#if service.callingPoints.filter((p) => !p.isCancelled).length > 0}
			<Map
				{focusedStation}
				onSelect={(e) => (focusedStation = e)}
				{zoom}
				focus={mapFocus}
				locations={service.locations}
				color={operatorList[service.trainCard.operator].bg}
			/>
		{/if}

		<Accordion.Root
			class="border-border min-h-0 flex-grow overflow-y-scroll border-t py-4"
			type="single"
			bind:value={focusedStation}
		>
			<div class="h-full" in:fade|global={{ duration: 200 }}>
				{#each service.callingPoints as callingPoint, i (callingPoint.tiploc)}
					<CallingPoint
						{focusedStation}
						{i}
						{callingPoint}
						dest={service.destination.name}
						operator={service.trainCard.operator}
					/>
				{/each}
			</div>
		</Accordion.Root>
	{:else}
		<div class="pt-4">
			<div class="border-border flex h-[40px] items-center overflow-hidden pb-0">
				<a href="/board/{page.data.crs}?{page.data.searchParams}" class="flex w-14 justify-center"
					><X /></a
				>
				<div class="flex-grow text-center font-medium"></div>
				<div class="flex w-14 justify-center"></div>
			</div>
		</div>
		<div class="h-20">
			<div class={['relative flex min-h-20 items-center gap-4 pr-4 pl-5']}>
				<div class={['flex flex-col items-center']}>
					<Skeleton class="mb-[2px] h-[10px] w-[40px] rounded-full" />
					<div class="overflow-hidden rounded-full">
						<Skeleton class="h-7 w-7 rounded-full" />
					</div>
				</div>
				<div class="flex-grow">
					<div class="flex-grow text-xl font-semibold select-text">
						<Skeleton class="h-8 w-40" />
					</div>
				</div>
				<div>
					<Skeleton class="h-4 w-20" />
				</div>
			</div>
		</div>
		<div class="-mt-2 h-[36px] px-4 pb-4">
			<Skeleton class="h-[28px] w-40" />
		</div>
		<Skeleton class="min-h-[150px] w-full rounded-[0px]" />
		<div class="flex flex-col py-4">
			{#each Array(10)}
				<Skeleton class="even:bg-accent/20 h-16 w-full rounded-[0px] opacity-60" />
			{/each}
		</div>
	{/if}
</div>
