<script lang="ts">
	import { Position } from '$lib/types';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';

	let {
		position,
		arrival,
		departure
	}: { position: Position; arrival: string | null; departure: string | null } = $props();

	let now = $state(dayjs());

	const relativeArrival = $derived(arrival ? dayjs(arrival).diff(now, 'minute') : null);
	const relativeDeparture = $derived(departure ? dayjs(departure).diff(now, 'minute') : null);

	onMount(() => {
		const interval = setInterval(() => {
			now = dayjs();
		}, 1000);
		return () => clearInterval(interval);
	});

	$inspect('relativeDeparture', relativeDeparture);
</script>

<div class="text-foreground-muted flex gap-1 text-xs/3">
	{#if position === Position.CANCELLED}
		<div class="text-red-600">Cancelled</div>
	{:else if position === Position.DEPARTED}
		<div class="text-foreground">Departed</div>
	{:else if position === Position.ARRIVED}
		<div class="text-foreground">Arrived</div>
		-
		{#if relativeDeparture !== null}
			<div class="">
				{#if relativeDeparture < 1}Departing soon{:else}Departs in {relativeDeparture}m{/if}
			</div>
		{/if}
	{:else if position === Position.STARTS_HERE}
		<div class="">Starts here</div>

		{#if relativeDeparture !== null && relativeDeparture < 20}
			-
			<div class="">
				{#if relativeDeparture < 1}Departing soon{:else}Departs in {relativeDeparture}m{/if}
			</div>
		{/if}
	{:else if position === Position.AWAY && relativeArrival !== null && (relativeArrival ?? 0) < 15}
		<div class="">
			{#if relativeArrival < 1}Arriving soon{:else}Arrives in {relativeArrival}m{/if}
		</div>
	{:else if relativeDeparture && (relativeDeparture ?? 0) < 15}
		<div class="">
			{#if relativeDeparture < 1}Departing soon{:else}Departs in {relativeDeparture}m{/if}
		</div>
	{/if}
</div>
