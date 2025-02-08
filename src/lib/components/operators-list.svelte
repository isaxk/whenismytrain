<script lang="ts">
	import { operatorList } from '$lib/data/operators';
	import { X } from 'lucide-svelte';
	import { flip } from 'svelte/animate';
	import { MediaQuery } from 'svelte/reactivity';
	import { scrollY } from 'svelte/reactivity/window';

	let {
		operators,
		selectedOperator,
		onselect
	}: {
		operators: string[];
		selectedOperator: string | null;
		onselect: (o: string | null) => void;
	} = $props();

	const md = new MediaQuery('min-width: 768px');
</script>

{#if operators.length > 0}
	<div
		class={[
			'thin top-0 flex overflow-x-auto px-4 transition-all duration-200 md:sticky md:px-0',
			(scrollY.current ?? 0) > 50 && !md.current ? '-mt-1 pb-3' : 'pb-4'
		]}
	>
		<div
			class={[
				'h-full overflow-hidden transition-all duration-200',
				selectedOperator && operators.length > 1 ? `w-9 px-0 opacity-100` : 'w-0 opacity-0'
			]}
		>
			<button
				onclick={() => onselect(null)}
				class={[
					'flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-300 transition-all duration-200'
				]}><X size={(scrollY.current ?? 0) > 50 ? 16 : 18} /></button
			>
		</div>
		{#each Array.from(operators).filter( (o) => (selectedOperator ? o === selectedOperator : true) ) as o (o)}
			<button
				animate:flip={{ duration: 250 }}
				onclick={() => {
					if (operators.length > 1) onselect(o);
				}}
				class={[
					'mr-2 flex h-7 items-center text-nowrap rounded-lg px-2 text-sm transition-all duration-200'
				]}
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
