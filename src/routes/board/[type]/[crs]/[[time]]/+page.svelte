<script lang="ts">
	import { goto, onNavigate, preloadData, pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import BoardList from '$lib/components/board/board-list.svelte';
	import OperatorsList from '$lib/components/operators-list.svelte';
	import Refresher from '$lib/components/refresher.svelte';
	import Skeleton from '$lib/components/skeleton.svelte';
	import Spinner from '$lib/components/spinner.svelte';
	import ComboSidetopbar from '$lib/components/ui/combo-sidetopbar.svelte';
	import Header from '$lib/components/ui/header.svelte';
	import type { definitions } from '$lib/types/api';
	import { sortByLiveDepart } from '$lib/utils';
	import { getTrainServices } from '$lib/utils/api';
	import { flyAndScale } from '$lib/utils/transitions';
	import { Dialog } from 'bits-ui';
	import {
		AlertCircle,
		ArrowDownRight,
		ArrowUpRight,
		Calendar,
		Calendar1,
		Clock,
		Edit,
		Home,
		RotateCw,
		Settings,
		X
	} from 'lucide-svelte';
	import { MediaQuery, SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { fade } from 'svelte/transition';
	import { throttle } from 'throttle-typescript';
	import { Drawer } from 'vaul-svelte';
	import ServiceDetails from '../../../../service/[id]/[crs]/+page.svelte';
	import type { PageData } from './$types';
	import Switcher from '$lib/components/board/switcher.svelte';
	import dayjs from 'dayjs';

	let { data }: { data: PageData } = $props();

	// data
	let trains: SvelteMap<string, definitions['ServiceItem']> = $state(new SvelteMap([]));
	let board: definitions['StationBoard'] | null = $state(null);
	let operators: SvelteSet<string> = $state(new SvelteSet([]));
	let operatorStartTimes: SvelteMap<string, string | null> = $state(new SvelteMap([]));
	let sorted: SvelteMap<string, definitions['ServiceItem']> = $derived(
		trains.size > 0 ? new SvelteMap([...trains].sort(sortByLiveDepart)) : new SvelteMap([])
	);

	$inspect(operators)

	// state
	let loadingLaterTrains = $state(false);
	let refreshing = $state(false);
	let drawerOpen = $state(false);
	let maxTrainsReached = $state(false);
	let selectedOperator: string | null = $state(null);
	const md = new MediaQuery('min-width: 768px');

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
			board.crs!,
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

		trains = new SvelteMap(await getTrainServices(board.crs!, data.date, 15, o, data.type));

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

{#snippet disruption(messages: definitions['NRCCMessage'][])}
	{#if messages && messages.length > 0}
		<div class="hidden items-center gap-2 px-4 pt-4 text-lg font-medium md:flex">
			<AlertCircle size={22} /> Disruption
		</div>
		<div class="flex flex-col gap-2 px-4 pt-4">
			{#each messages.toSorted((a) => {
				if (a.severity === 'Major') {
					return -1;
				} else {
					return 1;
				}
			}) as message}
				<Dialog.Root>
					<Dialog.Trigger
						class={[
							'prose rounded-lg border px-2 py-2 text-left text-sm',
							message.severity === 'Normal' && 'bg-blue-00/80 border-blue-300',
							message.severity === 'Major' && 'border-red-300 bg-red-100/80',
							message.severity === 'Minor' && 'border-amber-300 bg-amber-100/80',
							message.severity === 'Severe' && 'border-black bg-red-950/95 text-white'
						]}
					>
						<div class="line-clamp-1 leading-5 md:line-clamp-2">
							{@html message.xhtmlMessage}
						</div>
					</Dialog.Trigger>
					<Dialog.Portal>
						<Dialog.Overlay
							class="fixed inset-0 z-20 bg-black/80"
							transition={fade}
							transitionConfig={{ duration: 150 }}
						/>
						<Dialog.Content
							transition={flyAndScale}
							class="fixed left-1/2 top-1/2 z-40 h-max w-[480px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-50 pt-2"
						>
							<Header title="{message.severity} Disruption" type="dialog" BackIcon={X} />

							<div class="px-4 pb-4 pt-1">
								<div
									class={[
										'prose rounded border p-2',
										message.severity === 'Normal' && 'bg-blue-00/80 border-blue-300',
										message.severity === 'Major' && 'border-red-300 bg-red-100/80',
										message.severity === 'Minor' && 'border-amber-300 bg-amber-100/80',
										message.severity === 'Severe' && 'border-black bg-red-950/95 text-white'
									]}
								>
									{@html message.xhtmlMessage}
								</div>
							</div>
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>
			{/each}
		</div>
	{/if}
{/snippet}

<div class="mx-auto min-h-screen md:flex md:max-w-screen-lg">
	<ComboSidetopbar>
		<Header
			ActionIcon={RotateCw}
			onBackClick={() => history.back()}
			onActionClick={() => {
				operator(selectedOperator);
			}}
		>
			{#await data.board}
				<Skeleton class="h-8 w-52" />
			{:then { board }}
				{#if !md.current}
					<Drawer.Root>
						<Drawer.Trigger
							class="flex h-full min-w-0 flex-grow flex-col items-center justify-center overflow-hidden text-ellipsis"
						>
							<div
								class="w-full min-w-0 flex-grow overflow-hidden text-ellipsis text-nowrap text-center text-2xl font-bold md:hidden md:pr-10 md:text-left md:text-4xl"
							>
								{board.locationName}
							</div>
							<div class="flex gap-2 text-sm">
								<div class="flex items-center gap-1">
									{#if data.type === 'dept'}
										<ArrowUpRight size={12} /> Departures
									{:else}
										<ArrowDownRight size={12} /> Arrivals
									{/if}
								</div>
								<div class="flex items-center gap-1">
									<Clock size={12} />
									{data.date ? dayjs(data.date).format('HH:mm') : 'now'}
								</div>
								<button class="flex items-center gap-1 rounded bg-zinc-200 px-2 py-1 text-xs"
									><Settings size={12} /> Options</button
								>
							</div>
						</Drawer.Trigger>

						<Drawer.Portal>
							<Drawer.Overlay class="fixed inset-0 z-40 bg-black/80" />
							<Drawer.Content
								class="fixed bottom-0 left-0 right-0 z-50 flex h-drawer flex-col rounded-t-lg bg-zinc-50 pt-3"
							>
								<Header BackIcon={X} type="drawer" title="Board Options"></Header>
								<div class="pb-ios-bottom h-full min-h-0 flex-grow px-4">
									<Switcher
										drawer
										crs={board.crs}
										type={data.type}
										value={data.date ? dayjs(data.date).format('HH:mm') : dayjs().format('HH:mm')}
									/>
								</div>
							</Drawer.Content>
						</Drawer.Portal>
					</Drawer.Root>
				{:else}
					<div class="w-full">
						<a href="/" class="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-300"
							><Home /></a
						>
					</div>
				{/if}
			{/await}
		</Header>

		<div class="hidden pb-3 pl-4 pt-2 md:flex md:pt-2">
			{#await data.board}
				<Skeleton class="h-12 w-52" />
			{:then { board }}
				<div class="flex flex-col">
					<div class="text-4xl font-bold">{board.locationName}</div>
					<div class="flex gap-2 text-base">
						<div class="flex items-center gap-1">
							{#if data.type === 'dept'}
								<ArrowUpRight size={12} /> Departures
							{:else}
								<ArrowDownRight size={12} /> Arrivals
							{/if}
						</div>
						<div class="flex items-center gap-1">
							<Clock size={12} />
							{data.date ? dayjs(data.date).format('HH:mm') : 'now'}
						</div>
					</div>
				</div>
			{/await}
		</div>
		<div class="h-3 md:h-0"></div>
		<OperatorsList operators={Array.from(operators)} {selectedOperator} onselect={operator} />

		{#if md.current}
			{#await data.board then { board }}
				{@render disruption(board.nrccMessages ?? [])}
			{/await}
		{/if}
	</ComboSidetopbar>

	{#if !md.current}
		<div class="h-ios-top"></div>
		<div class="h-28"></div>
	{/if}

	<Refresher {onRefresh} {refreshing}>
		<div class="md:flex-grow">
			{#if !md.current}
				{#await data.board then { board }}
					{@render disruption(board.nrccMessages ?? [])}
				{/await}
				<div class="h-6"></div>
			{/if}
			{#await data.board}
				<div class="flex flex-col gap-2 pl-4 pr-4 md:pl-0 md:pt-4">
					{#each Array(10)}
						<Skeleton class="h-[88px]" />
					{/each}
				</div>
			{:then}
				{#if sorted && sorted.size > 0}
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
						title="Service Details"
						ActionIcon={ArrowUpRight}
						onActionClick={() => {
							let id = page.state.selected?.serviceID;
							replaceState('', { selected: null });
							goto(`/service/${id}/${board?.crs}`);
						}}
					/>
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
				class="fixed left-1/2 top-1/2 z-40 h-[80%] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-50"
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
