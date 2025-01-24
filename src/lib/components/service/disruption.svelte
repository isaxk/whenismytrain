<script lang="ts">
	import type { definitions } from '$lib/types/api';
	import { AlertCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import Skeleton from '../skeleton.svelte';
	import { fade } from 'svelte/transition';

	let { code, isCancelled } = $props();

	let data: definitions['ReasonDescription'] | null = $state(null);

	onMount(async () => {
		const response = await fetch(`/api/disruption/${code}`);
		data = await response.json();
		console.log(data);
	});
</script>

<div
	class="mt-0.5 flex w-full items-center gap-2 rounded-lg border border-amber-400 bg-amber-100/80 px-3 py-2 text-left"
>
	<div>
		<AlertCircle size={22} />
	</div>
	{#if data}
		<div class="line-clamp-2 flex-grow text-sm text-zinc-700" in:fade={{duration:200}}>
			{isCancelled ? data.cancReason : data.lateReason}
		</div>
	{:else}
		<Skeleton class="h-4 w-full bg-zinc-400/20" />
	{/if}
</div>
