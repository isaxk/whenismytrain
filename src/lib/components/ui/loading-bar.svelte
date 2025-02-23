<script lang="ts">
	import { navigating } from '$app/state';
	import { fade } from 'svelte/transition';
</script>

{#if navigating.to}
	<div
		in:fade={{ duration: 50, delay: 50 }}
		out:fade={{ duration: 50 }}
		class="h-0.5 w-full animate-pulse bg-blue-400"
	></div>
{/if}
