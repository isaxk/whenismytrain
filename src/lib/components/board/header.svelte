<script lang="ts">
	import { page } from '$app/state';
	import { operatorList } from '$lib/data/operators';
	import { ChevronLeft, Clock, House, Plus, X } from 'lucide-svelte';
	import { flip } from 'svelte/animate';
	import { quadInOut } from 'svelte/easing';
	import { MediaQuery } from 'svelte/reactivity';
	import { untrack } from 'svelte';
	import { crossfade, fade } from 'svelte/transition';

	import SaveToggle from './save-toggle.svelte';
	import Refreshbar from '../ui/refreshbar.svelte';
	import Skeleton from '../ui/skeleton.svelte';
	import StationSearch from '../ui/station-search.svelte';
	import TimeDropdown from '../ui/time-dropdown.svelte';

	let { scrollYLocked, details, adjust } = $props();

	const md = new MediaQuery('(min-width: 768px)');
	const [titleSend, titleReceive] = crossfade({ duration: 250, easing: quadInOut });

	let data = $derived(page.data);
	let headerExpanded = $state(true);

	$effect(() => {
		if (scrollYLocked > 80) {
			untrack(() => {
				headerExpanded = false;
			});
		} else {
			untrack(() => {
				headerExpanded = true;
			});
		}
	});

	function selectOperator(op: string) {
		if (data.toc) {
			adjust(data.crs, data.to, data.time, null);
		} else {
			if ((details?.operators?.length ?? 0) > 1) {
				adjust(data.crs, data.to, data.time, data.toc ? null : op);
				data.toc = data.toc ? null : op;
			}
		}
	}
</script>

<div
	class={[
		'bg-background pt-safe border-border fixed top-0 left-0 z-20 w-full transition-all md:static md:w-full',
		scrollYLocked > 10 && !md.current && 'border-b drop-shadow-sm'
	]}
