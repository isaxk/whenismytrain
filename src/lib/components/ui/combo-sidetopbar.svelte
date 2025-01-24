<script lang="ts">
	import type { Snippet } from 'svelte';

	import { scrollY } from 'svelte/reactivity/window';

	let { children }: { children: Snippet } = $props();
</script>

<div
	class={[
		'fixed right-0 top-0 z-10 w-full max-w-full bg-white pt-ios-top transition-all md:sticky md:min-w-96 md:max-w-96',
		(scrollY.current ?? 0) > 5 &&
			'border-b border-zinc-300 drop-shadow md:border-none md:drop-shadow-none'
	]}
>
	{@render children()}
</div>
