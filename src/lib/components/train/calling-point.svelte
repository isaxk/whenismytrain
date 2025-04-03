<script lang="ts">
	import { Order, Status } from '$lib/types/train';
	import { Accordion, Switch } from 'bits-ui';
	import TimeDisplay from '../ui/time-display.svelte';
	import { pos } from '$lib/utils/transitions';
	import { ArrowLeftRight, Check, ChevronDown, ChevronRight, Train } from 'lucide-svelte';
	import { operatorList } from '$lib/data/operators';
	import { slide } from 'svelte/transition';
	import dayjs from 'dayjs';
	import { quadInOut } from 'svelte/easing';
	import { page } from '$app/state';

	const { send, receive } = pos;

	let { i, operator, location, length, dest = '' } = $props();

	let clientHeight = $state();
</script>

{#if location.divideFrom}
	<div class="relative">
		<a href="/service/{location.divideFrom.id}/{location.crs}" class="pl-20 text-sm">
			This train is divided from a train from {location.divideFrom.origin} to {location.divideFrom
				.destination}
		</a>
	</div>
{/if}
<Accordion.Item
	class={[
		'even:bg-muted odd:bg-card group border-border relative transition-all duration-200 first:border-none',
		location.isCancelled && 'opacity-75'
	]}
	value={location.tiploc}
>
	<div bind:clientHeight class="flex gap-4 pr-0 pl-5">
		<div class="flex h-16 w-12 items-center justify-end">
			<TimeDisplay
				size="sm"
				point
				isCancelled={location.isCancelled}
				estimated={location.times.estimated.departure ?? location.times.estimated.arrival ?? null}
				scheduled={location.times.scheduled.departure ?? location.times.scheduled.arrival ?? null}
			/>
		</div>
		<div class={['min-w-5']}>
			<div class="absolute top-0 bottom-0 flex flex-col justify-center pl-1">
				{#if i !== 0}
					<div
						class={[
							'bg-accent h-7 w-2',
							location.status !== Status.ARRIVED &&
								location.status !== Status.DEPARTED &&
								'opacity-[80%]'
						]}
						style:background={operatorList[operator].bg}
					></div>
				{:else}
					<div class="h-7"></div>
				{/if}
				<div
					class={[
						'bg-accent rounded-x h-2 w-4 rounded-r',
						location.status !== Status.DEPARTED && 'opacity-[80%]'
					]}
					style:background={operatorList[operator].bg}
				></div>
				{#if i !== length - 1}
					<div
						class={[
							'bg-accent w-2 flex-grow',
							location.status !== Status.DEPARTED && 'opacity-[80%]'
						]}
						style:background={operatorList[operator].bg}
					></div>
				{:else}
					<div class="flex-grow"></div>
				{/if}
				{#if location.status === Status.DEPARTED && location.progress !== 1 && !location.isCancelled}
					<div class="absolute top-12 -bottom-4 left-1 z-[1000] w-2">
						<div
							class="flex w-full items-end transition-all duration-200"
							style:height="{location.progress * 100}%"
						>
							<div class="flex h-1 w-full items-center justify-center">
								<div
									in:receive={{ key: 'pos' }}
									out:send={{ key: 'pos' }}
									class="flex h-6 min-w-6 items-center justify-center rounded-full border-2 bg-white"
									style:border-color={operatorList[operator].bg}
									style:color={operatorList[operator].bg}
								>
									<Train size={16} strokeWidth={2.5} />
								</div>
							</div>
						</div>
					</div>
				{:else if location.status === Status.ARRIVED && !location.isCancelled}
					<div class="absolute top-[21px] -left-1 flex w-2">
						<div
							in:receive={{ key: 'pos' }}
							out:send={{ key: 'pos' }}
							class="flex h-6 min-w-6 items-center justify-center rounded-full border-2 bg-white"
							style:border-color={operatorList[operator].bg}
							style:color={operatorList[operator].bg}
						>
							<Train size={16} strokeWidth={2.5} />
						</div>
					</div>
				{/if}
			</div>
		</div>
		{#snippet format(date: string)}
			{#if date}
				{dayjs(date).format('HH:mm:ss')}
			{:else}
				-
			{/if}
		{/snippet}
		<div class="flex-grow">
			<Accordion.Trigger class={['left-4 flex h-16 w-full items-center text-left']}>
				<div
					class={[
						'flex-grow',
						location.order === Order.FOCUS && 'font-semibold',
						location.order === Order.SUBSEQUENT && 'font-medium',
						location.isCancelled && 'line-through'
					]}
				>
					{location.name}
				</div>

				<div class="flex h-16 min-w-10 flex-col items-center justify-center">
					<div class="text-[10px]">Platform</div>
					<div class="bg-accent flex h-7 w-7 items-center justify-center rounded-full text-sm">
						{location.platform}
					</div>
				</div>
				<div class="w-2"></div>
				<div
					class="text-foreground-muted transition-all duration-200 group-data-[state=open]:rotate-180"
				>
					<ChevronDown size={18} />
				</div>
			</Accordion.Trigger>

			<Accordion.Content forceMount={true}
				>{#snippet child({ props, open })}
					{@const time =
						location.times.estimated.arrival ??
						location.times.scheduled.arrival ??
						location.times.scheduled.departure ??
						'null'}
					{#if open}
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
										!location.times.scheduled.arrival
											? 'text-foreground-muted font-medium'
											: 'font-semibold'
									]}
								>
									Arrival {#if location.status === Status.ARRIVED || (location.status === Status.DEPARTED && location.times.scheduled.arrival)}
										<Check size={16} />{/if}
								</div>
								<div
									class={[
										'flex h-7 items-center gap-0.5',
										!location.times.scheduled.departure
											? 'text-foreground-muted font-medium'
											: 'font-semibold'
									]}
								>
									Departure {#if location.status === Status.DEPARTED}
										<Check size={16} />{/if}
								</div>
								<div class="flex h-7 items-center font-semibold">Expected</div>

								<div class="flex h-7 items-center gap-0.5 font-mono">
									{@render format(location.times.estimated.arrival)}
								</div>
								<div class="flex h-7 items-center gap-0.5 font-mono">
									{@render format(location.times.estimated.departure)}
								</div>

								<div class="flex h-7 items-center font-semibold">Scheduled</div>
								<div class="flex h-7 items-center font-mono">
									{@render format(location.times.scheduled.arrival)}
								</div>
								<div class="flex h-7 items-center font-mono">
									{@render format(location.times.scheduled.departure)}
								</div>
							</div>
							<a
								class="flex w-full items-center gap-2 rounded py-2 pt-4 underline"
								href="/board/{location.crs}?time={dayjs(time).format('HHmm')}&history={dayjs(
									time
								).format('HH:MM')} to {dest}"
								><ArrowLeftRight size={18} /> Transfer departures
							</a>
						</div>
					{/if}
				{/snippet}</Accordion.Content
			>
		</div>

		<div class="flex h-16 flex-col items-end justify-center"></div>
	</div>
	{#if location.divideTo}
		<a
			href="/service/{location.divideTo.id}/{location.crs}"
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
					{location.divideTo.destination}
				</div>
			</div>
			<div>
				<ChevronRight />
			</div>
		</a>
	{/if}
</Accordion.Item>
