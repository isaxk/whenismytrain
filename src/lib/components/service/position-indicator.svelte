<script lang="ts">
	import { Status } from '$lib/types';
	import { receive, send } from '$lib/utils/transitions';
	import dayjs from 'dayjs';
	import { Train } from 'lucide-svelte';

	let {
		a,
		b,
		state: currentState,
		now,
		color
	}: {
		a: string;
		b: string;
		state: Status;
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
</script>

{#snippet indicator()}
	<div
		in:receive|global={{ key: 'indicator' }}
		out:send|global={{ key: 'indicator' }}
		style:border-color={color}
		style:color
		class={[
			'bg-card flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-600 text-zinc-600 drop-shadow-2xl transition-all delay-75 duration-200'
		]}
	>
		<Train size={16} strokeWidth={2.5} />
	</div>
{/snippet}

{#if currentState === Status.AWAY}
	<div class="h-17 absolute -bottom-5 left-[62px] top-10 z-40 w-6 pt-5 duration-75">
		<div class="flex w-full items-end transition-all" style:height="{progress}%">
			{@render indicator()}
		</div>
	</div>
{:else if currentState === Status.ARRIVED}
	<div class="h-17 absolute -bottom-11 left-[62px] top-10 z-40 flex w-6 items-end pt-3 duration-75">
		{@render indicator()}
	</div>{/if}
