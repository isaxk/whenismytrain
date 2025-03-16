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
			} else if (diff < 9) {
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
	{#if fromNow < -10 && !point}
		<span class={[!point && 'text-black']}>
			{time.format('HH:mm')}
		</span>
	{:else if fromNow < -1 && !point}
		<span class="text-black">
			{-fromNow}<span class="pl-0.5 font-sans text-base font-light">mins ago</span>
		</span>
	{:else if fromNow < 1 && !point}
		<div class="font-sans">now</div>
	{:else if fromNow < 40 && !point}
		{fromNow}<span class="pl-0.5 font-sans text-base font-light">mins</span>
	{:else}
		{time.format('HH:mm')}
	{/if}
{/snippet}

<div
	class={[
		'flex flex-col items-end',
		size === 'md' && 'text-lg',
		size === 'sm' && 'text-base',
		size === 'xs' && 'text-xs opacity-75'
	]}
>
	{#if state === 'cancelled'}
		<span class=" text-red-500">Cancelled</span>
		<div
			class={['font-mono line-through', size === 'md' ? '-mt-1 text-sm' : '-mt-1.5 text-[11px]']}
		>
			{sDate.format('HH:mm')}
		</div>
	{:else if state === 'early'}
		<div class="font-mono text-amber-500">{@render formatTime(eDate)}</div>
		{#if size !== 'xs'}
			<div
				class={['font-mono line-through', size === 'md' ? '-mt-1 text-sm' : '-mt-1.5 text-[10px]']}
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
				class={['font-mono line-through', size === 'md' ? '-mt-1 text-sm' : '-mt-1.5 text-[10px]']}
			>
				{sDate.format('HH:mm')}
			</div>
		{/if}
	{:else if state === 'major'}
		<div class="font-mono text-red-500">{@render formatTime(eDate)}</div>
		{#if size !== 'xs'}
			<div
				class={['font-mono line-through', size === 'md' ? '-mt-1 text-sm' : '-mt-1.5 text-[10px]']}
			>
				{sDate.format('HH:mm')}
			</div>
		{/if}
	{:else if state === 'severe'}
		<div class="font-mono text-red-800">{@render formatTime(eDate)}</div>
		{#if size !== 'xs'}
			<div
				class={['font-mono line-through', size === 'md' ? '-mt-1 text-sm' : '-mt-1.5 text-[10px]']}
			>
				{sDate.format('HH:mm')}
			</div>
		{/if}
	{:else}
		<div class=" font-medium text-red-500">Delayed</div>
		{#if size !== 'xs'}
			<div
				class={['font-mono line-through', size === 'md' ? '-mt-1 text-sm' : '-mt-1.5 text-[11px]']}
			>
				{sDate.format('HH:mm')}
			</div>
		{/if}
	{/if}
</div>
