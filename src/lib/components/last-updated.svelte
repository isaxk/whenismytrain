<script lang="ts">
	import dayjs from 'dayjs';
	import { onDestroy, onMount } from 'svelte';

	let { date } = $props();

	let display = $state(0);

	let interval;

	onMount(() => {
		interval = setInterval(() => {
			const now = dayjs();
			const last = dayjs(date);
			const diff = now.diff(last, 'seconds');
			display = diff;
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="text-xs">
	last updated {display} seconds ago
</div>
