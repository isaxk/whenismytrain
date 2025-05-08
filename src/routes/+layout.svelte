<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import '../app.css';
	import { navigating, page } from '$app/state';
	import Search from '$lib/components/ui/search.svelte';
	import { fade } from 'svelte/transition';
	import { Bookmark, ChevronRight, Train, X } from 'lucide-svelte';
	import { expandedMap, saved } from '$lib/data/saved.svelte';
	import SavedTrain from '$lib/components/train/saved-train.svelte';

	let { children } = $props();

	const md = new MediaQuery('(min-width: 768px)');

	let from = $derived(null);
	let to = $derived(null);
	let isIOSSwipeGesture = false;

	onMount(() => {
		if (!browser) return;

		const clear = refresher.init(10000);

		// Check if we're on iOS
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

		if (isIOS) {
			let touchStartX = 0;
			const edgeThreshold = 20; // px from edge

			// Track touch start position
			document.addEventListener('touchstart', (e) => {
				touchStartX = e.touches[0].screenX;

				// Only consider touches near the left edge
				if (touchStartX <= edgeThreshold) {
					// This might be an edge swipe starting
					isIOSSwipeGesture = true;

					// Reset after a delay if no navigation occurred
					setTimeout(() => {
						isIOSSwipeGesture = false;
					}, 1000);
				}
			});
		}

		return () => {
			clear();
		};
	});

	$effect(() => {
		if (page.data.crs) {
			from = page.data.crs;
		}
		if (page.data.filter) {
			to = page.data.filter;
		}
	});

	// Register service worker
	$effect(() => {
		if (!browser) return;
		
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/service-worker.js')
				.then((registration) => {
					// Check for updates every hour
					setInterval(() => {
						registration.update();
					}, 1000 * 60 * 60);

					// When an update is found, either refresh immediately or notify the user
					registration.addEventListener('updatefound', () => {
						const newWorker = registration.installing;
						newWorker?.addEventListener('statechange', () => {
							if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
								// Optional: Show a notification to the user about the update
								if (confirm('New version available! Reload to update?')) {
									newWorker.postMessage({ type: 'SKIP_WAITING' });
									window.location.reload();
								}
							}
						});
					});
				})
				.catch((error) => {
					console.error('Service worker registration failed:', error);
				});
		}
	});

	import { onNavigate, preloadData } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { refresher, refreshing } from '$lib/data/refresh.svelte';
	import { Tooltip } from 'bits-ui';

	onNavigate((navigation) => {
		expandedMap.current = false;
		if (!document.startViewTransition) return;

		if (isIOSSwipeGesture) {
			// Reset the flag after the navigation completes
			navigation.complete.then(() => {
				isIOSSwipeGesture = false;
			});
			return; // No transition for swipe gesture
		}

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	$effect(() => {
		if (from || to) {
			if (to) {
				preloadData(`/board/${from}?to=${to ?? ''}`);
			} else {
				preloadData(`/board/${from}`);
			}
		}
	});
</script>

<div
	class="flex min-h-screen w-screen items-center justify-center bg-zinc-50 p-0 md:h-screen md:p-4"
>
	<div
		class={['flex h-full w-full max-w-screen-xl gap-4', expandedMap.current && 'md:justify-center']}
	>
		<div
			class={[
				(!md.current && page.data.crs) || expandedMap.current ? 'hidden' : 'flex',
				'bg-background md:border-border h-full min-h-screen w-full flex-col p-4 md:relative md:min-h-auto md:w-[400px] md:min-w-[400px] md:rounded-lg md:border'
			]}
		>
			<div class="p-2 text-3xl font-semibold">When is my train?</div>

			<div class="flex w-full items-center py-4 pt-6">
				<div class="w-full min-w-0 flex-grow text-right">
					<Search bind:selected={from} />
				</div>
				<div class="px-2">
					<ChevronRight size={22} />
				</div>
				<div class="w-full min-w-0 flex-grow text-right">
					<Search bind:selected={to} to />
				</div>
				{#if to}
					<button
						class="bg-background border-border flex aspect-square h-16 w-10 items-center justify-center rounded-r-lg border drop-shadow-xs"
						onclick={() => (to = null)}><X /></button
					>
				{/if}
			</div>

			{#if from}
				<a
					in:fade={{ duration: 200 }}
					href={to ? `/board/${from}?to=${to ?? ''}` : `/board/${from}`}
					class="flex w-full transform-gpu justify-center rounded-lg bg-blue-500 px-3 py-2 font-medium text-white drop-shadow-sm"
					>Go</a
				>
			{:else}
				<div
					class="bg-muted text-foreground-muted/40 flex w-full transform-gpu justify-center rounded-lg px-3 py-2 font-medium"
				>
					Go
				</div>
			{/if}

			<div class="flex items-center gap-1 pt-10 pb-2 text-lg font-semibold">
				<Train size={20} />
				<div class="pr-2">Saved</div>
				<div class="bg-border h-0.5 flex-grow"></div>
			</div>
			<div class="flex-grow overflow-y-scroll">
				<Tooltip.Provider>
					{#if saved.value.length}
						{#each saved.value as { id, filter, focus }, i (id + filter + focus)}
							<svelte:boundary>
								<SavedTrain {i} {id} {filter} {focus} />
								{#snippet failed(error)}
									{error}
								{/snippet}
							</svelte:boundary>
						{/each}
					{:else}
						<div class="font-medium">No saved trains</div>
						<div class="flex items-center gap-1 text-sm">
							Tap the <Bookmark size={16} /> icon on a train to save it here!.
						</div>
					{/if}
				</Tooltip.Provider>
			</div>
		</div>
		{@render children()}
	</div>
</div>

{#if refreshing.value || navigating.to}
	<div
		in:fade={{ duration: 100, delay: 100 }}
		out:fade={{ duration: 100 }}
		class="fixed top-0 right-0 left-0 z-[1000] h-0.5 animate-pulse bg-blue-500/60"
	></div>
{/if}
