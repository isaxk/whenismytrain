<script lang="ts">
	import {
		ArrowDownRight,
		ArrowLeftRight,
		ArrowUpRight,
		CalendarSync,
		RotateCcw,
		X
	} from 'lucide-svelte';
	import Search from '../home/search.svelte';
	import Switchbar from '../ui/switchbar.svelte';
	import dayjs from 'dayjs';
	import { goto } from '$app/navigation';
	import { Drawer } from 'vaul-svelte';

	let {
		drawer = false,
		value = dayjs().format('HH:mm'),
		type = 'dept',
		from = null,
		to = null
	} = $props();

	function go() {
		const list = from + (to ? `-${to}` : '');
		requestAnimationFrame(() => {
			if (value !== dayjs().format('HH:mm')) {
				goto(`/board/${type}/${list}/${value}`);
			} else {
				goto(`/board/${type}/${list}`);
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
			class="flex h-11 items-center justify-center gap-1 rounded-lg bg-blue-500 px-4 text-white"
			onclick={() => (value = dayjs().format('HH:mm'))}><CalendarSync size={20} /> now</button
		>
	</div>
	<div class="relative flex w-full items-center gap-2 text-right">
		<button
			onclick={() => {
				const temp = to;
				to = from;
				from = temp;
			}}
			class="absolute left-7 drop-shadow-sm top-[52px] flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200"
		>
			<ArrowLeftRight size={16} />
		</button>
		<div class="min-w-14">
			{#if type === 'dept'}from{:else}at{/if}
		</div>
		<Search {drawer} bind:crs={from}></Search>
	</div>
	<div class="flex w-full items-center gap-2 text-right">
		<div class="w-14 min-w-14">
			{#if type === 'dept'}to{:else}from{/if}
			<div class="text-xs">(optional)</div>
		</div>
		<Search {drawer} bind:crs={to} clearable={true}></Search>
	</div>
	<div class="flex-grow"></div>
	{#if from && to!==from}
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
