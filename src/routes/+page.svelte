<script lang="ts">
	import Switcher from '$lib/components/board/switcher.svelte';
	import Contact from '$lib/components/home/contact.svelte';

	import { ArrowUpRight } from 'lucide-svelte';
</script>

<div class="full mx-auto min-h-screen max-w-screen-sm justify-center px-4 pt-ios-top">
	<div class="flex flex-col justify-center py-4">
		<div class="text-3xl font-bold">When is my train?</div>
		<div class="text-sm font-medium">The simple train times app powered by National Rail</div>
	</div>

	<div class="border-b border-zinc-200 pb-3">
		<Contact />
	</div>

	<div class="h-5"></div>

	<Switcher drawer={false}>
		{#snippet suggestions()}{/snippet}
	</Switcher>

	<div class="pt-6"></div>
</div>
