<script lang="ts">
	import { ArrowLeft, RotateCw } from 'lucide-svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { scrollY } from 'svelte/reactivity/window';
	import Title from './title.svelte';
	import HomeSaveToggle from './home-save-toggle.svelte';
	import dayjs from 'dayjs';

	const md = new MediaQuery('min-width: 768px');

	let { onRefresh, board, from, to, type, date } = $props();
</script>

<div class={['flex gap-2 px-4 pb-2 pt-1']}>
	<button
		onclick={() => history.back()}
		class="flex h-10 min-w-10 items-center justify-center rounded-lg bg-zinc-300"
	>
		<ArrowLeft size={20} />
	</button>

	<div class="min-w-0 flex-grow">
		{#if board && (scrollY.current ?? 0) > 50 && !md.current}
			<Title
				locationName={board.locationName}
				{type}
				{date}
				filter={board.filterLocationName ?? null}
				compact
			/>
		{/if}
	</div>

	<button
		onclick={onRefresh}
		class="flex h-10 min-w-10 items-center justify-center rounded-lg bg-zinc-300"
		><RotateCw size={20} /></button
	>

	<HomeSaveToggle {from} time={date ? dayjs(date).format('HH:mm') : ''} {to} {type} />
</div>
