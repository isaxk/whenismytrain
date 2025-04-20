<script lang="ts">
	import { Order, Status, type CallingPoint } from '$lib/types/train';
	import { Accordion } from 'bits-ui';
	import TimeDisplay from '$lib/components/ui/time-display.svelte';
	import { pos } from '$lib/utils/transitions';
	import { ArrowLeftRight, Check, ChevronDown, ChevronRight, Train } from 'lucide-svelte';
	import { operatorList } from '$lib/data/operators';
	import { slide } from 'svelte/transition';
	import dayjs from 'dayjs';
	import { quadInOut } from 'svelte/easing';
	import ScrollIntoView from '$lib/components/ui/scroll-into-view.svelte';
	import PositionIndicator from './position-indicator.svelte';

	const { send, receive } = pos;

	let {
		i,
		operator,
		callingPoint,
		length,
		dest = '',
		focusedStation
	}: {
		i: number;
		operator: string;
		callingPoint: CallingPoint;
		length: number;
		dest: string;
		focusedStation: string | undefined;
	} = $props();

	let clientHeight = $state();
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
	<div bind:clientHeight class="flex gap-4 pr-0 pl-5">
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
		{#snippet format(date: string)}
			{#if date}
				{dayjs(date).format('HH:mm:ss')}
			{:else}
				-
			{/if}
		{/snippet}
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
						{@const time =
							callingPoint.times.estimated.arrival ??
							callingPoint.times.scheduled.arrival ??
							callingPoint.times.scheduled.departure ??
							'null'}
						{#if open}
							<ScrollIntoView />
							<div
								transition:slide={{ duration: 200, easing: quadInOut }}
								class="border-border border-t pt-1 pb-2"
								{...props}
							>
								<div class="grid grid-cols-3 grid-rows-3 pt-3 text-sm">
									<div class="flex h-7 items-center"></div>
									<div
										class={[
											'flex h-7 items-center gap-0.5',
											!callingPoint.times.scheduled.arrival
												? 'text-foreground-muted font-medium'
												: 'font-semibold'
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
									href="/board/{callingPoint.crs}?time={dayjs(time).format('HHmm')}&history={dayjs(
										time
									).format('HH:MM')} to {dest}"
									><ArrowLeftRight size={18} /> Transfer departures
								</a>
							</div>
						{/if}
					{/snippet}</Accordion.Content
				>
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
