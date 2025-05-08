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
	import { Info } from 'lucide-svelte';
	import NoticeList from '$lib/components/board/notice-list.svelte';
	import { flip } from 'svelte/animate';
	import { expandedMap } from '$lib/data/saved.svelte';
	import SpiderMap from '$lib/components/board/spider-map.svelte';
	import { fade } from 'svelte/transition';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const md = new MediaQuery('(min-width: 768px)');

	let trains: Train[] | null = $state(null);

	let clearer: () => void;

	$effect(() => {
		data.board.then((board) => {
			console.log(board.details.spiderMap);
			if (clearer) clearer();
			trains = board.trains;
			clearer = refresher.subscribe<{ details: Details; trains: Train[] }>(
				`/api/board/${data.crs}/${data.to}/null`,
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
</script>

{#if (!page.data.train_id || md.current) && !expandedMap.current}
	<div
		class="bg-background md:border-border flex h-full min-h-screen w-full flex-col md:min-h-auto md:w-[400px] md:min-w-[400px] md:rounded-lg md:border"
	>
		{#await data.board then { details }}
			{#if !md.current}
				<Header {details} />
			{/if}
			<!-- <SpiderMap spiderMap={details.spiderMap} /> -->
			<div class="flex-grow overflow-y-scroll md:pt-4" in:fade={{ duration: 150 }}>
				{#if details.notices.length > 0}
					<div class="px-4 pb-4">
						<NoticeList notices={details.notices} />
					</div>
				{/if}
				{#if trains && trains.length > 0}
					{#if trains.some((t) => !t.platform)}
						<div class="flex flex-col items-end justify-center px-4 pb-4 text-sm">
							Hidden Platforms (by RealTimeTrains):
							<div class="flex gap-2 text-xs">
								<div class="flex items-center gap-1">
									<div class="h-max w-max rounded-full bg-green-100"><Info size={16} /></div>
									Confirmed
								</div>
								<div class="flex items-center gap-1">
									<div class="h-max w-max rounded-full bg-amber-100"><Info size={16} /></div>
									Predicted
								</div>
							</div>
						</div>
					{/if}
					<Tooltip.Provider>
						{#each trains as train, i (train.id)}
							<div class="group" animate:flip={{ duration: 200 }}>
								<BoardItem {i} {train} url="/board/{data.crs}/{train.id}{page.url.search}" />
							</div>
						{/each}
					</Tooltip.Provider>
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
		class="bg-background md:border-border flex h-full max-h-full max-w-screen-xl flex-grow flex-col md:rounded-lg md:border"
	>
		{@render children()}
	</div>
{/if}
