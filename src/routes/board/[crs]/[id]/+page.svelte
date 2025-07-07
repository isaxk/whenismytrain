<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import CallingPoint from '$lib/components/train/calling-point.svelte';
	import CarriageDiagram from '$lib/components/train/carriage-diagram.svelte';
	import CollapsableSectionTrigger from '$lib/components/train/collapsable-section-trigger.svelte';
	import Map from '$lib/components/train/map.svelte';
	import SaveToggle from '$lib/components/train/save-toggle.svelte';
	import TrainPageSkel from '$lib/components/train/train-page-skel.svelte';
	import InfoCard from '$lib/components/ui/info-card.svelte';
	import { operatorList } from '$lib/data/operators';
	import { refresher } from '$lib/data/refresh.svelte.js';
	import { expandedMap } from '$lib/data/saved.svelte.js';
	import { Position } from '$lib/types/index.js';
	import type { ServiceDetails } from '$lib/types/train.js';
	import { Tooltip } from 'bits-ui';

	import dayjs from 'dayjs';
	import {
		Accessibility,
		ArrowLeft,
		ChevronDown,
		ChevronUp,
		Clock1,
		Clock4,
		Clock5,
		Clock6,
		ClockAlert,
		Toilet,
		X
	} from 'lucide-svelte';
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
		if (clearer) clearer();
		data.train
			.then((details) => {
				console.log(details);
				train = details;
				console.log(train);
				show = {
					previous: false,
					subsequent: false,
					further: false
				};
				clearer = refresher.subscribe<ServiceDetails>(
					`/api/service/${data.train_id}/${data.crs}/${data.filter ?? data.dest}`,
					'page-data' + Date.now(),
					(data) => {
						train = data;
					}
				);
			})
			.catch((error) => {
				console.error(error);
			});
	});

	let clientHeight = $state();
</script>

<svelte:window onscroll={() => (expandedMap.current = false)} />

