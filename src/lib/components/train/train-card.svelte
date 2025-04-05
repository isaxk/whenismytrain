<script lang="ts">
	import { operatorList } from '$lib/data/operators';
	import { Status, type Train } from '$lib/types/train';
	import { receive, send } from '$lib/utils/transitions';
	import TimeDisplay from '../ui/time-display.svelte';

	let { train, fixedWidthTime = false }: { train: Train; fixedWidthTime?: boolean } = $props();

	let state: string | null = $state(null);
</script>

<div
	class={[
		'relative flex min-h-20 items-center gap-4 pr-4 pl-4',
		state === 'cancelled' && 'bg-red-100/5',
		state === 'early' && 'bg-amber-100/5',
		state === 'ontime' && 'bg-transparent',
		state === 'minor' && 'bg-yellow-50/5',
		state === 'major' && 'bg-red-50/5',
		state === 'severe' && 'bg-red-100/5',
		state === 'unknown' && 'bg-red-100/5'
	]}
>
	<div class={['text-left', fixedWidthTime ? 'w-12' : 'w-max pl-2']}>
		<TimeDisplay
			bind:state
			estimated={train.estimated}
			scheduled={train.scheduled}
			isCancelled={train.isCancelled}
		/>
	</div>
	<div class="flex-grow">
		{#if train.oldDestination}
			<div class="-mb-1 flex-grow text-xs line-through">
				{train.oldDestination.name}
			</div>
		{/if}
		<div class="flex-grow text-xl font-semibold select-text">
			{train.destination.name}
		</div>
		<div class="-mt-0.5 flex items-center">
			<div class="text-xs font-medium italic">
				{#if train.isCancelled}
					<span class="font-semibold text-red-600 not-italic">Cancelled</span>
				{:else if train.status === Status.ARRIVED}
					Arrived
				{:else if train.status === Status.DEPARTED}
					Departed
				{:else if train.status === Status.STARTS_HERE}
					<div class="text-foreground-muted font-light">Starts Here</div>
				{/if}
			</div>
		</div>
	</div>

	<div class={['flex flex-col items-center', train.platform === null && 'opacity-50']}>
		<div class="text-foreground-muted text-[10px]">Platform</div>
		<div class={['bg-accent flex h-7 w-7 items-center justify-center rounded-full text-sm']}>
			{train.platform ?? '?'}
		</div>
	</div>
</div>
