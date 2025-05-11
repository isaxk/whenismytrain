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
	style:view-transition-name="header"
	class={[
		'bg-background fixed top-0 right-0 left-0 z-[1000] px-4 pt-2 pb-6 transition-all md:static',
		(scrollY.current ?? 0) > 1 && 'drop-shadow-md'
	]}
	in:fade|global={{ duration: 150 }}
>
	<div class="flex min-h-16 items-center pb-4">
		<a href="/" class="flex h-full w-16" style:view-transition-name="back-btn"><ArrowLeft /></a>
	</div>
	<div class="flex h-full gap-4">
		<div class="w-full min-w-0 flex-grow">
			<div class="text-4xl font-medium">{details.crs}</div>
			<div class="truncate text-xs">
				{details.name}
			</div>
		</div>
		<div class="flex min-h-[30px] min-w-1/5 flex-col items-center justify-center">
			<div class="flex min-h-[20px] items-center">
				<ChevronRight />
			</div>
			{#if details.tomorrow}
				<div class="text-foreground-muted flex items-center gap-1 pt-1 text-xs">
					<Calendar1 size={12} />
					tomorrow
				</div>
			{/if}
			{#if details.time}
				<div class="flex h-[16px] items-center">
					<div class="text-foreground-muted flex items-center gap-1 text-sm">
						<Clock size={12} />
						{details.time}
					</div>
				</div>
			{/if}
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
