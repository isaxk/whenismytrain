<script lang="ts">
	import { goto, onNavigate, preloadData, pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import BoardList from '$lib/components/board/board-list.svelte';
	import Switcher from '$lib/components/board/switcher.svelte';
	import OperatorsList from '$lib/components/operators-list.svelte';
	import Refresher from '$lib/components/refresher.svelte';
	import Skeleton from '$lib/components/skeleton.svelte';
	import Spinner from '$lib/components/spinner.svelte';
	import ComboSidetopbar from '$lib/components/ui/combo-sidetopbar.svelte';
	import Header from '$lib/components/ui/header.svelte';
	import Saved from '../../../../(pages)/saved/+page.svelte';
	import type { definitions } from '$lib/types/api';
	import { sortByLiveDepart } from '$lib/utils';
	import { getTrainServices } from '$lib/utils/api';
	import { flyAndScale } from '$lib/utils/transitions';
	import { Dialog } from 'bits-ui';
	import dayjs from 'dayjs';
	import {
		AlertCircle,
		ArrowDownRight,
		ArrowLeft,
		ArrowUpRight,
		Bookmark,
		Check,
		Clock,
		Home,
		RotateCw,
		Save,
		Settings,
		X
	} from 'lucide-svelte';
	import { MediaQuery, SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { crossfade, fade, fly, scale } from 'svelte/transition';
	import { throttle } from 'throttle-typescript';
	import { Drawer } from 'vaul-svelte';
	import ServiceDetails from '../../../../service/[id]/[crs]/+page.svelte';
	import type { PageData } from './$types';
	import DisruptionList from '$lib/components/board/disruption-list.svelte';
	import LastUpdated from '$lib/components/last-updated.svelte';
	import { scrollY } from 'svelte/reactivity/window';
	import { quadInOut, quartInOut } from 'svelte/easing';
	import Title from '$lib/components/board/title.svelte';
	import { savedBoards } from '$lib/data/saved.svelte';
	import ServiceSaveToggle from '$lib/components/service/service-save-toggle.svelte';

	const [send, receive] = crossfade({ duration: 250, easing: quadInOut });

	let { data }: { data: PageData } = $props();

	// data
	let trains: SvelteMap<string, definitions['ServiceItem']> = $state(new SvelteMap([]));
	let board: definitions['StationBoard'] | null = $state(null);
	let operators: SvelteSet<string> = $state(new SvelteSet([]));
	let operatorStartTimes: SvelteMap<string, string | null> = $state(new SvelteMap([]));
	let sorted: SvelteMap<string, definitions['ServiceItem']> = $derived(
		trains.size > 0 ? new SvelteMap([...trains].sort(sortByLiveDepart)) : new SvelteMap([])
	);

	// state
	let loadingLaterTrains = $state(false);
	let refreshing = $state(false);
	let drawerOpen = $state(false);
	let maxTrainsReached = $state(false);
	let selectedOperator: string | null = $state(null);
	let generatedAt = $state(dayjs());
	const md = new MediaQuery('min-width: 768px');

	const saveIndex = $derived(
		savedBoards.value.findIndex(
			(b) =>
				b.from === data.from && b.time === data.time && b.to === data.to && b.type === data.type
		)
	);

	// update after data.board promise resolves
	$effect(() => {
		data.board.then((d) => {
			console.log(d);
			operators = new SvelteSet([]);
			trains = new SvelteMap([...d.trainServices]);
			board = d.board;
		});
	});

	// Update operators
	$effect(() => {
		Array.from(trains.values()).forEach((t) => {
			if (!operators.has(t.operatorCode!)) {
				operators.add(t.operatorCode!);
				if (!operatorStartTimes.has(t.operatorCode!)) {
					operatorStartTimes.set(t.operatorCode!, t.atd ?? t.etd ?? t.std ?? null);
				}
			}
		});
	});

	// open/close the drawer based on page state
	$effect(() => {
		if (page.state.selected) {
			drawerOpen = true;
		} else {
			drawerOpen = false;
		}
	});

	// load later trains
	const later = throttle(async () => {
		if (loadingLaterTrains) return;
		if (maxTrainsReached) return;
		if (!board) return;
		if (trains.size > 200) {
			maxTrainsReached = true;
			return;
		}

		loadingLaterTrains = true;

		const arr = Array.from(sorted);
		const [, lastTrain] = arr.length > 0 ? arr[arr.length - 1] : [null, null];

		const response = await getTrainServices(
			data.from,
			data.to,
			lastTrain?.etd ?? lastTrain?.std ?? null,
			15,
			selectedOperator,
			data.type
		);

		let newTrain = false;
		response.forEach(([rid, t]) => {
			if (!trains.has(t.rid)) {
				newTrain = true;
				trains.set(rid, t);
			}
		});

		if (!newTrain) maxTrainsReached = true;
		loadingLaterTrains = false;
	}, 200);

	// open the service details drawer / modal
	async function handleServiceDetails(id: string) {
		if (!board) return;
		drawerOpen = true;
		const response = await preloadData(`/service/${id}/${board.crs}`);
		if (response.type === 'loaded' && response.status === 200) {
			pushState(`/service/${id}/${board.crs}`, { selected: response.data });
		}
	}

	// refresh or filter by operator
	async function operator(o: string | null) {
		if (!board) return;
		refreshing = true;
		selectedOperator = o;
		maxTrainsReached = false;

		window.scrollTo({ top: 0, behavior: 'smooth' });

		const arr = Array.from(sorted.values());

		let startTime: string | null = o ? (operatorStartTimes.get(o) ?? null) : null;

		if (o && arr.length > 0) {
			arr.forEach((t) => {
				if ((t.operatorCode ?? '' === o) && startTime === null) {
					startTime = t.atd ?? t.etd ?? t.std ?? 'null';
				}
			});
		}

		trains = new SvelteMap(await getTrainServices(data.from, data.to, data.date, 15, o, data.type));
		generatedAt = dayjs();

		refreshing = false;
		if (trains.size < 2) {
			later();
		}
	}

	// handle pull to refresh
	async function onRefresh() {
		await operator(selectedOperator);
	}

	onNavigate(() => {
		page.state.selected = null;
	});
</script>

<svelte:head>
	{#await data.board}
		<title>Departures</title>
	{:then { board }}
		<title>{board.locationName} -Departures</title>
	{/await}
</svelte:head>

<div class="mx-auto min-h-screen md:flex md:max-w-screen-lg md:gap-10">
	<ComboSidetopbar>
		<div class="flex gap-2 px-4 pb-2">
			<button
				onclick={() => history.back()}
				class="flex h-10 min-w-10 items-center justify-center rounded-lg bg-zinc-300"
				><ArrowLeft size={20} /></button
			>
			<button
				onclick={() => operator(selectedOperator)}
				class="flex h-10 min-w-10 items-center justify-center rounded-lg bg-zinc-300"
				><RotateCw size={20} /></button
			>
			{#await data.board}
				<Skeleton class="h-8 w-52" />
			{:then { board }}
				{#if !md.current}
					<div class="min-w-0 flex-grow">
						{#if (scrollY.current ?? 0) > 50}
							<Title
								locationName={board.locationName}
								type={data.type}
								date={data.date}
								filter={board.filterLocationName ?? null}
								compact
							/>
						{/if}
					</div>
				{:else}
					<div class="flex w-full items-center">
						<a href="/" class="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-300"
							><Home /></a
						>
						<div class="flex-grow"></div>
						<LastUpdated date={generatedAt} />
					</div>
				{/if}
			{/await}

			{#if saveIndex !== -1}
				<button
					in:scale={{ start: 0.5 }}
					onclick={() => {
						savedBoards.value.splice(saveIndex, 1);
					}}
					class="flex h-10 min-w-10 items-center justify-center rounded-lg bg-blue-500 text-white"
				>
					<Check size={20} />
				</button>
			{:else}
				<button
					onclick={() =>
						(savedBoards.value = [
							...savedBoards.value,
							{
								from: data.from,
								time: data.time,
								to: data.to,
								type: data.type,
								key: Date.now() + data.from + data.time + data.to + data.type
							}
						])}
					class="flex h-10 min-w-10 items-center justify-center rounded-lg bg-zinc-300"
					><Bookmark size={20} /></button
				>
			{/if}
		</div>

		{#await data.board then { board }}
			<div
				class={[
					'transition-all',
					md.current
						? 'h-full flex-grow overflow-y-scroll'
						: (scrollY.current ?? 0) > 50
							? 'h-2 duration-200'
							: data.to
								? 'h-[100px] pt-2 duration-300'
								: 'h-20 pt-2 duration-300'
				]}
			>
				{#if !md.current && (scrollY.current ?? 0) <= 50}
					<Title
						compact={false}
						locationName={board.locationName}
						type={data.type}
						date={data.date}
						filter={board.filterLocationName ?? null}
					/>
				{/if}
				{#if md.current}
					<div class="h-3 md:h-0"></div>

					<div class="overflow-y-scroll px-1 md:pb-4 md:pt-4" in:fade={{ duration: 200 }}>
						<div class="h-[350px] rounded-lg border-zinc-100 bg-white/95 p-4 drop-shadow">
							<Switcher
								drawer={false}
								from={data.from}
								to={data.to}
								type={data.type}
								value={data.date ? dayjs(data.date).format('HH:mm') : dayjs().format('HH:mm')}
							/>
						</div>
						<div class="mt-4 rounded-lg border bg-white p-2 drop-shadow-sm">
							<Saved card />
						</div>
					</div>
				{/if}
			</div>

			{#if !md.current}
				<OperatorsList operators={Array.from(operators)} {selectedOperator} onselect={operator} />
			{/if}
		{/await}
	</ComboSidetopbar>

	{#if !md.current}
		<div class="h-ios-top"></div>
		<div class="h-[180px]"></div>
	{/if}

	<Refresher {onRefresh} {refreshing}>
		<div class="md:flex-grow">
			{#await data.board then { board }}
				{#if md.current}
					<div class="sticky top-0 z-20 flex w-full bg-zinc-50 pt-4">
						<div class="min-w-0 flex-grow">
							<OperatorsList
								operators={Array.from(operators)}
								{selectedOperator}
								onselect={operator}
							/>
						</div>
						{#if refreshing}
							<div
								transition:fade={{ duration: 200 }}
								class="flex h-10 items-center justify-end overflow-hidden"
							>
								<div class="-mr-4 scale-75">
									<Spinner />
								</div>
							</div>
						{/if}
					</div>
				{/if}
				<DisruptionList messages={board.nrccMessages ?? []} />
			{/await}
			{#await data.board}
				<div class="flex flex-col gap-2 pl-4 pr-4 md:pl-0 md:pt-4">
					{#each Array(10)}
						<Skeleton class="h-[88px]" />
					{/each}
				</div>
			{:then}
				{#if sorted && sorted.size > 0}
					{#if !md.current}
						<div class="flex items-center justify-end pb-1 pr-5">
							<LastUpdated date={generatedAt} />
						</div>
					{/if}
					<BoardList list={sorted} {handleServiceDetails} type={data.type} />
					<div class="flex h-32 items-center justify-center px-4">
						{#if maxTrainsReached}
							<div
								in:fade={{ duration: 200 }}
								class="flex h-20 items-center justify-center text-center"
							>
								Refer to a timetable or dedicated journey planner app to see further trains.
							</div>
						{:else if loadingLaterTrains}
							<div in:fade={{ duration: 200 }} class="flex h-20 items-center justify-center">
								<Spinner />
							</div>
						{:else}
							<button
								in:fade={{ duration: 200 }}
								class="flex h-11 w-full items-center justify-center rounded-lg bg-blue-500 text-center text-white placeholder-gray-300 drop-shadow-xl transition-all duration-300 hover:brightness-105"
								onclick={later}>Later trains</button
							>
							<div class="h-10"></div>
						{/if}
					</div>
				{:else if sorted.size === 0}
					<div class="p-4">No services found</div>
				{/if}
			{/await}
		</div>
	</Refresher>
</div>

{#snippet serviceContent()}
	<div class="flex h-full flex-col pt-3">
		{#if page.state.selected}
			<ServiceDetails data={page.state.selected} drawer>
				{#snippet header()}
					<Header
						BackIcon={X}
						onBackClick={() => {
							drawerOpen = false;
							page.state.selected = null;
							history.back();
						}}
						ActionIcon={ArrowUpRight}
						onActionClick={() => {
							let id = page.state.selected?.serviceID;
							replaceState('', { selected: null });
							goto(`/service/${id}/${board?.crs}`);
						}}
					>
						<div class="w-10"></div>
						<div class="flex h-10 flex-grow items-center justify-center font-medium">
							Service Details
						</div>
						<ServiceSaveToggle id={page.state.selected?.serviceID} crs={data.from} />
					</Header>
				{/snippet}
			</ServiceDetails>
		{:else}
			<div class="flex items-center justify-between px-4 pt-1">
				<Skeleton class="h-10 w-10" />
				<div class="font-semibold">Service Details</div>
				<Skeleton class="h-10 w-10" />
			</div>
			<div class="p-4">
				<Skeleton class="h-[88px] w-full" />
				<div class="h-4"></div>
				<div class="flex flex-col gap-1">
					{#each Array(6)}
						<Skeleton class="h-12 w-full" />
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/snippet}

{#if md.current}
	<Dialog.Root
		open={drawerOpen}
		closeOnEscape
		closeOnOutsideClick
		onOpenChange={(e) => {
			if (!e && page.state.selected) {
				page.state.selected = null;
				drawerOpen = false;
				history.back();
			}
		}}
	>
		<Dialog.Portal>
			<Dialog.Overlay
				class="fixed inset-0 z-20 bg-black/80"
				transition={fade}
				transitionConfig={{ duration: 150 }}
			/>
			<Dialog.Content
				transition={flyAndScale}
				class="fixed left-1/2 top-1/2 z-40 h-[90%] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-50"
			>
				{@render serviceContent()}
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
{:else}
	<Drawer.Root
		bind:open={drawerOpen}
		onOpenChange={(e) => {
			if (!e && page.state.selected) {
				page.state.selected = null;
				history.back();
			}
		}}
	>
		<Drawer.Portal>
			<Drawer.Overlay class="pointer-events-auto fixed inset-0 z-20 bg-black/80" />
			<Drawer.Content
				class="fixed bottom-0 left-0 right-0 z-40 mt-ios-top h-drawer rounded-t-lg bg-zinc-50 px-0 pb-5  outline-none"
			>
				{@render serviceContent()}
			</Drawer.Content>
		</Drawer.Portal>
	</Drawer.Root>
{/if}
