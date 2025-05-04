<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import '../app.css';
	import { page } from '$app/state';
	import Search from '$lib/components/ui/search.svelte';
	import { fade } from 'svelte/transition';
	import { X } from 'lucide-svelte';
	import { saved } from '$lib/data/saved.svelte';
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

	import { onNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { refresher } from '$lib/data/refresh.svelte';
	import { Tooltip } from 'bits-ui';

	onNavigate((navigation) => {
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
</script>

<div
	class="flex min-h-screen w-screen items-center justify-center bg-zinc-50 p-0 md:h-screen md:p-4"
>
	<div class="flex h-full w-full max-w-screen-xl gap-4">
		<div
			class={[
				!md.current && page.data.crs ? 'hidden' : 'flex',
				'bg-background md:border-border h-full min-h-screen w-full flex-col p-4 md:relative md:min-h-auto md:w-[400px] md:min-w-[400px] md:rounded-lg md:border'
			]}
		>
			<div class="p-2 text-3xl font-semibold">When is my train?</div>

			<div class="flex w-full flex-col gap-2 py-4 pt-6">
				<div class="flex w-full items-center gap-2">
					<div class="min-w-10 text-right">from:</div>
					<Search bind:selected={from} />
				</div>
				<div class="flex w-full items-center gap-2">
					<div class="min-w-10 text-right">to:</div>
					<Search bind:selected={to} to />
					{#if to}
						<button
							class="bg-background border-border flex aspect-square h-full min-w-10 items-center justify-center rounded-lg border drop-shadow-xs"
							onclick={() => (to = null)}><X /></button
						>
					{/if}
				</div>
			</div>

			{#if from}
				<a
					in:fade={{ duration: 200 }}
					href="/board/{from}?to={to}"
					class="flex w-full transform-gpu justify-center rounded-lg bg-blue-500 px-3 py-2 font-medium text-white drop-shadow-sm"
					>Go</a
				>
			{/if}

			<div class="pt-5 pb-2 text-lg font-semibold">Saved trains:</div>
			<div class="flex-grow overflow-y-scroll">
				<Tooltip.Provider>
					{#each saved.value as { id, filter, focus }, i (id + filter + focus)}
						<svelte:boundary>
							<SavedTrain {i} {id} {filter} {focus} />
							{#snippet failed(error)}
								{error}
							{/snippet}
						</svelte:boundary>
					{/each}
				</Tooltip.Provider>
			</div>
		</div>
		{@render children()}
	</div>
</div>
