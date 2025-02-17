<script lang="ts">
	import type { Icon as IconType } from 'lucide-svelte';
	import { circInOut, quartInOut, quartOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';

	let {
		items,
		value = $bindable()
	}: { value: string; items: { key: string; label: string; Icon: typeof IconType }[] } = $props();

	const [send, receive] = crossfade({ duration: 200, easing: quartInOut });
</script>

<div
	class="bg-card flex h-11 min-h-11 transform-gpu rounded-lg border border-zinc-100 p-1 drop-shadow"
>
	{#each items as { key, label, Icon }}
		<button
			onclick={() => (value = key)}
			class={[
				'relative h-full w-full rounded-lg p-2 transition-all',
				value == key && 'text-white drop-shadow'
			]}
		>
			{#if value === key}
				<div
					in:receive={{ key: 'active' }}
					out:send={{ key: 'active' }}
					class="absolute inset-0 h-full rounded-lg bg-blue-500"
				></div>
			{/if}
			<div class="absolute inset-0 flex h-full items-center justify-center gap-1">
				<Icon size={20} />
				{label}
			</div>
		</button>
	{/each}
</div>
