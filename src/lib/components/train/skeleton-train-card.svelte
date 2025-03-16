<script>
	import Skeleton from '../ui/skeleton.svelte';
</script>

<div class={['border-border relative flex min-h-20 items-center gap-4 border-t pr-5 pl-6']}>
	<Skeleton class="absolute top-0 bottom-0 left-0 h-full w-2 rounded-none" />
	<div class={['flex flex-col items-center']}>
		<Skeleton class="mb-1.5 h-[8px] w-[40px]" />
		<Skeleton class="h-7 w-7 rounded-full" />
	</div>
	<div class="flex-grow">
		<div class="flex-grow text-xl font-semibold select-text">
			<Skeleton class="h-6 w-60" />
		</div>
	</div>
	<div>
		<Skeleton class="h-6 w-10" />
	</div>
</div>
