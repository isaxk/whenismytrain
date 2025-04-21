<script lang="ts">
	import dayjs, { type Dayjs } from 'dayjs';

	let {
		estimated,
		scheduled,
		isCancelled,
		point = false,
		size = 'md',
		state = $bindable(null)
	} = $props();

	const eDate = $derived(dayjs(estimated));
	const sDate = $derived(dayjs(scheduled));
	const fromNow = $derived(dayjs(estimated ?? scheduled).diff(dayjs(), 'minute'));
	const diff = $derived(eDate.diff(sDate, 'minute'));

	$effect(() => {
		if (isCancelled) {
			state = 'cancelled';
		} else if (estimated && scheduled) {
			if (diff < -0.5) {
				state = 'early';
			} else if (diff < 0.5) {
				state = 'ontime';
			} else if (diff < 6) {
				state = 'minor';
			} else if (diff < 20) {
				state = 'major';
			} else {
				state = 'severe';
			}
		} else {
			state = 'unknown';
		}
	});
</script>

{#snippet formatTime(time: Dayjs)}
	<!-- {#if fromNow < -1 && !point}
		<span class={[!point && 'text-black']}>
			{time.format('HH:mm')}
		</span>
	{:else if fromNow < 1 && !point}
		<span class="text-base font-medium">&lt;1</span><span
			class="pl-0.5 font-sans text-[13px] font-light">mins</span
		>
		{#if !point}
			<div class="-mt-1.5 mb-0.5 text-center font-mono text-[10px] font-light">
				{time.format('HH:mm')}
			</div>
		{/if}
	{:else if fromNow < 40 && !point}
		<span class="text-base font-medium">{fromNow.toString().padStart(2, '0')}</span><span
			class="pl-0.5 font-sans text-[13px] font-light">mins</span
		>
		{#if !point}
			<div class="-mt-1.5 mb-0.5 text-center font-mono text-[10px] font-light">
				{time.format('HH:mm')}
			</div>
		{/if}
{:else} -->
	{time.format('HH:mm')}
	<!-- {/if} -->
{/snippet}

<div
	class={[
		'flex flex-col items-center',
		size === 'md' && 'text-base',
		size === 'sm' && 'text-base',
		size === 'xs' && 'text-xs opacity-75'
	]}
>
	{#if state === 'cancelled'}
		<div class="font-mono text-red-500">{sDate.format('HH:mm')}</div>
	{:else if state === 'early'}
		<div class="font-mono text-amber-500">{@render formatTime(eDate)}</div>
		{#if size !== 'xs'}
			<div
				class={['font-mono line-through', size === 'md' ? '-mt-1 text-xs' : '-mt-1.5 text-[10px]']}
			>
				{sDate.format('HH:mm')}
			</div>
		{/if}
	{:else if state === 'ontime'}
		<div class="font-mono text-green-500">{@render formatTime(eDate)}</div>
	{:else if state === 'minor'}
		<div class="border-border font-mono text-yellow-500">{@render formatTime(eDate)}</div>
		{#if size !== 'xs'}
			<div
				class={[
					'font-mono line-through decoration-black/50',
					size === 'md' ? '-mt-1 text-xs' : '-mt-1.5 text-[10px]'
				]}
			>
				{sDate.format('HH:mm')}
			</div>
		{/if}
	{:else if state === 'major'}
		<div class="font-mono text-red-500">{@render formatTime(eDate)}</div>

		{#if size !== 'xs'}
			<div
				class={[
					'font-mono line-through decoration-black/50',
					size === 'md' ? '-mt-1 text-xs' : '-mt-1.5 text-[10px]'
				]}
			>
				{sDate.format('HH:mm')}
			</div>
		{/if}
	{:else if state === 'severe'}
		<div class="font-mono text-red-800">{@render formatTime(eDate)}</div>
		{#if size !== 'xs'}
			<div
				class={[
					'font-mono line-through decoration-black/50',
					size === 'md' ? '-mt-1 text-xs' : '-mt-1.5 text-[10px]'
				]}
			>
				{sDate.format('HH:mm')}
			</div>
		{/if}
	{:else}
		<div class="text-sm font-semibold text-red-500">Delay?</div>
		{#if size !== 'xs'}
			<div
				class={['font-mono line-through', size === 'md' ? '-mt-1 text-sm' : '-mt-1.5 text-[11px]']}
			>
				{sDate.format('HH:mm')}
			</div>
		{/if}
	{/if}
</div>
