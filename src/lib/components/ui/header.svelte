<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ArrowLeft, type Icon as IconType } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	let {
		children,
		title,
		backHref = '/',
        onBackClick,
		BackIcon = ArrowLeft,
		actionHref,
		ActionIcon,
		onActionClick = () => {}
	}: {
		children?: Snippet;
		title?: string;
		backHref?: string;
        onBackClick?: ()=>void;
		BackIcon?: typeof IconType;
		actionHref?: string;
		ActionIcon?: typeof IconType;
		onActionClick?: () => void;
	} = $props();
</script>

<div class="flex h-14 items-center justify-between gap-3 px-4 md:h-max md:items-center pb-2 pt-1">
	<a
		href={onBackClick ? '#' : backHref}
        onclick={onBackClick}
		class={[
			'flex min-h-10 min-w-10 flex-col items-center justify-center rounded-lg bg-zinc-300 text-xs transition-all'
		]}
	>
		<BackIcon size={20} />
	</a>
	{#if children}
		{@render children()}
	{:else if title}
		<div class=" font-medium h-full flex items-center">{title}</div>
	{/if}
	{#if ActionIcon}
		<button
			class="flex min-h-10 min-w-10 flex-col items-center justify-center rounded-lg bg-blue-500 text-xs text-white transition-all"
			onclick={() => {
				if (actionHref) {
					goto(actionHref);
				} else {
					onActionClick();
				}
			}}><ActionIcon size={20} /></button
		>
	{:else}
		<div class="w-10"></div>
	{/if}
</div>
