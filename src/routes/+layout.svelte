<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { fade } from 'svelte/transition';
	let { children, data } = $props();

</script>

{#key data.url}
	<div in:fade={{duration:200, delay: 200}} out:fade={{duration:150}} class="min-h-screen bg-zinc-50" data-vaul-drawer-wrapper>
		{@render children()}
	</div>
{/key}

<style lang="postcss">
	:global(body) {
		@apply overflow-y-scroll bg-zinc-50;
	}
</style>