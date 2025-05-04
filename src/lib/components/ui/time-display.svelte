<script lang="ts">
	import dayjs from 'dayjs';

	let { expected, scheduled, isCancelled } = $props();

	const delay = $derived(expected ? dayjs(expected).diff(dayjs(scheduled), 'minutes') : null);
	const expectedTime = $derived(expected ? dayjs(expected).format('HH:mm') : null);
	const scheduledTime = $derived(dayjs(scheduled).format('HH:mm'));
</script>

<div class="flex w-12 flex-col items-center justify-center">
	{#if isCancelled}
		<div class="font-medium text-red-600">{scheduledTime}</div>
	{:else if delay === null}
		<div class="text-sm">
			{scheduledTime}
		</div>
		<div class="text-xs text-red-600">Delayed</div>
	{:else if delay < 1}
		<div class="font-medium text-green-600">{expectedTime}</div>
	{:else if delay < 3}
		<div class="text-sm line-through">
			{scheduledTime}
		</div>
		<div class="text-base/4 text-yellow-600">{expectedTime}</div>
	{:else if delay < 8}
		<div class="text-sm line-through">
			{scheduledTime}
		</div>
		<div class="text-base/4 font-medium text-amber-600">{expectedTime}</div>
	{:else if delay < 15}
		<div class="text-sm line-through">
			{scheduledTime}
		</div>
		<div class="text-base/4 font-medium text-red-600">{expectedTime}</div>
	{:else}
		<div class="text-sm line-through">
			{scheduledTime}
		</div>
		<div class="text-base/4 font-medium text-red-800">{expectedTime}</div>
	{/if}
</div>
