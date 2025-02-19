<script lang="ts">
	import dayjs from 'dayjs';
	import { onDestroy, onMount, type Snippet } from 'svelte';
	import { scrollY } from 'svelte/reactivity/window';
	import { draw, fade } from 'svelte/transition';
	import { Accordion } from 'bits-ui';

	import CallingPoint from '$lib/components/service/calling-point.svelte';
	import Disruption from '$lib/components/service/disruption.svelte';
	import TrainCard from '$lib/components/service/train-card.svelte';
	import Header from '$lib/components/ui/header.svelte';
	import PositionIndicator from '$lib/components/service/position-indicator.svelte';
	import LastUpdated from '$lib/components/last-updated.svelte';
	import ServiceSaveToggle from '$lib/components/service/service-save-toggle.svelte';

	import { operatorList } from '$lib/data/operators';
	import type { PageData } from './$types';
	import Map from '$lib/components/service/map.svelte';
	import { Drawer } from 'vaul-svelte';

	let {
		data,
		drawer = false,
		header
	}: { data: PageData; drawer?: boolean; header?: Snippet } = $props();

	let open = $state(true);

	let currentAccordion = $state(data.focus.crs);
	let now: dayjs.Dayjs | null = $state(null);
	let interval: ReturnType<typeof setInterval>;

	async function refresh() {
		const response = await fetch(`/api/service/${data.id}/${data.crs}`);
		now = dayjs();
		data = { ...(await response.json()), crs: data.crs, id: data.id };
	}

	onMount(() => {
		interval = setInterval(refresh, 10000);
		now = dayjs();

		const genAt = dayjs(data.generatedAt);
		const diff = Math.abs(genAt.diff(now, 'seconds'));
		console.log(diff);
		if (diff > 10) {
			refresh();
		}
	});

	let coords = $state([]);

	onMount(async () => {
		const response = await fetch(`https://json-993.pages.dev/tiploc.json`);
		const tiplocs = (await response.json()).Tiplocs;
		coords = JSON.parse(
			JSON.stringify(
				data.all.map((l, i) => {
					const found = tiplocs.find((tiploc) => tiploc.Tiploc === l.tiploc);
					return found
						? { l, coords: [found.Latitude, found.Longitude] }
						: { l, coords: [null, null] };
				})
			)
		);
	});
	onDestroy(() => {
		clearInterval(interval);
	});

	let expandedMap = $state(false);
</script>

{#if data && data !== undefined && data.focus}
	<div class={['w-full', !drawer && 'md:max-w-96']} in:fade|global={{ duration: 250 }}>
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
					details={data}
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
					<LastUpdated date={data.generatedAt} />
				</div>

				<Disruption
					isCancelled={data.destination.isCancelled}
					code={data.cancelReason?.Value ?? data.delayReason?.Value ?? null}
				/>
			</div>
		</div>
	</div>

	<div class="flex-grow overflow-y-scroll">
		{#if coords.length > 0}
			<div class={['h-[200px] transition-all']}>
				<Map
					color={operatorList[data.operatorCode!].bg}
					locations={coords}
					current={data.currentAll}
				/>
			</div>
		{/if}

		{#if !expandedMap}
			{@render stopList()}
		{/if}
	</div>
{/if}

{#snippet stopList()}
	<Accordion.Root
		bind:value={currentAccordion}
		class="z-40 flex -translate-y-4 flex-col rounded-t-xl border-t border-zinc-300 bg-background pt-2 md:rounded-t-none md:drop-shadow-none"
	>
		{#if data.locations}
			{#each data.locations ?? [] as location, i}
				<div class="group relative">
					<div
						style:background={data.operatorCode ? operatorList[data.operatorCode].bg : ''}
						class={[
							'absolute -bottom-3 left-[78px] top-0 z-30 flex w-2 rounded-full bg-zinc-400 group-first:top-7 group-first:items-start group-last:bottom-7 group-last:h-9 group-last:items-end'
						]}
					></div>
					{#if data.currentLocation === i + 1}
						{@const b = data !== undefined ? (data.locations[i + 1] ?? null) : null}
						{#if b}
							<PositionIndicator
								a={location.atd ?? location.etd ?? location.std}
								b={b ? (b.ata ?? b.eta ?? b.sta) : null}
								{now}
								state={b.state}
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
			{/each}
		{/if}
	</Accordion.Root>
	<div class="z-40 h-20 bg-background md:h-0"></div>
{/snippet}
