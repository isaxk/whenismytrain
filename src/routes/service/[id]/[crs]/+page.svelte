<script lang="ts">
	import CallingPoint from '$lib/components/calling-point.svelte';
	import TrainCard from '$lib/components/train-card.svelte';
	import { ArrowLeft, ArrowUpRight, ArrowUpRightSquare, Train, X } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { Drawer } from 'vaul-svelte';
	import { goto, replaceState } from '$app/navigation';
	import { Dialog } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	let {
		data,
		drawer = false,
		header
	}: { data: PageData; drawer?: boolean; header?: Snippet } = $props();

	const destination: string = data.locations![data.locations!.length - 1].locationName!;
</script>

<div class="px-4" in:fade={{ duration: 100 }}>
	{#if drawer}
		{#if header}
			{@render header()}
		{/if}
	{:else}
		<div class="flex items-center gap-2 pb-2">
			<a
				href={data.focus ? `/dept/${data.focus.crs}` : '/'}
				class={[
					'flex min-h-10 min-w-10 flex-col items-center justify-center rounded-lg bg-zinc-300 text-xs transition-all'
				]}
			>
				<ArrowLeft size={20} />
			</a>
			<div class="flex-grow text-center text-xl font-semibold">Service Details</div>
			<div class="w-10"></div>
		</div>
	{/if}
	<TrainCard
		id={data.serviceID}
		destination={data.destination.name ?? ''}
		platform={data.focus?.platform ?? ''}
		operator={data.operatorCode!}
		etd={data.focus?.et ?? data.focus?.at ?? ''}
		std={data.focus?.st ?? ''}
		details={data}
		onservicedetails={() => {}}
	/>
</div>
<div class="flex flex-grow flex-col overflow-y-scroll pl-4 pt-4">
	{#each data.locations ?? [] as location, i}
		<div class="group relative">
			<div
				class={[
					'absolute bottom-0 left-[70px] top-0 flex w-2 items-center bg-zinc-400 drop-shadow group-first:top-6 group-first:items-start group-first:rounded-t-full group-last:bottom-5 group-last:items-end group-last:rounded-b-full'
				]}
			>
				<div class="h-2 w-5 rounded-l-full rounded-r-full bg-zinc-400 pl-4"></div>
			</div>
			<CallingPoint
				{i}
				platform={location.platform}
				name={location.name}
				st={location.st}
				et={location.at ?? location.et}
				type={location.order}
			/>
			{#if data.lastToBePast === i}
				<div
					class="absolute -bottom-3 left-[61px] z-40 rounded-full border-2 border-zinc-600 bg-white p-0.5 text-zinc-600 drop-shadow-2xl"
				>
					<Train size={18} />
				</div>
			{/if}
		</div>
	{/each}
</div>
