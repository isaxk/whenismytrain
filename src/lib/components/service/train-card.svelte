<script lang="ts">
	import { pushState } from '$app/navigation';
	import { operatorList } from '$lib/data/operators';
	import { getServiceDetails } from '$lib/data/service-details';
	import type { definitions } from '$lib/types/api';
	import { Dam, List } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { inview } from 'svelte-inview';
	import { fade } from 'svelte/transition';
	import TimeDisplay from './time-display.svelte';
	import Disruption from '../service/disruption.svelte';
	import { Status } from '$lib/types';

	let {
		id,
		destination,
		operator,
		platform,
		state,
		etd,
		std,
		isCancelled,
		disruptionCode = null,
		details = false,
		focus = null,
		onservicedetails
	}: {
		id: string;
		destination: string;
		operator: string;
		platform: string | null;
		state: Status;
		etd: string;
		std: string;
		isCancelled: boolean;
		disruptionCode: number | null;
		details?: boolean;
		focus?: string;
		onservicedetails: (id: string) => void;
	} = $props();
</script>

<button
	onclick={() => {
		onservicedetails(id);
	}}
	use:inview
	class={[
		'relative flex w-full min-w-0 flex-col items-center justify-center gap-2 py-4',
		details ? 'border-b px-0 pr-2' : 'px-4'
	]}
>
	{#if !details}
		<div
			class="absolute -bottom-1 left-0 top-0 z-40 flex w-1.5 items-center text-xs"
			style:background={operatorList[operator].bg}
		></div>
	{/if}
	<div class="flex w-full items-center gap-3 pl-2 md:gap-4">
		<div class={['flex flex-col items-center']}>
			<div class="text-[10px] font-light">Platform</div>
			<div
				class={[
					'flex h-8 w-8 items-center justify-center rounded-full border drop-shadow-sm',
					platform ? 'bg-zinc-100' : 'bg-background text-zinc-400'
				]}
			>
				<div class={['font-bold', (platform ?? '?').length > 2 ? 'text-md' : 'max-w-lg']}>
					{platform ?? '?'}
				</div>
			</div>
		</div>
		<div class="flex-grow text-left">
			<div
				class={[
					'line-clamp-2 overflow-hidden text-ellipsis text-xl font-semibold leading-6',
					isCancelled && 'line-through'
				]}
			>
				{destination}
			</div>
			<div class="-mb-1 text-xs font-medium italic text-zinc-800">
				{#if state === Status.STARTS_HERE}
					<span class="font-light italic text-zinc-500">Starts Here</span>
				{:else if state === Status.ARRIVED}
					Arrived {#if details}
						<span class="font-light italic text-zinc-500">
							at {focus}
						</span>
					{/if}
				{:else if state === Status.DEPARTED}
					Departed {#if details}
						<span class="font-light italic text-zinc-500">
							from {focus}
						</span>
					{/if}
				{:else if details}
					<span class="font-light italic text-zinc-500">
						Departing {focus} at:
					</span>
				{/if}
			</div>
		</div>
		<div class="flex flex-col items-end">
			<TimeDisplay {isCancelled} et={etd ?? 'Delayed'} st={std} />
		</div>
	</div>
	{#if disruptionCode}
		<Disruption code={disruptionCode} {isCancelled} />
	{/if}
</button>
