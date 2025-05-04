<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import CallingPoint from '$lib/components/train/calling-point.svelte';
	import Map from '$lib/components/train/map.svelte';
	import SaveToggle from '$lib/components/train/save-toggle.svelte';
	import Skeleton from '$lib/components/ui/skeleton.svelte';
	import { operatorList } from '$lib/data/operators';
	import { refresher } from '$lib/data/refresh.svelte.js';
	import type { ServiceDetails } from '$lib/types/train.js';
	import { Tooltip } from 'bits-ui';

	import dayjs from 'dayjs';
	import { ChevronDown, ChevronUp, X } from 'lucide-svelte';
	import { onDestroy } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { fade, slide } from 'svelte/transition';

	let { data } = $props();

	const md = new MediaQuery('(min-width: 768px)');

	let show = $state({
		previous: false,
		subsequent: false,
		further: false
	});

	let train: ServiceDetails | null = $state(null);

	let clearer: () => void;

	onDestroy(() => {
		if (clearer) clearer();
	});

	$effect(() => {
		data.train.then((details) => {
			if (clearer) clearer();
			train = details;
			show = {
				previous: false,
				subsequent: false,
				further: false
			};
			clearer = refresher.subscribe<ServiceDetails>(
				`/api/service/${data.train_id}/${data.crs}/${data.filter}`,
				'page-data' + Date.now(),
				(data) => {
					train = data;
				}
			);
		});
	});

	let clientHeight = $state();
</script>

