<script lang="ts">
	import { ChevronDown, ChevronUp } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	let {
		show = $bindable(false),
		progressState = 'none',
		openedText = 'Show stops',
		closedText = 'Hide stops',
		closedTextSnippet = null,
		color
	}: {
		show?: boolean;
		progressState?: 'none' | 'partial' | 'full';
		openedText?: string;
		closedText?: string;
		closedTextSnippet?: Snippet | null;
		color: string;
	} = $props();
</script>

<button
	onclick={() => (show = !show)}
	class={[
		'text-foreground-tint flex items-center gap-2 px-4',
		closedTextSnippet && !show ? 'h-14' : 'h-10'
	]}
>
	<div class="w-12"></div>
	<div class="flex h-full flex-col pr-4">
		{#if progressState === 'full'}
			<div class="w-2 flex-grow" style:background={color}></div>
		{:else if progressState === 'partial'}
			<div
				class="w-2 flex-grow"
				style:background="linear-gradient(to bottom, {color}, {color}B3)"
			></div>
		{:else}
			<div class="w-2 flex-grow" style:background="{color}B3"></div>
		{/if}
	</div>
	{#if show}
		<div class="flex items-center gap-1">{openedText}<ChevronUp size={20} /></div>
	{:else}
		<div class="flex items-center gap-1">
			{#if closedTextSnippet}
				<div class="pr-1 text-left">
					{@render closedTextSnippet()}
				</div>
			{:else}
				{closedText}
			{/if}

			<ChevronDown size={20} />
		</div>
	{/if}
</button>
