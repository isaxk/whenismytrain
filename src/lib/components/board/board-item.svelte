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

	let { i, train, url }: { i: number; train: BoardItem; url: string } = $props();

	const md = new MediaQuery('(min-width: 768px)');
</script>

<a
	href={url}
	class={[
		'flex h-20 items-center transition-all',
		page.data.train_id === train.id
			? 'bg-foreground-tint/20'
			: 'group-odd:bg-muted/70 bg-background'
	]}
>
	<div class="h-full min-w-1.5" style:background={operatorList[train.operator].bg}></div>
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
			/>
			{#if train.filter && !train.isCancelled}
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
				<RttPlatform uid={train.uid} sdd={train.sdd} crs={page.data.crs} />
			{/if}
		</div>
	</div>
</a>