<Tooltip.Provider>
	<div class="min-h-screen md:flex md:h-full md:min-h-full md:flex-col">
		{#await data.train}
			<div class="flex min-h-16 items-center gap-0">
				<a
					href={data.closeToHome ? '/' : `/board/${data.crs}${page.url.search}`}
					class="flex h-full w-14 items-center justify-center"
				>
					<X />
				</a>
			</div>
			<Skeleton class="h-42" />
			<div class="flex h-10 items-center gap-2 px-4">
				<div class="min-w-14"></div>
				<Skeleton class="h-full w-2" />
				<div class="pl-2"></div>
				<Skeleton class="h-4 w-24 rounded-full" />
			</div>
			<div class="flex h-14 items-center gap-2 px-4">
				<div class="min-w-14">
					<Skeleton class="h-4 w-12 rounded-full" />
				</div>
				<Skeleton class="h-full w-2" />
				<div class="pl-2"></div>
				<Skeleton class="h-4 w-24 rounded-full" />
			</div>
			<div class="flex h-14 items-center gap-2 px-4">
				<div class="min-w-14"></div>
				<Skeleton class="h-full w-2" />
				<div class="pl-2"></div>
				<Skeleton class="h-4 w-24 rounded-full" />
			</div>
			<div class="flex h-14 items-center gap-2 px-4">
				<div class="min-w-14">
					<Skeleton class="h-4 w-12 rounded-full" />
				</div>
				<Skeleton class="h-full w-2" />
				<div class="pl-2"></div>
				<Skeleton class="h-4 w-24 rounded-full" />
			</div>
			<div class="flex h-14 items-center gap-2 px-4">
				<div class="min-w-14">
					<Skeleton class="h-4 w-12 rounded-full" />
				</div>
				<Skeleton class="h-full w-2 rounded-full" />
				<div class="pl-2"></div>
				<Skeleton class="h-4 w-24 rounded-full" />
			</div>
		{:then}
			{#if train}
				{@const { grouped, locations, filterDetails, operator } = train}

				<div class="bg-background fixed top-0 right-0 left-0 z-[1000] md:static" bind:clientHeight>
					<div class="bg-background flex min-h-16 items-center gap-0" in:fade={{ duration: 200 }}>
						<a
							href={data.closeToHome ? '/' : `/board/${data.crs}${page.url.search}`}
							class="flex h-full w-14 items-center justify-center"
						>
							<X />
						</a>
						<div class="flex min-w-0 flex-grow flex-col items-center gap-0.5">
							<div
								class="rounded-lg px-2 py-0.5 text-[11px] text-nowrap"
								style:background-color={operatorList[operator].bg}
								style:color={operatorList[operator].text}
							>
								{operatorList[operator].name}
							</div>
							<div class="flex min-w-0 flex-grow items-center gap-1 truncate text-sm/4 font-medium">
								<div>
									{dayjs(grouped.focus.times.scheduled.departure).format('HH:mm')} to {grouped
										.destination.name}
								</div>
							</div>
						</div>
						<SaveToggle id={data.train_id} focus={data.crs} filter={data.to} />
					</div>
					<div in:fade={{ duration: 200 }} class="min-h-42">
						<Map {locations} {operator} focus={data.crs} filter={data.filter} />
					</div>
				</div>
				{#if !md.current}
					<div style:min-height="{clientHeight}px"></div>
				{/if}
				<div class="md:flex-grow md:overflow-y-scroll" in:fade={{ duration: 200 }}>
					{#if show.previous}
						<div transition:slide={{ duration: 200 }}>
							{#each grouped.previous as callingPoint, i (callingPoint.tiploc + i)}
								<CallingPoint
									uid={train.uid}
									sdd={train.sdd}
									{callingPoint}
									{i}
									color={operatorList[operator].bg}
									order="previous"
									end={i === 0 ? 'start' : null}
								/>
							{/each}
						</div>
					{/if}
					{#if grouped.previous.length > 0}
						<button
							onclick={() => (show.previous = !show.previous)}
							class="text-foreground-tint flex h-10 items-center gap-2 px-4"
						>
							<div class="w-14"></div>
							<div class="flex h-full flex-col pr-4">
								<div class="w-2 flex-grow" style:background={operatorList[operator].bg}></div>
							</div>
							{#if show.previous}
								<div class="flex items-center gap-1">Hide previous <ChevronUp size={20} /></div>
							{:else}
								<div class="flex items-center gap-1">Show previous <ChevronDown size={20} /></div>
							{/if}
						</button>
					{/if}
					<CallingPoint
						uid={train.uid}
						sdd={train.sdd}
						callingPoint={grouped.focus}
						i={0}
						color={operatorList[operator].bg}
						order="focus"
						end={grouped.previous.length === 0 ? 'start' : null}
					/>
					{#if show.subsequent}
						<div transition:slide={{ duration: 200 }}>
							{#each grouped.subsequent as callingPoint, i (callingPoint.tiploc + i)}
								<CallingPoint
									uid={train.uid}
									sdd={train.sdd}
									{callingPoint}
									{i}
									color={operatorList[operator].bg}
									order="subsequent"
								/>
							{/each}
						</div>
					{/if}
					{#if grouped.subsequent.length > 0}
						<button
							onclick={() => (show.subsequent = !show.subsequent)}
							class="text-foreground-tint flex h-10 items-center gap-2 px-4"
						>
							<div class="w-14"></div>
							<div class="flex h-full flex-col pr-4">
								<div class="w-2 flex-grow" style:background={operatorList[operator].bg}></div>
							</div>
							{#if show.subsequent}
								<div class="flex items-center gap-1">Hide stops <ChevronUp size={20} /></div>
							{:else}
								<div class="flex items-center gap-1">
									{filterDetails.stops} stops - {filterDetails.duration}
									<ChevronDown size={20} />
								</div>
							{/if}
						</button>
					{:else}
						<div class="text-foreground-tint flex h-10 items-center gap-2 px-4">
							<div class="w-14"></div>
							<div class="flex h-full flex-col pr-4">
								<div class="w-2 flex-grow" style:background={operatorList[operator].bg}></div>
							</div>
							<div class="flex items-center gap-1">Non-stop - {filterDetails.duration}</div>
						</div>
					{/if}
					<CallingPoint
						uid={train.uid}
						sdd={train.sdd}
						callingPoint={grouped.filter}
						i={0}
						color={operatorList[operator].bg}
						order="filter"
						end={grouped.filter.crs === grouped.destination.crs ? 'end' : null}
					/>
					{#if show.further}
						<div transition:slide={{ duration: 200 }}>
							{#each grouped.further as callingPoint, i (callingPoint.tiploc + i)}
								<CallingPoint
									uid={train.uid}
									sdd={train.sdd}
									{callingPoint}
									{i}
									color={operatorList[operator].bg}
									order="further"
								/>
							{/each}
						</div>
					{/if}
					{#if grouped.further.length > 0}
						<button
							onclick={() => (show.further = !show.further)}
							class="text-foreground-tint flex h-10 items-center gap-2 px-4"
						>
							<div class="w-14"></div>
							<div class="flex h-full flex-col pr-4">
								<div class="w-2 flex-grow" style:background={operatorList[operator].bg}></div>
							</div>
							{#if show.further}
								<div class="flex items-center gap-1">Hide further <ChevronUp size={20} /></div>
							{:else}
								<div class="flex items-center gap-1">Show further <ChevronDown size={20} /></div>
							{/if}
						</button>
					{/if}
					{#if grouped.destination.crs !== grouped.filter.crs}
						<CallingPoint
							uid={train.uid}
							sdd={train.sdd}
							callingPoint={grouped.destination}
							i={0}
							hideDetails={!show.further && grouped.further.length > 0}
							color={operatorList[operator].bg}
							order="destination"
							end="end"
						/>
					{/if}
				</div>
			{/if}
		{/await}
	</div>
</Tooltip.Provider>
