<script lang="ts">
	import { strToMins } from '$lib/utils';

	let { et, st, small = false } = $props();

	function color(et: string, st: string) {
		const diff = strToMins(et) - strToMins(st);

		if (diff < 1) {
			return 'text-yellow-600';
		} else if (diff < 2) {
			return 'text-green-600';
		} else if (diff < 15) {
			return 'text-yellow-600';
		} else {
			return 'text-red-600';
		}
	}
</script>

<div class="flex flex-col items-end font-mono">
	{#if et === 'On time'}
		<div class={['text-green-600', small ? 'text-md' : 'text-lg']}>{st}</div>
	{:else if et === 'Delayed'}
		<div class={['text-red-600', small ? 'text-md' : 'text-lg']}>?</div>
		<div class="text-xs">{st}</div>
	{:else if et === 'Cancelled'}
		<div class={['text-red-600', small ? 'text-md' : 'text-lg']}>Cancelled</div>
		<div class="text-xs">{st}</div>
	{:else}
		<div class={[small ? 'text-md' : 'text-lg', color(et, st)]}>{et}</div>
		<div class="text-xs line-through">{st}</div>
	{/if}
</div>
