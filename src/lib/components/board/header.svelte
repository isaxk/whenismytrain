<script lang="ts">
	import type { Details } from '$lib/types/board';
	import {
		ArrowDownRight,
		ArrowLeft,
		ArrowUpRight,
		Calendar1,
		ChevronRight,
		Clock
	} from 'lucide-svelte';
	import { scrollY } from 'svelte/reactivity/window';
	import { fade } from 'svelte/transition';

	let { details }: { details: Details } = $props();

	let clientHeight = $state();
</script>

<div
	bind:clientHeight
	class={[
		'bg-background fixed top-0 right-0 left-0 z-[1000] p-4 pb-6 transition-all md:static',
		(scrollY.current ?? 0) > 1 && 'drop-shadow-md'
	]}
	in:fade|global={{ duration: 150 }}
>
	<a href="/" class="flex pb-4"><ArrowLeft /></a>
	<div class="flex gap-4">
		<div class="w-full min-w-0 flex-grow">
			<div class="text-4xl font-medium">{details.crs}</div>
			<div class="truncate text-xs">
				{details.name}
			</div>
		</div>
		<div class="flex h-full min-w-1/5 flex-col items-center justify-center">
			<div class="flex flex-grow items-center">
				<ChevronRight />
			</div>
			{#if details.tomorrow}
				<div class="text-foreground-muted flex items-center gap-1 pt-1 text-sm">
					<Calendar1 size={12} />
					tomorrow
				</div>
			{/if}
			<div class="flex h-[16px] items-center">
				{#if details.time}
					<div class="text-foreground-muted flex items-center gap-1 text-sm">
						<Clock size={12} />
						{details.time}
					</div>
				{/if}
			</div>
		</div>
		<div class="w-full min-w-0 flex-grow text-right">
			<div
				class={[details.filterCrs ? 'text-4xl font-medium' : 'text-foreground-muted/60 text-4xl']}
			>
				{details.filterCrs ?? 'ANY'}
			</div>
			<div class="truncate text-xs">
				{details.filterName ?? 'All Destinations'}
			</div>
		</div>
	</div>
</div>

<div style:height="{clientHeight}px"></div>
