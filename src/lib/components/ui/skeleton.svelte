<script lang="ts">
	import { cn } from '$lib/utils/fn';

	let { class: className } = $props();
</script>

<div class={cn('bg-accent/40 animate-pulse rounded-lg', className)}></div>
