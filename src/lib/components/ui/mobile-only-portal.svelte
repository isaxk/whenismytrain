<script>
	import { Portal } from 'bits-ui';
	import { MediaQuery } from 'svelte/reactivity';

	let { children } = $props();

	const md = new MediaQuery('(max-width: 768px)');
</script>

{#if md.current}
	{@render children()}
{:else}
	<Portal>{@render children()}</Portal>
{/if}
