<script lang="ts">
	import { operatorList } from '$lib/data/operators';
	import type { ServiceDetails } from '$lib/types/train';
	import { Trash } from 'lucide-svelte';
	import RelativeTimeDisplay from '../ui/relative-time-display.svelte';
	import TimeDisplay from '../ui/time-display.svelte';
	import { saved } from '$lib/data/saved.svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import dayjs from 'dayjs';
	import { preloadData } from '$app/navigation';
	import { refresher } from '$lib/data/refresh.svelte';
	import { onDestroy } from 'svelte';
	import RttPlatform from './rtt-platform.svelte';
	import { error } from '@sveltejs/kit';
	import { fade } from 'svelte/transition';
	import { Position } from '$lib/types';
	import Skeleton from '../ui/skeleton.svelte';

	let { i, id, filter, focus, onTime } = $props();

	const md = new MediaQuery('(min-width: 768px)');

	async function fetchTrain(id: string, focus: string, filter: string) {
		const response = await fetch(`/api/service/${id}/${focus}/${filter}`);
		if (response.ok) {
			const data = await response.json();
			return { data, error: null };
		} else {
			return { data: null, error: response.statusText };
		}
	}

	const data: Promise<{ data: ServiceDetails | null; error: string | null }> = fetchTrain(
		id,
		focus,
		filter
	);
	let train: { data: ServiceDetails | null; error: string | null } | null = $state(null);

	let clearer: () => void;

	data.then((d) => {
		train = d;
		onTime(train.data?.grouped.focus.times.scheduled.departure);
		if (!train.error) {
			clearer = refresher.subscribe<ServiceDetails>(
				`/api/service/${id}/${focus}/${filter}`,
				'saved-train',
				(data) => {
					if (train) {
						train.data = data;
					}
				}
			);
		}
	});

	onDestroy(() => {
		if (clearer) {
			clearer();
		}
	});

	function remove() {
		saved.value = saved.value.toSpliced(i, 1);
	}

	let now = $state(dayjs());
</script>

