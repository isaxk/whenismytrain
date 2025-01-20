<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	let { children } = $props();

	let idk: HTMLDivElement;

	onMount(() => {
		// idk.addEventListener('touchstart', (e) => {
		// 	e.preventDefault();
		// });
	});
</script>

<div class="min-h-screen bg-white" data-vaul-drawer-wrapper>
	<div class="fixed bottom-0 left-0 top-0 w-5" bind:this={idk}></div>
	{@render children()}
</div>

<style lang="postcss">
	:global(body) {
		@apply overflow-y-scroll;
	}
</style>
