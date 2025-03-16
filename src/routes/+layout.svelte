<script lang="ts">
	import '../app.css';
	let { children } = $props();

	import { onDestroy, onMount } from 'svelte';
	import { updateLocation } from '$lib/data/location.svelte';
	import { refresher } from '$lib/state/refresh.svelte';
	import { onNavigate } from '$app/navigation';

	onMount(() => {
		updateLocation();
		refresher.init(10000);
	});

	onDestroy(() => {
		refresher.clear();
	});

	onNavigate(() => {
		refresher.reset();
	});
</script>

<div class="bg-background text-foreground min-h-screen w-full">
	{@render children()}
	<!-- <div class="bg-background fixed right-0 bottom-0 left-0 z-50 h-20"></div> -->
</div>
