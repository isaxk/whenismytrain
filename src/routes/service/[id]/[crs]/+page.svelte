<script lang="ts">
	import dayjs from 'dayjs';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { scrollY } from 'svelte/reactivity/window';
	import { draw, fade, slide } from 'svelte/transition';
	import { Accordion } from 'bits-ui';

	import CallingPoint from '$lib/components/service/calling-point.svelte';
	import Disruption from '$lib/components/service/disruption.svelte';
	import TrainCard from '$lib/components/service/train-card.svelte';
	import Header from '$lib/components/ui/header.svelte';
	import PositionIndicator from '$lib/components/service/position-indicator.svelte';
	import ServiceSaveToggle from '$lib/components/service/service-save-toggle.svelte';

	import { operatorList } from '$lib/data/operators';
	import type { PageData } from './$types';
	import Map from '$lib/components/service/map.svelte';
	import { browser } from '$app/environment';
	import Switchbar from '$lib/components/ui/switchbar.svelte';
	import { Ellipsis, List, Table } from 'lucide-svelte';
	import Refreshbar from '$lib/components/ui/refreshbar/refreshbar.svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { receive, send } from '$lib/utils/transitions';
	import { Status } from '$lib/types';

	let {
		data,
		drawer = false,
		header
	}: { data: PageData; drawer?: boolean; header?: Snippet } = $props();

	const REFRESH_INTERVAL = 10;

	const md = new MediaQuery('min-width: 768px');

	let currentAccordion = $state(data.focus.crs);
	let now: dayjs.Dayjs | null = $state(null);
	let interval: ReturnType<typeof setInterval>;
	let showPasses = $state(false);
	let refreshing = $state(false);
	let lastUpdated = $state(dayjs());

	async function refresh() {
		refreshing = true;
		if (!data) return;

		const response = await fetch(`/api/service/${data.id}/${data.crs}`);
		now = dayjs();
		data = { ...(await response.json()), crs: data.crs, id: data.id, tiplocs: data.tiplocs };
		lastUpdated = dayjs();
		clearTimeout(interval);
		interval = setTimeout(refresh, REFRESH_INTERVAL * 1000);
		refreshing = false;
	}

	const coords = $derived(
		data
			? data.all.map((l, i) => {
					const found = data.tiplocs.find((tiploc) => tiploc.Tiploc === l.tiploc);
					return found
						? { l, coords: [found.Latitude, found.Longitude] }
						: { l, coords: [null, null] };
				})
			: []
	);

	onMount(() => {
		interval = setTimeout(refresh, REFRESH_INTERVAL * 1000);
		now = dayjs();
		lastUpdated = now;

		const genAt = data ? dayjs(data?.generatedAt) : dayjs();
		const diff = Math.abs(genAt.diff(now, 'seconds'));
		if (diff > REFRESH_INTERVAL) {
			refresh();
		}
	});

	onDestroy(() => {
		clearTimeout(interval);
	});

	let pointsScrollY = $state(0);
	let pointsScrollX = $state(0);

	let expandedMap = $state(true);
	let expandLock = $state(false);
	let showPrevious = $state(false);
</script>

