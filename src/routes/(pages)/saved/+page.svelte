<script lang="ts">
	import SavedService from '$lib/components/service/saved-service.svelte';
	import Switchbar from '$lib/components/ui/switchbar.svelte';
	import { localStore, savedBoards, savedServices } from '$lib/data/saved.svelte';
	import { ArrowDownRight, ArrowUp, ArrowUpRight, Clock, List, Train, X } from 'lucide-svelte';
	import { flip } from 'svelte/animate';
	import { slide } from 'svelte/transition';
	import { send, receive } from '$lib/utils/transitions';
	import AllStationsJSON from 'uk-railway-stations';
	import { Tween } from 'svelte/motion';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import { quadInOut } from 'svelte/easing';
	import dayjs from 'dayjs';
	import { MediaQuery, SvelteMap } from 'svelte/reactivity';

	let { card = false } = $props();

	let elm: HTMLElement;

	const heightTween = new Tween(0, { duration: 150, easing: quadInOut });
	onMount(() => {
		let ro = new ResizeObserver(() => {
			console.log(elm.offsetHeight);
			heightTween.set(elm?.offsetHeight);
		});
		ro.observe(elm);
	});

	let value = $state('board');
	let dates = $state(new SvelteMap([]));

	const sortedServices = $derived.by(() => {
		let allDates = true;
		savedServices.value.forEach((s) => {
			if (!dates.has(s.key)) {
				allDates = false;
			}
		});

		if (allDates) {
			const withDate = savedServices.value.map((s, i) => {
				return { date: dates.get(s.key) ?? dayjs(), service: s };
			});
			return withDate
				.toSorted((a, b) => {
					// @ts-ignore
					const dateA = a.date ? dayjs(a.date).unix() : 0;
					// @ts-ignore
					const dateB = b.date ? dayjs(b.date).unix() : 0;
					console.log(dateA, dateB, dateA - dateB);
					if (dateA > dateB) {
						return 1;
					} else {
						return -1;
					}
				})
				.map((s) => s.service);
		} else {
			return savedServices.value;
		}
	});

	$inspect(savedBoards.value);
</script>

<div
	class={[
		'sticky top-0 z-40 flex items-center font-semibold',
		card ? 'bg-card px-4 text-xl' : 'bg-zinc-50 p-4 text-3xl'
	]}
>
	<div class="pt-ios-top">Saved</div>
</div>

<div class="px-4 pt-2">
	<Switchbar
		bind:value
		items={[
			{
				key: 'board',
				label: 'Boards',
				Icon: List
			},
			{
				key: 'service',
				label: 'Services',
				Icon: Train
			}
		]}
	/>

	<div
		class="flex flex-col overflow-hidden pt-2"
		style:height={card ? `${heightTween.current}px` : '100%'}
	>
		<div bind:this={elm} class="pb-4">
			{#if value === 'board'}
				{#each savedBoards.value as save, i (save.key)}
					<div
						class={[
							'flex items-center gap-2 border-t first:border-t-0',
							card ? 'py-1.5' : 'h-[70px]'
						]}
						animate:flip={{ duration: 150 }}
					>
						<a
							class="min-w-0 flex-grow pr-2"
							href="/board/{save.type ?? 'dept'}/{save.from}{save.to
								? '-' + save.to
								: null}/{save.time ?? null}"
						>
							<div class={['font-semibold', card ? 'text-lg' : 'text-xl']}>
								{AllStationsJSON.find((s) => s.crsCode === save.from)?.stationName}
							</div>
							<div class="-mt-1 flex w-full items-center gap-1.5 text-sm">
								{#if save.to}
									<div class="overflow-hidden text-ellipsis text-nowrap text-sm text-zinc-700">
										to {AllStationsJSON.find((s) => s.crsCode === save.to)?.stationName}
									</div>
								{/if}
								<div class="flex items-center gap-1 font-medium">
									{#if (save.type ?? 'dept') === 'arr'}
										<ArrowDownRight size={12} /> {save.to ? 'Arrv.' : 'Arrivals'}
									{:else}
										<ArrowUpRight size={12} /> {save.to ? 'Dept.' : 'Departures'}
									{/if}
								</div>
								{#if save.time}
									<div class="flex items-center gap-1 font-medium">
										<Clock size={12} />
										{save.time}
									</div>
								{/if}
							</div>
						</a>
						<button
							class="flex h-9 min-w-9 items-center justify-center rounded-lg bg-zinc-200"
							onclick={() => {
								savedBoards.value.splice(i, 1);
							}}><X size={20} /></button
						>
						{#if !card}
							<a
								href="/board/{save.type ?? 'dept'}/{save.from}{save.to
									? '-' + save.to
									: null}/{save.time ?? null}"
								class="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-500 text-white"
								><ArrowUpRight size={20} /></a
							>
						{/if}
					</div>
				{/each}
			{:else if value === 'service'}
				{#each sortedServices as save, i (save.key)}
					<div class="group" in:slide={{ duration: 200 }} animate:flip={{ duration: 200 }}>
						<SavedService
							onDate={(d: string) => dates.set(save.key, d)}
							{i}
							id={save.id}
							crs={save.crs}
							{card}
						/>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
