<script lang="ts">
	import type { Train } from '$lib/types/train';
	import { Spring } from 'svelte/motion';
	import TrainCard from '../train/train-card.svelte';
	import ServiceDetails from '../../../routes/service/[id]/[crs]/+page.svelte';
	import { preloadData, pushState } from '$app/navigation';
	import PaneContent from './pane-content.svelte';
	import { fade, scale, slide } from 'svelte/transition';
	import { pan, swipe } from 'svelte-gestures';
	import { operatorList } from '$lib/data/operators';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { throttle } from '$lib/utils/fn';
	import { receive, send } from '$lib/utils/transitions';

	let { train, crs, root }: { train: Train; crs: string; root: HTMLDivElement } = $props();

	let open = $derived(page.state.selected?.id === train.id);
	let fixed = $state(false);
	let coords = new Spring({ x: 0, y: 0, h: 0, scale: 1 });
	let startX = 0;
	let startY = 0;
	let elm: HTMLDivElement | null = $state(null);
	let swiped = $state(false);
	let data: Promise<
		| {
				type: 'loaded';
				status: number;
				data: Record<string, any>;
		  }
		| {
				type: 'redirect';
				location: string;
		  }
	> | null = $state(null);

	let pythag = $derived(Math.sqrt(coords.current.x ** 2 + coords.current.y ** 2));

	function handlePan(e) {
		if (!swiped) {
			const scale = Math.min(1, 1 - (pythag / 600) * 0.9);
			const x = Math.max(-35, e.detail.x - startX);
			const y = Math.max(-5, e.detail.y - startY);
			coords.set({ x, y, h: coords.current.h, scale });
			if (Math.sqrt(y ** 2 + x ** 2) > 150) {
				closePane();
			}
		}
	}

	function openPane() {
		pushState(`/service/${train.id}/${crs}`, { selected: train });
		let boundingBox = elm?.getBoundingClientRect();
		fixed = true;

		coords.set(
			{ x: boundingBox!.x, y: boundingBox!.y, h: boundingBox!.height, scale: 1 },
			{ instant: true }
		);
		const y = window.scrollY ?? 0;
		console.log(y);
		root.style.position = 'fixed';
		root.style.top = `-${y}px`;
		root.style.right = '0';
		root.style.left = '0';
		coords.set({ x: 0, y: 0, h: window.innerHeight, scale: 1 });
	}
	const closePane = () => {
		if (!swiped) {
			let boundingBox = elm?.getBoundingClientRect();
			history.back();
			swiped = true;
			coords
				.set({ x: boundingBox!.x, y: boundingBox!.y, h: boundingBox!.height, scale: 1 })
				.then(() => {
					fixed = false;
					swiped = false;
					const scrollY = root.style.top;
					root.style.position = '';
					root.style.top = '';

					window.scrollTo(0, parseInt(scrollY || '0') * -1);
				});
		}
	};

	// $effect(() => {
	// 	if (page.state.selected?.id !== train.id && fixed) {
	// 		let boundingBox = elm?.getBoundingClientRect();
	// 		const distance = Math.abs(
	// 			Math.sqrt(
	// 				(boundingBox!.x - coords.current.x) ** 2 + (boundingBox!.y - coords.current.y) ** 2
	// 			)
	// 		);
	// 		console.log(distance);
	// 		if (distance < 1) {
	// 		}
	// 	}
	// });

	onMount(() => {
		window.addEventListener(
			'touchstart',
			(e) => {
				const touch = e.touches[0];
				if (
					(touch.clientX < window.innerWidth * 0.1 || touch.clientX > window.innerWidth * 0.9) &&
					fixed
				) {
					console.log('touchstart');
					e.preventDefault();
				}
			},
			{ passive: false }
		);
	});

	let trainCard = $state(null);
</script>

<div
	bind:this={elm}
	class={[
		'group even:bg-muted border-border odd:bg-background relative h-20 w-full border-t text-left transition-all duration-200 last:border-b'
	]}
>
	<div
		class="absolute top-0 -bottom-1 left-0 z-10 w-1.5"
		style:background={operatorList[train.operator].bg}
	></div>
	{#if fixed}
		<div
			in:fade={{ duration: 200 }}
			out:fade={{ duration: 200 }}
			class="fixed inset-0 z-10 bg-black/40 backdrop-blur-[1px] transition-all duration-300"
			style:opacity={page.state.selected?.id === train.id ? 1 : 0}
		></div>
		<div
			use:pan={() => ({ delay: 0 })}
			use:swipe={() => ({ timeframe: 300, minSwipeDistance: 60 })}
			onswipe={(e) => {
				if (e.detail.direction === 'right' || e.detail.direction === 'bottom') {
					closePane();
				}
			}}
			onpan={handlePan}
			onpandown={(e) => {
				startX = e.detail.x;
				startY = e.detail.y;
			}}
			onpanup={() => {
				if (!swiped) {
					coords.set({ x: 0, y: 0, h: window.innerHeight, scale: 1 });
				}
			}}
			class={[
				'bg-background flex w-full flex-col overflow-hidden transition-[border-radius] select-none',
				fixed && 'fixed z-40',
				pythag > 10 && (open ? 'rounded-2xl drop-shadow-xl' : 'rounded-none drop-shadow-none')
			]}
			style:left="{coords.current.x + (page.state.selected?.id === train.id ? 0 : 6)}px"
			style:top="{coords.current.y}px"
			style:height="{coords.current.h}px"
			style:transform="scale({coords.current.scale})"
			style:opacity={coords.current.scale * 1.1}
		>
			{#if page.state.selected?.id === train.id}
				<div class="pt-safe border-border flex min-h-14 items-center pb-4">
					<button onclick={closePane} class="w-20">Close</button>
					<div class="flex-grow text-center font-semibold">Service Details</div>
					<div class="w-20"></div>
				</div>
			{/if}
			<div
				class={[
					'flex h-20 transition-all',
					page.state.selected?.id !== train.id && 'group-even:bg-muted group-odd:bg-background'
				]}
			>
				<div class="flex-grow">
					<TrainCard train={train ?? trainCard} />
				</div>
				{#if swiped}
					<div class="w-1.5"></div>
				{/if}
			</div>
			{#if page.state.selected?.id === train.id}
				<div class="min-h-0 flex-grow pl-1.5" out:fade={{ duration: 300 }}>
					<PaneContent {train} {crs} />
				</div>
			{/if}
		</div>
	{:else}
		<button class="h-full w-full pl-1.5 text-left" onclick={openPane}>
			<TrainCard train={train ?? trainCard} />
		</button>
	{/if}
</div>