<div class="flex min-h-28 gap-4 py-2">
	<a
		class="flex-grow"
		href="/board/{focus}/{id}?to={filter}&closeToHome={md.current ? 'false' : 'true'}"
	>
		{#if train && train.data}
			{@const { grouped, filterDetails, operator, uid, sdd } = train.data}
			{#if dayjs(grouped.focus.times.estimated.departure ?? grouped.focus.times.scheduled.departure).day() !== now.day()}
				<div class="text-foreground-muted px-1.5 text-sm">
					{dayjs(
						grouped.focus.times.estimated.departure ?? grouped.focus.times.scheduled.departure
					).format('DD MMM')}
				</div>
			{/if}
			<div
				in:fade={{ duration: 200 }}
				class={[
					[Position.ARRIVED, Position.DEPARTED].includes(grouped.filter.trainRelativePosition) &&
						'opacity-60'
				]}
			>
				<div class={['flex h-8 items-center gap-0']}>
					<div class="flex min-w-14 flex-col items-end pr-3">
						<TimeDisplay
							expected={grouped.focus.times.estimated.departure}
							scheduled={grouped.focus.times.scheduled.departure}
							isCancelled={grouped.focus.isCancelled}
						/>
					</div>

					<div class="flex h-full flex-col pr-2">
						{#if grouped.previous.length > 0}
							<div style:background={operatorList[operator].bg} class="w-1.5 flex-grow"></div>
						{:else}
							<div class="flex-grow"></div>
						{/if}
						<div
							class="h-1.5 w-3 rounded-r-full"
							style:background={operatorList[operator].bg}
						></div>
						<div style:background={operatorList[operator].bg} class="w-1.5 flex-grow"></div>
					</div>
					<div class="min-w-0 flex-grow">
						<div class="truncate text-base/4">{grouped.focus.name}</div>
						<div class="text-foreground/80 -mb-0 flex gap-2 text-xs/3 font-normal">
							<RelativeTimeDisplay
								departure={grouped.focus.times.estimated.departure}
								arrival={grouped.focus.times.estimated.arrival}
								position={grouped.focus.trainRelativePosition}
							/>
						</div>
					</div>
					<div class="flex flex-col items-center">
						<div class="text-foreground-muted/60 text-[9px]">Platform</div>
						<div
							class="bg-muted flex h-6 w-6 items-center justify-center rounded-full text-sm drop-shadow-sm"
						>
							{#if grouped.focus.platform}
								{grouped.focus.platform}
							{:else}
								<RttPlatform {uid} {sdd} crs={grouped.focus.crs} />
							{/if}
						</div>
					</div>
				</div>
				<div class="flex h-7 items-center gap-0">
					<div class="min-w-14"></div>
					<div class="flex h-full w-3 min-w-3 flex-col pr-5">
						<div style:background={operatorList[operator].bg} class="w-1.5 flex-grow"></div>
					</div>
					{#if grouped.focus.isCancelled || grouped.filter.isCancelled}
						<div class="-mb-0.5 text-xs text-red-600">Cancelled</div>
					{:else}
						<div class="text-foreground-muted -mb-0.5 text-xs">
							{#if filterDetails.stops > 0}{filterDetails.stops} stops{:else}Non-stop{/if} - {filterDetails.duration}
						</div>
					{/if}
				</div>
				<div class="flex h-8 items-center gap-0">
					<div class="flex min-w-14 flex-col items-end pr-3">
						<div class="flex origin-right scale-90 flex-col items-end">
							<TimeDisplay
								expected={grouped.filter.times.estimated.arrival}
								scheduled={grouped.filter.times.scheduled.arrival}
								isCancelled={grouped.filter.isCancelled}
							/>
						</div>
					</div>
					<div class="flex h-full flex-col pr-2">
						<div style:background={operatorList[operator].bg} class="w-1.5 flex-grow"></div>
						<div
							class="h-1.5 w-3 rounded-r-full"
							style:background={operatorList[operator].bg}
						></div>
						{#if grouped.destination.crs !== grouped.filter.crs}
							<div style:background={operatorList[operator].bg} class="w-1.5 flex-grow"></div>
						{:else}
							<div class="flex-grow"></div>
						{/if}
					</div>
					<div class="font-medium">{grouped.filter.name}</div>
				</div>
				{#if grouped.destination.crs !== grouped.filter.crs}
					<div class="flex h-8 items-center gap-0">
						<div class="min-w-14"></div>
						<div class="flex h-full flex-col pr-2">
							<div style:background={operatorList[operator].bg} class="w-1.5 flex-grow"></div>
							<div
								class="h-1.5 w-3 rounded-r-full"
								style:background={operatorList[operator].bg}
							></div>
							<div class="flex-grow"></div>
						</div>
						<div class="text-foreground-muted text-sm">{grouped.destination.name}</div>
					</div>
				{/if}
			</div>
		{:else if train && train.error}
			{train.error}
		{:else}
			<div in:fade={{ duration: 200 }}>
				<!-- Departure station -->
				<div class="flex h-8 items-center gap-0">
					<div class="flex min-w-14 flex-col items-end pr-3">
						<Skeleton class="h-4 w-10 rounded" />
					</div>
					<div class="flex h-full flex-col pr-2">
						<Skeleton class="h-full w-1.5" />
					</div>
					<div class="min-w-0 flex-grow">
						<Skeleton class="mb-1 h-4 w-32 rounded" />
						<Skeleton class="h-3 w-24 rounded" />
					</div>
					<Skeleton class="h-6 w-6 rounded-full" />
				</div>

				<!-- Journey info -->
				<div class="flex h-7 items-center gap-0 pl-16">
					<Skeleton class="h-3 w-36 rounded" />
				</div>

				<!-- Arrival station -->
				<div class="flex h-8 items-center gap-0">
					<div class="flex min-w-14 flex-col items-end pr-3">
						<Skeleton class="h-4 w-10 rounded" />
					</div>
					<div class="flex h-full flex-col pr-2">
						<Skeleton class="h-full w-1.5" />
					</div>
					<Skeleton class="h-4 w-28 rounded" />
				</div>
			</div>
		{/if}
	</a>
	<button class="h-10" onclick={remove}><Trash size={18} /></button>
</div>
