<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { fade } from 'svelte/transition';
	import { ArrowUpRight, Bookmark, Drama, LocateIcon, MapPin, Star, X } from 'lucide-svelte';
	import { Drawer } from 'vaul-svelte';
	import Header from '$lib/components/ui/header.svelte';
	import Switcher from '$lib/components/board/switcher.svelte';
	import { page } from '$app/state';
	import dayjs from 'dayjs';
	let { children, data } = $props();
</script>

{#key data.url}
	<div
		in:fade={{ duration: 200, delay: 200 }}
		out:fade={{ duration: 150 }}
		class="min-h-screen bg-zinc-50"
		data-vaul-drawer-wrapper
	>
		{@render children()}
		<div
			class="fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-evenly border-t bg-white drop-shadow md:hidden"
		>
			<a href="/nearme"><MapPin /></a>
			{#if data.url.includes('board')}
				<Drawer.Root>
					<Drawer.Trigger class="rounded-full bg-blue-500 p-3 text-white"
						><ArrowUpRight size={24} /></Drawer.Trigger
					>
					<Drawer.Portal>
						<Drawer.Overlay class="fixed inset-0 z-40 bg-black/80" />
						<Drawer.Content
							class="fixed bottom-0 left-0 right-0 z-50 flex h-drawer flex-col rounded-t-lg bg-zinc-50 pt-3"
						>
							<Header BackIcon={X} type="drawer" title="Board Options"></Header>
							<div class="h-full min-h-0 flex-grow px-4 pb-ios-bottom">
								<Switcher
									drawer
									from={page.data.from}
									to={page.data.to}
									type={page.data.type}
									value={page.data.time ?? dayjs().format('HH:mm')}
								/>
							</div>
						</Drawer.Content>
					</Drawer.Portal>
				</Drawer.Root>
			{:else}
				<a href="/" class="rounded-full bg-blue-500 p-3 text-white"><ArrowUpRight size={24} /></a>
			{/if}
			<a href="/saved"><Bookmark /></a>
		</div>
	</div>
{/key}

<style lang="postcss">
	:global(body) {
		@apply overflow-y-scroll bg-zinc-50;
	}
</style>
