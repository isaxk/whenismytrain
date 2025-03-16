<script>
	import { savedServices } from '$lib/data/saved.svelte';
	import { Status } from '$lib/types/train';
	import { fade } from 'svelte/transition';
	import TimeDisplay from '../ui/time-display.svelte';
	import { Trash } from 'lucide-svelte';

	let { i, id, focus, cache } = $props();

	const data = fetch(`/api/service/${id}/${focus}`).then(async (r) => await r.json());
	let error = $state(false);

	data.then((d) => {
		console.log(d);
		const index = savedServices.value.findIndex((service) => service.id === id);
		if (!d.trainCard) {
			error = true;
			savedServices.value.splice(index, 1);
		} else {
			savedServices.value[index].cache = {
				destination: d.destination,
				date: d.trainCard.estimated
			};
		}
	});
</script>

{#if !error}
	<div class="flex items-center">
		<a href="/board/{focus}/train/{id}" class="flex h-14 min-w-0 flex-grow items-center gap-3 px-4">
			{#await data}
				<div class="flex-grow opacity-50">
					<div class="text-lg font-medium">
						{cache.destination.name}
					</div>
					<div class="-mt-1 text-xs">loading...</div>
				</div>
				<div class="saturate-0">
					<TimeDisplay
						isCancelled={false}
						size="sm"
						estimated={cache.date}
						scheduled={cache.date}
					/>
				</div>
			{:then { trainCard, focus }}
				{#if trainCard}
					<div class="flex flex-col items-center">
						<div class="text-[10px]">Platform</div>
						<div class="bg-accent flex h-6 w-6 items-center justify-center rounded-full text-sm">
							{focus.platform}
						</div>
					</div>
					<div class="min-w-0 flex-grow overflow-hidden">
						<div class="w-full min-w-0 truncate text-lg font-medium">
							{trainCard.destination.name}
						</div>
						<div class="-mt-1 w-full truncate text-xs" in:fade|global={{ duration: 200 }}>
							{#if trainCard.status === Status.DEPARTED}
								Departed from {focus.name}
							{:else}
								Departing from {focus.name}
							{/if}
						</div>
					</div>
					<div in:fade|global={{ duration: 200 }}>
						<TimeDisplay
							isCancelled={trainCard.isCancelled}
							size="sm"
							estimated={trainCard.estimated}
							scheduled={trainCard.scheduled}
						/>
					</div>
				{/if}
			{/await}
		</a>
		<button class="min-w-7 text-sm text-red-500" onclick={() => savedServices.value.splice(i, 1)}
			><Trash size={16} /></button
		>
	</div>
{/if}
