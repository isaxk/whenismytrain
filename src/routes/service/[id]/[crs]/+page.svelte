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
	import { Accordion } from 'bits-ui';
	import Disruption from '$lib/components/service/disruption.svelte';
	import Header from '$lib/components/ui/header.svelte';
	import { scrollY } from 'svelte/reactivity/window';
	import { operatorList } from '$lib/data/operators';

	let {
		data,
		drawer = false,
		header
	}: { data: PageData; drawer?: boolean; header?: Snippet } = $props();
	console.log(data);

	const destination: string = data.locations![data.locations!.length - 1].locationName!;

	$inspect(data);
</script>

{#if data && data.focus}
	<div class={['w-full', !drawer && 'md:max-w-96']} in:fade|global={{ duration: 250 }}>
		<div class={['top-0 md:sticky', !drawer && 'pt-ios-top']}>
			{#if drawer}
				{#if header}
					{@render header()}
					<div class="h-1"></div>
				{/if}
			{:else}
				<div
					class={[
						'fixed left-0 right-0 top-0 z-40 bg-zinc-50 pb-1 pt-ios-top md:static md:pt-0',
						(scrollY.current ?? 0) > 5 && 'border-b drop-shadow md:border-none md:drop-shadow-none'
					]}
				>
					<Header
						onBackClick={() => {
							history.back();
						}}
						title="Service Details"
					/>
				</div>
				<div class="pt-ios-top md:hidden"><div class="h-3"></div></div>
			{/if}
			<div class="flex flex-col gap-2 px-4">
				<TrainCard
					disruptionCode={null}
					id={data.serviceID}
					isCancelled={data.destination.isCancelled ?? false}
					destination={data.destination.name ?? ''}
					platform={data.focus?.platform ?? null}
					operator={data.operatorCode!}
					etd={data.focus?.et ?? data.focus?.at ?? 'Delayed'}
					std={data.focus?.st ?? ''}
					details={data}
					onservicedetails={() => {}}
				/>
				<Disruption
					isCancelled={data.destination.isCancelled}
					code={data.cancelReason?.Value ?? data.delayReason?.Value ?? null}
				/>
			</div>
		</div>
	</div>
	<Accordion.Root
		class="flex flex-grow flex-col overflow-y-scroll pl-4 pr-4 pt-4 [scrollbar-gutter:stable] [scrollbar-width:thin]"
	>
		{#each data.locations ?? [] as location, i}
			<div class="group relative">
				<div
					style:background={operatorList[data.operatorCode].bg}
					class={[
						'absolute -bottom-3 left-[70px] top-0 z-30 flex w-2 bg-zinc-400 group-first:top-7 group-first:items-start group-last:bottom-7 group-last:h-7 group-last:items-end'
					]}
				></div>
				<div class="absolute left-[70px] top-0 flex h-14 w-2 items-center">
					<div
						style:background={operatorList[data.operatorCode].bg}
						class="h-2 w-5 rounded-l-full rounded-r-full pl-4"
					></div>
				</div>
				<CallingPoint
					{i}
					platform={location.platform}
					crs={location.crs}
					name={location.name}
					st={location.st}
					et={location.at ?? location.et ?? location.st}
					type={location.order}
					isCancelled={location.isCancelled ?? false}
					destCrs={data.destination.crs}
				/>
				{#if data.lastToBePast === i}
					<div
						style:border-color={operatorList[data.operatorCode].bg}
						style:color={operatorList[data.operatorCode].bg}
						class="absolute -bottom-3 left-[61px] z-40 rounded-full border-2 border-zinc-600 bg-white p-0.5 text-zinc-600 drop-shadow-2xl"
					>
						<Train size={18} strokeWidth={2.5} />
					</div>
				{/if}
			</div>
		{/each}
	</Accordion.Root>
{/if}
