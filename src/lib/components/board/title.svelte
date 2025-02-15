<script lang="ts">
	import dayjs from 'dayjs';
	import { ArrowDownRight, ArrowUpRight, Clock } from 'lucide-svelte';
	import { quadInOut } from 'svelte/easing';
	import { MediaQuery } from 'svelte/reactivity';
	import { scrollY } from 'svelte/reactivity/window';
	import { crossfade, fly } from 'svelte/transition';
	import { send, receive } from '$lib/utils/transitions';

	let { compact = false, filter, locationName, type, date } = $props();

	const md = new MediaQuery('min-width: 768px');
</script>

{#if compact}
	<div class="w-full min-w-0 flex-col px-1">
		<div
			class="h-max w-max text-base font-bold"
			in:receive|global={{ key: 'title' }}
			out:send|global={{ key: 'title' }}
		>
			{locationName}
		</div>
		<div class="-mt-0.5 flex w-full gap-2 text-xs">
			{#if filter}
				<div
					in:receive|global={{ key: 'filter' }}
					out:send|global={{ key: 'filter' }}
					class="w-max min-w-0 overflow-hidden text-ellipsis text-nowrap text-zinc-700"
				>
					{type === 'dept' ? 'to' : 'from'}
					{filter}
				</div>
			{/if}
			<div
				class="flex items-center gap-1.5 font-medium"
				in:receive|global={{ key: 'details' }}
				out:send|global={{ key: 'details' }}
			>
				<div class="flex items-center gap-1">
					{#if type === 'dept'}
						<ArrowUpRight size={12} /> Dept.
					{:else}
						<ArrowDownRight size={12} /> Arrv.
					{/if}
				</div>
				<div class="flex items-center gap-1">
					<Clock size={12} />
					{date ? dayjs(date).format('HH:mm') : 'now'}
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class={['flex h-max w-full flex-col justify-end text-ellipsis px-4 duration-200 ']}>
		<div class="flex w-full flex-col">
			<div
				in:receive|global={{ key: 'title' }}
				out:send|global={{ key: 'title' }}
				class={[
					'z-20 h-max w-max min-w-0 text-ellipsis text-nowrap text-left text-3xl font-bold duration-200 md:hidden md:pr-10 md:text-left md:text-4xl'
				]}
			>
				{locationName}
			</div>
			{#if filter}
				<div
					in:receive|global={{ key: 'filter' }}
					out:send|global={{ key: 'filter' }}
					class={[
						'z-20 -mt-1 w-max min-w-0 text-ellipsis text-nowrap pb-2 text-left text-zinc-600 transition-all duration-200'
					]}
				>
					{type === 'arr' ? 'from' : 'to'}
					{filter}
				</div>
			{/if}
		</div>
		<div
			transition:fly={{ duration: 200, y: -50 }}
			class={['-mt-1 w-full border-zinc-100', filter ? 'h-0' : 'h-0.5']}
		></div>
		<div
			class="z-20 flex w-max items-center gap-4"
			in:receive|global={{ key: 'details' }}
			out:send|global={{ key: 'details' }}
		>
			<div class={['flex items-center gap-2 text-sm font-medium transition-all duration-200']}>
				<div class="flex items-center gap-1">
					{#if type === 'dept'}
						<ArrowUpRight size={12} /> Departures
					{:else}
						<ArrowDownRight size={12} /> Arrivals
					{/if}
				</div>
				<div class="flex items-center gap-1">
					<Clock size={12} />
					{date ? dayjs(date).format('HH:mm') : 'now'}
				</div>
			</div>
		</div>
	</div>
{/if}
