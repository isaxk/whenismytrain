<script lang="ts">
	import dayjs, { duration } from 'dayjs';
	import { onMount } from 'svelte';
	import { quartInOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	let { interval, genAt, refreshing } = $props();

	const genAtDate = $derived(dayjs(genAt));
	const refreshDate = $derived(genAtDate.add(interval, 'seconds'));
	const genAtFromRefresh = $derived(genAtDate.diff(refreshDate, 'milliseconds'));

	let progress = new Tween(0, { duration: 175 });

	onMount(() => {
		const intervalId = setInterval(() => {
			const genAtFromNow = genAtDate.diff(dayjs(), 'milliseconds');
			if (progress.target !== 0 || !refreshing) {
				progress.set(refreshing ? 0 : genAtFromNow / genAtFromRefresh);
			}
		}, 1);
		return () => clearInterval(intervalId);
	});
</script>

<div
	class={['relative min-h-0.5 w-full transition-all duration-1000', refreshing && 'animate-pulse']}
>
	<div
		transition:fade={{ duration: 200 }}
		class={['absolute bottom-0 left-0 top-0 h-full rounded bg-blue-300']}
		style:width="{(1 - progress.current) * 100}%"
	></div>
</div>
