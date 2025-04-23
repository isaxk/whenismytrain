<script lang="ts">
	import { operatorList } from '$lib/data/operators';
	import { Status, type Train } from '$lib/types/train';
	import { receive, send } from '$lib/utils/transitions';
	import type { Dayjs } from 'dayjs';
	import FromNow from '../ui/from-now.svelte';
	import TimeDisplay from '../ui/time-display.svelte';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';

	let { train, fixedWidthTime = false }: { train: Train; fixedWidthTime?: boolean } = $props();

	let status: string | null = $state(null);
	let now = $state(dayjs());

	function fromNow(time: string) {
		return dayjs(time).diff(now, 'minutes');
	}

	onMount(() => {
		const interval = setInterval(() => {
			now = dayjs();
		}, 1000);
		return () => clearInterval(interval);
	});
</script>

<div
	class={[
		'relative flex min-h-20 items-center gap-4 pr-4 pl-4',
		status === 'cancelled' && 'bg-red-100/5',
		status === 'early' && 'bg-amber-100/5',
		status === 'ontime' && 'bg-transparent',
		status === 'minor' && 'bg-yellow-50/5',
		status === 'major' && 'bg-red-50/5',
		status === 'severe' && 'bg-red-100/5',
		status === 'unknown' && 'bg-red-100/5'
	]}
>
	<div class={['text-left', fixedWidthTime ? 'w-12' : 'w-max pl-2']}>
		<TimeDisplay
			bind:state={status}
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
		<div class="-mt-0.5 flex items-center gap-2 text-xs">
			{#if train.isCancelled}
				<span class="font-semibold text-red-600 not-italic">Cancelled</span>
			{:else if train.status === Status.ARRIVED}
				<div>Arrived</div>
				{#if train.times.estimated.departure}
					<div class="text-foreground-muted font-light italic">
						Departs in <span class="font-normal text-black">
							{#if fromNow(train.times.estimated.departure) < 1}
								&lt;1 min
							{:else}
								{fromNow(train.times.estimated.departure)} mins
							{/if}</span
						>
					</div>
				{/if}
			{:else if train.status === Status.DEPARTED}
				Departed
			{:else if train.status === Status.STARTS_HERE}
				<div class="text-foreground-muted">Starts Here</div>
				{#if fromNow(train.times.estimated.departure) < 15 && train.times.estimated.departure}
					<div class="text-foreground-muted font-light italic">
						Departs in <span class="font-normal text-black">
							{#if fromNow(train.times.estimated.departure) < 1}
								&lt;1 min
							{:else}
								{fromNow(train.times.estimated.departure)} mins
							{/if}
						</span>
					</div>
				{/if}
			{:else if train.times.estimated.arrival && fromNow(train.times.estimated.arrival) < 15}
				<div class="text-foreground-muted font-light italic">
					{#if fromNow(train.times.estimated.arrival) < 1.2}
						<div class="">Arriving</div>
					{:else}
						Arrives in <span class="font-normal text-black">
							{Math.max(1, fromNow(train.times.estimated.arrival))} mins
						</span>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<div class={['flex flex-col items-center', train.platform === null && 'opacity-50']}>
		<div class="text-foreground-muted text-[10px]">Platform</div>
		<div class={['bg-accent flex h-7 w-7 items-center justify-center rounded-full text-sm']}>
			{train.platform ?? '?'}
		</div>
	</div>
</div>
