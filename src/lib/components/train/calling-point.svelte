<script lang="ts">
	import type { CallingPoint } from '$lib/types/train';
	import { slide } from 'svelte/transition';
	import TimeDisplay from '../ui/time-display.svelte';
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import RelativeTimeDisplay from '../ui/relative-time-display.svelte';
	import RttPlatform from './rtt-platform.svelte';

	let {
		i,
		callingPoint,
		color,
		order,
		end = null,
		uid,
		sdd,
		hideDetails = false
	}: {
		i: number;
		callingPoint: CallingPoint;
		color: string;
		order: 'previous' | 'focus' | 'subsequent' | 'filter' | 'further' | 'destination';
		end?: 'start' | 'end' | null;
		uid: string;
		sdd: string;
		hideDetails?: boolean;
	} = $props();

	let showDiv = $state(false);

	console.log(uid);
</script>

{#if callingPoint.formedFrom && !callingPoint.division}
	<a
		href="/board/{callingPoint.formedFrom.origin.crs}/{callingPoint.formedFrom.id}"
		class="flex h-14 items-center gap-2 px-4"
	>
		<div class="min-w-14"></div>
		<div class="flex h-full flex-col pr-3">
			<div class="w-2 flex-grow" style:background={color}></div>
		</div>
		<div class="text-xs">
			Divides from a train from {callingPoint.formedFrom.origin.name} to {callingPoint.formedFrom
				.destination.name}
		</div>
	</a>
{/if}
<div class="flex h-14 items-center gap-2 px-4">
	<div
		class={[
			'min-w-14',
			['previous', 'subsequent', 'further', 'destination'].includes(order) && 'opacity-60'
		]}
	>
		{#if !hideDetails}
			<TimeDisplay
				expected={order === 'previous' || order === 'focus'
					? (callingPoint.times.estimated.departure ?? callingPoint.times.estimated.arrival)
					: (callingPoint.times.estimated.arrival ?? callingPoint.times.estimated.departure)}
				scheduled={order === 'previous' || order === 'focus'
					? (callingPoint.times.scheduled.departure ?? callingPoint.times.scheduled.arrival)
					: (callingPoint.times.scheduled.arrival ?? callingPoint.times.scheduled.departure)}
				isCancelled={callingPoint.isCancelled}
			/>
		{/if}
	</div>
	<div class="flex h-full flex-col pr-2">
		{#if end === 'start' && !callingPoint.formedFrom}
			<div class="flex-grow"></div>
		{:else}
			<div class="w-2 flex-grow" style:background={color}></div>
		{/if}
		<div
			class={['rounded-r', ['focus', 'filter'].includes(order) ? 'h-2 w-4' : 'h-1.5 w-4']}
			style:background={color}
		></div>
		{#if end === 'end'}
			<div class="flex-grow"></div>
		{:else}
			<div class="w-2 flex-grow" style:background={color}></div>
		{/if}
	</div>
	<div
		class={[
			['focus', 'filter'].includes(order)
				? 'text-base font-semibold md:text-lg'
				: order === 'destination'
					? 'text-sm text-black md:text-base'
					: 'text-foreground-muted/80 text-sm md:text-base',
			order === 'destination' && 'text-foreground font-medium',
			'flex-grow'
		]}
	>
		<div class="">
			{callingPoint.name}
			<span class="text-foreground-muted/80 text-xs font-light">({callingPoint.crs})</span>
		</div>
		{#if callingPoint.isCancelled}
			<div class="-mb-0.5 text-xs/4 text-red-600">Cancelled</div>
		{:else if order === 'focus'}
			<div class="-mb-0.5 font-normal">
				<RelativeTimeDisplay
					arrival={callingPoint.times.estimated.arrival}
					departure={callingPoint.times.estimated.departure}
					position={callingPoint.trainRelativePosition}
				/>
			</div>
		{/if}
	</div>
	{#if !hideDetails}
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
{#if callingPoint.division}
	{@const dest =
		callingPoint.division.callingPoints[callingPoint.division.callingPoints.length - 1]}
	<div class={['flex items-center gap-2 px-4', showDiv ? 'h-10' : 'h-8']}>
		<div class="w-14 pl-1"></div>
		<div class="relative flex h-full flex-col pr-0">
			<div class="h-5 w-2" style:background={color}></div>
			{#if showDiv}
				<div
					class="absolute top-5 h-6 w-2"
					style:background="linear-gradient(to bottom, {color}, transparent)"
				></div>
			{:else}
				<div class="h-5 w-2 flex-grow" style:background={color}></div>
			{/if}
		</div>
		<div class="relative h-5">
			<div
				style:background={color}
				class="h-[130%] w-2 -translate-x-2 translate-y-[0.45rem] -rotate-45"
			></div>
			<div class="absolute top-[26px] h-6 w-2" style:background={color}></div>
		</div>
	</div>
	{#if showDiv}
		<div transition:slide={{ duration: 200 }}>
			{#each callingPoint.division.callingPoints.slice(1, -1) as divPoint, i (divPoint.tiploc + i)}
				<div class="flex h-14 items-center gap-2 px-4">
					<div class="w-18 pl-4 opacity-60">
						<TimeDisplay
							expected={divPoint.times.estimated.arrival}
							scheduled={divPoint.times.scheduled.arrival}
							isCancelled={divPoint.isCancelled}
						/>
					</div>
					<div class="flex h-full flex-col pr-2">
						<div class="w-2 flex-grow" style:background={color}></div>
						<div
							class={['rounded-r', ['focus', 'filter'].includes(order) ? 'h-2 w-4' : 'h-1.5 w-4']}
							style:background={color}
						></div>
						{#if i === callingPoint.division.callingPoints.length - 1}
							<div class="flex-grow"></div>
						{:else}
							<div class="w-2 flex-grow" style:background={color}></div>
						{/if}
					</div>
					<div
						class={[
							'text-foreground-muted/70',
							'text-foreground flex-grow text-sm font-medium md:text-base'
						]}
					>
						{divPoint.name}
						<span class="text-foreground-muted/80 text-xs font-light">({divPoint.crs})</span>
					</div>
					<div class="flex flex-col items-center opacity-60">
						<div class="text-[10px]">Platform</div>
						<div
							class="bg-muted relative flex h-7 w-7 items-center justify-center rounded-full text-sm"
						>
							{divPoint.platform ?? '?'}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
	<button
		onclick={() => (showDiv = !showDiv)}
		class={['text-foreground-tint flex h-6 items-center gap-2 px-4']}
	>
		{#if !showDiv}
			<div class="w-14"></div>
			<div class="flex h-full flex-col pr-0">
				<div class="w-2 flex-grow" style:background={color}></div>
			</div>
			<div class="flex h-full flex-col pr-4">
				<div class="w-2 flex-grow" style:background={color}></div>
			</div>
			<div class="flex items-center gap-1">
				Show division <ChevronDown size={20} />
			</div>
		{:else}
			<div class="w-18"></div>
			<div class="flex h-full flex-col pr-4">
				<div class="w-2 flex-grow" style:background={color}></div>
			</div>
			<div class="flex items-center gap-1">
				Hide division <ChevronUp size={20} />
			</div>
		{/if}
	</button>

	<div class="flex h-14 items-center gap-2 px-4">
		{#if !showDiv}
			<div class="w-14"></div>
			<div class="flex h-full flex-col pr-0">
				<div class="w-2 flex-grow" style:background={color}></div>
			</div>
			<div class="flex h-full flex-col pr-0">
				<div class="w-2 flex-grow" style:background={color}></div>
				<div class="flex h-full flex-col pr-2">
					<div class="w-2 flex-grow" style:background={color}></div>
					<div
						class={['rounded-r', ['focus', 'filter'].includes(order) ? 'h-2 w-4' : 'h-1.5 w-4']}
						style:background={color}
					></div>
					<div class="flex-grow"></div>
				</div>
				<div class="flex-grow"></div>
			</div>
		{:else}
			<div class="relative w-18 pl-4">
				<TimeDisplay
					expected={dest.times.estimated.arrival}
					scheduled={dest.times.scheduled.arrival}
					isCancelled={dest.isCancelled}
				/>
				<div
					class="absolute right-0 -bottom-7 h-5 w-2 flex-grow"
					style:background="linear-gradient(to top, {color}, transparent)"
				></div>
			</div>
			<div class="flex h-full flex-col pr-0">
				<div class="w-2 flex-grow" style:background={color}></div>
				<div class="flex h-full flex-col pr-2">
					<div class="w-2 flex-grow" style:background={color}></div>
					<div
						class={['rounded-r', ['focus', 'filter'].includes(order) ? 'h-2 w-4' : 'h-1.5 w-4']}
						style:background={color}
					></div>
					<div class="flex-grow"></div>
				</div>
				<div class="flex-grow"></div>
			</div>
		{/if}
		<div class={['text-foreground flex-grow text-sm font-medium md:text-base']}>
			{dest.name} <span class="text-foreground-muted/80 text-xs font-light">({dest.crs})</span>
		</div>
		{#if showDiv}
			<div class="flex flex-col items-center">
				<div class="text-[10px]">Platform</div>
				<div
					class="bg-muted relative flex h-7 w-7 items-center justify-center rounded-full text-sm"
				>
					{dest.platform ?? '?'}
				</div>
			</div>
		{/if}
	</div>
	{#if showDiv}
		<div class="h-3"></div>
	{/if}
{/if}