<Tooltip.Provider>
	<div
		class={[
			'min-h-screen min-w-0 md:flex md:h-full md:min-h-full md:flex-col',
			expandedMap.current ? 'md:flex-row' : 'md:flex-col'
		]}
	>
		{#await data.train}
			<TrainPageSkel />
		{:then}
			{#if train}
				{@const {
					grouped,
					locations,
					filterDetails,
					operator,
					lateReason,
					cancelReason,
					formation
				} = train}

				<div
					style:view-transition-name="header"
					class={[
						'bg-background fixed top-0 right-0 left-0 z-[1000] md:static',
						expandedMap.current && 'flex h-[85%] min-h-[400px] flex-col md:h-full md:w-2/3'
					]}
					bind:clientHeight
					in:fade|global={{ duration: 150 }}
				>
					<div class="bg-background flex min-h-16 items-center gap-0">
						<button
							style:view-transition-name="back"
							onclick={() => {
								if (md.current) {
									goto(`/board/${data.crs}${page.url.search}`);
								} else {
									history.back();
								}
								expandedMap.current = false;
							}}
							class="flex h-14 w-14 items-center justify-center"
						>
							{#if md.current}
								<X />
							{:else}
								<ArrowLeft />
							{/if}
						</button>

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
									{#if dayjs(grouped.focus.times.estimated.departure ?? grouped.focus.times.scheduled.departure).day() !== dayjs().day()}
										<span class="text-foreground-muted">
											{dayjs(
												grouped.focus.times.estimated.departure ??
													grouped.focus.times.scheduled.departure
											).format('DD MMM YYYY')}
										</span> -
									{/if}
									{dayjs(grouped.focus.times.scheduled.departure).format('HH:mm')} to
									{#if grouped.destination.crs !== page.data.dest}
										{#await data.stations then stations}
											{stations.find((s) => s.crs === page.data.dest)?.Value}
										{/await}
									{:else}
										{grouped.destination.name}
									{/if}
								</div>
							</div>
						</div>
						<SaveToggle id={data.train_id} focus={data.crs} filter={data.to ?? data.dest} />
					</div>
					{#if (grouped.focus.isCancelled || grouped.filter.isCancelled) && cancelReason}
						<InfoCard icon={X} style="danger" message={cancelReason} />
					{:else if lateReason}
						<InfoCard icon={ClockAlert} style="warning" message={lateReason} />
					{/if}
					{#if locations.some((l) => l.divisionType)}
						<InfoCard
							message="This service divides, please check departure boards to ensure you are in the correct carriage"
						/>
					{/if}
					<div
						in:fade={{ duration: 200 }}
						class={['relative', expandedMap.current ? 'flex-grow' : 'h-42 min-h-42']}
					>
						<div class={['h-full w-full overflow-hidden']}>
							<Map
								expanded={expandedMap.current}
								{locations}
								{operator}
								focus={data.crs}
								filter={data.filter}
								focusedCallingPoints={[grouped.focus, ...grouped.subsequent, grouped.filter]}
							/>
						</div>
						<button
							onclick={() => (expandedMap.current = !expandedMap.current)}
							class="absolute bottom-2 left-2 z-[200] flex items-center gap-1 rounded-full px-2 py-1 text-sm drop-shadow-2xl"
							style:background={operatorList[operator].bg}
							style:color={operatorList[operator].text}
						>
							{#if expandedMap.current}
								<ChevronUp size={16} /> Collapse Map
							{:else}
								<ChevronDown size={16} /> Expand Map
							{/if}
						</button>
					</div>
				</div>
				{#if !md.current}
					<div style:min-height="{clientHeight}px"></div>
				{/if}
				<div class="flex min-h-0 flex-grow flex-col">
					{#if formation && formation.length > 0}
						<CarriageDiagram {formation} />
					{/if}
					{#if formation?.some((f) => f.loading) || locations?.some((l) => l.loading)}
						<div class="px-4 pb-2 text-xs">
							* Colours indicate seat availability, not standing capacity.
						</div>
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
										next={grouped.previous[i + 1] ?? grouped.focus ?? null}
									/>
								{/each}
							</div>
						{/if}
						{#if grouped.previous.length > 0}
							<CollapsableSectionTrigger
								color={operatorList[operator].bg}
								bind:show={show.previous}
								openedText="Hide previous"
								closedText="Show previous"
								progressState={[Position.ARRIVED, Position.DEPARTED].includes(
									grouped.focus.trainRelativePosition
								)
									? 'full'
									: grouped.previous.some((l) => l.trainRelativePosition === Position.DEPARTED) &&
										  !show.previous
										? 'partial'
										: 'none'}
							/>
						{/if}
						<CallingPoint
							uid={train.uid}
							sdd={train.sdd}
							callingPoint={grouped.focus}
							i={0}
							color={operatorList[operator].bg}
							order="focus"
							end={grouped.previous.length === 0 ? 'start' : null}
							showJoin={show.previous}
							showDivide={show.subsequent}
							next={grouped.subsequent[0] ?? grouped.filter ?? null}
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
										next={grouped.subsequent[i + 1] ?? grouped.filter ?? null}
									/>
								{/each}
							</div>
						{/if}
						{#if grouped.subsequent.length > 0}
							<CollapsableSectionTrigger
								color={operatorList[operator].bg}
								bind:show={show.subsequent}
								openedText="Hide stops"
								closedText=""
								progressState={[Position.ARRIVED, Position.DEPARTED].includes(
									grouped.filter.trainRelativePosition
								)
									? 'full'
									: ([Position.ARRIVED, Position.DEPARTED].includes(
												grouped.subsequent[0].trainRelativePosition
										  ) &&
												!show.subsequent) ||
										  [Position.ARRIVED, Position.DEPARTED].includes(
												grouped.filter.trainRelativePosition
										  )
										? 'partial'
										: 'none'}
							>
								{#snippet closedTextSnippet()}
									<div class="text-foreground/80 flex items-center gap-1.5">
										<Clock4 size={14} />
										{filterDetails.duration} - {filterDetails.stops} stops
									</div>
									<div class="text-xs">Show {grouped.subsequent.length} intermediate stops</div>
								{/snippet}
							</CollapsableSectionTrigger>
						{:else}
							<div class="text-foreground-tint flex h-10 items-center gap-2 px-4">
								<div class="w-12"></div>
								<div class="flex h-full flex-col pr-4">
									{#if [Position.ARRIVED, Position.DEPARTED].includes(grouped.filter.trainRelativePosition)}
										<div class="w-2 flex-grow" style:background={operatorList[operator].bg}></div>
									{:else}
										<div
											class="w-2 flex-grow"
											style:background="{operatorList[operator].bg}B3"
										></div>
									{/if}
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
							next={grouped.further[0] ?? grouped.destination ?? null}
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
										next={grouped.further[i + 1] ?? grouped.destination ?? null}
									/>
								{/each}
							</div>
						{/if}
						{#if grouped.further.length > 0}
							<CollapsableSectionTrigger
								color={operatorList[operator].bg}
								bind:show={show.further}
								openedText="Hide further"
								closedText="Show further"
								progressState={[Position.DEPARTED, Position.ARRIVED].includes(
									grouped.destination.trainRelativePosition
								)
									? 'full'
									: [Position.DEPARTED, Position.ARRIVED].includes(
												grouped.further[0].trainRelativePosition
										  ) && !show.further
										? 'partial'
										: 'none'}
							/>
						{/if}
						{#if grouped.destination.crs !== data.dest && data.dest !== grouped.filter.crs && !show.further && !grouped.subsequent.some((s) => s.crs === data.dest)}
							<CallingPoint
								uid={train.uid}
								sdd={train.sdd}
								callingPoint={locations.find((l) => l.crs === data.dest)}
								i={0}
								hideDetails={!show.further && grouped.further.length > 0}
								color={operatorList[operator].bg}
								order="destination"
								next={null}
							/>
						{/if}

						{#if !show.further && grouped.destination.crs !== grouped.filter.crs && grouped.destination.crs !== data.dest && !grouped.subsequent.some((s) => s.crs === data.dest)}
							<div class="text-foreground-tint flex h-6 items-center gap-2 px-4">
								<div class="w-12"></div>
								<div class="flex h-full flex-col pr-4">
									{#if [Position.DEPARTED].includes(locations.find((l) => l.crs === data.dest)?.trainRelativePosition ?? Position.UNKNOWN)}
										<div
											class="w-2 flex-grow"
											style:background="linear-gradient(to bottom, {operatorList[operator].bg},
											transparent)"
										></div>
									{:else}
										<div
											class="w-2 flex-grow"
											style:background="linear-gradient(to bottom, {operatorList[operator].bg}B3,
											transparent)"
										></div>
									{/if}
								</div>
							</div>
						{/if}
						{#if grouped.destination.crs !== grouped.filter.crs && !(grouped.destination.crs !== data.dest && !show.further && !grouped.subsequent.some((s) => s.crs === data.dest))}
							<CallingPoint
								uid={train.uid}
								sdd={train.sdd}
								callingPoint={grouped.destination}
								i={0}
								hideDetails={!show.further && grouped.further.length > 0}
								color={operatorList[operator].bg}
								order="destination"
								end="end"
								next={null}
							/>
						{/if}
					</div>
				</div>
			{/if}
		{:catch error}
			<div class="flex items-center gap-1">{error.message}</div>
		{/await}
	</div>
</Tooltip.Provider>
