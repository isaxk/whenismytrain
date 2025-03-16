<script lang="ts">
	import { savedBoards, savedServices } from '$lib/data/saved.svelte';
	import { Bookmark, Check } from 'lucide-svelte';
	import { scale } from 'svelte/transition';

	let { id, focus, destination, date } = $props();

	const index = $derived(savedServices.value.findIndex((item) => item.id === id));
	const saved = $derived(index > -1);

	function save() {
		savedServices.value = [
			...savedServices.value,
			{
				id,
				focus,
				cache: {
					destination,
					date
				}
			}
		];
	}

	function remove() {
		savedServices.value = savedServices.value.toSpliced(index, 1);
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
