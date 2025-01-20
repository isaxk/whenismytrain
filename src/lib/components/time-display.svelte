<script lang="ts">
	import { strToMins } from '$lib/utils';
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';

	let { et, st, small = false, isCancelled } = $props();

	dayjs.extend(duration);

	const diff = dayjs(et).diff(dayjs(st));
	const diffDuration = dayjs.duration(diff).asMinutes();

	function color(et: string, st: string) {
		if (diffDuration < 0) {
			return 'text-yellow-600';
		} else if (diffDuration < 2) {
			return 'text-green-600';
		} else if (diffDuration < 15) {
			return 'text-yellow-600';
		} else {
			return 'text-red-600';
		}
	}
	color(et, st);

	const displayST = $derived(dayjs(st).format('HH:mm'));
	const displayET = $derived(dayjs(et).format('HH:mm'));
</script>

<div class="flex flex-col items-end font-mono">
	{#if isCancelled}
		<div class={['text-red-600', small ? 'text-md' : 'text-lg']}>Cancelled</div>
		<div class="text-xs line-through">{displayST}</div>
	{:else if diffDuration < 0.5}
		<div class={['text-green-600', small ? 'text-md' : 'text-lg']}>{displayET}</div>
	{:else if et === 'Delayed'}
		<div class={['text-red-600', small ? 'text-md' : 'text-lg']}>?</div>
		<div class="text-xs">{displayST}</div>
	{:else}
		<div class={[small ? 'text-md' : 'text-lg', color(et, st)]}>{displayET}</div>
		<div class="text-xs line-through">{displayST}</div>
	{/if}
</div>
