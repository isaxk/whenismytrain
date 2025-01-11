<script lang="ts">
	import TimeDisplay from './time-display.svelte';

	let { name, et, st, future = false } = $props();
</script>

<div class="flex min-h-12 items-center border-t first:border-none">
	<div class={['flex-grow', future && 'font-medium']}>{name}</div>
	<div class="flex flex-col items-end">
		<TimeDisplay {et} {st} small />
	</div>
</div>
