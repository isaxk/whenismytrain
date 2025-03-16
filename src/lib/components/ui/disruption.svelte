<script>
	import { AlertCircle } from 'lucide-svelte';

	let { code, isCancelled } = $props();

	const data = fetch(`/api/disruption/${code}`).then((res) => res.json());
</script>

<div
	class={[
		'flex w-full items-center gap-2 rounded-md border px-3 py-1.5 text-xs drop-shadow',
		isCancelled ? 'border-red-400 bg-red-100/80' : 'border-amber-400 bg-amber-100/80'
	]}
>
	<div>
		<AlertCircle size={20} />
	</div>
	<div>
		{#await data then data}
			{isCancelled ? data.cancReason : data.lateReason}
		{/await}
	</div>
</div>
