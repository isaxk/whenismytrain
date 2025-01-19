<script lang="ts">
	import { Drawer } from 'vaul-svelte';
	import type { PageData } from './$types';
	import type { definitions } from '$lib/types/api';
	import { MediaQuery, SvelteMap, SvelteSet } from 'svelte/reactivity';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
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

	let { data }: { data: PageData } = $props();

	let trains = $state(new SvelteMap(data.trainServices));
	let pinned = $state(false);

	$inspect(trains);

	const md = new MediaQuery('min-width: 768px');

	let loading = $state(false);
	let drawerOpen = $state(false);

	function sortByLiveDepart([, a], [, b]) {
		const timeA = a.etd ?? a.atd;
		const timeB = b.etd ?? b.atd;
		if ((timeA ?? 0) < (timeB ?? 0)) return -1;
		else return 1;
	}

	let sorted = $derived(new SvelteMap([...trains].sort(sortByLiveDepart)));

	const operators = $derived.by(() => {
		const o = new Set<string>([]);
		data.board.trainServices?.map((b) => {
			o.add(b.operatorCode);
		});
		return Array.from(o);
	});

	const handleScroll = async () => {
		loading = true;
		const endOfPage =
			window.innerHeight + (scrollY.current ?? 0) >= document.body.offsetHeight - 100;
		if (endOfPage) await later();
		loading = false;
	};

	let maxTrainsReached = $state(false);
	let fetchCount = $state(0);

	const later = throttle(async () => {
		const arr = Array.from(sorted);

		if (maxTrainsReached) return;
		if (arr.length > 200) {
			maxTrainsReached = true;
			return;
		}

		const [, lastTrain] = arr[arr.length - 1];

		const response = await fetch(
			`/api/dept/${data.board.crs}/15/${selectedOperator}/${lastTrain.etd ?? lastTrain.std}`
		);
		const resData: definitions['StationBoard'] = await response.json();
		if (resData.trainServices?.length < 1) {
			maxTrainsReached = true;
		}
		let newTrain = false;
		resData.trainServices?.map((t) => {
			if (!trains.has(t.rid)) newTrain = true;
			trains.set(t.rid, t);
		});
		if (!newTrain) maxTrainsReached = true;
	}, 200);

	async function handleServiceDetails(id: string) {
		// for some reason pushState won't accept proxied arrays
		drawerOpen = true;
		const response = await preloadData(`/service/${id}/${data.board.crs}`);
		if (response.type === 'loaded' && response.status === 200) {
			pushState(`/service/${id}/${data.board.crs}`, { selected: response.data });
		}
	}

	onMount(() => {
		const old = new Set(JSON.parse(localStorage.getItem('pins') ?? '[]'));
		if (old.has(data.board.crs)) {
			pinned = true;
		}
	});

	$effect(() => {
		// if (!page.state.selected) {
		// 	drawerOpen = false;
		// }
		// if (filtered.size < 10 && !maxTrainsReached) {
		// 	later();
		// }
		// if (selectedOperators.size == operators.length) {
		// 	selectedOperators = new SvelteSet<string>([]);
		// }
	});

	function togglePin() {
		const old = new Set(JSON.parse(localStorage.getItem('pins') ?? '[]'));
		if (pinned) old.delete(data.board.crs);
		else old.add(data.board.crs);
		localStorage.setItem(`pins`, JSON.stringify(Array.from(old)));
		pinned = !pinned;
	}

	let selectedOperator = $state(null);

	async function operator(o) {
		selectedOperator = o;
		maxTrainsReached = false;
		if (o !== null) {
			const response = await fetch(`/api/dept/${data.board.crs}/15/${o}/null`);
			const resData = await response.json();
			trains = new SvelteMap(
				resData.trainServices!.map((t: definitions['ServiceItem']) => [t.rid, t])
			);
		} else {
			const response = await fetch(`/api/dept/${data.board.crs}/15/null/null`);
			const resData = await response.json();
			console.log(resData);
			trains = new SvelteMap(
				resData.trainServices!.map((t: definitions['ServiceItem']) => [t.rid, t])
			);
		}
	}
</script>

<svelte:window onscroll={handleScroll} />

<div class="mx-auto min-h-screen md:flex md:max-w-screen-lg">
	<div class="sticky top-0 z-10 bg-white py-4 md:min-w-96 md:max-w-96">
		<div class="flex items-center gap-4 px-4 md:items-center md:pb-2">
			<a
				href="/"
				class={[
					'flex min-h-10 min-w-10 flex-col items-center justify-center rounded-lg bg-zinc-300 text-xs transition-all'
				]}
			>
				<ArrowLeft size={20} />
			</a>
			<div class="flex-grow text-center text-2xl font-bold md:pr-10 md:text-left md:text-4xl">
				{data.board.locationName}
			</div>
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
		{#if operators.length > 1}
			<div class="mt-4 flex gap-2 overflow-x-scroll border-t border-zinc-300/50 px-4 py-2">
				<div
					class={[
						'h-full overflow-hidden transition-all duration-200',
						selectedOperator ? 'w-7 opacity-100' : 'w-0 opacity-0'
					]}
				>
					<button
						onclick={() => operator(null)}
						class="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-300"
						><X size={18} /></button
					>
				</div>
				{#each operators.filter((o) => (selectedOperator ? o === selectedOperator : true)) as o (o)}
					<button
						animate:flip={{ duration: 250 }}
						onclick={() => operator(o)}
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
	<div class="md:flex-grow">
		<div class="flex flex-col gap-2 pr-4 md:pt-4">
			{#each sorted as [id, train], i (id)}
				<div
					class="flex items-center"
					animate:flip={{ duration: 200 }}
					out:fade={{ duration: 150 }}
					in:fade={{ duration: 150 }}
				>
					<div class="flex min-w-8 justify-center text-sm sm:min-w-12 md:text-base">
						{Array.from(sorted).findIndex(([i]) => i === id) + 1}
					</div>
					<TrainCard
						{id}
						destination={train.destination![0].locationName!}
						operator={train.operatorCode!}
						platform={train.platform!}
						etd={train.etd ?? train.atd}
						std={train.std ?? ''}
						onservicedetails={handleServiceDetails}
					/>
				</div>
			{/each}
		</div>
		<div class="h-20 px-4" use:inview oninview_enter={later}>
			{#if loading && !maxTrainsReached}
				<div class="flex h-20 items-center justify-center">
					<Spinner />
				</div>
			{:else if maxTrainsReached}
				<div class="flex h-20 items-center justify-center text-center">
					Refer to a timetable or dedicated journey planner app to see further trains.
				</div>
			{/if}
		</div>
	</div>
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
			<Drawer.Overlay class="fixed inset-0 z-20 bg-black/80" />
			<Drawer.Content
				class="fixed bottom-0 left-0 right-0 z-20 h-[95%] rounded-t-lg bg-white px-0 py-4 outline-none"
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
