<script lang="ts">
	import { circInOut, quartInOut } from 'ssgoi';
	import { fade } from 'svelte/transition';
	import TrainCard from '../service/train-card.svelte';
	import { flip } from 'svelte/animate';

	let { list, handleServiceDetails, type } = $props();
</script>

<div
	in:fade|global={{ duration: 300 }}
	class="flex flex-col md:overflow-hidden md:rounded-lg md:border md:drop-shadow-sm"
>
	{#each list as [id, train], i (id)}
		<div
			class={[
				'flex items-center border-t first:border-t-0',
				i % 2 === 0 ? 'bg-card' : 'bg-background'
			]}
			animate:flip={{ duration: 200, easing: circInOut }}
			transition:fade={{ duration: 200, easing: quartInOut }}
		>
			<TrainCard
				state={train.status}
				{id}
				disruptionCode={train.cancelReason?.Value ?? null}
				isCancelled={train.isCancelled ?? false}
				destination={type === 'dept' ? train.destination.name! : train.origin.name!}
				operator={train.operator}
				platform={train.platform!}
				etd={train.estimated ?? train.actual ?? 'Delayed'}
				std={train.scheduled}
				onservicedetails={handleServiceDetails}
			/>
		</div>
	{/each}
</div>
