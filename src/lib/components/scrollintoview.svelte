<script lang="ts">
	import { onMount } from 'svelte';

	let elm: HTMLDivElement;

	onMount(() => {
		setTimeout(() => {
			elm.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
		}, 180);
	});
</script>

<div bind:this={elm}></div>
