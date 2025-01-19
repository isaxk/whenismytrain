<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';

	let { children } = $props();
</script>

<div class="mx-auto w-full max-w-screen-lg flex-col pb-10 pt-4 md:flex md:flex-row">
	{@render children()}
</div>
