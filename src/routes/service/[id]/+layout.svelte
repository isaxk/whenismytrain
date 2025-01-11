<script lang="ts">
	let { children } = $props();
</script>

<div class="mx-auto max-w-screen-sm p-6">
	{@render children()}
</div>
