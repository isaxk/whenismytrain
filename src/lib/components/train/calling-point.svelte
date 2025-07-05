<script lang="ts">
	import type { CallingPoint } from '$lib/types/train';
	import { fade, slide } from 'svelte/transition';
	import TimeDisplay from '../ui/time-display.svelte';
	import { ChevronDown, ChevronUp, PersonStanding, Train, Users } from 'lucide-svelte';
	import RelativeTimeDisplay from '../ui/relative-time-display.svelte';
	import RttPlatform from './rtt-platform.svelte';
	import { Position } from '$lib/types';

	let {
		i,
		callingPoint,
		color,
		order,
		end = null,
		uid,
		sdd,
		hideDetails = false,
		showJoin = true,
		showDivide = true,
		next = null
	}: {
		i: number;
		callingPoint: CallingPoint;
		color: string;
		order: 'previous' | 'focus' | 'subsequent' | 'filter' | 'further' | 'destination';
		end?: 'start' | 'end' | null;
		uid: string;
		sdd: string;
		hideDetails?: boolean;
		showJoin?: boolean;
		showDivide?: boolean;
		next?: CallingPoint | null;
	} = $props();

	let showDiv = $state(false);

	console.log(uid);

	if (callingPoint.divisionType) {
		console.log(callingPoint.times);
	}

	function loadPercentage(p: number) {
		if (p < 40) {
			return 'bg-green-200/80';
		} else if (p < 60) {
			return 'bg-yellow-200/80';
		} else if (p < 80) {
			return 'bg-orange-200/80';
		} else {
			return 'bg-red-200/80';
		}
	}
</script>

