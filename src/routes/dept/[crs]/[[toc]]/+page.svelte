<script lang="ts">
	import { Drawer } from 'vaul-svelte';
	import type { PageData } from './$types';
	import type { definitions } from '$lib/types/api';
	import { MediaQuery, SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { flip } from 'svelte/animate';
	import { fade, slide } from 'svelte/transition';
	import { scrollY } from 'svelte/reactivity/window';
	import Spinner from '$lib/components/spinner.svelte';
	import TrainCard from '$lib/components/train-card.svelte';
	import ServiceDetails from '../../../service/[id]/[crs]/+page.svelte';
	import { goto, preloadData, pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { throttle } from 'throttle-typescript';
	import {
		ArrowLeft,
		ArrowUpRight,
		Check,
		ChevronLeft,
		Pin,
		PinOff,
		RefreshCw,
		X
	} from 'lucide-svelte';
	import { operatorList } from '$lib/data/operators';
	import { strToMins } from '$lib/utils';
	import type { ServiceDetailsWithID } from '$lib/types/extentions';
	import { onMount } from 'svelte';
	import { preventDefault } from 'svelte/legacy';
	import { Dialog } from 'bits-ui';
	import { flyAndScale } from '$lib/utils/transitions';
	import { inview } from 'svelte-inview';
	import Skeleton from '$lib/components/skeleton.svelte';
	import Columns_4 from 'lucide-svelte/icons/columns-4';
	import Refresher from '$lib/components/refresher.svelte';

	let { data }: { data: PageData } = $props();

	let trains: SvelteMap<string, definitions['ServiceItem']> = $state(new SvelteMap([]));
	let board: definitions['StationBoard'] | null = $state(null);
	let pinned = $state(false);
	let operators: SvelteSet<string> = $state(new SvelteSet([]));
	let operatorStartTimes: SvelteMap<string, string | null> = $state(new SvelteMap([]));

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

	$inspect(operatorStartTimes);

	data.board.then((d) => {
		trains = new SvelteMap([...d.trainServices]);
		board = d.board;
	});

	const md = new MediaQuery('min-width: 768px');

	let loading = $state(false);
	let refreshing = $state(false);
	let drawerOpen = $state(false);

	function sortByLiveDepart([, a], [, b]) {
		const timeA = a.etd ?? a.atd;
		const timeB = b.etd ?? b.atd;
		if ((timeA ?? 0) < (timeB ?? 0)) return -1;
		else return 1;
	}

	let sorted: SvelteMap<string, definitions['ServiceItem']> = $derived(
		trains.size > 0 ? new SvelteMap([...trains].sort(sortByLiveDepart)) : new SvelteMap([])
	);

	const handleScroll = async () => {
		// const endOfPage =
		// 	window.innerHeight + (scrollY.current ?? 0) >= document.body.offsetHeight - 100;
		// if (endOfPage) await later();
	};

	let maxTrainsReached = $state(false);

	let fetchCount = $state(0);

	const later = throttle(async () => {
		if (loading) return;

		if (!board) return;
		const arr = Array.from(sorted);

		if (maxTrainsReached) return;
		if (arr.length > 200) {
			maxTrainsReached = true;
			return;
		}
		loading = true;

		const [, lastTrain] = arr.length > 0 ? arr[arr.length - 1] : [null, null];

		const response = await fetch(
			`/api/dept/${board.crs}/15/${selectedOperator}/${lastTrain?.etd ?? lastTrain?.std ?? null}`
		);
		const resData: definitions['StationBoard'] = await response.json();
		if ((resData.trainServices?.length ?? 0) < 1) {
			maxTrainsReached = true;
		}
		let newTrain = false;
		resData.trainServices?.map((t) => {
			if (!trains.has(t.rid)) newTrain = true;
			trains.set(t.rid, t);
		});
		if (!newTrain) maxTrainsReached = true;
		loading = false;
	}, 200);

	async function handleServiceDetails(id: string) {
		if (!board) return;
		drawerOpen = true;
		const response = await preloadData(`/service/${id}/${board.crs}`);
		if (response.type === 'loaded' && response.status === 200) {
			pushState(`/service/${id}/${board.crs}`, { selected: response.data });
		}
	}

	$effect(() => {
		if (!page.state.selected) {
			drawerOpen = false;
		}
	});

	let selectedOperator: string | null = $state(null);

	async function operator(o: string | null) {
		if (!board) return;

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
		console.log('startTime', startTime);

		if (o !== null) {
			loading = true;
			const response = await fetch(`/api/dept/${board.crs}/15/${o}/${startTime}`);
			const resData = await response.json();
			trains = new SvelteMap(
				resData.trainServices?.map((t: definitions['ServiceItem']) => [t.rid, t]) ?? []
			);
		} else {
			const response = await fetch(`/api/dept/${board.crs}/15/null/${startTime}`);
			const resData = await response.json();
			console.log(resData);
			trains = new SvelteMap(
				resData.trainServices?.map((t: definitions['ServiceItem']) => [t.rid, t]) ?? []
			);
		}

		loading = false;
		if (trains.size < 2) {
			later();
		}
	}

	async function onRefresh() {
		await operator(selectedOperator);
	}
</script>

<svelte:window onscroll={handleScroll} />

<svelte:head>
	{#await data.board}
		<title>Departures</title>
	{:then { board }}
		<title>{board.locationName} -Departures</title>
	{/await}</svelte:head
>

<div class="mx-auto min-h-screen md:flex md:max-w-screen-lg">
	<div
		class={[
			'pt-ios-top fixed right-0 top-0 z-10 w-full max-w-full bg-white transition-all md:sticky md:min-w-96 md:max-w-96',
			(scrollY.current ?? 0) > 5 && 'border-b border-zinc-300 drop-shadow'
		]}
	>
		<div class="flex h-14 items-start justify-between gap-4 px-4 md:items-center md:pb-2">
			<a
				href="/"
				class={[
					'flex min-h-10 min-w-10 flex-col items-center justify-center rounded-lg bg-zinc-300 text-xs transition-all'
				]}
			>
				<ArrowLeft size={20} />
			</a>
			{#await data.board}
				<Skeleton class="h-8 w-52" />
			{:then { board }}
				<div
					in:fade={{ duration: 250 }}
					class="flex h-full flex-grow flex-col items-center justify-center"
				>
					<div class="-mb-0.5 text-xs">Departures</div>
					<div class="flex-grow text-center text-xl font-bold md:pr-10 md:text-left md:text-4xl">
						{board.locationName}
					</div>
				</div>
			{/await}
			<button
				onclick={async () => {
					await window.scrollTo({ top: 0, behavior: 'smooth' });
					setTimeout(() => operator(selectedOperator), 300);
				}}
				class={[
					'flex min-h-10 min-w-10 flex-col items-center justify-center rounded-lg bg-blue-500 text-xs text-white transition-all'
				]}
			>
				<RefreshCw />
			</button>
		</div>
		{#if operators.size > 0}
			<div class="flex gap-2 overflow-x-scroll px-2 pb-4">
				<div
					class={[
						'h-full overflow-hidden transition-all duration-200',
						selectedOperator && operators.size > 1 ? 'w-9 pl-2 opacity-100' : 'w-0 pl-0 opacity-0'
					]}
				>
					<button
						onclick={() => operator(null)}
						class="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-300"
						><X size={18} /></button
					>
				</div>
				{#each Array.from(operators).filter( (o) => (selectedOperator ? o === selectedOperator : true) ) as o (o)}
					<button
						animate:flip={{ duration: 250 }}
						onclick={() => {
							if (operators.size > 1) operator(o);
						}}
						class="flex h-7 items-center text-nowrap rounded-lg px-2 text-sm"
						style:color={operatorList[o]?.text}
						style:background={operatorList[o]?.bg}
					>
						{operatorList[o]?.name ?? ''}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="h-ios-top"></div>
	<div class="h-28"></div>
	<Refresher {onRefresh}>
		<div class="md:flex-grow">
			{#await data.board}
				<div class="flex flex-col gap-2 pl-4 pr-4 md:pl-0 md:pt-4">
					{#each Array(10)}
						<Skeleton class="h-[88px]" />
					{/each}
				</div>
			{:then}
				{#if sorted}
					<div
						in:fade|global={{ duration: 300 }}
						class="flex flex-col gap-2 pl-4 pr-4 md:pl-0 md:pt-4"
					>
						{#if refreshing}
							<div transition:slide={{ duration: 150 }} class="flex w-full justify-center">
								<Spinner />
							</div>
						{/if}
						{#each sorted as [id, train], i (id)}
							<div
								class="flex items-center"
								animate:flip={{ duration: 200 }}
								out:fade={{ duration: 150 }}
								in:fade={{ duration: 150 }}
							>
								<div class="hidden min-w-8 justify-center text-sm sm:min-w-12 md:flex md:text-base">
									{Array.from(sorted).findIndex(([i]) => i === id) + 1}
								</div>
								<TrainCard
									{id}
									isCancelled={train.isCancelled ?? false}
									destination={train.destination![0].locationName!}
									operator={train.operatorCode!}
									platform={train.platform!}
									etd={train.etd ?? train.atd ?? ''}
									std={train.std ?? ''}
									onservicedetails={handleServiceDetails}
								/>
							</div>
						{/each}
					</div>
					<div class="flex h-32 items-center justify-center px-4">
						{#if loading && !maxTrainsReached}
							<div in:fade={{ duration: 200 }} class="flex h-20 items-center justify-center">
								<Spinner />
							</div>
						{:else if maxTrainsReached}
							<div
								in:fade={{ duration: 200 }}
								class="flex h-20 items-center justify-center text-center"
							>
								Refer to a timetable or dedicated journey planner app to see further trains.
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
				{/if}
			{/await}
		</div>
	</Refresher>
</div>

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
				class="fixed left-1/2 top-1/2 z-40 h-[80%] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white"
			>
				<div class="flex h-full flex-col pt-3">
					{#if page.state.selected}
						<ServiceDetails data={page.state.selected} drawer>
							{#snippet header()}
								<div class="flex items-center justify-between pb-4">
									<Dialog.Close
										class="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-300"
										><X size={20} /></Dialog.Close
									>
									<div class="font-medium">Service Details</div>
									<button
										onclick={() => {
											goto(`/service/${page.state.selected?.serviceID}/${data.board.crs}`).then(
												() => replaceState('', { selected: null })
											);
										}}
										class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white"
										><ArrowUpRight size={20} /></button
									>
								</div>
							{/snippet}
						</ServiceDetails>
					{/if}
				</div>
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
				class="mt-ios-top h-drawer fixed bottom-0 left-0 right-0 z-40 rounded-t-lg bg-white px-0 py-4 outline-none"
			>
				<div class="flex h-full flex-col">
					{#if page.state.selected}
						<ServiceDetails data={page.state.selected} drawer>
							{#snippet header()}
								<div class="flex items-center justify-between pb-4">
									<Drawer.Close
										class="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-300"
										><X size={20} /></Drawer.Close
									>
									<div class="font-medium">Service Details</div>
									<button
										onclick={() => {
											goto(`/service/${page.state.selected?.serviceID}/${data.board.crs}`).then(
												() => replaceState('', { selected: null })
											);
										}}
										class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white"
										><ArrowUpRight size={20} /></button
									>
								</div>
							{/snippet}
						</ServiceDetails>
					{:else}
						<div class="flex items-center justify-between px-4">
							<Skeleton class="h-10 w-10" />
							<div class="font-medium">Service Details</div>
							<Skeleton class="h-10 w-10" />
						</div>
						<div class="p-4">
							<Skeleton class="h-[88px] w-full" />
							<div class="h-4"></div>
							<div class="flex flex-col gap-1">
								{#each Array(10)}
									<Skeleton class="h-12 w-full" />
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</Drawer.Content>
		</Drawer.Portal>
	</Drawer.Root>
{/if}
