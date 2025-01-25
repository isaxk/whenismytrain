<script lang="ts">
	let { value } = $props();
</script>

{#if Array.isArray(value)}
	{#each value as { matches, text }}
		{#if matches}
			<span class="font-semibold text-black bg-zinc-200/80">{text}</span>
		{:else}
			{text}
		{/if}
	{/each}
{:else}
	{value}
{/if}
