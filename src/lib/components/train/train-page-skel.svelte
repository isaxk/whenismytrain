<script>
	import { ArrowLeftIcon, X } from 'lucide-svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import Skeleton from '../ui/skeleton.svelte';

	const md = new MediaQuery('(min-width: 768px)');
</script>

<div class="flex min-h-16 items-center gap-0" style:view-transition-name="header">
	<button onclick={() => history.back()} class="flex h-full w-14 items-center justify-center">
		{#if md.current}
			<X />
		{:else}
			<ArrowLeftIcon />
		{/if}
	</button>
</div>
<Skeleton class="h-42" />
<div class="flex h-10 items-center gap-2 px-4">
	<div class="min-w-14"></div>
	<Skeleton class="h-full w-2" />
	<div class="pl-2"></div>
	<Skeleton class="h-4 w-24 rounded-full" />
</div>
<div class="flex h-14 items-center gap-2 px-4">
	<div class="min-w-14">
		<Skeleton class="h-4 w-12 rounded-full" />
	</div>
	<Skeleton class="h-full w-2" />
	<div class="pl-2"></div>
	<Skeleton class="h-4 w-24 rounded-full" />
</div>
<div class="flex h-14 items-center gap-2 px-4">
	<div class="min-w-14"></div>
	<Skeleton class="h-full w-2" />
	<div class="pl-2"></div>
	<Skeleton class="h-4 w-24 rounded-full" />
</div>
<div class="flex h-14 items-center gap-2 px-4">
	<div class="min-w-14">
		<Skeleton class="h-4 w-12 rounded-full" />
	</div>
	<Skeleton class="h-full w-2" />
	<div class="pl-2"></div>
	<Skeleton class="h-4 w-24 rounded-full" />
</div>
<div class="flex h-14 items-center gap-2 px-4">
	<div class="min-w-14">
		<Skeleton class="h-4 w-12 rounded-full" />
	</div>
	<Skeleton class="h-full w-2 rounded-full" />
	<div class="pl-2"></div>
	<Skeleton class="h-4 w-24 rounded-full" />
</div>
