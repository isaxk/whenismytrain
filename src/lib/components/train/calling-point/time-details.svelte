<script lang="ts">
	import { Status, type CallingPoint } from '$lib/types/train';
	import dayjs from 'dayjs';
	import { ArrowLeftRight, Check } from 'lucide-svelte';

	let { callingPoint, dest }: { callingPoint: CallingPoint; dest: string } = $props();

	const time = $derived(
		callingPoint.times.estimated.arrival ??
			callingPoint.times.scheduled.arrival ??
			callingPoint.times.scheduled.departure ??
			'null'
	);
</script>

{#snippet format(date: string)}
	{#if date}
		{dayjs(date).format('HH:mm:ss')}
	{:else}
		-
	{/if}
{/snippet}

<div class="grid grid-cols-3 grid-rows-3 pt-3 text-sm">
	<div class="flex h-7 items-center"></div>
	<div
		class={[
			'flex h-7 items-center gap-0.5',
			!callingPoint.times.scheduled.arrival ? 'text-foreground-muted font-medium' : 'font-semibold'
		]}
	>
		Arrival {#if callingPoint.status === Status.ARRIVED || (callingPoint.status === Status.DEPARTED && callingPoint.times.scheduled.arrival)}
			<Check size={16} />{/if}
	</div>
	<div
		class={[
			'flex h-7 items-center gap-0.5',
			!callingPoint.times.scheduled.departure
				? 'text-foreground-muted font-medium'
				: 'font-semibold'
		]}
	>
		Departure {#if callingPoint.status === Status.DEPARTED}
			<Check size={16} />{/if}
	</div>
	<div class="flex h-7 items-center font-semibold">Expected</div>

	<div class="flex h-7 items-center gap-0.5 font-mono">
		{@render format(callingPoint.times.estimated.arrival)}
	</div>
	<div class="flex h-7 items-center gap-0.5 font-mono">
		{@render format(callingPoint.times.estimated.departure)}
	</div>

	<div class="flex h-7 items-center font-semibold">Scheduled</div>
	<div class="flex h-7 items-center font-mono">
		{@render format(callingPoint.times.scheduled.arrival)}
	</div>
	<div class="flex h-7 items-center font-mono">
		{@render format(callingPoint.times.scheduled.departure)}
	</div>
</div>
<a
	class="flex w-full items-center gap-2 rounded py-2 pt-4 underline"
	href="/board/{callingPoint.crs}?time={dayjs(time).format('HHmm')}&history={dayjs(time).format(
		'HH:MM'
	)} to {dest}"
	><ArrowLeftRight size={18} /> Transfer departures
</a>
