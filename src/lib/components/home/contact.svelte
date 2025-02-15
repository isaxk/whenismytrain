<script>
	import { Bug, HeartHandshake, User } from 'lucide-svelte';
</script>

<div class="flex items-center gap-3 text-zinc-700">
	<a
		href="https://github.com/isaxk/whenismytrain/issues"
		class="flex items-center gap-1 transition-all hover:text-black"
	>
		<Bug size={18} /> Report Issues
	</a>
	<a
		href="https://github.com/isaxk/whenismytrain"
		class="flex items-center gap-1 transition-all hover:text-black"
	>
		<HeartHandshake size={18} /> Contribute
	</a>
	<a href="https://www.isaxk.com" class="flex items-center gap-1 transition-all hover:text-black">
		<User size={18} /> by isaxk
	</a>
</div>
