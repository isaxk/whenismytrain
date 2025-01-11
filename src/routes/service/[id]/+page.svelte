<script lang="ts">
	import CallingPoint from '$lib/components/calling-point.svelte';
	import TrainCard from '$lib/components/train-card.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	console.log(data);

	const destination: string =
		data.subsequentCallingPoints
			?.map((s) => {
				return s.callingPoint![s.callingPoint!.length - 1].locationName!;
			})
			.join() ?? '';
</script>

<div class="px-4">
	<TrainCard
		id={data.serviceID}
		{destination}
		platform={data.platform!}
		operator={data.operator!}
		etd={data.isCancelled ? 'Cancelled' : (data.etd ?? data.atd ?? 'On time')}
		std={data.std ?? ''}
		details={data}
		onservicedetails={() => {}}
	/>
</div>
<div class="flex flex-grow flex-col overflow-y-scroll py-4 pl-6 pr-4">
	{#each data.previousCallingPoints! as pcp}
		{#each pcp.callingPoint! as prev}
			<CallingPoint name={prev.locationName!} et={prev.et ?? 'On time'} st={prev.st!} />
		{/each}
	{/each}
	<CallingPoint future name={data.locationName!} et={data.etd ?? 'On time'} st={data.std!} />
	{#each data.subsequentCallingPoints! as scp}
		{#each scp.callingPoint! as point}
			<CallingPoint
				future
				name={point.locationName!}
				et={point.isCancelled ? 'Cancelled' : (point.et ?? 'On time')}
				st={point.st!}
			/>
		{/each}
	{/each}
</div>
