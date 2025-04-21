<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quadInOut } from 'svelte/easing';
	import { Accordion } from 'bits-ui';
	import { ChevronDown, ChevronRight } from 'lucide-svelte';

	import ScrollIntoView from '$lib/components/ui/scroll-into-view.svelte';
	import TimeDisplay from '$lib/components/ui/time-display.svelte';
	import PositionIndicator from './position-indicator.svelte';
	import TimeDetails from './time-details.svelte';
	import { Order, type CallingPoint } from '$lib/types/train';
	import { operatorList } from '$lib/data/operators';

	let {
		i,
		operator,
		callingPoint,
		dest = '',
		focusedStation,
		length
	}: {
		i: number;
		operator: string;
		callingPoint: CallingPoint;
		dest: string;
		focusedStation: string | undefined;
  length: number
	} = $props();
</script>

{#if callingPoint.divideFrom}
	<div class="relative">
		<a href="/service/{callingPoint.divideFrom.id}/{callingPoint.crs}" class="pl-20 text-sm">
			This train divides from a train from {callingPoint.divideFrom.origin} to {callingPoint
				.divideFrom.destination}
		</a>
	</div>
{/if}
<Accordion.Item
	class={[
		'even:bg-muted odd:bg-card group border-border relative transition-all duration-200 first:border-none',
		callingPoint.isCancelled && 'opacity-75',
		focusedStation === callingPoint.tiploc ? 'font-medium text-black' : 'text-black/80'
	]}
	value={callingPoint.tiploc}
>
	<div class="flex gap-4 pr-0 pl-5">
		<div
			class={[
				'flex w-12 items-center justify-end',
				callingPoint.isCancelled ? 'h-16' : 'h-16',
				callingPoint.order === Order.PREVIOUS && 'opacity-60'
			]}
		>
			<TimeDisplay
				size="sm"
				point
				isCancelled={callingPoint.isCancelled}
				estimated={callingPoint.times.estimated.departure ??
					callingPoint.times.estimated.arrival ??
					null}
				scheduled={callingPoint.times.scheduled.departure ??
					callingPoint.times.scheduled.arrival ??
					null}
			/>
		</div>
		<PositionIndicator
			{i}
			status={callingPoint.status}
			isCancelled={callingPoint.isCancelled}
			progress={callingPoint.progress}
			{operator}
		/>
		<div class="flex-grow">
			<Accordion.Trigger
				class={[
					'left-4 flex w-full items-center text-left',
					callingPoint.isCancelled ? 'h-16' : 'h-16'
				]}
			>
				<div class="flex-grow">
					<div
						class={[
							'flex-grow',
							callingPoint.order === Order.FOCUS && 'font-semibold',
							callingPoint.order === Order.SUBSEQUENT && 'font-medium',
							callingPoint.isCancelled && 'line-through',
							callingPoint.order === Order.PREVIOUS && 'text-foreground-muted/60'
						]}
					>
						{callingPoint.name}
					</div>
					{#if callingPoint.isCancelled}
						<div class="-mt-1 text-xs font-semibold text-red-600">Cancelled</div>
					{/if}
				</div>

				{#if !callingPoint.isCancelled}
					<div
						class={[
							'flex min-w-10 flex-col items-center justify-center',
							callingPoint.isCancelled ? 'h-16' : 'h-16'
						]}
					>
						<div class="text-[10px]">Platform</div>
						<div class="bg-accent flex h-7 w-7 items-center justify-center rounded-full text-sm">
							{callingPoint.platform}
						</div>
					</div>
				{/if}
				<div class="w-2"></div>
				<div
					class={[
						'text-foreground-muted pr-2 transition-all duration-200 group-data-[state=open]:rotate-180',
						callingPoint.isCancelled && 'opacity-0'
					]}
				>
					<ChevronDown size={18} />
				</div>
			</Accordion.Trigger>

			{#if !callingPoint.isCancelled}
				<Accordion.Content forceMount={true}>
					{#snippet child({ props, open })}
						{#if open}
							<ScrollIntoView />
							<div
								transition:slide={{ duration: 200, easing: quadInOut }}
								class="border-border border-t pt-1 pb-2"
								{...props}
							>
								<TimeDetails {callingPoint} {dest} />
							</div>
						{/if}
					{/snippet}
				</Accordion.Content>
			{/if}
		</div>
	</div>
	{#if callingPoint.divideTo}
		<a
			href="/service/{callingPoint.divideTo.id}/{callingPoint.crs}"
			class="flex items-center gap-2 pr-4 pb-2 pl-20"
		>
			<div>
				<div
					class="relative h-1.5 w-8 rotate-45 rounded-r"
					style:background={operatorList[operator].bg}
					style:color={operatorList[operator].bg}
				>
					<ChevronRight size={30} class="absolute -top-3 left-[13px]" />
				</div>
			</div>
			<div class="flex-grow">
				<div class="text-foreground-muted text-xs">Train divides and some carriages go to:</div>
				<div class="-mt-1 font-medium">
					{callingPoint.divideTo.destination}
				</div>
			</div>
			<div>
				<ChevronRight />
			</div>
		</a>
	{/if}
</Accordion.Item>
