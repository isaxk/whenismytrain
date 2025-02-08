<script lang="ts">
	import { operatorList } from '$lib/data/operators';
	import { receive, send } from '$lib/utils/transitions';
	import dayjs from 'dayjs';
	import { Train } from 'lucide-svelte';
	import { fly } from 'svelte/transition';

	let {
		a,
		b,
		state,
		now,
		color
	}: {
		a: string;
		b: string;
		state: 'far' | 'gone' | 'here';
		now: dayjs.Dayjs | null;
		color: string;
	} = $props();

	const progress = $derived.by(() => {
		const aTime = dayjs(a);
		const bTime = dayjs(b);

		const diffAB = aTime.diff(bTime, 'seconds');
		const diffNowA = aTime.diff(now ?? dayjs(), 'seconds');

		return (diffNowA / diffAB) * 100;
	});

	$inspect(now, a, b, progress);
</script>

{#snippet indicator()}
	<div
		in:receive|global={{ key: 'indicator' }}
		out:send|global={{ key: 'indicator' }}
		style:border-color={color}
		style:color
		class={[
			'z-40 flex h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-600 bg-white text-zinc-600 drop-shadow-2xl'
		]}
	>
		<Train size={16} strokeWidth={2.5} />
	</div>
{/snippet}

{#if state === 'far'}
	<div class="h-17 absolute -bottom-5 left-[62px] top-10 z-50 w-6 pt-5 duration-75">
		<div class="flex w-full items-end transition-all" style:height="{progress}%">
			{@render indicator()}
		</div>
	</div>
{:else if state === 'here'}
	<div class="h-17 absolute -bottom-11 left-[62px] top-10 z-50 flex w-6 items-end pt-3 duration-75">
		{@render indicator()}
	</div>{/if}
