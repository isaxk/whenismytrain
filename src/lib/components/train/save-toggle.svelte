<script lang="ts">
	import { saved } from '$lib/data/saved.svelte';
	import { Bookmark, BookmarkCheck } from 'lucide-svelte';

	let { id, focus, filter } = $props();

	let savedIndex = $derived(saved.value.findLastIndex((s) => s.id === id));
	$inspect('savedIndex', savedIndex);

	function save() {
		saved.value = [...saved.value, { id, focus, filter }];
	}

	function remove() {
		saved.value = saved.value.toSpliced(savedIndex, 1);
	}
</script>

{#if savedIndex === -1}
	<button onclick={save} class="flex h-14 w-14 items-center justify-center"><Bookmark /></button>
{:else}
	<button onclick={remove} class="flex h-14 w-14 items-center justify-center"
		><BookmarkCheck fill="currentColor" stroke="#ffffff" /></button
	>
{/if}
