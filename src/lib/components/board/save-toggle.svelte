<script lang="ts">
	import { savedBoards } from '$lib/data/saved.svelte';
	import { Bookmark, Check } from 'lucide-svelte';
	import { scale } from 'svelte/transition';

	let { from, to, time } = $props();

	const index = $derived(
		savedBoards.value.findIndex(
			(item) => item.from === from && item.to === to && item.time === time
		)
	);
	
	const saved = $derived(index > -1);

	$inspect(index, savedBoards.value);

	function save() {
		savedBoards.value = [...savedBoards.value, { from, to, time }];
	}

	function remove() {
		savedBoards.value = savedBoards.value.toSpliced(index, 1);
	}
</script>

<div class="relative h-10 w-10">
	<div
		class={[
			'absolute inset-0 flex items-center justify-center transition-all',
			saved && 'scale-80 opacity-15'
		]}
	>
		<Bookmark />
	</div>
	{#if saved}
		<button
			transition:scale={{ start: 0.5, duration: 200 }}
			class="absolute inset-0 flex items-center justify-center"
			onclick={remove}
			><Check class="drop-shadow-xl" stroke="#fff" size={28} strokeWidth={2.5} /></button
		>
	{:else}
		<button
			class="absolute inset-0 flex items-center justify-center text-transparent"
			onclick={save}>Save</button
		>
	{/if}
</div>
