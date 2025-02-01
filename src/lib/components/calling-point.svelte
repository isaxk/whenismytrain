<script lang="ts">
	import { onMount } from 'svelte';
	import TimeDisplay from './time-display.svelte';
	import { Accordion } from 'bits-ui';
	import Header from './ui/header.svelte';
	import Preview from './board/preview.svelte';
	import { slide } from 'svelte/transition';
	import { foreign } from '$lib/data/foreign';

	let { i, crs, name, et, platform, st, type = 'past', isCancelled, destCrs } = $props();

	let elm: HTMLDivElement;
</script>

<Accordion.Item
	value={crs}
	class={[
		'border-t px-2 first:border-none',
		type === 'previous' ? 'min-h-14' : 'min-h-14',
		i % 2 === 0 && 'bg-zinc-50'
	]}
>
	<Accordion.Header class="contents h-full">
		<Accordion.Trigger class="flex h-14 w-full items-center gap-3 text-left">
			<div class="flex flex-col items-center px-3 text-[10px] font-light text-zinc-600">
				<div>Platform</div>
				<div
					class={[
						'flex h-7 w-7 items-center justify-center rounded-full font-normal',
						platform?.length > 2 ? 'text-xs' : 'text-sm',
						type === 'previous' ? 'bg-zinc-200 text-neutral-500' : 'bg-zinc-300 text-black'
					]}
				>
					{platform ?? '?'}
				</div>
			</div>
			<div class="w-1"></div>
			<div class={['flex-grow']}>
				<div
					class={[
						type === 'subsquent' && 'font-medium text-black',
						type === 'focus' && 'font-semibold text-black',
						type === 'previous' && 'font-light text-zinc-500'
					]}
				>
					{name}
				</div>
			</div>
			<div class="flex flex-col items-end">
				<TimeDisplay {et} {st} small {isCancelled} />
			</div>
		</Accordion.Trigger>
	</Accordion.Header>
	{#if type === 'subsequent' && !foreign.includes(crs)}
		<Accordion.Content class="pl-[90px]" transition={slide} transitionConfig={{ duration: 200 }}>
			<Preview {crs} date={et ?? st} {destCrs} />
		</Accordion.Content>
	{/if}
</Accordion.Item>
