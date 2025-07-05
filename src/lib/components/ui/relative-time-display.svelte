<script lang="ts">
	import { Position } from '$lib/types';
	import dayjs from 'dayjs';
	import { ArrowDown, ArrowDownRight, ArrowUp, ArrowUpRight, Check, Home, X } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let {
		position,
		arrival,
		departure,
		cancelledAtFilter = null
	}: {
		position: Position;
		arrival: string | null;
		departure: string | null;
		cancelledAtFilter?: string | null;
	} = $props();

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

{#if position === Position.CANCELLED}
	<div class="flex items-center gap-1 text-red-600">
		<X size={12} />
		<div class="text-red-600">Cancelled</div>
	</div>
{:else if cancelledAtFilter}
	<div class="flex items-center gap-1 text-red-600">
		<X size={12} />
		<div class="text-red-600">Cancelled at {cancelledAtFilter}</div>
	</div>
{:else if position === Position.DEPARTED}
	<div class="flex items-center gap-1"><Check size={12} />Departed</div>
{:else if position === Position.ARRIVED}
	<div class="flex items-center gap-1"><Check size={12} /> Arrived</div>
	{#if relativeDeparture !== null}
		<div class="flex items-center gap-1">
			<ArrowUpRight size={12} />
			{#if relativeDeparture < 1}Departing soon{:else}Departing in {relativeDeparture}m{/if}
		</div>
	{/if}
{:else if position === Position.STARTS_HERE}
	<div class="flex items-center gap-1">
		<Home size={12} />
	</div>
	{#if relativeDeparture !== null && relativeDeparture < 20}
		<div class="flex items-center gap-1">
			<ArrowUpRight size={12} />
			{#if relativeDeparture < 1}Departing soon{:else}Departing in {relativeDeparture}m{/if}
		</div>
	{/if}
{:else if position === Position.AWAY && relativeArrival !== null && (relativeArrival ?? 0) < 15}
	<div class="flex items-center gap-1">
		<ArrowDownRight size={12} />
		{#if relativeArrival < 1}Arriving soon{:else}Arriving in {relativeArrival}m{/if}
	</div>
	{#if relativeDeparture}
		<div class="flex items-center gap-1">
			<ArrowUpRight size={12} />
			{relativeDeparture}m
		</div>
	{/if}
{:else if relativeDeparture && (relativeDeparture ?? 0) < 15}
	<div class="flex items-center gap-1">
		<ArrowUpRight size={12} />
		{#if relativeDeparture < 1}Departing soon{:else}Departing in {relativeDeparture}m{/if}
	</div>
{/if}
