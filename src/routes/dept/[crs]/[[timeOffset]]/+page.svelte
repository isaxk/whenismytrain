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
	import ServiceDetails from '../../../service/[id]/+page.svelte';
	import { goto, preloadData, pushState } from '$app/navigation';
	import { page } from '$app/state';
	import { throttle } from 'throttle-typescript';
	import { Check, Pin, PinOff } from 'lucide-svelte';
	import { operatorList } from '$lib/data/operators';
	import { strToMins } from '$lib/utils';
	import type { ServiceDetailsWithID } from '$lib/types/extentions';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	let trains = $state(new SvelteMap(data.trainServices));
	let selectedOperators = $state(new SvelteSet<string>([]));
	let pinned = $state(false);

	const md = new MediaQuery('min-width: 768px');

	let loading = $state(false);
	let drawerOpen = $state(false);

	const operators: string[] = $derived.by(() => {
		let o = new Set<string>([]);
		Array.from(trains).forEach(([, t]) => {
			if (t.operator) o.add(t.operator ?? '');
		});
		const selected = new Set<string>([]);
		const unselected = new Set(o);

		Array.from(selectedOperators).forEach((o) => {
			unselected.delete(o);
			selected.add(o);
		});

		return [...Array.from(selected), ...Array.from(unselected)];
	});

	function sortByLiveDepart([, a], [, b]) {
		const timeA = ['On time', 'Delayed', 'Cancelled'].includes(a.etd ?? '') ? a.std : a.etd;
		const timeB = ['On time', 'Delayed', 'Cancelled'].includes(b.etd ?? '') ? b.std : b.etd;
		if ((timeA ?? 0) < (timeB ?? 0)) return -1;
		else return 1;
	}

	let sorted = $derived(new SvelteMap([...trains].toSorted(sortByLiveDepart)));

	let filtered = $derived(
		new SvelteMap(
			Array.from(sorted).filter(
				([, t]) => selectedOperators.size === 0 || selectedOperators.has(t.operator ?? '')
			)
		)
	);

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
		const arr: definitions['ServiceItem'][] = Array.from(trains.values());
		const first = ['On time', 'Delayed', 'Cancelled'].includes(arr[0].etd ?? '')
			? arr[0].std
			: arr[0].etd;

		const last = ['On time', 'Delayed', 'Cancelled'].includes(arr[arr.length - 1].etd ?? '')
			? arr[arr.length - 1].std
			: arr[arr.length - 1].etd;
		const timeDiff = strToMins(last ?? '0') - strToMins(first ?? '0');
		console.log(first, last, timeDiff);
		let newData;
		if (timeDiff < 120 && !maxTrainsReached) {
			const response = await fetch(
				`/api/dept/${data.board.crs}/${timeDiff < 30 ? 15 : 10}/${timeDiff}`
			);
			newData = await response.json();
			fetchCount++;
			let isNewTrain = false;
			newData.trainServices!.forEach((t: definitions['ServiceItem']) => {
				isNewTrain = isNewTrain || !trains.has(t.serviceID);
				trains.set(t.serviceID, t);
			});
			if (!isNewTrain) maxTrainsReached = true;
		} else {
			maxTrainsReached = true;
		}
	}, 200);

	async function handleServiceDetails(id: string, details: ServiceDetailsWithID) {
		// for some reason pushState won't accept proxied arrays
		const d = JSON.parse(JSON.stringify(details));
		if (md.current) {
			goto('/service/' + id);
		} else {
			pushState('/service/' + id, { selected: d });
			drawerOpen = true;
		}
	}

	onMount(() => {
		const old = new Set(JSON.parse(localStorage.getItem('pins') ?? '[]'));
		if (old.has(data.board.crs)) {
			pinned = true;
		}
	});

	$effect(() => {
		if (!page.state.selected) {
			drawerOpen = false;
		}
		if (filtered.size < 10 && !maxTrainsReached) {
			later();
		}
		if (selectedOperators.size == operators.length) {
			selectedOperators = new SvelteSet<string>([]);
		}
	});

	function togglePin() {
		const old = new Set(JSON.parse(localStorage.getItem('pins') ?? '[]'));
		if (pinned) old.delete(data.board.crs);
		else old.add(data.board.crs);
		localStorage.setItem(`pins`, JSON.stringify(Array.from(old)));
		pinned = !pinned;
	}
</script>

<svelte:window onscroll={handleScroll} />

<div class="mx-auto min-h-screen md:flex md:max-w-screen-lg">
	<div class="sticky top-0 z-10 bg-white py-4 md:min-w-96 md:max-w-96">
		<div class="flex px-4">
			<div class="flex-grow text-4xl font-semibold">{data.board.locationName}</div>
			<button
				onclick={togglePin}
				class={[
					'h-11 rounded-lg px-4 transition-all',
					pinned ? 'bg-blue-500 text-white' : 'bg-zinc-300 text-black'
				]}
			>
				{#if pinned}
					<PinOff size={20} />
				{:else}
					<Pin size={20} />
				{/if}
			</button>
		</div>
		{#if operators.length > 1 || md.current}
			<div
				class="flex flex-nowrap gap-2 overflow-x-scroll text-nowrap p-4 md:flex-col md:overflow-hidden"
			>
				{#each operators as o (o)}
					<button
						onclick={() =>
							selectedOperators.has(o) ? selectedOperators.delete(o) : selectedOperators.add(o)}
						class={[
							'flex items-center justify-center rounded-lg px-3 py-1 text-sm drop-shadow transition-all md:justify-start',
							selectedOperators.has(o)
								? 'brightness-100'
								: selectedOperators.size === 0
									? 'brightness-100'
									: 'contrast-50'
						]}
						animate:flip={{ duration: 200 }}
						style:background={operatorList[o]?.bg}
						style:color={operatorList[o]?.text}
					>
						<div
							class={['overflow-hidden transition-all', selectedOperators.has(o) ? 'w-6' : 'w-0']}
						>
							{#if selectedOperators.has(o)}
								<Check size={18} />
							{/if}
						</div>
						{o}
					</button>
				{/each}
			</div>
		{/if}
	</div>
	<div class="md:flex-grow">
		<div class="flex flex-col gap-2 pr-4">
			{#each filtered as [id, train], i (id)}
				<div
					class="flex items-center"
					animate:flip={{ duration: 200 }}
					out:fade={{ duration: 150 }}
					in:fade={{ duration: 150 }}
				>
					<div class="flex min-w-12 justify-center">
						{Array.from(sorted).findIndex(([i]) => i === id) + 1}
					</div>
					<TrainCard
						{id}
						destination={train.destination![0].locationName!}
						operator={train.operator!}
						platform={train.platform!}
						etd={train.etd!}
						std={train.std!}
						onservicedetails={handleServiceDetails}
					/>
				</div>
			{/each}
		</div>
		<div class="h-20">
			{#if loading}
				<div class="flex h-20 items-center justify-center">
					<Spinner />
				</div>
			{:else if maxTrainsReached}
				<div class="flex h-20 items-center justify-center">
					Cannot see trains more than 2 hours in the future
				</div>
			{/if}
		</div>
	</div>
</div>

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
			class="fixed bottom-0 left-0 right-0 z-20 h-[95%] rounded-t-lg bg-white px-2 py-7 outline-none"
		>
			<div class="flex h-full flex-col">
				{#if page.state.selected}
					<ServiceDetails data={page.state.selected} />
				{/if}
			</div>
		</Drawer.Content>
	</Drawer.Portal>
</Drawer.Root>
