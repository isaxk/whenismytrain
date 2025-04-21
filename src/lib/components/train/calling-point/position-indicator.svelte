<script lang="ts">
	import { operatorList } from '$lib/data/operators';
	import { Status } from '$lib/types/train';
	import { receive, send } from '$lib/utils/transitions';
	import { Train } from 'lucide-svelte';

	let {
		i,
		status,
		isCancelled,
		progress,
		operator,
		length
	}: { i: number; status: Status; isCancelled: boolean; progress: number; operator: string; length: number } =
		$props();
</script>

<div class={['min-w-5']}>
	<div class="absolute top-0 bottom-0 flex flex-col justify-center pl-1">
		{#if i !== 0}
			<div
				class={[
					'bg-accent h-7 w-2',
					progress === 1 || status === Status.DEPARTED || status === Status.ARRIVED
						? 'opacity-100'
						: 'opacity-[80%]'
				]}
				style:background={operatorList[operator].bg}
			></div>
		{:else}
			<div class="h-7"></div>
		{/if}
		<div
			class={[
				'bg-accent rounded-x h-2 w-4 rounded-r',
				progress === 1 || status === Status.DEPARTED || status === Status.ARRIVED
					? 'opacity-100'
					: 'opacity-[80%]'
			]}
			style:background={operatorList[operator].bg}
		></div>
		{#if i !== length - 1}
			<div
				class={['bg-accent w-2 flex-grow', progress === 1 ? 'opacity-100' : 'opacity-[80%]']}
				style:background={operatorList[operator].bg}
			></div>
		{:else}
			<div class="flex-grow"></div>
		{/if}
		{#if status === Status.DEPARTED && progress !== 1 && !isCancelled}
			<div class="absolute top-8 -bottom-4 left-1 z-[1000] w-2">
				<div
					class="flex w-full items-end pt-4 transition-all duration-200"
					style:background={operatorList[operator].bg}
					style:height="{progress * 100}%"
				>
					<div class="flex h-1 w-full items-center justify-center">
						<div
							in:receive={{ key: 'pos' }}
							out:send={{ key: 'pos' }}
							class="flex h-6 min-w-6 items-center justify-center rounded-full border-2 bg-white"
							style:border-color={operatorList[operator].bg}
							style:color={operatorList[operator].bg}
						>
							<Train size={16} strokeWidth={2.5} />
						</div>
					</div>
				</div>
			</div>
		{:else if status === Status.ARRIVED && !isCancelled}
			<div class="absolute top-[21px] -left-1 flex w-2">
				<div
					in:receive={{ key: 'pos' }}
					out:send={{ key: 'pos' }}
					class="flex h-6 min-w-6 items-center justify-center rounded-full border-2 bg-white"
					style:border-color={operatorList[operator].bg}
					style:color={operatorList[operator].bg}
				>
					<Train size={16} strokeWidth={2.5} />
				</div>
			</div>
		{/if}
	</div>
</div>
