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
	{@render children()}
</div>

<style lang="postcss">
	:global(body) {
		@apply overflow-y-scroll;
	}
</style>
