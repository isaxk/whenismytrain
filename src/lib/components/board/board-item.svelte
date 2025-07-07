<script lang="ts">
	import { navigating, page } from '$app/state';
	import { operatorList } from '$lib/data/operators';
	import type { BoardItem } from '$lib/types/board';
	import { MediaQuery } from 'svelte/reactivity';
	import RelativeTimeDisplay from '../ui/relative-time-display.svelte';
	import TimeDisplay from '../ui/time-display.svelte';
	import RttPlatform from '../train/rtt-platform.svelte';
	import { Bolt, BusFront, BusFrontIcon, Clock, Zap } from 'lucide-svelte';
	import { destination, flip } from '@turf/turf';
	import { Position } from '$lib/types';
	import { terminalGroups } from '$lib/data/terminal-groups';
	import type { Station } from '$lib/types/ldbsvws';
	import { abbreviate, cfg } from '$lib/utils';

	let {
		i,
		train,
		url,
		crs,
		filter,
		filterName
	}: { i: number; train: BoardItem; url: string; crs: string; filter: string; filterName: string } =
		$props();

	const md = new MediaQuery('(min-width: 768px)');

	let stations: Station[] | null = $state(null);

	page.data.stations.then((s) => {
		stations = s;
	});

	const showTerminalOrigin = $derived(train.terminal?.origin && crs != train.terminal?.origin);
	const showTerminalDestination = $derived(
		train.terminal?.destination &&
			train.destination.crs[0] != train.terminal?.destination &&
			train.terminal?.destination != filter
	);

	const originGroup = $derived(terminalGroups.find((g) => g.crs === crs));
	const destGroup = $derived(terminalGroups.find((g) => g.crs === filter));

	const originTerminals = $derived.by<string[]>(() => {
		if (!originGroup || stations === null || !train.terminal?.origin) return '';
		const names = train.terminal.origin.map((t) =>
			stations?.find((s) => s.crs == t)?.Value?.replace(originGroup.shortReplace, '')
		);
		return names;
	});
	const destinationTerminals = $derived.by<string[] | null>(() => {
		console.log('terminal', train.terminal);
		if (!destGroup || stations === null || !train.terminal?.destination) return '';

		const names = train.terminal.destination
			.filter((t) => t !== train.destination.crs[0])
			.map((t) => stations?.find((s) => s.crs === t)?.Value?.replace(destGroup.shortReplace, ''));
		if (names.length > 0) {
			return names;
		} else {
			return null;
		}
	});
</script>

<a
	href={url}
	class={[
		'relative flex items-center py-4 pl-2 transition-all',
		page.data.train_id === train.id
			? 'bg-foreground-tint/20'
			: 'group-odd:bg-muted/40 bg-background'
	]}
>
	<div class="absolute top-0 left-0 h-full w-1.5" style:background={train.operatorColor}></div>
	<div class="flex h-full min-w-0 flex-grow flex-col justify-center gap-1">
		<div
			class={[
				'flex h-max items-end gap-2 px-2',
				train.position === Position.DEPARTED && 'opacity-60'
			]}
		>
			<div class="flex h-max min-w-0 flex-grow items-end gap-2">
				<div class="flex h-max w-12 min-w-12 flex-col items-start justify-end pl-2">
					<TimeDisplay
						expected={train.times.estimated.departure}
						scheduled={train.times.scheduled.departure}
						isCancelled={train.isCancelled}
					/>
				</div>
				<div
					class={['text-foreground-muted/80 min-w-0 flex-grow truncate pr-2 text-xs wrap-normal']}
				>
					<span
						class={[
							train.destination.name.concat(train.destination.via).length > 38
								? 'text-base/6'
								: 'text-lg/6',
							'text-foreground font-semibold'
						]}
					>
						{#if train.destination.name.concat(train.destination.via).length > 40}
							{abbreviate(train.destination.name, cfg)}
						{:else}
							{train.destination.name}
						{/if}
					</span>
					<span class="text-foreground-muted/80 text-xs font-normal">{train.destination.via}</span>
				</div>
			</div>
		</div>
		{#if stations && train.terminal && (originTerminals || destinationTerminals)}
			<div
				class={[
					'text-foreground-muted/90 flex w-full items-center gap-1 pr-2 pl-4 text-xs',
					train.position === Position.DEPARTED && 'opacity-60'
				]}
			>
				{#if originTerminals}
					<div class="text-nowrap">
						from <span class="text-foreground font-medium"
							>{originGroup?.shortReplace}{originTerminals[0]}</span
						>{#if originTerminals.length > 1},{/if}
					</div>
					{#if originTerminals.length > 1}
						<div class="min-w-0 truncate">
							{originTerminals.slice(1).join(', ')}
						</div>
					{/if}
				{/if}

				{#if destinationTerminals}
					<div class="text-nowrap">
						to
						<span class="text-foreground font-medium"
							>{destGroup?.shortReplace}{destinationTerminals[0]}</span
						>{#if destinationTerminals.length > 1},{/if}
					</div>
					{#if destinationTerminals.length > 1}
						<div class="text-foreground-muted/90 min-w-0 truncate">
							{destinationTerminals.slice(1).join(', ')}
						</div>
					{/if}
				{/if}
			</div>
		{/if}
		<div
			class={[
				'text-foreground-muted/90 flex min-h-4 w-full items-center gap-2 pl-4 text-xs',
				train.position === Position.DEPARTED && 'opacity-60'
			]}
		>
			{#if train.type === 'bus'}
				<div class="flex items-center gap-1 text-red-600">
					<BusFront size={12} />
					Rail replacement bus
				</div>
			{:else}
				<RelativeTimeDisplay
					departure={train.times.estimated.departure}
					arrival={train.times.estimated.arrival}
					position={train.position}
					cancelledAtFilter={train.isCancelledAtFilter ? train.filter?.name : null}
				/>
				{#if train.filter && !train.isCancelled && !train.isCancelledAtFilter}
					<div class="text-foreground-muted/70 flex items-center gap-1">
						<Clock size={12} />
						<div class="text-xs/3">
							{train.filter.duration}
							{#if train.filter.stops > 1}({train.filter.stops} stops){:else}(non-stop){/if}
						</div>
					</div>
				{/if}
			{/if}
		</div>
		{#if train.arrivesFirst || train.shortestJourney}
			<div class="gap-2 px-4 text-xs">
				{#if train.arrivesFirst}
					<div class="flex items-center gap-1 text-green-600">
						<Zap size={12} />
						<div class="text-xs">Arrives first (at {filterName?.replace(' (any)', '')})</div>
					</div>
				{/if}
				{#if train.shortestJourney}
					<div class="flex items-center gap-1 text-green-600">
						<Clock size={12} />
						<div class="text-xs">Shortest Journey</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
	<div
		class={[
			'flex flex-col items-center pr-4',
			train.position === Position.DEPARTED && 'opacity-60'
		]}
	>
		{#if train.type !== 'bus'}
			<div class="text-foreground-muted text-[10px]">Platform</div>
			<div class="bg-muted relative flex size-6 items-center justify-center rounded-full text-xs">
				{#if train.platform}
					{train.platform}
				{:else if !train.isCancelled}
					<RttPlatform
						uid={train.uid}
						sdd={train.sdd}
						crs={train.terminal?.origin ?? page.data.crs}
					/>
				{/if}
			</div>
		{/if}
	</div>
</a>
