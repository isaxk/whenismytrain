<script lang="ts">
	import type { Details, BoardItem as Train } from '$lib/types/board';
	import Header from '$lib/components/board/header.svelte';
	import { onDestroy, type Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/state';
	import { MediaQuery } from 'svelte/reactivity';
	import dayjs from 'dayjs';
	import BoardItem from '$lib/components/board/board-item.svelte';
	import { refresher } from '$lib/data/refresh.svelte';
	import { Tooltip } from 'bits-ui';
	import { ChevronDown, ChevronUp, Clock, Info } from 'lucide-svelte';
	import NoticeList from '$lib/components/board/notice-list.svelte';
	import { flip } from 'svelte/animate';
	import { cancelVt, expandedMap } from '$lib/data/saved.svelte';
	import SpiderMap from '$lib/components/board/spider-map.svelte';
	import { fade } from 'svelte/transition';
	import { Position } from '$lib/types';
	import Skeleton from '$lib/components/ui/skeleton.svelte';
	import { goto } from '$app/navigation';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const md = new MediaQuery('(min-width: 768px)');

	let trains: Train[] | null = $state(null);
	let details: Details | null = $state(null);

	let clearer: () => void;

	$effect(() => {
		if (clearer) clearer();
		data.board.then((board) => {
			console.log(board.trains);

			trains = board.trains;
			details = board.details;
			clearer = refresher.subscribe<{ details: Details; trains: Train[] }>(
				`/api/board/${data.crs}/${data.to}/${data.time}/${data.tomorrow}`,
				'board-page',
				(data) => {
					trains = data.trains;
				}
			);
		});
	});

	onDestroy(() => {
		clearer();
	});

	const laterUrl = $derived.by(() => {
		const time =
			trains && trains.length
				? dayjs(trains[trains.length - 1].times.scheduled.departure).format('HHmm')
				: dayjs()
						.set('hour', parseInt(data.time?.substring(0, 2) ?? '0') ?? 0)
						.set('minute', parseInt(data.time?.substring(2, 4) ?? '0') ?? 0)
						.add(30, 'minutes')
						.format('HHmm');
		if (page.data.train_id) {
			if (page.data.to) {
				return `/board/${data.crs}/${page.data.train_id}?to=${page.data.to}&time=${time}&tomorrow=${data.tomorrow}`;
			}
			return `/board/${data.crs}/${page.data.train_id}?time=${time}&tomorrow=${data.tomorrow}`;
		} else {
			if (page.data.to) {
				return `/board/${data.crs}?to=${page.data.to}&time=${time}&tomorrow=${data.tomorrow}`;
			}
			return `/board/${data.crs}?time=${time}&tomorrow=${data.tomorrow}`;
		}
	});

	const earlierUrl = $derived.by(() => {
		const range =
			trains && trains.length > 1
				? dayjs(trains[trains.length - 1].times.scheduled.departure).diff(
						dayjs(trains[0].times.scheduled.departure),
						'minutes'
					)
				: 30;

		const time = (
			data.time
				? dayjs()
						.set('hour', parseInt(data.time?.substring(0, 2) ?? '0') ?? 0)
						.set('minute', parseInt(data.time?.substring(2, 4) ?? '0') ?? 0)
				: dayjs()
		)
			.subtract(range, 'minutes')
			.format('HHmm');
		if (page.data.train_id) {
			if (page.data.to) {
				return `/board/${data.crs}/${page.data.train_id}?to=${page.data.to}&time=${time}&tomorrow=${data.tomorrow}`;
			}
			return `/board/${data.crs}/${page.data.train_id}?time=${time}&tomorrow=${data.tomorrow}`;
		} else {
			if (page.data.to) {
				return `/board/${data.crs}?to=${page.data.to}&time=${time}&tomorrow=${data.tomorrow}`;
			}
			return `/board/${data.crs}?time=${time}&tomorrow=${data.tomorrow}`;
		}
	});

	const nowUrl = $derived.by(() => {
		if (page.data.train_id) {
			if (page.data.to) {
				return `/board/${data.crs}/${page.data.train_id}?to=${page.data.to}`;
			}
			return `/board/${data.crs}/${page.data.train_id}`;
		} else {
			if (page.data.to) {
				return `/board/${data.crs}?to=${page.data.to}`;
			}
			return `/board/${data.crs}`;
		}
	});
</script>

{#if (!page.data.train_id || md.current) && !expandedMap.current}
	<div
		class="bg-background md:border-border flex h-full min-h-screen w-full flex-col md:min-h-auto md:w-[400px] md:min-w-[400px] md:rounded-lg md:border"
	>
		{#if !md.current && details}
			<Header {details} />
		{/if}
		{#await data.board}
			<div class="flex h-full flex-col gap-4">
				{#if !details && !md.current}
					<!-- Skeleton Header -->
					<div class="bg-background w-full p-4 pb-6 md:static">
						<div class="flex pb-4">
							<Skeleton class="h-6 w-6 rounded-md" />
						</div>
						<div class="flex w-full gap-4">
							<div class="min-w-1/3">
								<Skeleton class="mb-1 h-10 w-16 rounded-md" />
								<Skeleton class="h-4 w-[80%] rounded-md" />
							</div>
							<div class="flex flex-grow flex-col items-center justify-center gap-1">
								<Skeleton class="h-6 w-6 rounded-md" />
							</div>
							<div class="flex min-w-1/3 flex-grow flex-col items-end text-right">
								<Skeleton class="mb-1 ml-auto h-10 w-16 rounded-md" />
								<Skeleton class="h-4 w-[60%] rounded-md" />
							</div>
						</div>
					</div>
				{/if}

				<!-- Skeleton Navigation -->
				<div class="flex justify-between px-4">
					<Skeleton class="h-6 w-32 rounded-md" />
					<Skeleton class="h-6 w-24 rounded-md" />
				</div>

				<div>
					<!-- Skeleton Train Items -->
					{#each Array(8) as _, i (i)}
						<Skeleton class="odd:bg-muted/40 h-20 w-full" />
					{/each}
				</div>
			</div>
		{:then { details }}
			<!-- <SpiderMap spiderMap={details.spiderMap} /> -->
			<div class="flex-grow overflow-y-scroll md:pt-4" in:fade={{ duration: 150 }}>
				{#if details.notices.length > 0}
					<div class="px-4 pb-4">
						<NoticeList notices={details.notices} />
					</div>
				{/if}
				{#if trains && trains.length > 0}
					<div class="flex px-4 pb-4">
						<a
							href={earlierUrl}
							onclick={(e) => {
								cancelVt.current = true;
								if (!md.current) {
									e.preventDefault();
									goto(earlierUrl, { replaceState: true });
								}
							}}
							class="h flex flex-grow items-center gap-1 text-blue-500"
							><ChevronUp size={18} /> Earlier trains</a
						>
						{#if data.time}
							<a
								onclick={(e) => {
									cancelVt.current = true;
									if (!md.current) {
										e.preventDefault();
										goto(nowUrl, { replaceState: true });
									}
								}}
								href={nowUrl}
								class="text-foreground-muted flex items-center gap-1"
								><Clock size={16} /> Back to now</a
							>
						{/if}
					</div>
					<Tooltip.Provider>
						{#each trains as train, i (train.id + train.times.scheduled.departure)}
							<div class="group" animate:flip={{ duration: 200 }}>
								<BoardItem {i} {train} url="/board/{data.crs}/{train.id}{page.url.search ? page.url.search+'&dest='+train.destination.crs : '?dest='+train.destination.crs}" />
							</div>
						{/each}
					</Tooltip.Provider>
					<div class="flex px-4 pt-4">
						{#if trains.length < 1 || !data.tomorrow || (data.tomorrow && dayjs(trains[trains.length - 1].times.estimated.departure ?? trains[trains.length - 1].times.scheduled.departure).diff(dayjs().startOf('day'), 'days') < 2)}
							<a
								href={laterUrl}
								onclick={(e) => {
									cancelVt.current = true;
									if (!md.current) {
										e.preventDefault();
										goto(laterUrl, { replaceState: true });
									}
								}}
								class="flex flex-grow items-center gap-1 text-blue-500"
								><ChevronDown size={18} /> Later trains</a
							>
						{/if}
						{#if trains.some((t) => !t.platform)}
							<div class="flex flex-col items-end justify-center text-xs">
								Hidden Platforms (by RealTimeTrains):
								<div class="flex gap-2 text-[12px]">
									<div class="flex items-center gap-1">
										<div class="h-max w-max rounded-full bg-green-100"><Info size={15} /></div>
										Confirmed
									</div>
									<div class="flex items-center gap-1">
										<div class="h-max w-max rounded-full bg-amber-100"><Info size={15} /></div>
										Predicted
									</div>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<div class="px-4">
						<div class="text-xl font-medium">
							There are no direct trains for the specified search.
						</div>
						{#if data.to}
							<a
								class="block text-blue-600"
								href="https://www.nationalrail.co.uk/journey-planner/?type=single&origin={data.crs}&destination={data.to}&leavingType=departing&leavingDate={dayjs().format(
									'DDMMYY'
								)}&leavingHour={String(dayjs().add(30, 'minute').hour()).padStart(
									2,
									'0'
								)}&leavingMin={String(
									dayjs().add(15, 'minute').minute() > 45
										? 0
										: Math.ceil(dayjs().add(15, 'minute').minute() / 15) * 15
								).padStart(2, '0')}&adults=1&extraTime=0#O"
								>Click here to search this journey on the national rail journey planner.</a
							>
						{/if}
					</div>
				{/if}
				<div class="p-4 text-sm">
					<div>Station managed by {details.manager}</div>
					<a class="text-xs text-blue-600" href="https://www.nationalrail.co.uk/stations/{data.crs}"
						>National Rail Station Information</a
					>
				</div>
			</div>
		{/await}
	</div>
{/if}
{#if page.data.train_id}
	<div
		class="bg-background md:border-border flex h-full max-h-full max-w-screen-xl min-w-0 flex-grow flex-col md:rounded-lg md:border"
	>
		{@render children()}
	</div>
{/if}
