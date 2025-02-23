<script lang="ts">
	import { Status } from '$lib/types';
	import { receive, send } from '$lib/utils/transitions';
	import dayjs from 'dayjs';
	import { Train } from 'lucide-svelte';

	let {
		a,
		b,
		state: currentState = null,
		now,
		color,
		progress = 0,
		collapsed = false
	}: {
		a?: string;
		b?: string;
		state?: Status | null;
		now: dayjs.Dayjs | null;
		color: string;
		progress: number;
		collapsed?: boolean;
	} = $props();
</script>

{#snippet indicator()}
	<div
		in:receive|global={{ key: 'indicator' }}
		out:send|global={{ key: 'indicator' }}
		style:border-color={color}
		style:color
		class={[
			'flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-600 bg-card text-zinc-600 drop-shadow-2xl transition-all delay-75 duration-200'
		]}
	>
		<Train size={16} strokeWidth={2.5} />
	</div>
{/snippet}

{#if collapsed}
	<div class="h-17 absolute -bottom-0 left-[70px] top-0 z-40 w-6 duration-75">
		<div class="flex h-full w-full items-center transition-all">
			{@render indicator()}
		</div>
	</div>
{:else if currentState === Status.ARRIVED}
	<div
		class="h-17 absolute left-[70px] top-0 z-40 flex w-6 items-end justify-center pt-5 duration-75"
	>
		{@render indicator()}
	</div>
{:else if currentState === Status.DEPARTED}
	<div class="absolute -bottom-6 left-[70px] top-10 z-40 w-6 duration-75">
		<div class="absolute flex w-full items-end justify-center" style:height="{progress * 100}%">
			<div class="flex h-1 items-center justify-center">
				{@render indicator()}
			</div>
		</div>
	</div>
{/if}
