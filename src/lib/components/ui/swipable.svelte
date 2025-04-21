<script lang="ts">
	import { browser } from '$app/environment';
	import { onNavigate, pushState } from '$app/navigation';
	import { page } from '$app/state';
	import { dontMove } from '$lib/state/dont-move.svelte';
	import { ChevronDown, X } from 'lucide-svelte';
	import { onMount, untrack, type Snippet } from 'svelte';
	import { pan, swipe, type PanCustomEvent } from 'svelte-gestures';
	import { Spring, Tween } from 'svelte/motion';
	import { MediaQuery } from 'svelte/reactivity';
	import { fade, slide } from 'svelte/transition';

	let {
		rootElm,
		desktopWidth = 600,
		desktopHeight = 700,
		children,
		title,
		action,
		key,
		url,
		containerClass: className,
		persistClass: triggerClassName,
		contentClass: contentClassName
	}: {
		desktopWidth?: number;
		desktopHeight?: number;
		rootElm: HTMLElement;
		children: Snippet<[boolean, boolean]>;
		title: Snippet;
		action?: Snippet;
		key: string;
		url: string;
		containerClass: string;
		persistClass: string;
		contentClass: string;
	} = $props();

	let open = $derived(page.state.selected === key);

	let containerElm: HTMLDivElement;
	let fixed = $state(false);
	let swiped = $state(false);
	let boundingBox: DOMRect | null = $state(null);

	let startX = 0;
	let startY = 0;
	let coords = new Spring({ x: 0, y: 0, h: 0, w: 0, scale: 1 });
	let titleHeight = $state(0);
	let distanceDragged = $derived(Math.sqrt(coords.current.x ** 2 + coords.current.y ** 2));
	let openProgress = $derived.by(() => {
		if (browser) {
			const h = md.current ? desktopHeight : window.innerHeight;
			return coords.current.h / h;
		} else {
			return 1;
		}
	});

	const md = new MediaQuery('min-width: 768px');

	let previouslyOpened = false;

	function handlePan(e: PanCustomEvent) {
		if (!swiped && !md.current && !dontMove.current) {
			const scale = Math.min(1, 1 - (distanceDragged / 600) * 0.9);
			const x = Math.max(-35, e.detail.x - startX);
			const y = Math.max(-5, e.detail.y - startY);
			coords.set({ x, y, h: coords.current.h, w: coords.current.w, scale });
			if (Math.sqrt(y ** 2 + x ** 2) > 150) {
				closePane();
			}
		}
	}

	onNavigate((e) => {});

	function explicitEffect(fn, depsFn) {
		$effect(() => {
			depsFn();
			untrack(fn);
		});
	}

	explicitEffect(
		() => {
			if (open) {
				fixed = true;
				previouslyOpened = true;
				if (boundingBox) {
					coords.set(
						{
							x: boundingBox?.x,
							y: boundingBox?.y,
							h: boundingBox?.height,
							w: boundingBox?.width,
							scale: 1
						},
						{ instant: true }
					);
				}
				const y = window.scrollY ?? 0;
				rootElm.style.position = 'fixed';
				rootElm.style.top = `-${y}px`;
				rootElm.style.right = '0';
				rootElm.style.left = '0';
				coords.set({
					x: md.current ? window.innerWidth - window.innerWidth / 2 - desktopWidth / 2 : 0,
					y: md.current ? window.innerHeight - window.innerHeight / 2 - desktopHeight / 2 : 0,
					h: md.current ? desktopHeight : window.innerHeight,
					w: md.current ? desktopWidth : window.innerWidth,
					scale: 1
				});
			} else {
				if (previouslyOpened) {
					swiped = true;

					if (boundingBox) {
						coords
							.set({
								x: boundingBox?.x,
								y: boundingBox?.y,
								h: boundingBox?.height,
								w: boundingBox?.width,
								scale: 1
							})
							.then(() => {
								fixed = false;
								swiped = false;
								const scrollY = rootElm.style.top;
								rootElm.style.position = '';
								rootElm.style.top = '';

								window.scrollTo(0, parseInt(scrollY || '0') * -1);
							});
					} else {
						fixed = false;
						swiped = false;
						const scrollY = rootElm.style.top;
						rootElm.style.position = '';
						rootElm.style.top = '';

						window.scrollTo(0, parseInt(scrollY || '0') * -1);
					}
				}
			}
		},
		() => open
	);

	onMount(() => {
		boundingBox = containerElm.getBoundingClientRect();
	});

	function openPane() {
		pushState(url, { selected: key });
	}

	function closePane() {
		history.back();
	}
</script>

<svelte:window
	onscroll={() => {
		boundingBox = containerElm.getBoundingClientRect();
	}}
/>

<div bind:this={containerElm} class={['relative', className]}>
	{#if fixed}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		{#if open && !swiped}
			<div
				onclick={closePane}
				in:fade|global={{ duration: md.current ? 400 : 200, delay: md.current ? 0 : 180 }}
				out:fade|global={{ duration: 400, delay: 0 }}
				class="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] transition-all duration-400"
			></div>
		{/if}
		<div
			use:pan={() => ({ delay: 0 })}
			use:swipe={() => ({ timeframe: 500, minSwipeDistance: 20 })}
			onswipe={(e) => {
				if (
					(e.detail.direction === 'right' || e.detail.direction === 'bottom') &&
					!open &&
					!dontMove
				) {
					closePane();
				}
			}}
			onpan={handlePan}
			onpandown={(e) => {
				startX = e.detail.x;
				startY = e.detail.y;
			}}
			onpanup={() => {
				if (!swiped && !md.current) {
					coords.set({ x: 0, y: 0, h: window.innerHeight, w: window.innerWidth, scale: 1 });
				}
			}}
			class={[
				contentClassName,
				'bg-background h-screen overflow-hidden',
				fixed && 'fixed z-40',
				distanceDragged > 5 && open && 'rounded-xl drop-shadow-2xl'
			]}
			style:left={`${coords.current.x}px`}
			style:top={`${coords.current.y}px`}
			style:height="{coords.current.h}px"
			style:width="{coords.current.w}px"
			style:transform="scale({coords.current.scale})"
			style:opacity={coords.current.scale * 1.1}
		>
			{#if open && !swiped}
				<div
					out:slide|global={{ duration: 200 }}
					in:fade|global={{ duration: 200 }}
					class="relative overflow-hidden"
					style:min-height="{titleHeight}px "
				>
					<div
						bind:clientHeight={titleHeight}
						class="pt-safe border-border absolute right-0 bottom-0 left-0 flex items-center overflow-hidden pb-4"
					>
						<button onclick={closePane} class="flex w-14 justify-center"><ChevronDown /></button>
						<div class="flex-grow text-center font-medium">
							<div>
								{@render title()}
							</div>
						</div>
						<div class="flex w-14 items-center justify-center">
							{#if action}{@render action()}{/if}
						</div>
					</div>
				</div>
			{/if}
			{@render children(open, swiped)}
		</div>
	{:else}
		<button onclick={openPane} class={triggerClassName}>{@render children(open, swiped)}</button>
	{/if}
</div>
