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
	import Disruption from './service/disruption.svelte';

	let {
		id,
		destination,
		operator,
		platform,
		state = 'far',
		etd,
		std,
		isCancelled,
		disruptionCode = null,
		details = null,
		onservicedetails
	}: {
		id: string;
		destination: string;
		operator: string;
		platform: string | null;
		state: 'far' | 'here' | 'gone';
		etd: string;
		std: string;
		isCancelled: boolean;
		disruptionCode: number | null;
		details?: definitions['ServiceDetails'] | null;
		onservicedetails: (id: string) => void;
	} = $props();

	console.log(disruptionCode);
</script>

<button
	onclick={() => {
		onservicedetails(id);
	}}
	use:inview
	class="relative flex w-full min-w-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border bg-white p-4 drop-shadow"
>
	<div
		class="absolute bottom-1 left-1 top-1 flex w-1.5 items-center rounded-lg text-xs"
		style:background={operatorList[operator].bg}
	></div>
	<div class="flex w-full items-center gap-3 pl-2 md:gap-4">
		<div class={['flex flex-col items-center']}>
			<div class="text-[10px] font-light">Platform</div>
			<div
				class={[
					'flex h-8 w-8 items-center justify-center rounded-full border drop-shadow-sm',
					platform ? 'bg-zinc-100' : 'bg-zinc-50 text-zinc-400'
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
			<div class="text-xs -mb-1 text-zinc-800">
				{#if state === 'here'}
					Arrived
				{:else if state === 'gone'}
					Departed
				{/if}
			</div>
		</div>
		<div class="flex flex-col items-end">
			
			<TimeDisplay {isCancelled} et={etd} st={std} />
		</div>
	</div>
	{#if disruptionCode}
		<Disruption code={disruptionCode} {isCancelled} />
	{/if}
</button>
