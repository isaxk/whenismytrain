<script lang="ts">
	import type { PageData } from './$types';
	import type { Board, TrainService } from '$lib/types';

	import dayjs from 'dayjs';
	import { throttle } from 'throttle-typescript';
	import { goto, onNavigate, preloadData, pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { scrollY } from 'svelte/reactivity/window';
	import { quadInOut } from 'svelte/easing';
	import { MediaQuery, SvelteMap, SvelteSet } from 'svelte/reactivity';

	import { sortByLiveDepart, strToMins } from '$lib/utils';
	import { getTrainServices } from '$lib/utils/api';
	import { flyAndScale } from '$lib/utils/transitions';
	import { crossfade, fade, scale } from 'svelte/transition';

	import { ArrowDown, ArrowUp, ArrowUpRight, X } from 'lucide-svelte';
	import { Dialog } from 'bits-ui';
	import { Drawer } from 'vaul-svelte';

	import BoardList from '$lib/components/board/board-list.svelte';
	import Switcher from '$lib/components/board/switcher.svelte';
	import OperatorsList from '$lib/components/operators-list.svelte';
	import Refresher from '$lib/components/refresher.svelte';
	import Skeleton from '$lib/components/skeleton.svelte';
	import Spinner from '$lib/components/spinner.svelte';
	import ComboSidetopbar from '$lib/components/ui/combo-sidetopbar.svelte';
	import Header from '$lib/components/ui/header.svelte';
	import Saved from '../../../../(pages)/saved/+page.svelte';
	import ServiceDetails from '../../../../service/[id]/[crs]/+page.svelte';
	import DisruptionList from '$lib/components/board/disruption-list.svelte';
	import LastUpdated from '$lib/components/last-updated.svelte';
	import ServiceSaveToggle from '$lib/components/service/service-save-toggle.svelte';
	import Contact from '$lib/components/home/contact.svelte';
	import Title from '$lib/components/board/title.svelte';
	import BoardHeader from '$lib/components/board/board-header.svelte';
	import Refreshbar from '$lib/components/ui/refreshbar/refreshbar.svelte';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	const [send, receive] = crossfade({ duration: 250, easing: quadInOut });

	// data
	let trains: SvelteMap<string, TrainService> = $state(new SvelteMap([]));
	let board: Board | null = $state(null);
	let operators: SvelteSet<string> = $state(new SvelteSet([]));
	let operatorStartTimes: SvelteMap<string, string | null> = $state(new SvelteMap([]));
	let sorted: SvelteMap<string, TrainService> = $derived(
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

	let loading: 'earlier' | 'later' | 'refresh' | null = $state(null);

	// update after data.board promise resolves
	$effect(() => {
		data.board.then((d) => {
			operators = new SvelteSet([]);
			selectedOperator = null;
			trains = new SvelteMap<string, TrainService>([...d.trains]);
			generatedAt = dayjs();
			board = d.board;
			loading = null;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	});

	// Update operators
	$effect(() => {
		Array.from(trains.values()).forEach((t) => {
			if (!operators.has(t.operator!)) {
				operators.add(t.operator!);
				if (!operatorStartTimes.has(t.operator!)) {
					operatorStartTimes.set(t.operator!, t.actual ?? t.estimated ?? t.scheduled ?? null);
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
		loading = 'later';
		const arr = Array.from(sorted);
		const [, lastTrain] = arr.length > 0 ? arr[arr.length - 1] : [null, null];

		const time = dayjs(lastTrain?.actual ?? lastTrain?.estimated ?? lastTrain?.scheduled).format(
			'HH:mm'
		);

		if (strToMins(time) < 120) {
			loading = null;
			return;
		}

		goto(
			`/board/${data.type}/${data.from}${data.to ? '-' + data.to : ''}/${time}${data.toc ? '?toc=' + data.toc : ''}`
		).then(() => window.scrollTo({ top: 10000 }));
	}, 200);

	const earlier = throttle(async () => {
		loading = 'earlier';
		const arr = Array.from(sorted);
		const [, firstTrain] = arr.length > 0 ? arr[0] : [null, null];

		let time = dayjs(firstTrain?.actual ?? firstTrain?.estimated ?? firstTrain?.scheduled).subtract(
			30,
			'minutes'
		);

		if (time.format('HH:mm') === data.time) {
			time = time.subtract(30, 'minutes');
		}

		await goto(
			`/board/${data.type}/${data.from}${data.to ? '-' + data.to : ''}/${time.format('HH:mm')}${data.toc ? '?toc=' + data.toc : ''}`
		);
	}, 200);

	// open the service details drawer / modal
	async function handleServiceDetails(id: string) {
		if (!board) return;
		drawerOpen = true;
		const response = await preloadData(`/service/${id}/${board.locationCrs}`);
		if (response.type === 'loaded' && response.status === 200) {
			pushState(`/service/${id}/${board.locationCrs}`, { selected: response.data });
		}
	}

	let refreshTimeout: ReturnType<typeof setTimeout>;

	// refresh or filter by operator
	async function refresh() {
		clearInterval(refreshTimeout);
		if (!board) return;
		loading = 'refresh';

		trains = new SvelteMap(
			await getTrainServices(data.from, data.to, data.date, 15, data.toc, data.type)
		);
		generatedAt = dayjs();

		loading = null;
		if (trains.size < 2) {
			later();
		}
		refreshTimeout = setTimeout(refresh, 15000);
	}

	onMount(() => {
		refreshTimeout = setTimeout(refresh, 15000);
		return () => clearInterval(refreshTimeout);
	});

	// handle pull to refresh
	async function onRefresh() {
		await refresh();
	}

	onNavigate(() => {
		page.state.selected = null;
	});
</script>

<svelte:head>
	{#await data.board}
		<title>Departures</title>
	{:then { board }}
		<title>{board.locationName} - Departures</title>
	{/await}
</svelte:head>

<div class="mx-auto min-h-screen md:flex md:max-w-screen-lg md:gap-10">
	<ComboSidetopbar>
		<BoardHeader
			{board}
			from={data.from}
			to={data.to}
			date={data.date}
			type={data.type}
			onRefresh={refresh}
		/>
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
			{#if board && !md.current && (scrollY.current ?? 0) <= 50}
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
					<div class="h-[350px] w-full rounded-lg border-zinc-100 bg-card/95 p-4 drop-shadow">
						<Switcher
							drawer={false}
							from={data.from}
							to={data.to}
							type={data.type}
							value={data.date ? dayjs(data.date).format('HH:mm') : dayjs().format('HH:mm')}
						/>
					</div>
					<div class="mt-4 rounded-lg border bg-card p-2 drop-shadow-sm">
						<Saved card />
					</div>
				</div>
			{/if}
		</div>

		{#if !md.current}
			<OperatorsList board={data.board} />
			<Refreshbar interval={15} genAt={generatedAt} refreshing={loading === 'refresh'} />
		{/if}
	</ComboSidetopbar>

	{#if !md.current}
		<div class="h-ios-top"></div>
		<div class="h-[180px]"></div>
	{/if}

	<Refresher {onRefresh} refreshing={false}>
		<div class="min-w-0 md:flex-grow">
			{#if md.current}
				<div class="sticky top-0 z-20 mb-2 bg-background pt-4">
					<div class="min-w-0 flex-grow">
						<OperatorsList board={data.board} />
					</div>
					<Refreshbar interval={15} genAt={generatedAt} refreshing={loading === 'refresh'} />
				</div>
			{/if}

			<DisruptionList board={data.board} />

			<div class="flex min-h-12 w-full items-center justify-start px-4">
				{#if strToMins(data.time ?? dayjs().format('HH:mm')) > 30}
					<button
						in:fade={{ duration: 200 }}
						class="flex h-9 w-full items-center gap-1 py-2"
						onclick={earlier}
					>
						<div class="flex h-9 w-4 items-center justify-center overflow-hidden">
							{#if loading === 'earlier'}
								<div class="mr-1 mt-1 origin-center scale-[60%]">
									<Spinner />
								</div>
							{:else}
								<ArrowUp size={18} />
							{/if}
						</div>
						Earlier trains
					</button>
				{/if}
			</div>

			{#await data.board}
				<div class="flex flex-col gap-2 pl-4 pr-4 md:pl-0 md:pt-4">
					{#each Array(15)}
						<Skeleton class="h-[88px]" />
					{/each}
				</div>
			{:then { board }}
				{#if sorted && sorted.size > 0}
					<BoardList list={sorted} {handleServiceDetails} type={data.type} />
				{:else}
					No services found
				{/if}
			{/await}

			<div class="flex min-h-12 items-center justify-start px-4">
				<button
					in:fade={{ duration: 200 }}
					class="flex w-full items-center gap-1 py-2"
					onclick={later}
				>
					<div class="flex h-9 w-4 items-center justify-center overflow-hidden">
						{#if loading === 'later'}
							<div class="mr-1 mt-1 origin-center scale-[60%]">
								<Spinner />
							</div>
						{:else}
							<ArrowDown size={18} />
						{/if}
					</div>
					Later trains
				</button>
			</div>
			<div class="flex justify-center">
				<Contact />
			</div>
			<div class="h-20 md:h-0"></div>
			<div class="h-ios-bottom"></div>
		</div>
	</Refresher>
</div>

{#snippet serviceContent()}
	<div
		class="flex h-full flex-col pt-3"
		in:receive={{ key: 'service-details' }}
		out:send={{ key: 'service-details' }}
	>
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
							drawerOpen = false;
							setTimeout(() => {
								let id = page.state.selected?.serviceID;
								replaceState('', { selected: null });
								goto(`/service/${id}/${board?.locationCrs}`);
							}, 200);
						}}
					>
						<div class="w-10"></div>
						<div class="flex h-10 flex-grow items-center justify-center font-semibold">
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
				class="fixed left-1/2 top-1/2 z-50 h-[90%] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background"
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
				class="fixed bottom-0 left-0 right-0 z-40 mt-ios-top h-drawer rounded-t-lg bg-background px-0 pb-5  outline-none"
			>
				{@render serviceContent()}
			</Drawer.Content>
		</Drawer.Portal>
	</Drawer.Root>
{/if}
