<script lang="ts">
	import type { Details } from '$lib/types/board';
	import { ArrowLeft } from 'lucide-svelte';

	let { details }: { details: Details } = $props();
</script>

<div class="z-[1000] p-4">
	<a href="/" class="flex pb-4"><ArrowLeft /></a>
	<div class="text-4xl font-medium">{details.name}</div>
	{#if details.filterName}
		<div class="text-lg font-medium">to {details.filterName}</div>
	{:else}
		to All Destinations
	{/if}
</div>
