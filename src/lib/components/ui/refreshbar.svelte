<script>
	import { navigating } from '$app/state';
	import { refresherVals } from '$lib/state/refresh.svelte';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';

	let { color = '' } = $props();

	let now = $state(dayjs());

	const progress = $derived(now.diff(refresherVals.lastRefreshed, 'ms') ?? 0);

	const tween = new Tween(0, { duration: 200 });

	$effect(() => {
		console.log(refresherVals.interval);
		tween.set(refresherVals.isRefreshing ? 0 : progress / (refresherVals.interval - 250));
	});

	onMount(() => {
		const intervalTimer = setInterval(() => {
			if (tween.target !== 0) {
				now = dayjs();
			}
		}, 100);
		return () => clearInterval(intervalTimer);
	});
</script>

<div class="z-0 h-0.5 min-h-0.5 w-full">
	<div
		style:background-color={color}
		class={[
			'h-full bg-blue-500 opacity-50 transition-[animation]',
			refresherVals.isRefreshing || (navigating.to && 'animate-pulse')
		]}
		style:width="{(1 - tween.current) * 100}%"
	></div>
</div>
