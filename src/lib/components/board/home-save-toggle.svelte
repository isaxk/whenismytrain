<script lang="ts">
	import { savedBoards } from '$lib/data/saved.svelte';
	import { scale } from 'svelte/transition';

	import { Bookmark, Check } from 'lucide-svelte';

	let { from, time, to, type } = $props();

	const saveIndex = $derived(
		savedBoards.value.findIndex(
			(b) => b.from === from && b.time === time && b.to === to && b.type === type
		)
	);
</script>

{#if saveIndex !== -1}
	<button
		in:scale={{ start: 0.5 }}
		onclick={() => {
			savedBoards.value.splice(saveIndex, 1);
		}}
		class="flex h-10 min-w-10 items-center justify-center rounded-lg bg-blue-500 text-white"
	>
		<Check size={20} />
	</button>
{:else}
	<button
		onclick={() =>
			(savedBoards.value = [
				...savedBoards.value,
				{
					from: from,
					time: time,
					to: to,
					type: type,
					key: Date.now() + from + time + to + type
				}
			])}
		class="flex h-10 min-w-10 items-center justify-center rounded-lg bg-zinc-300"
		><Bookmark size={20} /></button
	>
{/if}
