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
		etd: string;
		std: string;
		isCancelled: boolean;
		disruptionCode: number | null;
		details?: definitions['ServiceDetails'] | null;
		onservicedetails: (id: string) => void;
	} = $props();

	console.log(disruptionCode)
</script>

<button
	onclick={() => {
		onservicedetails(id);
	}}
	use:inview
	class="flex w-full min-w-0 flex-col items-center gap-2 rounded-lg border bg-white p-4 drop-shadow"
>
	<div class="flex w-full items-center gap-4">
		<div class={['flex flex-col items-center']}>
			<div class="text-[12px] font-light">Platform</div>
			<div
				class={[
					'flex h-9 w-9 items-center justify-center rounded-full border drop-shadow-sm',
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
					'line-clamp-2 overflow-hidden text-ellipsis pb-1 text-xl font-semibold leading-6',
					isCancelled && 'line-through'
				]}
			>
				{destination}
			</div>
			<div
				class="w-max rounded px-2 py-0.5 text-[10px]"
				style:color={operatorList[operator]?.text}
				style:background={operatorList[operator]?.bg}
			>
				{operatorList[operator]?.name ?? ''}
			</div>
		</div>
		<TimeDisplay {isCancelled} et={etd} st={std} />
	</div>
	{#if disruptionCode}
	<Disruption code={disruptionCode} {isCancelled} />
	{/if}
</button>
