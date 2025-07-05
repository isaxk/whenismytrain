<script lang="ts">
	import { navigating, page } from '$app/state';
	import { operatorList } from '$lib/data/operators';
	import type { BoardItem } from '$lib/types/board';
	import { MediaQuery } from 'svelte/reactivity';
	import RelativeTimeDisplay from '../ui/relative-time-display.svelte';
	import TimeDisplay from '../ui/time-display.svelte';
	import RttPlatform from '../train/rtt-platform.svelte';
	import { Clock } from 'lucide-svelte';
	import { destination, flip } from '@turf/turf';
	import { Position } from '$lib/types';
	import { terminalGroups } from '$lib/data/terminal-groups';

	let {
		i,
		train,
		url,
		crs,
		filter
	}: { i: number; train: BoardItem; url: string; crs: string; filter: string } = $props();

	const md = new MediaQuery('(min-width: 768px)');

	let stations = $state(null);

	page.data.stations.then((s) => {
		stations = s;
	});
</script>

<a
	href={url}
	class={[
		'flex items-center transition-all',
		(train.terminal?.origin && crs != train.terminal?.origin) ||
		(train.terminal?.destination &&
			train.destination.crs != train.terminal?.destination &&
			!train.isCancelledAtFilter)
			? 'h-24'
			: 'h-20',
		page.data.train_id === train.id
			? 'bg-foreground-tint/20'
			: 'group-odd:bg-muted/70 bg-background'
	]}
>
	<div class="h-full min-w-2" style:background={operatorList[train.operator].bg}></div>
	<div class="flex h-full min-w-0 flex-grow flex-col justify-center gap-1">
		<div
			class={[
				'flex h-max items-end gap-2 px-2',
				train.position === Position.DEPARTED && 'opacity-60'
			]}
		>
			<div class="flex h-max min-w-0 flex-grow items-end gap-2">
				<div class="flex h-max w-12 min-w-12 flex-col items-start justify-end pl-2">
					<TimeDisplay
						expected={train.times.estimated.departure}
						scheduled={train.times.scheduled.departure}
						isCancelled={train.isCancelled}
					/>
				</div>
				<div class={['min-w-0 flex-grow truncate text-lg/6 font-semibold']}>
					{train.destination.name}
				</div>
			</div>
		</div>
		{#if stations && train.terminal && ((train.terminal.origin && crs != train.terminal.origin) || (train.terminal.destination && train.destination.crs != train.terminal.destination && !train.isCancelledAtFilter))}
			<div
				class={[
					'text-foreground-muted/90 flex w-full items-center gap-1 px-4 text-xs/4',
					train.position === Position.DEPARTED && 'opacity-60'
				]}
			>
				via
				{#if train.terminal.origin && crs != train.terminal.origin}
					<div>
						<span class="font-medium text-black">
							{stations.find((s) => s.crs === train.terminal.origin)?.Value}</span
						>{#if train.terminal.destination && train.destination.crs != train.terminal.destination && !train.isCancelledAtFilter}
							,
						{/if}
					</div>
				{/if}

				{#if train.terminal.destination && train.destination.crs != train.terminal.destination && !train.isCancelledAtFilter}
					<div>
						<span class="font-medium text-black"
							>{stations.find((s) => s.crs === train.terminal.destination)?.Value}</span
						>
					</div>
				{/if}
			</div>
		{/if}
		<div
			class={[
				'text-foreground-muted/90 flex min-h-4 w-full items-center gap-2 px-4 text-xs/4',
				train.position === Position.DEPARTED && 'opacity-60'
			]}
		>
			<RelativeTimeDisplay
				departure={train.times.estimated.departure}
				arrival={train.times.estimated.arrival}
				position={train.position}
				cancelledAtFilter={train.isCancelledAtFilter ? train.filter?.name : null}
			/>
			{#if train.filter && !train.isCancelled && !train.isCancelledAtFilter}
				<div class="text-foreground-muted/70 flex items-center gap-1">
					<Clock size={12} />
					<div class="text-xs/3">
						{train.filter.duration}
						{#if train.filter.stops}({train.filter.stops} stops){:else}(non-stop){/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
	<div
		class={[
			'flex flex-col items-center pr-4',
			train.position === Position.DEPARTED && 'opacity-60'
		]}
	>
		<div class="text-foreground-muted text-[10px]">Platform</div>
		<div class="bg-muted relative flex size-6 items-center justify-center rounded-full text-xs">
			{#if train.platform}
				{train.platform}
			{:else if !train.isCancelled}
				<RttPlatform
					uid={train.uid}
					sdd={train.sdd}
					crs={train.terminal?.origin ?? page.data.crs}
				/>
			{/if}
		</div>
	</div>
</a>