{#snippet division(type: 'divide' | 'join', callingPoints: CallingPoint[])}
	{#if type === 'divide'}
		<button onclick={() => (showDiv = !showDiv)} class="flex h-10 items-center pl-6">
			<div class="min-w-12"></div>
			<div class="relative flex h-full flex-col pr-4">
				<div
					class="z-20 h-[80%] w-2"
					style:background={[Position.ARRIVED, Position.DEPARTED].includes(
						next?.trainRelativePosition ?? 0
					)
						? color
						: color + 'B3'}
				></div>
				{#if showDiv}
					<div
						transition:fade={{ duration: 0 }}
						class="absolute -bottom-3 left-0 z-20 h-1/2 w-2"
						style:background="linear-gradient(to top, transparent, {[
							Position.ARRIVED,
							Position.DEPARTED
						].includes(next?.trainRelativePosition ?? 0)
							? color
							: color + 'B3'})"
					></div>
				{:else}
					<div
						class="absolute -bottom-4 left-0 z-20 h-6 w-2"
						style:background={[Position.ARRIVED, Position.DEPARTED].includes(
							next?.trainRelativePosition ?? 0
						)
							? color
							: color + 'B3'}
					></div>
				{/if}

				<div
					class="absolute -bottom-1.5 left-2 z-0 h-6 w-2 -rotate-45"
					style:background="#d4d4d8"
				></div>
				<div class="absolute right-0 -bottom-4 h-4 w-2" style:background="#d4d4d8"></div>
			</div>
			{#if showDiv}
				<div class="mt-8 flex items-center gap-1 pl-6">Hide division <ChevronUp size={18} /></div>
			{:else}
				<div class="mt-8 flex items-center gap-1 pl-6">Show division <ChevronDown size={18} /></div>
			{/if}
		</button>
	{/if}
	<div class="py-4">
		{#if showDiv}
			<div transition:slide={{ duration: 200 }}>
				{#each callingPoints as point, i (point.tiploc)}
					<div class="flex h-14 items-center pl-10">
						<div class="min-w-12 -translate-x-2 opacity-80">
							<TimeDisplay
								expected={order === 'previous' || order === 'focus'
									? (point.times.estimated.departure ?? point.times.estimated.arrival)
									: (point.times.estimated.arrival ?? point.times.estimated.departure)}
								scheduled={order === 'previous' || order === 'focus'
									? (point.times.scheduled.departure ?? point.times.scheduled.arrival)
									: (point.times.scheduled.arrival ?? point.times.scheduled.departure)}
								isCancelled={point.isCancelled}
							/>
						</div>

						<div class="relative flex h-full flex-col pr-4">
							{#if type === 'join' && i === 0}
								<div class="flex-grow"></div>
								<div
									class="absolute -top-4 -left-4 h-4 w-2"
									style:background="linear-gradient(to bottom, {color + 'B3'}, transparent)"
								></div>
							{:else}
								<div class="w-2 flex-grow" style:background="#d4d4d8"></div>
							{/if}
							<div
								class={['rounded-r', ['focus', 'filter'].includes(order) ? 'h-2 w-4' : 'h-1.5 w-4']}
								style:background="#d4d4d8"
							></div>
							{#if type === 'divide' && i === callingPoints.length - 1}
								<div class="flex-grow"></div>
								<div
									class="absolute -bottom-4 -left-4 h-4 w-2"
									style:background="linear-gradient(to top, {color + 'B3'}, transparent)"
								></div>
							{:else}
								<div class="w-2 flex-grow" style:background="#d4d4d8"></div>
							{/if}
						</div>
						{#if (type === 'divide' && i === callingPoints.length - 1) || (type === 'join' && i === 0)}
							<div class="text-sm font-medium text-black">{point.name}</div>
						{:else}
							<div class="text-foreground-muted/80 text-sm">{point.name}</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			{@const destOri =
				type === 'divide' ? callingPoints[callingPoints.length - 1] : callingPoints[0]}
			<div class="flex h-14 items-center pl-6">
				<div class="min-w-12"></div>
				<div class="relative flex h-full flex-col pr-2">
					<div
						class="w-2 flex-grow"
						style:background={[Position.ARRIVED, Position.DEPARTED].includes(
							next?.trainRelativePosition ?? 0
						)
							? color
							: color + 'B3'}
					></div>
				</div>

				<div class="relative flex h-full flex-col pr-4">
					{#if type === 'join'}
						<div class="flex-grow"></div>

						<div
							class="absolute -top-4 -left-4 z-20 h-4 w-2"
							style:background={[Position.ARRIVED, Position.DEPARTED].includes(
								next?.trainRelativePosition ?? 0
							)
								? color
								: color + 'B3'}
						></div>
					{:else}
						<div class="w-2 flex-grow" style:background="#d4d4d8"></div>
					{/if}
					<div
						class={['rounded-r', ['focus', 'filter'].includes(order) ? 'h-2 w-4' : 'h-1.5 w-4']}
						style:background="#d4d4d8"
					></div>
					{#if type === 'divide'}
						<div class="flex-grow"></div>

						<div
							class="absolute -bottom-4 -left-4 z-20 h-4 w-2"
							style:background={[Position.ARRIVED, Position.DEPARTED].includes(
								next?.trainRelativePosition ?? 0
							)
								? color
								: color + 'B3'}
						></div>
					{:else}
						<div class="w-2 flex-grow" style:background="#d4d4d8"></div>
					{/if}
				</div>
				<div class="font-medium text-black">{destOri.name}</div>
			</div>
		{/if}
	</div>
	{#if type === 'join'}
		<button onclick={() => (showDiv = !showDiv)} class="flex h-10 items-center pl-6">
			<div class="min-w-12"></div>
			<div class="relative flex h-full flex-col pr-4">
				<div
					class="z-20 h-[100%] w-2"
					style:background={[Position.ARRIVED, Position.DEPARTED].includes(
						next?.trainRelativePosition ?? 0
					)
						? color
						: color + 'B3'}
				></div>
				{#if showDiv}
					<div
						transition:fade={{ duration: 0 }}
						class="absolute -top-3 left-0 h-1/2 w-2"
						style:background="linear-gradient(to bottom, transparent, {[
							Position.ARRIVED,
							Position.DEPARTED
						].includes(next?.trainRelativePosition ?? 0)
							? color
							: color + 'B3'})"
					></div>
				{:else}
					<div
						class="absolute -top-4 left-0 h-4 w-2"
						style:background={[Position.ARRIVED, Position.DEPARTED].includes(
							next?.trainRelativePosition ?? 0
						)
							? color
							: color + 'B3'}
					></div>
				{/if}

				<div class="absolute -top-1.5 left-2 h-6 w-2 rotate-45" style:background="#d4d4d8"></div>
				<div class="absolute -top-4 right-0 h-4 w-2" style:background="#d4d4d8"></div>
			</div>
			{#if showDiv}
				<div class="mb-8 flex items-center gap-1 pl-6">Hide merge <ChevronUp size={18} /></div>
			{:else}
				<div class="mb-8 flex items-center gap-1 pl-6">Show merge <ChevronDown size={18} /></div>
			{/if}
		</button>
	{/if}
{/snippet}

{#if callingPoint.divisionType === 'join' && callingPoint.divisionCallingPoints && showJoin}
	{@render division('join', callingPoint.divisionCallingPoints)}
{/if}
<div class="flex h-14 w-full items-center gap-2 px-4">
	<div
		class={[
			'flex max-w-12 min-w-12 flex-col items-end justify-center pr-2',
			['previous', 'subsequent', 'further', 'destination'].includes(order) && 'opacity-60'
		]}
	>
		{#if !hideDetails}
			<TimeDisplay
				expected={order === 'previous' || order === 'focus'
					? callingPoint.times.estimated.departure
					: callingPoint.times.estimated.arrival}
				scheduled={order === 'previous' || order === 'focus'
					? callingPoint.times.scheduled.departure
					: callingPoint.times.scheduled.arrival}
				isCancelled={callingPoint.isCancelled}
			/>
		{/if}
	</div>
	<div class="relative flex h-full flex-col pr-2">
		{#if end === 'start' && !callingPoint.formedFrom}
			<div class="flex-grow"></div>
		{:else if [Position.ARRIVED, Position.DEPARTED].includes(callingPoint.trainRelativePosition)}
			<div class="w-2 flex-grow" style:background={color}></div>
		{:else}
			<div class="w-2 flex-grow" style:background={color + 'B3'}></div>
		{/if}
		<div
			class={['rounded-r', ['focus', 'filter'].includes(order) ? 'h-2 w-4' : 'h-1.5 w-4']}
			style:background={[Position.ARRIVED, Position.DEPARTED].includes(
				callingPoint.trainRelativePosition
			)
				? color
				: `${color}B3`}
		></div>

		{#if end === 'end' && !callingPoint.formedFrom}
			<div class="flex-grow"></div>
		{:else if [Position.DEPARTED].includes(callingPoint.trainRelativePosition)}
			{#if next && [Position.ARRIVED, Position.DEPARTED].includes(next.trainRelativePosition)}
				<div class="w-2 flex-grow" style:background={color}></div>
			{:else}
				<div
					class="w-2 flex-grow"
					style:background="linear-gradient(to bottom, {color}, {color}B3)"
				></div>
			{/if}
		{:else}
			<div class="w-2 flex-grow" style:background={color + 'B3'}></div>
		{/if}
		<!-- {#if callingPoint.trainRelativePosition === Position.ARRIVED}
			<div class="absolute top-1/2 -translate-y-1/2"><Train /></div>
		{:else if callingPoint.trainRelativePosition === Position.DEPARTED}
			<div class="absolute top-2/3"><Train /></div>
		{/if} -->
	</div>
	<div
		class={[
			['focus', 'filter'].includes(order)
				? 'text-base font-semibold md:text-lg'
				: order === 'destination'
					? 'text-sm text-black md:text-base'
					: 'text-foreground-muted/80 text-sm md:text-base',
			order === 'destination' && 'text-foreground font-medium',
			'w-0 flex-grow truncate'
		]}
	>
		<div class="flex w-full items-center gap-1 truncate">
			<div class="min-w-0 truncate">
				{callingPoint.name}
			</div>
			<span class="text-foreground-muted/80 text-xs font-light">({callingPoint.crs})</span>
		</div>
		{#if callingPoint.isCancelled}
			<div class="-mb-0.5 text-xs/4 text-red-600">Cancelled</div>
		{:else if order === 'focus'}
			<div class="-mb-0 flex gap-2 text-xs font-normal">
				<RelativeTimeDisplay
					arrival={callingPoint.times.estimated.arrival}
					departure={callingPoint.times.estimated.departure}
					position={callingPoint.trainRelativePosition}
				/>
			</div>
		{/if}
	</div>
	{#if !hideDetails}
		{#if callingPoint.loading}
			<div class="relative flex h-8 w-6 items-end">
				<div
					style:height="{callingPoint.loading}%"
					class="min absolute right-0 left-0 flex min-h-5 items-center justify-center"
				>
					<Users size={14} />
				</div>
				<div
					class="bg-background border-border min-h-2 w-6 rounded"
					style:height="{callingPoint.loading}%"
				>
					<div class={['h-full w-full rounded', loadPercentage(callingPoint.loading)]}></div>
				</div>
			</div>
		{/if}
		<div
			class={[
				'flex flex-col items-center',
				['previous', 'subsequent', 'further', 'destination'].includes(order) && 'opacity-60'
			]}
		>
			<div class="text-[10px]">Platform</div>
			<div class="bg-muted relative flex h-7 w-7 items-center justify-center rounded-full text-sm">
				{#if callingPoint.platform}
					{callingPoint.platform}
				{:else}
					<RttPlatform {uid} {sdd} crs={callingPoint.crs} />
				{/if}
			</div>
		</div>
	{/if}
</div>

{#if callingPoint.divisionType === 'divide' && callingPoint.divisionCallingPoints && showDivide}
	{@render division('divide', callingPoint.divisionCallingPoints)}
{/if}
