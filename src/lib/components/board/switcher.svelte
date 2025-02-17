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
	import Switch from '../ui/switch.svelte';
	import { Label } from 'bits-ui';

	let {
		drawer = false,
		value = dayjs().format('HH:mm'),
		type = 'dept',
		from = null,
		to = null,
		suggestions = null
	} = $props();

	let closeDrawer: HTMLButtonElement | null = $state(null);
	let now = $state(value === dayjs().format('HH:mm'));

	function go() {
		const list = from + (to ? `-${to}` : '');
		if (drawer) {
			closeDrawer?.click();
		}
		window.setTimeout(
			() => {
				requestAnimationFrame(() => {
					if (now) {
						goto(`/board/${type}/${list}`);
					} else {
						goto(`/board/${type}/${list}/${value}`);
					}
				});
			},
			drawer ? 450 : 0
		);
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
	<div class="flex w-full items-center gap-4">
		<div class="flex items-center gap-2">
			<Switch bind:checked={now} name="now" />
			<Label.Root for="now" class="font-medium">Now</Label.Root>
		</div>
		<div
			class={[
				'bg-card h-11 flex-grow transform-gpu rounded-lg border border-zinc-100 drop-shadow transition-all',
				now && 'opacity-50'
			]}
		>
			<input type="time" disabled={now} bind:value class="h-full w-full bg-transparent px-2" />
		</div>
	</div>
	<div class="relative flex w-full items-center gap-2 text-right">
		<button
			onclick={() => {
				const temp = to;
				to = from;
				from = temp;
			}}
			class="absolute left-5 top-[52px] flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 drop-shadow-sm"
		>
			<ArrowLeftRight size={16} />
		</button>
		<div class="min-w-12">
			{#if type === 'dept'}from{:else}at{/if}
		</div>
		<Search {drawer} bind:crs={from}></Search>
	</div>
	<div class="flex w-full items-center gap-2 text-right">
		<div class="w-12 min-w-12">
			{#if type === 'dept'}to{:else}from{/if}
			<div class="text-[10px] text-zinc-700">(optional)</div>
		</div>
		<Search {drawer} bind:crs={to} clearable={true}></Search>
	</div>

	{#if drawer}
		<Drawer.Close bind:ref={closeDrawer} class="hidden"></Drawer.Close>
	{/if}
	{#if from && to !== from}
		<div class="flex-grow"></div>
		{#if drawer}
			<button
				onclick={go}
				class="z-0 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 text-white drop-shadow-lg"
				><ArrowUpRight /> Go</button
			>
		{:else}
			<button
				onclick={go}
				class="z-0 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 text-white drop-shadow-lg"
				><ArrowUpRight /> Go</button
			>
			<div class="h-4"></div>
		{/if}
	{:else if suggestions}
		{@render suggestions()}
	{/if}
</div>
