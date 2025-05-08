<script lang="ts">
	import type { Details } from '$lib/types/board';
	import { ArrowDownRight, ArrowLeft, ArrowUpRight } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	let { details }: { details: Details } = $props();
</script>

<div
	class="bg-background sticky top-0 z-[1000] p-4 pb-4 md:static"
	in:fade|global={{ duration: 150 }}
>
	<a href="/" class="flex pb-4"><ArrowLeft /></a>
	<div class="flex">
		<div>
			<div class="text-4xl font-medium">{details.crs}</div>
			<div class="flex items-center gap-1 text-xs">
				<ArrowUpRight size={16} />
				{details.name}
			</div>
		</div>
		<div class="flex-grow"></div>
		<div class="text-right">
			<div
				class={[details.filterCrs ? 'text-4xl font-medium' : 'text-foreground-muted/60 text-4xl']}
			>
				{details.filterCrs ?? 'ANY'}
			</div>
			<div class="flex items-center gap-1 text-xs">
				{details.filterName ?? 'All Destinations'}
				<ArrowDownRight size={16} />
			</div>
		</div>
	</div>
</div>
