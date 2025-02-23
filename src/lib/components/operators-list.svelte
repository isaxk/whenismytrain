<script lang="ts">
	import { operatorList } from '$lib/data/operators';
	import { X } from 'lucide-svelte';
	import { flip } from 'svelte/animate';
	import { MediaQuery } from 'svelte/reactivity';
	import { scrollY } from 'svelte/reactivity/window';
	import Page from '../../routes/service/[id]/[crs]/+page.svelte';
	import { page } from '$app/state';
	import type { Board, TrainService } from '$lib/types';
	import { duration } from 'dayjs';
	import { crossfade, fade, fly, scale } from 'svelte/transition';
	import { quadInOut, quartInOut } from 'svelte/easing';

	let {
		board
	}: {
		board: Promise<{
			board: Board;
			trains: Map<string, TrainService>;
			operators: string[];
		}>;
	} = $props();

	const md = new MediaQuery('min-width: 768px');

	const toc = $derived(page.url.searchParams.get('toc'));
	let operators: string[] = $state([]);
	const filtered: string[] = $derived.by(() => {
		if (toc && toc !== 'null') {
			return [toc];
		} else {
			return operators.toSorted((a, b) => a.localeCompare(b));
		}
	});

	$inspect(filtered);

	$effect(() => {
		board.then((b) => {
			if (b.operators.length < 2 && b.operators[0] === toc) return;
			operators = b.operators;
		});
	});
</script>

<div
	class={[
		'thin top-0 flex overflow-x-auto px-4 transition-all duration-200 vt-name-[operator-list] md:sticky md:px-0',
		(scrollY.current ?? 0) > 50 && !md.current ? '-mt-1 pb-3' : 'pb-2'
	]}
>
	<div class={['transition-all duration-200', toc && toc !== 'null' ? 'w-9' : 'w-0']}>
		{#if toc && toc !== 'null'}
			<a
				transition:fly={{ duration: 150, x: -20 }}
				href="?toc=null"
				class={[
					'flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-300 transition-all duration-200'
				]}><X size={(scrollY.current ?? 0) > 50 ? 16 : 18} /></a
			>
		{/if}
	</div>
	<div class="flex gap-2">
		{#each filtered as o (o)}
			<a
				in:scale={{ duration: 150, start: 0.995 }}
				animate:flip={{ duration: 200, easing: quadInOut }}
				href={operators.length > 1 ? `?toc=${o}` : '#'}
				class={[
					'flex h-7 items-center text-nowrap rounded-lg px-2 text-sm transition-all duration-200'
				]}
				style:color={operatorList[o]?.text}
				style:background={operatorList[o]?.bg}
			>
				{operatorList[o]?.name ?? ''}
			</a>
		{/each}
	</div>
</div>

<style>
	.thin {
		scrollbar-width: thin;
		scrollbar-gutter: stable;
	}
</style>
