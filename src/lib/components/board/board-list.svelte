<script lang="ts">
	import { circInOut, quartInOut } from 'ssgoi';
	import { fade } from 'svelte/transition';
	import TrainCard from '../train-card.svelte';
	import { flip } from 'svelte/animate';

	let { list, handleServiceDetails, type } = $props();

	console.log(list);
</script>

<div
	in:fade|global={{ duration: 300 }}
	class="flex w-full flex-col gap-2 pl-4 pr-4 md:pl-0 md:pt-4"
>
	{#each list as [id, train], i (id)}
		<div
			class="flex items-center"
			animate:flip={{ duration: 200, easing: circInOut }}
			transition:fade={{ duration: 200, easing: quartInOut }}
		>
			<div class="hidden min-w-8 justify-center text-sm sm:min-w-12 md:flex md:text-base">
				{i + 1}
			</div>
			<TrainCard
				{id}
				disruptionCode={train.cancelReason?.Value ?? null}
				isCancelled={train.isCancelled ?? false}
				destination={type === 'dept'
					? train.destination![0].locationName!
					: train.origin![0].locationName!}
				operator={train.operatorCode!}
				platform={train.platform!}
				etd={type === 'dept'
					? (train.etd ?? train.atd ?? 'Delayed')
					: (train.eta ?? train.ata ?? train.sta)}
				std={(type === 'dept' ? train.std : train.sta) ?? ''}
				onservicedetails={handleServiceDetails}
			/>
		</div>
	{/each}
</div>
