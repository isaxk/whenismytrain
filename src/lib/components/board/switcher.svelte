<script lang="ts">
	import { ArrowDownRight, ArrowUpRight, CalendarSync, RotateCcw } from 'lucide-svelte';
	import Search from '../home/search.svelte';
	import Switchbar from '../ui/switchbar.svelte';
	import dayjs from 'dayjs';
	import { goto } from '$app/navigation';
	import { Drawer } from 'vaul-svelte';

	let { drawer = false, value = dayjs().format('HH:mm'), type = 'dept', crs = null } = $props();

	function go() {
		requestAnimationFrame(() => {
			if (value !== dayjs().format('HH:mm')) {
				goto(`/board/${type}/${crs}/${value}`);
			} else {
				goto(`/board/${type}/${crs}`);
			}
		});
	}
</script>

<div class="flex h-full w-full flex-grow flex-col gap-3">
	<Switchbar
		items={[
			{
				key: 'dept',
				label: 'Departures',
				Icon: ArrowUpRight
			},
			{ key: 'arr', label: 'Arrivals', Icon: ArrowDownRight }
		]}
		bind:value={type}
	></Switchbar>
	<div class="flex w-full gap-1">
		<div class="h-11 flex-grow rounded-lg border border-zinc-100 bg-white drop-shadow">
			<input type="time" bind:value class="h-full w-full bg-transparent px-2" />
		</div>
		<button
			class="flex h-11 items-center gap-1 justify-center rounded-lg bg-blue-500 px-4 text-white"
			onclick={() => (value = dayjs().format('HH:mm'))}><CalendarSync size={20} /> now</button
		>
	</div>
	<Search {drawer} bind:crs></Search>
	<div class="flex-grow"></div>
	{#if crs}
		{#if drawer}
			<Drawer.Close
				onclick={go}
				class="z-0 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 text-white drop-shadow-lg"
				><ArrowUpRight /> Go</Drawer.Close
			>
		{:else}
			<button
				onclick={go}
				class="z-0 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 text-white drop-shadow-lg"
				><ArrowUpRight /> Go</button
			>
			<div class="h-4"></div>
		{/if}
	{/if}
</div>
