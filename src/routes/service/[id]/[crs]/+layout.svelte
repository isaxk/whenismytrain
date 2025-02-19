<script lang="ts">
	import { receive, send } from '$lib/utils/transitions';
	import { ArrowLeft } from 'lucide-svelte';

	let { children } = $props();
</script>

<div class="mx-auto flex h-screen w-full max-w-screen-lg flex-col pb-10 md:flex-row">
	{@render children()}
</div>