<svelte:head>
	{#if data}
		<title
			>{dayjs(
				data.focus.atd ?? data.focus.etd ?? data.focus.std ?? data.focus.ata ?? data.focus.eta
			).format('HH:mm')}
			to {data.destination.name} - {operatorList[data.operatorCode].name}
		</title>
	{/if}
</svelte:head>

{#if data && data !== undefined && data.focus}
	<div
		class={['w-full', !drawer && 'md:min-w-[450px] md:max-w-[450px]']}
		in:fade|global={{ duration: 250 }}
	>
		<div class={['top-0 pb-2 md:sticky', !drawer && 'pt-ios-top']}>
			{#if drawer}
				{#if header}
					{@render header()}
					<div class="h-1"></div>
				{/if}
			{:else}
				<div
					class={[
						'fixed left-0 right-0 top-0 z-40 bg-background pb-1 pt-ios-top md:static md:pt-0',
						(scrollY.current ?? 0) > 5 && 'border-b drop-shadow md:border-none md:drop-shadow-none'
					]}
				>
					<Header
						onBackClick={() => {
							history.back();
						}}
						title="Service Details"
					>
						{#snippet actionSnippet()}
							<ServiceSaveToggle id={data.serviceID} crs={data.focus.crs} />
						{/snippet}
					</Header>
				</div>
				<div class="h-14 pt-ios-top md:h-0 md:pt-0"></div>
			{/if}
			<div class={['flex flex-col gap-2 px-4']}>
				<TrainCard
					state={data.focus.state}
					disruptionCode={null}
					id={data.serviceID}
					isCancelled={data.destination.isCancelled ?? false}
					destination={data.destination.name ?? ''}
					platform={data.focus?.platform ?? null}
					operator={data.operatorCode!}
					etd={data.focus?.atd ?? data.focus?.etd ?? 'Delayed'}
					std={data.focus?.std ?? ''}
					focus={data.focus?.name}
					details
					onservicedetails={() => {}}
				/>
				<div class="flex items-center gap-2">
					<div
						class="w-max rounded-md px-2 py-1 text-xs"
						style:color={operatorList[data.operatorCode!].text}
						style:background={operatorList[data.operatorCode!].bg}
					>
						{operatorList[data.operatorCode!].name}
					</div>
					<div class="flex-grow"></div>
				</div>

				<Disruption
					isCancelled={data.destination.isCancelled}
					code={data.cancelReason?.Value ?? data.delayReason?.Value ?? null}
				/>
			</div>
		</div>
		<div class="md:px-4">
			<Refreshbar {refreshing} interval={REFRESH_INTERVAL} genAt={lastUpdated.toISOString()} />
		</div>
		{#if coords && coords.length > 0 && browser && md.current && !drawer}
			<div class="px-4 pt-4">
				<Map
					color={operatorList[data.operatorCode!].bg}
					locations={coords}
					current={data?.currentAll}
					expanded={expandedMap}
				/>
			</div>
		{/if}
	</div>

	<div class={['flex flex-grow flex-col overflow-auto', !drawer && 'md:pt-5']}>
		{#if coords && coords.length > 0 && browser && (!md.current || drawer)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				onmousedown={() => {
					expandLock = true;
					expandedMap = true;
					setTimeout(() => {
						expandLock = false;
					}, 500);
				}}
				ontouchstart={() => {
					expandLock = true;
					expandedMap = true;
					setTimeout(() => {
						expandLock = false;
					}, 500);
				}}
				class={[
					'z-0 overflow-hidden transition-all duration-300',
					expandedMap
						? 'h-[150px] max-h-[150px] min-h-[150px]'
						: 'h-[90px] max-h-[90px] min-h-[90px] opacity-90 blur-[2px] brightness-75'
				]}
			>
				<Map
					color={operatorList[data.operatorCode!].bg}
					locations={coords}
					current={data?.currentAll}
					expanded={expandedMap}
				/>
			</div>
		{/if}

		<div
			class="z-20 flex min-h-0 flex-grow -translate-y-2 flex-col rounded-t-lg border-t bg-background md:border-none"
		>
			<div class="p-1">
				<Switchbar
					bind:value={showPasses}
					items={[
						{
							Icon: List,
							key: false,
							label: 'Simple'
						},
						{
							Icon: Table,
							key: true,
							label: 'Detailed'
						}
					]}
				/>
			</div>

			<div
				onscroll={(e) => {
					if (e.target?.scrollTop > 50 && !expandLock) {
						expandedMap = false;
					}
				}}
				class="min-h-0 flex-grow overflow-scroll overscroll-none"
			>
				{#if showPasses}
					<div
						class={[
							[
								'sticky -top-1 z-10 -mt-1 flex w-max items-end gap-2 bg-background px-4 py-1 font-semibold',
								pointsScrollY > 5 ? 'drop-shadow' : ''
							]
						]}
					>
						<div class="min-w-10">Plat.</div>
						<div class="min-w-64">Name</div>
						<div class="flex">
							<div class="w-full flex-col pr-1">
								<div class="w-full text-left">Arrival</div>
								<div class="flex gap-1 text-left text-xs font-medium">
									<div class="min-w-[54px] max-w-[54px]">Planned</div>
									<div class="min-w-[54px] max-w-[54px]">Expect.</div>
									<div class="min-w-[54px] max-w-[54px]">Actual</div>
								</div>
							</div>
							<div class="w-full flex-col">
								<div class="w-full text-left">Departure</div>
								<div class="flex gap-1 text-left text-xs font-medium">
									<div class="min-w-[54px] max-w-[54px]">Planned</div>
									<div class="min-w-[54px] max-w-[54px]">Expect.</div>
									<div class="min-w-[54px] max-w-[54px]">Actual</div>
								</div>
							</div>
						</div>
					</div>
					<div class="flex w-max flex-col border-b font-bold">
						{#each data.all as location, i (location.tiploc + location.std)}
							<div
								class={[
									'flex items-center gap-2 px-4 text-base',
									location.isPass
										? 'py-0.5 text-xs font-normal text-zinc-500'
										: 'py-1 font-semibold',
									i % 2 === 0 && 'border-y bg-card'
								]}
							>
								<div class="min-w-10">
									{#if location.isPass}
										<span class="text-xs italic">PASS</span>
									{:else}
										<div class="font-mono">
											{location.platform ?? '?'}
										</div>
									{/if}
								</div>
								{#snippet date(d)}
									{#if d}
										{dayjs(d).format('HH:mm')}
										{#if dayjs(d).format('ss') !== '00'}
											<div class="translate-y-[1px] pl-[0.5px] text-[9px] font-light">
												{dayjs(d).format('ss')}
											</div>
										{/if}
									{:else}
										-
									{/if}
								{/snippet}
								<div
									class={[
										'w-full min-w-64 max-w-64 truncate',
										location.crs && location.isPass && 'font-medium text-zinc-800'
									]}
								>
									{location.name}
									{#if location.crs}
										<span class="text-xs font-light text-zinc-600"> ({location.crs})</span>{/if}
								</div>
								<div class="flex gap-1 text-left">
									<div class="flex min-w-[54px] max-w-[54px] items-end font-mono text-xs">
										{@render date(location.sta)}
									</div>
									<div class="flex min-w-[54px] max-w-[54px] items-end font-mono text-xs">
										{@render date(location.eta)}
									</div>
									<div class="flex min-w-[54px] max-w-[54px] items-end font-mono text-xs">
										{#if location.isCancelled}
											<span class="text-red-500">Cancel</span>
										{:else}
											{@render date(location.ata)}
										{/if}
									</div>
									<div class="flex min-w-[54px] max-w-[54px] items-end font-mono text-xs">
										{@render date(location.std)}
									</div>
									<div class="flex min-w-[54px] max-w-[54px] items-end font-mono text-xs">
										{@render date(location.etd)}
									</div>
									<div class="flex min-w-[54px] max-w-[54px] items-end font-mono text-xs">
										{#if location.isCancelled}
											<span class="text-red-500">Cancel</span>
										{:else}
											{@render date(location.atd)}
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
					<div class="h-20"></div>
				{:else}
					{@render stopList()}
				{/if}
			</div>
		</div>
	</div>
{/if}

{#snippet stopList()}
	{#if data}
		<Accordion.Root
			bind:value={currentAccordion}
			class="z-40 flex flex-col bg-background pt-2 md:rounded-t-none md:drop-shadow-none"
		>
			{#if data.locations}
				{#each data.locations as location, i}
					{#if showPrevious || location.order !== 'previous'}
						{#if !showPrevious && location.order === 'focus' && data.locations.filter((l) => l.order === 'previous').length > 0}
							<button
								out:slide={{ duration: 125 }}
								class={[
									'relative flex items-center px-4 py-3 text-left font-medium',
									(i - 1) % 2 === 0 ? 'bg-background' : 'bg-card'
								]}
								onclick={() => (showPrevious = true)}
							>
								<div class="flex w-16 items-center justify-center text-center"></div>
								<div class="w-[26px]">
									<div
										class={[
											'absolute -bottom-0 left-[78px] top-3 z-30 grid w-2 grid-rows-6 rounded-sm group-first:top-7 group-first:items-start group-last:bottom-7 group-last:h-9 group-last:items-end'
										]}
									>
										{#snippet empty()}
											<div class="rounded"></div>
										{/snippet}
										{#snippet dot()}
											<div
												class="rounded"
												style:background={data.operatorCode
													? operatorList[data.operatorCode].bg
													: ''}
											></div>
										{/snippet}

										{@render dot()}
										{@render empty()}
										{@render dot()}
										{@render empty()}
										{@render dot()}
										{@render empty()}
									</div>

									{#if data.locations[0].state === Status.DEPARTED && data.focus.state === Status.AWAY}
										<PositionIndicator
											progress={0}
											collapsed
											color={operatorList[data.operatorCode].bg}
											{now}
										/>
									{/if}
								</div>
								Show {data.locations.filter((l) => l.order === 'previous').length} previous stops
							</button>
						{/if}
						<div class="group relative" transition:slide={{ duration: 75 }}>
							<div
								style:background={data.operatorCode ? operatorList[data.operatorCode].bg : ''}
								class={[
									'absolute -bottom-3 left-[78px] top-0 z-30 flex w-2 rounded-full bg-zinc-400 transition-all duration-75 group-first:top-7 group-first:items-start group-last:bottom-7 group-last:h-9 group-last:items-end'
								]}
							></div>
							{#if data.currentLocation === i}
								{@const b = data !== undefined ? (data.locations[i + 1] ?? null) : null}
								{#if b}
									<PositionIndicator
										progress={location.progress}
										a={location.atd ?? location.etd ?? location.std}
										b={b ? (b.ata ?? b.eta ?? b.sta) : null}
										{now}
										state={location.state}
										color={data.operatorCode ? operatorList[data.operatorCode].bg : ''}
									/>
								{/if}
							{/if}
							<div class="absolute left-[78px] top-0 z-30 flex h-16 w-2 items-center">
								<div
									style:background={data.operatorCode ? operatorList[data.operatorCode].bg : ''}
									class="h-2 w-2 rounded-l-full rounded-r-full border-blue-500 pl-4"
								></div>
							</div>

							<CallingPoint
								{i}
								isPass={location.isPass}
								platform={location.platform}
								crs={location.crs}
								name={location.name}
								std={location.std}
								sta={location.sta}
								etd={location.etd}
								atd={location.atd}
								ata={location.ata}
								eta={location.eta}
								type={location.order}
								isCancelled={location.isCancelled ?? false}
								destCrs={data.destination.crs}
							/>
						</div>
						{#if data.locations[i + 1]?.order === 'focus' && showPrevious}
							<button
								transition:slide={{ duration: 125 }}
								class={[
									'relative pb-2 pl-[108px] text-left font-medium text-zinc-700 transition-all duration-200',
									i % 2 === 0 ? 'bg-background' : 'bg-card'
								]}
								onclick={() => (showPrevious = false)}
							>
								<div
									style:background={data.operatorCode ? operatorList[data.operatorCode].bg : ''}
									class={[
										'absolute  -bottom-3 left-[78px] top-0 z-30 flex w-2 rounded-full bg-zinc-400 group-first:top-7 group-first:items-start group-last:bottom-7 group-last:h-9 group-last:items-end'
									]}
								></div>
								Hide previous stops
							</button>
						{/if}
					{/if}
				{/each}
			{/if}
		</Accordion.Root>
		<div class="z-40 h-20 bg-background md:h-0"></div>
	{/if}
{/snippet}
