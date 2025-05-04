<script lang="ts">
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { PUBLIC_RTT_USERNAME, PUBLIC_RTT_PASSWORD } from '$env/static/public';
	import { Check, Info } from 'lucide-svelte';
	import { Tooltip } from 'bits-ui';

	let { uid, sdd, crs } = $props();

	const { year, month, day } = $derived.by(() => {
		const date = dayjs(sdd);
		return { year: date.format('YYYY'), month: date.format('MM'), day: date.format('DD') };
	});

	let data: null | { platform: string; isConfirmed: boolean } = $state(null);

	$effect(() => {
		getPlatform(uid, year, month, day, crs).then((d) => {
			data = d;
		});
	});

	async function getPlatform(uid: string, year: string, month: string, day: string, crs: string) {
		const response = await fetch(`/api/rtt-platform/${uid}/${year}/${month}/${day}/${crs}`);
		const data = await response.json();
		console.log(data);
		return data;
	}
</script>

{#if data}
	{data.platform}
	<Tooltip.Root>
		<Tooltip.Trigger
			class={[
				'absolute -right-1.5 -bottom-1.5 rounded-full  p-0',
				data.isConfirmed ? 'bg-green-100' : 'bg-amber-100'
			]}
		>
			<Info size={16} />
		</Tooltip.Trigger>
		<Tooltip.Content class="z-[10000] rounded-md bg-white p-2 text-black shadow-md">
			{#if data.isConfirmed}
				This platform was hidden, but a confirmed platform was provided by Real Time Trains.
			{:else}
				This platform was hidden, but a prediction was provided by Real Time Trains.
			{/if}
		</Tooltip.Content>
	</Tooltip.Root>
{/if}
