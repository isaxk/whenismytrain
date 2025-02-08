<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ArrowLeft, type Icon as IconType } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import { Dialog } from 'bits-ui';
	import { Drawer } from 'vaul-svelte';

	let {
		children,
		title,
		backHref = '/',
		type = 'normal',
		onBackClick,
		BackIcon = ArrowLeft,
		actionHref,
		ActionIcon,
		onActionClick = () => {},
		actionSnippet
	}: {
		children?: Snippet;
		title?: string;
		type?: 'normal' | 'dialog' | 'drawer';
		backHref?: string;
		onBackClick?: () => void;
		BackIcon?: typeof IconType;
		actionHref?: string;
		ActionIcon?: typeof IconType;
		onActionClick?: () => void;
		actionSnippet?: Snippet;
	} = $props();
</script>

<div
	class="flex min-h-14 items-start justify-between gap-2 px-4 pb-2 pt-1 md:h-max md:items-center"
>
	{#if type === 'dialog'}
		<Dialog.Close
			class={[
				'flex min-h-10 min-w-10 flex-col items-center justify-center rounded-lg bg-zinc-300 text-xs transition-all'
			]}
		>
			<BackIcon size={20} />
		</Dialog.Close>
	{:else if type === 'drawer'}
		<Drawer.Close
			class={[
				'flex min-h-10 min-w-10 flex-col items-center justify-center rounded-lg bg-zinc-300 text-xs transition-all'
			]}
		>
			<BackIcon size={20} />
		</Drawer.Close>
	{:else}
		<a
			href={onBackClick ? '#' : backHref}
			onclick={onBackClick}
			class={[
				'flex min-h-10 min-w-10 flex-col items-center justify-center rounded-lg bg-zinc-300 text-xs transition-all'
			]}
		>
			<BackIcon size={20} />
		</a>
	{/if}
	{#if children}
		{@render children()}
	{:else if title}
		<div class=" flex min-h-10 items-center font-semibold">{title}</div>
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
	{:else if actionSnippet}
		{@render actionSnippet()}
	{:else}
		<div class="w-10"></div>
	{/if}
</div>
