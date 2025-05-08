<script lang="ts">
	import dayjs from 'dayjs';

	let { expected, scheduled, isCancelled } = $props();

	const delay = $derived(expected ? dayjs(expected).diff(dayjs(scheduled), 'minutes') : null);
	const expectedTime = $derived(expected ? dayjs(expected).format('HH:mm') : null);
	const scheduledTime = $derived(dayjs(scheduled).format('HH:mm'));
</script>

{#if isCancelled}
	<div class="font-normal text-red-600">{scheduledTime}</div>
{:else if delay === null}
	<div class="text-xs/3">
		{scheduledTime}
	</div>
	<div class="pb-0 text-xs/4 text-red-600">Delayed</div>
{:else if delay < -1}
	<div class="text-xs/3 line-through">
		{scheduledTime}
	</div>
	<div class="pb-0 text-base/4 text-yellow-600">{expectedTime}</div>
{:else if delay < 1}
	<div class="font-normal text-green-600">{expectedTime}</div>
{:else if delay < 3}
	<div class="text-xs/3 line-through">
		{scheduledTime}
	</div>
	<div class="pb-0 text-base/4 font-normal text-yellow-600">{expectedTime}</div>
{:else if delay < 8}
	<div class="text-xs/3 line-through">
		{scheduledTime}
	</div>
	<div class="pb-0 text-base/4 font-normal text-amber-600">{expectedTime}</div>
{:else if delay < 15}
	<div class="text-xs/3 line-through">
		{scheduledTime}
	</div>
	<div class="pb-0 text-base/4 font-normal text-red-600">{expectedTime}</div>
{:else}
	<div class="text-xs/3 line-through">
		{scheduledTime}
	</div>
	<div class="pb-0 text-base/4 font-normal text-red-800">{expectedTime}</div>
{/if}
