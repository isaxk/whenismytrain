<script lang="ts">
	import { Info } from 'lucide-svelte';
	import { type Icon as IconType } from 'lucide-svelte';

	let {
		icon: Icon = Info,
		message,
		style = 'info'
	}: { icon?: typeof IconType; message: string; style?: 'info' | 'warning' | 'danger' } = $props();
</script>

<div class="px-4 pb-2">
	<div
		class={[
			'flex min-h-8 items-center gap-2 rounded border p-1 px-3 text-xs',
			{
				'border-red-600 bg-red-100': style === 'danger',
				'border-yellow-600 bg-amber-100': style === 'warning',
				'border-blue-600 bg-blue-100': style === 'info'
			}
		]}
	>
		<div>
			<Icon size={16} />
		</div>
		<div>
			{message}
		</div>
	</div>
</div>
