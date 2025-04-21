<script lang="ts">
	import dayjs from 'dayjs';

	let { time }: { time: string } = $props();

	let now = $state(dayjs());

	let fromNow = $derived(dayjs(time).diff(now, 'minutes'));
</script>

{#if fromNow < 1}
	&lt;1 mins
{:else}
	{fromNow} mins
{/if}
