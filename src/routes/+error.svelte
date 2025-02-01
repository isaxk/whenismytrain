<script lang="ts">
	import { page } from '$app/state';

	let { error } = $props();
	console.log(error);
</script>

<div class="mx-auto max-w-screen-md pt-10">
	<div class="text-2xl">
		{page.status}
	</div>
	<p>
		{page.error?.message}
	</p>
    <div class="h-4"></div>
	<a href="/" class="px-3 py-2 rounded-lg bg-blue-500 text-white block w-max">Home</a>
</div>
