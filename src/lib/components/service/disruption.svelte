<script lang="ts">
	import type { definitions } from '$lib/types/api';
	import { AlertCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import Skeleton from '../skeleton.svelte';
	import { fade } from 'svelte/transition';

	let { code, isCancelled } = $props();

	let data: definitions['ReasonDescription'] | null = $state(null);

	onMount(async () => {
		if (code) {
			const response = await fetch(`/api/disruption/${code}`);
			data = await response.json();
		}

		console.log(data);
	});
</script>

{#if code}
	<div
		class="mt-0.5 flex w-full items-center gap-2 rounded-lg border border-amber-400 bg-amber-100/80 px-3 py-1.5 text-left drop-shadow"
	>
		<div>
			<AlertCircle size={20} />
		</div>
		{#if data}
			<div
				class="prose line-clamp-2 flex-grow text-xs text-zinc-700 prose-p:m-0"
				in:fade={{ duration: 200 }}
			>
				{isCancelled ? data.cancReason : data.lateReason}
			</div>
		{:else}
			<Skeleton class="h-8 w-full bg-zinc-400/20" />
		{/if}
	</div>
{/if}
