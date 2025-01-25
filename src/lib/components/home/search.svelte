<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import Fuse from 'fuse.js';
	import format from 'format-fuse.js';
	import AllStationsJSON from 'uk-railway-stations';
	import ExtraSuggestion from '../extra-suggestion.svelte';
	import { goto } from '$app/navigation';
	import { ArrowUpRight } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import Highlighter from './highlighter.svelte';
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';

	let { whenEmpty } = $props();

	const fuzzySearch = new Fuse(AllStationsJSON, {
		keys: ['stationName', 'crsCode'],
		includeMatches: true
	});

	const md = new MediaQuery('min-width: 768px');

	let value = $state('');

	type highlight = {
		matches: boolean;
		text: string;
	};
	const results = $derived(fuzzySearch.search(value).slice(0, 7));
	const formatted = $derived(
		browser
			? format<{
					crsCode: string;
					stationName: string;
				}>(results)
			: []
	);

	$inspect(results);
</script>

<form>
	<input
		type="text"
		placeholder="Find a station..."
		bind:value
		class="w-full rounded-lg border bg-white p-3 drop-shadow"
	/>

	<div class="py-2">
		{#if formatted.length > 0}
			<div class="flex flex-col gap-2">
				{#each formatted as result, i}
					{#if i === 0}
						<button
							type="submit"
							onclick={async () => {
								requestAnimationFrame(() => {
									goto('/dept/' + results[i].item.crsCode);
								});
							}}
							class="hidden">Go</button
						>
					{/if}
					<a
						href="/dept/{results[i].item.crsCode}"
						class="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-zinc-800 drop-shadow-sm"
					>
						<div class="flex-grow">
							<div class="text-xl font-medium">
								<Highlighter value={result.stationName} />
							</div>
							<div class="text-xs">
								<Highlighter value={result.crsCode} />
							</div>
						</div>
						<button
							class="h-max rounded-lg bg-blue-500 px-4 py-2 text-center text-white drop-shadow-xl transition-all duration-300 hover:brightness-105"
							><ArrowUpRight size={22} /></button
						>
					</a>
				{/each}
			</div>
		{:else}
			{@render whenEmpty()}
		{/if}
	</div>
</form>
