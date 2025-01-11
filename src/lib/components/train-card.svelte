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

	let {
		id,
		destination,
		operator,
		platform,
		etd,
		std,
		details = null,
		onservicedetails
	}: {
		id: string;
		destination: string;
		operator: string;
		platform: string;
		etd: string;
		std: string;
		details?: definitions['ServiceDetails'] | null;
		onservicedetails: (id: string, details: definitions['ServiceDetails']) => void;
	} = $props();

	let serviceDetails: definitions['ServiceDetails'] | null = $state(details);

	async function fetchServiceDetails() {
		serviceDetails = await getServiceDetails(id);
	}
</script>

<button
	onclick={() => {
		if (serviceDetails && !details) {
			onservicedetails(id, serviceDetails);
		}
	}}
	use:inview
	oninview_enter={fetchServiceDetails}
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
				<div class="text-lg font-bold">{platform ?? '?'}</div>
			</div>
		</div>
		<div class="flex-grow text-left">
			<div class="text-2xl font-semibold">
				{destination}
			</div>
			<div
				class="w-max rounded px-2 py-0.5 text-[11px]"
				style:color={operatorList[operator]?.text}
				style:background={operatorList[operator]?.bg}
			>
				{operator}
			</div>
		</div>
		<TimeDisplay et={etd} st={std} />
	</div>
	<div class="h-3 w-full">
		{#if serviceDetails}
			{@const list = serviceDetails.subsequentCallingPoints[0].callingPoint.slice(0, 5) ?? []}
			<div
				in:fade={{ duration: 75 }}
				class="w-full overflow-x-hidden text-ellipsis text-nowrap text-left text-sm text-zinc-500"
			>
				{#each list as point, i}
					<span>
						{point.locationName}{#if i < list.length - 1},&nbsp;{/if}
					</span>
				{/each}
			</div>
		{/if}
	</div>
</button>
