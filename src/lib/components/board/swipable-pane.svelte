<script lang="ts">
	import { goto } from '$app/navigation';
	import { dontMove } from '$lib/state/dont-move.svelte';
	import { pan, swipe, type PanCustomEvent } from 'svelte-gestures';
	import { Spring } from 'svelte/motion';
	import { MediaQuery } from 'svelte/reactivity';
	import { fade, fly } from 'svelte/transition';

	let { url, searchParams, children } = $props();

	const md = new MediaQuery('(min-width: 768px)');
	const coords = new Spring({ x: 0, y: 0, scale: 1 });
	let startX = $state(0);
	let startY = $state(0);

	function handlePan(e: PanCustomEvent) {
		if (!md.current && !dontMove.current) {
			const x = Math.max(-35, e.detail.x - startX) / 10;

			const y = Math.max(-5, e.detail.y - startY);
			coords.set({ x, y, scale: 1 });
			if (Math.sqrt(x * x + y * y) > 250) {
				goto(url + '?' + searchParams, { noScroll: true, replaceState: true });
			}
		}
	}
</script>

{#if !md.current}
	<div
		class="fixed inset-0 z-50 bg-black/80 backdrop-blur-[1px]"
		transition:fade|global={{ duration: 200 }}
	></div>
{/if}
<div
	use:pan={() => ({ delay: 50 })}
	use:swipe={() => ({ timeframe: 400, minSwipeDistance: 100 })}
	onpandown={(e) => {
		startX = e.detail.x;
		startY = e.detail.y;
	}}
	onpan={handlePan}
	onpanup={() => {
		coords.set({ x: 0, y: 0, scale: 1 });
	}}
	onswipe={(e) => {
		if (
			(e.detail.direction === 'right' || e.detail.direction === 'bottom') &&
			!md.current &&
			!dontMove.current
		) {
			goto(url + '?' + searchParams, { noScroll: true, replaceState: true });
		}
	}}
	out:fly={{ duration: 250, y: 500 }}
	in:fly={{ duration: 200, y: 500 }}
	style:transform="translate({coords.current.x}px, {coords.current.y}px)"
	class="top-drawer fixed right-0 bottom-0 left-0 z-50 flex min-w-0 flex-grow flex-col overflow-y-scroll md:static lg:h-full"
>
	<div class="h-full w-full">
		{@render children()}
	</div>
</div>
