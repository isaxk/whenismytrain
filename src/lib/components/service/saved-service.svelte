<script lang="ts">
	import { savedServices } from '$lib/data/saved.svelte';
	import { ArrowUpRight, Bookmark, Check, X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import Skeleton from '../skeleton.svelte';
	import TrainCard from '../train-card.svelte';
	import { operatorList } from '$lib/data/operators';
	import TimeDisplay from '../time-display.svelte';

	let { i, id, crs, card = false } = $props();

	const index = $derived(savedServices.value.findIndex((s) => s.id === id && s.crs === crs));

	const data = new Promise(async (resolve) => {
		const response = await fetch(`/api/service/${id}/${crs}`);
		const data = await response.json();
		console.log(data);
		resolve(data);
	});
</script>

{#await data}
	<Skeleton class="h-16 w-full" />
{:then data}
	<div
		in:fade={{ duration: 200 }}
		class="relative flex min-h-14 items-center gap-2 border-t py-2 pl-4 group-first:border-t-0"
	>
		<div
			class="absolute bottom-0 left-0 top-0 w-1"
			style:background={operatorList[data.operatorCode].bg}
		></div>
		<a href="/service/{id}/{crs}" class="min-w-0 flex-grow">
			<div class="overflow-hidden text-ellipsis text-nowrap font-semibold">
				{data.destination.name}
			</div>
			<div class="flex-grow text-sm">from {data.focus.name}:</div>
		</a>
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
		Could not fetch service <button
			class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-200"
			onclick={() => {
				savedServices.value.splice(index, 1);
			}}><X size={20} /></button
		>
	</div>
{/await}