>
	<div class="border-border flex h-[50px] min-w-14 items-center pb-3 pl-3">
		<button onclick={() => history.back()} class="flex h-full items-center justify-center"
			><ChevronLeft />
			<span
				class="text-foreground-muted pl-2 text-sm font-light"
				in:fade={{ duration: 200, delay: 200 }}
			>
				{data.history}</span
			>
		</button>

		<div class="flex-grow"></div>
		<a href="/" class="flex h-14 w-8 items-center justify-center"><House /></a>
		<div class="flex w-14 justify-center">
			{#if details}
				<SaveToggle from={data.crs} to={data.to} time={data.time} />
			{/if}
		</div>
	</div>
	<div
		class={[
			'relative flex w-full items-start px-4 transition-all duration-300',
			headerExpanded || md.current ? 'h-[85px] duration-300' : 'h-[42px]'
		]}
	>
		{#if details}
			<div in:fade|global={{ duration: 300 }} class="h-[90px]">
				{#if headerExpanded || md.current}
					<div class="absolute top-0 left-0 h-[90px] w-max pb-1 pl-4">
						<StationSearch
							hidden={data.to}
							class="w-full"
							onselect={(s) => adjust(s, data.to, data.time)}
						>
							{#snippet children(selected)}
								<div
									in:titleReceive|global={{ key: 'title' }}
									out:titleSend|global={{ key: 'title' }}
									class="border-border/90 hover:bg-muted bg-card flex h-max w-max items-center gap-1 rounded-md border px-2.5 py-1 text-3xl font-semibold drop-shadow-xs transition-all"
								>
									<div class="z-30 w-max text-3xl font-semibold text-nowrap backface-hidden">
										{selected ?? details?.name}
									</div>
								</div>
							{/snippet}
						</StationSearch>
						<div class="flex items-center gap-1.5 pt-1.5">
							<div class="flex">
								<StationSearch
									hidden={data.crs}
									selected={data.to}
									onselect={(s) => adjust(data.crs, s, data.time)}
								>
									{#snippet children(selected)}
										<div
											in:titleReceive|global={{ key: 'dest' }}
											out:titleSend|global={{ key: 'dest' }}
											class={[
												'bg-card hover:bg-muted border-border/90 flex w-max items-center gap-2 rounded-l-md border px-1.5 py-0.5 text-sm drop-shadow-xs transition-all',
												!selected && !details?.to ? 'rounded-r-md opacity-80' : ''
											]}
										>
											{#if selected}
												to {selected}
											{:else if details?.to}
												to {details?.to}
											{:else}
												<div class="text-foreground-muted flex items-center gap-0.5">
													<Plus size={16} /> Add destination
												</div>
											{/if}
										</div>
									{/snippet}
								</StationSearch>
								{#if details?.to}
									<button
										onclick={() => {
											if (details && details.to) {
												details.to = null;
											}
											adjust(data.crs, null, data.time);
										}}
										class="bg-card border-border hover:bg-muted flex aspect-square h-[26px] items-center justify-center rounded-r border border-l-0 drop-shadow-xs transition-all"
									>
										<X size={14} />
									</button>
								{/if}
							</div>
							<div in:titleReceive|global={{ key: 'time' }} out:titleSend|global={{ key: 'time' }}>
								<TimeDropdown time={data.time} onselect={(s) => adjust(data.crs, data.to, s)} />
							</div>
						</div>
					</div>
				{:else}
					<button
						class="-mt-1 flex flex-grow flex-col items-start justify-center text-center font-medium"
						onclick={() => (headerExpanded = true)}
					>
						{#if details}
							{#if !headerExpanded && !md.current}
								<div class="flex flex-col items-start justify-center">
									<div class="flex">
										<div
											in:titleReceive|global={{ key: 'title' }}
											out:titleSend|global={{ key: 'title' }}
											class="h-max w-max font-semibold backface-hidden"
										>
											{details.name}
										</div>
										<div class="h-1 w-1"></div>
									</div>
									<div class="-mt-0.5 flex gap-2">
										<div
											in:titleReceive|global={{ key: 'dest' }}
											out:titleSend|global={{ key: 'dest' }}
											class="text-foreground-muted flex items-center gap-1 text-xs font-light"
										>
											to {details?.to ?? 'anywhere'}
										</div>
										<div
											class="flex items-center gap-1 text-xs"
											in:titleReceive|global={{ key: 'time' }}
											out:titleSend|global={{ key: 'time' }}
										>
											<Clock size={12} />
											{data.time ? data.time.slice(0, 2) + ':' + data.time.slice(2) : 'now'}
										</div>
									</div>
								</div>
							{/if}
						{/if}
					</button>
				{/if}
			</div>
		{:else}
			<div class="flex h-[80px] flex-col justify-end gap-2 pb-2">
				<Skeleton class="h-[30px] w-72" />
				<div class="flex gap-2">
					<Skeleton class="h-[20px] w-[135px]" />
					<Skeleton class="h-[20px] w-[50px]" />
				</div>
			</div>
		{/if}
	</div>
	{#if details}
		<div
			in:fade|global={{ duration: 300 }}
			class="flex w-full flex-nowrap gap-1 overflow-x-scroll px-4 pb-2"
		>
			{#each details.operators as op (op)}
				<div
					animate:flip={{ duration: 200 }}
					class="flex transform-gpu rounded-md drop-shadow"
					transition:fade={{ duration: 150 }}
				>
					<button
						onclick={() => selectOperator(op)}
						class={[
							'relative flex h-[26px] items-center overflow-hidden px-2 py-0.5 text-sm text-nowrap transition-all duration-200 ease-in-out',
							data.toc === op ? 'rounded-l-md' : 'rounded-md'
						]}
						style:background={operatorList[op].bg}
						style:color={operatorList[op].text}
					>
						{operatorList[op].name}
					</button>
					<div
						class={[
							'h-[26px] overflow-hidden transition-all duration-200',
							data.toc === op ? 'min-w-[26px]' : 'min-w-0'
						]}
					>
						{#if data.toc === op}
							<button
								class="border-border bg-card flex aspect-square h-[26px] min-w-[26px] items-center justify-center rounded-r-md border"
								onclick={() => adjust(data.crs, data.to, data.time, null)}><X size={14} /></button
							>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="flex gap-2 px-4 pb-2">
			<Skeleton class="h-[25px] w-72" />
			<Skeleton class="h-[25px] w-72" />
		</div>
	{/if}
	<Refreshbar />
</div>
