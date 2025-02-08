<script lang="ts">
	import { savedServices } from '$lib/data/saved.svelte';
	import { Bookmark, Check } from 'lucide-svelte';
	import { scale } from 'svelte/transition';

	let { id, crs } = $props();

	const saveIndex = $derived(savedServices.value.findIndex((s) => s.id === id && s.crs === crs));
</script>

{#if saveIndex !== -1}
	<button
		in:scale={{ start: 0.5 }}
		onclick={() => savedServices.value.splice(saveIndex, 1)}
		class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white"
		><Check size={20} /></button
	>
{:else}
	<button
		onclick={() => savedServices.value.push({ id, crs, key: Date.now() + id + crs })}
		class="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-300"
		><Bookmark size={20} /></button
	>
{/if}
