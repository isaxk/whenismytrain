<script lang="ts">
	import SavedListItem from '$lib/components/train/saved-list-item.svelte';
	import StationSearch from '$lib/components/ui/station-search.svelte';
	import { getGeoStations } from '$lib/data/location.svelte';
	import { savedBoards, savedServices } from '$lib/data/saved.svelte';
	import { boardUrl } from '$lib/utils/fn';
	import { Label, Switch, Tabs } from 'bits-ui';
	import dayjs from 'dayjs';
	import { Bookmark, Bug, Clock, Code, Trash, User, X } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import AllStationsJSON from 'uk-railway-stations';

	let from: string | null = $state(null);
	let to: string | null = $state(null);
	let now = $state(true);
	let time = $state(dayjs().format('HH:mm'));

	let url = $derived.by(() => {
		if (to && now) {
			return `/board/${from}?to=${to}`;
		} else if (to && !now) {
			return `/board/${from}?to=${to}&time=${time.replace(':', '')}`;
		} else if (now) {
			return `/board/${from}`;
		} else {
			return `/board/${from}?time=${time.replace(':', '')}`;
		}
	});

	onMount(() => {
		from = getGeoStations()[0]?.crsCode ?? null;
	});
</script>

{#snippet infos()}
	<div class="flex items-center gap-2">
		<div class="w-6 max-w-6 min-w-6"><User size={20} /></div>
		<a href="https://www.isaxk.com">
			Created by
			<span class="font-medium">Isaac (@isaxk)</span>
		</a>
	</div>
	<div class="flex items-center gap-2">
		<div class="w-6 max-w-6 min-w-6"><Code size={20} /></div>
		<a href="https://github.com/isaxk/whenismytrain"> Open Source on GitHub </a>
	</div>
	<div class="flex items-center gap-2">
		<div class="w-6 max-w-6 min-w-6"><Bug size={20} /></div>
		<a href="https://github.com/isaxk/whenismytrain/issues"> Report Bugs & Issues </a>
	</div>
{/snippet}

<div class="bg-muted h-full min-h-screen w-full md:h-screen">
	<div class="pt-safe mx-auto flex h-full w-full max-w-screen-xl flex-col gap-4 p-4 lg:flex-row">
		<div
			class="border-border bg-background flex w-full flex-col rounded-lg border pt-2 drop-shadow-xs lg:h-full lg:max-w-[500px]"
		>
			<div class="p-4 px-6">
				<div class="pb-4">
					<div class="text-3xl font-bold">When is my train?</div>
					<div class="text-base">The easiest UK train tracker</div>
				</div>
				<div class="flex min-h-20 items-center">
					<div class="box-content min-w-10 pr-3 text-right">from:</div>
					<StationSearch bind:selected={from}>
						{#snippet children(name, crs)}
							<div
								class="bg-card border-border text-foreground flex h-18 w-full flex-col justify-center rounded-lg border p-4 text-left drop-shadow-sm"
							>
								{#if name && crs}
									<div class="text-xl font-semibold">
										{name}
									</div>
									<div class="-mt-1 text-sm">{crs}</div>
								{:else}
									<div class="font-medium">Find a station</div>
								{/if}
							</div>
						{/snippet}
					</StationSearch>
				</div>
				<div class="flex min-h-10 items-center">
					<div class="box-content min-w-10 pr-3 text-right">to:</div>
					<StationSearch bind:selected={to}>
						{#snippet children(name, crs)}
							<div
								class="bg-card text-foreground-muted border-border flex h-14 w-full flex-col justify-center rounded-lg border p-4 text-left drop-shadow-sm"
							>
								{#if name && crs}
									<div class="text-base font-semibold">
										{name}
									</div>
									<div class="-mt-1 text-xs">{crs}</div>
								{:else}
									Add Destination
								{/if}
							</div>
						{/snippet}
					</StationSearch>
					{#if to}
						<div class="w-2"></div>
						<button
							onclick={() => (to = null)}
							class="bg-card border-border flex h-14 min-w-14 items-center justify-center rounded-lg border drop-shadow"
							><X size={20} /></button
						>
					{/if}
				</div>
				<div class="h-3"></div>
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-1">
						<Switch.Root
							bind:checked={now}
							id="dnd"
							name="hello"
							class="focus-visible:ring-foreground focus-visible:ring-offset-background data-[state=checked]:bg-primary data-[state=unchecked]:bg-accent data-[state=unchecked]:shadow-mini-inset  peer inline-flex h-[22px] min-h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Switch.Thumb
								class="bg-background data-[state=unchecked]:shadow-mini  pointer-events-none block size-[18px] shrink-0 rounded-full transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 "
							/>
						</Switch.Root>
						<Label.Root for="dnd" class="text-sm font-medium">now</Label.Root>
					</div>
					<div
						class={[
							'bg-card border-border flex-grow rounded-lg border drop-shadow transition-all',
							now && 'opacity-50'
						]}
					>
						<input type="time" bind:value={time} disabled={now} class="w-full p-2" />
					</div>
				</div>
				<div class="h-4"></div>
				{#if from}
					<a
						class="bg-primary border-border flex w-full items-center justify-center rounded-lg border p-2 text-lg text-white drop-shadow"
						href={url}>Go</a
					>
				{/if}
			</div>
			<div class="flex-grow"></div>
			<div class="hidden flex-col gap-2 px-4 pb-5 lg:flex">
				{@render infos()}
			</div>
		</div>
		<div class="border-border bg-background flex-grow rounded-lg border pt-4 drop-shadow-xs">
			<Tabs.Root value="boards">
				<div class="px-4 pt-1 pb-2 text-2xl font-semibold">Saved</div>

				<Tabs.List class="flex h-max flex-grow py-0">
					<Tabs.Trigger
						value="boards"
						class="data-[state=active]:border-primary border-accent flex flex-grow items-center justify-center border-b-2 px-4 py-2 font-medium transition-all"
					>
						Boards
					</Tabs.Trigger>
					<Tabs.Trigger
						value="trains"
						class="data-[state=active]:border-primary border-accent flex flex-grow items-center justify-center border-b-2 px-4 py-2 font-medium transition-all"
					>
						Trains
					</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="boards" class="flex flex-col">
					{#if savedBoards.value.length > 0}
						{#each savedBoards.value as board, i (`${board.from}${board.time}${board.to}`)}
							<div
								animate:flip={{ duration: 200 }}
								class="odd:bg-muted border-border/60 even:bg-card flex h-14 items-center justify-between border-t px-4 transition-all duration-200"
							>
								<a href={boardUrl(board.from, board.to, board.time)} class="flex-grow">
									<div class="text-lg font-medium">
										{AllStationsJSON.find((station) => station.crsCode === board.from)?.stationName}
									</div>
									<div class="-mt-1 flex gap-2">
										{#if board.to}
											<div class="text-sm">
												to {AllStationsJSON.find((station) => station.crsCode === board.to)
													?.stationName}
											</div>
										{/if}
										{#if board.time}
											<div class="flex items-center gap-1 text-sm">
												<Clock size={12} />
												{board.time[0] + board.time[1] + ':' + board.time[2] + board.time[3]}
											</div>
										{/if}
									</div>
								</a>
								<button class="text-sm text-red-500" onclick={() => savedBoards.value.splice(i, 1)}
									><Trash size={16} /></button
								>
							</div>
						{/each}
					{:else}
						<div class="p-4">
							<div class="text-lg font-medium">No saved boards.</div>
							<div class="flex items-center gap-1 text-sm font-light">
								Tap the <Bookmark size={16} class="inline" /> icon on the the board page to save it.
							</div>
						</div>
					{/if}
				</Tabs.Content>
				<Tabs.Content value="trains" class="flex flex-col">
					{#if savedServices.value.length > 0}
						{#each savedServices.value as service, i (`${service.id}${service.focus}`)}
							<div class="odd:bg-muted even:bg-card border-border/60 border-t first:border-t-0">
								<svelte:boundary>
									<SavedListItem {i} id={service.id} focus={service.focus} cache={service.cache} />
									{#snippet failed(error)}
										<div
											class="flex h-14 items-center overflow-hidden text-sm text-nowrap text-red-500"
										>
											{error}
										</div>
									{/snippet}
								</svelte:boundary>
							</div>
						{/each}
					{:else}
						<div class="p-4">
							<div class="text-lg font-medium">No saved trains.</div>
							<div class="flex items-center gap-1 text-sm font-light">
								Tap the <Bookmark size={16} class="inline" /> icon on a train to save it.
							</div>
						</div>
					{/if}
				</Tabs.Content>
			</Tabs.Root>
		</div>
		<div
			class="border-border bg-background flex flex-grow flex-col gap-2 rounded-lg border p-4 py-5 drop-shadow-xs lg:hidden"
		>
			{@render infos()}
		</div>
	</div>
</div>
