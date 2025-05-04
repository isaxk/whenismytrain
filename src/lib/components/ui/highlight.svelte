<script lang="ts">
	let { value } = $props();
</script>

{#if Array.isArray(value)}
	{#each value as { matches, text }, i (i)}
		{#if matches}
			<span class="bg-zinc-200/80 font-semibold text-black">{text}</span>
		{:else}
			{text}
		{/if}
	{/each}
{:else}
	{value}
{/if}
