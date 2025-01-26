<script lang="ts">
	import { strToMins } from '$lib/utils';
	import dayjs from 'dayjs';
	import duration from 'dayjs/plugin/duration';
	import { onDestroy, onMount } from 'svelte';

	let { et, st, small = false, preview = false, isCancelled } = $props();

	dayjs.extend(duration);

	const diff = dayjs(et).diff(dayjs(st));
	const fromNowDiff = dayjs(et ?? st).diff(dayjs());
	let fromNow = $state(dayjs.duration(fromNowDiff).asMinutes());
	const diffDuration = dayjs.duration(diff).asMinutes();

	let interval: ReturnType<typeof setInterval>;

	onMount(() => {
		interval = setInterval(() => {
			const fromNowDiff = dayjs(et ?? st).diff(dayjs());
			fromNow = dayjs.duration(fromNowDiff).asMinutes();
		}, 2000);
	});

	onDestroy(()=>{
		clearInterval(interval);
	})

	function color(et: string, st: string) {
		if (diffDuration < 0) {
			return 'text-yellow-600';
		} else if (diffDuration < 2) {
			return 'text-green-600';
		} else if (diffDuration < 18) {
			return 'text-yellow-600';
		} else {
			return 'text-red-600';
		}
	}
	color(et, st);

	const displayST = $derived(dayjs(st).format('HH:mm'));
	const displayET = $derived(dayjs(et).format('HH:mm'));
</script>

<div class={['flex items-end font-mono pl-1', preview ? 'flex-row' : 'flex-col']}>
	{#if isCancelled}
		<div class={['text-red-600', preview ? 'text-xs' : small ? 'text-md' : 'text-lg']}>
			Cancelled
		</div>
		{#if !preview}
			<div class="text-xs line-through -mt-1">{displayST}</div>
		{/if}
	{:else if diffDuration < 0.5}
		<div class={['text-nowrap text-green-600', small ? 'text-md' : 'text-lg']}>
			{#if fromNow < 40 && !small}
				{#if fromNow < -1}
					<span class="text-black">
						{Math.abs(Math.round(fromNow))}
						<span class="-ml-1.5 font-sans text-base font-light"> mins ago</span>
					</span>
				{:else if fromNow < 1}
					now
				{:else}
					{Math.round(fromNow)} <span class="-ml-1.5 font-sans text-base font-light"> mins</span>
				{/if}
			{:else}
				{displayET}
			{/if}
		</div>
		{#if fromNow < 40 && !small}
			<div class="text-xs -mt-1">
				{displayET}
			</div>
		{/if}
	{:else if et === 'Delayed'}
		{#if !preview}
			<div class={['text-red-600', small ? 'text-md' : 'text-lg']}>?</div>
		{/if}
		<div class="text-xs -mt-1">{displayST}</div>
	{:else}
		<div class={['text-nowrap', small ? 'text-md' : 'text-lg', color(et, st)]}>
			{#if fromNow < 40 && !small}
				{#if fromNow < 1}
					now
				{:else}
					{Math.round(fromNow)} <span class="-ml-1.5 font-sans text-base font-light"> mins</span>
				{/if}
			{:else}
				{displayET}
			{/if}
		</div>
		{#if !preview}
		<div class="flex items-center justify-end -mt-1 gap-1 text-right">
			<div class="text-xs font-light text-zinc-700 line-through">{displayST}</div>
			{#if !small}
				<div class="text-[13px]">{displayET}</div>
			{/if}
		</div>
		{/if}
	{/if}
</div>
