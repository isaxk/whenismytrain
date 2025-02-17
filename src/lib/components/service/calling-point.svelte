<script lang="ts">
	import { onMount } from 'svelte';
	import TimeDisplay from '../service/time-display.svelte';
	import { Accordion } from 'bits-ui';
	import Header from '../ui/header.svelte';
	import Preview from '../board/preview.svelte';
	import { slide } from 'svelte/transition';
	import { foreign } from '$lib/data/foreign';
	import dayjs from 'dayjs';
	import Scrollintoview from '../scrollintoview.svelte';

	let {
		i,
		crs,
		name,
		platform,
		type = 'past',
		isCancelled,
		destCrs,
		std,
		etd,
		atd,
		sta,
		eta,
		ata
	} = $props();

	let elm: HTMLDivElement;

	function format(d: string) {
		return dayjs(d).format('HH:mm:ss');
	}
</script>

<Accordion.Item
	value={crs}
	class={[
		'border-t px-2 group-first:border-t-0',
		type === 'previous' ? 'min-h-14' : 'min-h-14',
		i % 2 === 0 ? 'bg-background' : 'bg-card'
	]}
>
	<Accordion.Header class="contents h-full">
		<Accordion.Trigger class="flex h-16 w-full items-center gap-3 text-left">
			<div
				bind:this={elm}
				class="flex flex-col items-center px-3 text-[10px] font-light text-zinc-600"
			>
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
				<TimeDisplay
					et={atd ?? ata ?? etd ?? eta ?? 'Delayed'}
					st={std ?? sta}
					small
					{isCancelled}
				/>
			</div>
		</Accordion.Trigger>
	</Accordion.Header>

	<Accordion.Content class="pb-5 pl-[90px]" transition={slide} transitionConfig={{ duration: 180 }}>
		<div class="rounded-lg border bg-zinc-100 px-2 py-2.5 drop-shadow-sm">
			{#if type === 'subsequent' && !foreign.includes(crs)}
				<Preview {crs} date={std ?? etd ?? sta ?? eta} {destCrs} />
			{/if}
			<Scrollintoview />
			<div class="grid grid-cols-3 px-2 pt-1 text-xs md:text-sm">
				<div class="text-xs font-medium">
					<div class="h-5"></div>
					<div class="flex h-6 items-center">Scheduled</div>
					<div class="flex h-6 items-center">Actual</div>
					<div class="flex h-6 items-center">Expected</div>
				</div>
				<div>
					<div class="h-5 text-xs font-medium">Arrival</div>
					<div class="flex h-6 items-center font-mono">{sta ? format(sta) : '-'}</div>
					<div class="flex h-6 items-center font-mono">{ata ? format(ata) : '-'}</div>
					<div class="flex h-6 items-center font-mono">{eta ? format(eta) : '-'}</div>
				</div>
				<!---->
				<div class="">
					<div class="h-5 text-xs font-medium">Departure</div>
					<div class="flex h-6 items-center font-mono">{std ? format(std) : '-'}</div>
					<div class="flex h-6 items-center font-mono">{atd ? format(atd) : '-'}</div>
					<div class="flex h-6 items-center font-mono">{etd ? format(etd) : '-'}</div>
				</div>
				<!---->
			</div>
		</div>
	</Accordion.Content>
</Accordion.Item>
