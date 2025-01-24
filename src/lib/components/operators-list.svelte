<script lang="ts">
	import { operatorList } from '$lib/data/operators';
	import { X } from 'lucide-svelte';
	import { flip } from 'svelte/animate';

	let {
		operators,
		selectedOperator,
		onselect
	}: {
		operators: string[];
		selectedOperator: string|null;
		onselect: (o: string|null) => void;
	} = $props();
</script>

{#if operators.length > 0}
	<div class="flex gap-2 overflow-x-auto thin px-2 pb-4">
		<div
			class={[
				'h-full overflow-hidden transition-all duration-200',
				selectedOperator && operators.length > 1 ? 'w-9 pl-2 opacity-100' : 'w-0 pl-0 opacity-0'
			]}
		>
			<button
				onclick={() => onselect(null)}
				class="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-300"
				><X size={18} /></button
			>
		</div>
		{#each Array.from(operators).filter( (o) => (selectedOperator ? o === selectedOperator : true) ) as o (o)}
			<button
				animate:flip={{ duration: 250 }}
				onclick={() => {
					if (operators.length > 1) onselect(o);
				}}
				class="flex h-7 items-center text-nowrap rounded-lg px-2 text-sm"
				style:color={operatorList[o]?.text}
				style:background={operatorList[o]?.bg}
			>
				{operatorList[o]?.name ?? ''}
			</button>
		{/each}
	</div>
{/if}

<style>
    .thin {
        scrollbar-width: thin;
        scrollbar-gutter: stable;
    }
</style>