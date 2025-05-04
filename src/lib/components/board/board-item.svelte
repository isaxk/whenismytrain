<script lang="ts">
	import { navigating, page } from '$app/state';
	import { operatorList } from '$lib/data/operators';
	import type { BoardItem } from '$lib/types/board';
	import { MediaQuery } from 'svelte/reactivity';
	import RelativeTimeDisplay from '../ui/relative-time-display.svelte';
	import TimeDisplay from '../ui/time-display.svelte';
	import RttPlatform from '../train/rtt-platform.svelte';

	let { i, train, url }: { i: number; train: BoardItem; url: string } = $props();

	const md = new MediaQuery('(min-width: 768px)');
</script>

<a
	href={url}
	class={[
		'flex h-20 items-center gap-2',
		page.data.train_id === train.id ? 'bg-muted' : 'odd:bg-muted/40'
	]}
>
	<div class="h-full min-w-1.5" style:background={operatorList[train.operator].bg}></div>
	<div class="flex w-14 min-w-14 justify-center">
		<TimeDisplay
			expected={train.times.estimated.departure}
			scheduled={train.times.scheduled.departure}
			isCancelled={train.isCancelled}
		/>
	</div>
	<div class="min-w-0 flex-grow">
		<div class={['truncate text-lg/6 font-semibold']}>
			{train.destination.name}
		</div>

		<RelativeTimeDisplay
			arrival={train.times.estimated.arrival}
			departure={train.times.estimated.departure}
			position={train.position}
		/>
		{#if train.filter}
			<div class="text-foreground-muted text-xs/3">
				{train.filter.duration} to {train.filter.crs}
				{#if train.filter.stops}({train.filter.stops} stops){:else}(non-stop){/if}
			</div>
		{/if}
	</div>
	<div class="flex flex-col items-center pr-4">
		<div class="text-foreground-muted text-[10px]">Platform</div>
		<div class="bg-muted relative flex size-8 items-center justify-center rounded-full text-sm">
			{#if train.platform}
				{train.platform}
			{:else}
				<RttPlatform uid={train.uid} sdd={train.sdd} crs={page.data.crs} />
			{/if}
		</div>
	</div>
</a>
