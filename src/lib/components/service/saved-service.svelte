<script lang="ts">
	import { savedServices } from '$lib/data/saved.svelte';
	import { ArrowUpRight, Bookmark, Check, X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import Skeleton from '../skeleton.svelte';
	import TrainCard from '../train-card.svelte';
	import { operatorList } from '$lib/data/operators';
	import TimeDisplay from '../time-display.svelte';
	import dayjs from 'dayjs';

	let { i, id, crs, card = false, onDate } = $props();

	const index = $derived(savedServices.value.findIndex((s) => s.id === id && s.crs === crs));

	const data = new Promise(async (resolve, error) => {
		const response = await fetch(`/api/service/${id}/${crs}`);
		const data = await response.json();
		if (response.status !== 200) {
			if (data.message === 'Could not fetch service') {
				savedServices.value.splice(index, 1);
			}
			error('Could not fetch service');
		}

		onDate(
			data.focus.atd ??
				data.focus.etd ??
				data.focus.std ??
				data.focus.ata ??
				data.focus.eta ??
				data.focus.sta
		);

		resolve(data);
	});
</script>

{#await data}
	<div class={card ? 'h-14 pb-1' : 'h-[70px] pb-1'}>
		<Skeleton class="h-full w-full" />
	</div>
{:then data}
	<div
		in:fade={{ duration: 200 }}
		class={[
			'relative flex min-h-14 items-center gap-2 border-t pl-4 group-first:border-t-0',
			!card && 'h-[70px] '
		]}
	>
		<div
			class="absolute bottom-0 left-0 top-0 w-1"
			style:background={operatorList[data.operatorCode].bg}
		></div>
		<a href="/service/{id}/{crs}" class="min-w-0 flex-grow">
			<div class="overflow-hidden text-ellipsis text-nowrap font-semibold">
				{data.destination.name}
			</div>
			<div class="-mt-1 flex-grow overflow-hidden text-ellipsis text-nowrap text-sm">
				from {data.focus.name}:
			</div>
		</a>
		<div class="font-mono"></div>
		<div class="flex items-center pr-1">
			<TimeDisplay
				small
				isCancelled={data.isCancelled ?? false}
				et={data.focus.atd ??
					data.focus.etd ??
					data.focus.std ??
					data.focus.ata ??
					data.focus.eta ??
					data.focus.std}
				st={data.focus.std ?? data.focus.sta}
			/>
		</div>

		<button
			class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-200"
			onclick={() => {
				savedServices.value.splice(index, 1);
			}}><X size={20} /></button
		>
		{#if !card}
			<a
				href="/service/{id}/{crs}"
				class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white"
				><ArrowUpRight size={20} /></a
			>
		{/if}
	</div>
{:catch}
	<div class="flex h-14 items-center pl-2">
		<div class="flex-grow">Could not fetch service</div>
		<button
			class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-200"
			onclick={() => {
				savedServices.value.splice(index, 1);
			}}><X size={20} /></button
		>
	</div>
{/await}
