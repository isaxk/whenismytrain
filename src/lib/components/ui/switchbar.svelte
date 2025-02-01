<script lang="ts">
	import type { Icon as IconType } from 'lucide-svelte';
	import { circInOut, quartInOut, quartOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';

	let { items, value=$bindable() }: { value: string; items: { key: string; label: string, Icon: typeof IconType }[] } = $props();

	const [send, receive] = crossfade({duration:200, easing: quartInOut });
</script>

<div class="flex rounded-lg bg-white drop-shadow border border-zinc-100 p-1 h-11 min-h-11">
	{#each items as { key, label, Icon }}
		<button
			onclick={() => (value = key)}
			class={['relative h-full w-full rounded-lg p-2 transition-all', value == key && 'text-white drop-shadow']}
		>
			{#if value === key}
				<div
					in:receive={{ key: 'active' }}
					out:send={{ key: 'active' }}
					class="absolute h-full inset-0 rounded-lg bg-blue-500"
				></div>
			{/if}
			<div class="absolute h-full inset-0 gap-1 flex items-center justify-center">
				<Icon size={20}/> {label}
			</div>
		</button>
	{/each}
</div>
