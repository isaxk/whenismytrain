<script lang="ts">
	import { NoticeSeverity, type NoticeType } from '$lib/types/board';
	import { Accordion } from 'bits-ui';
	import { ChevronDown, Info, TriangleAlert } from 'lucide-svelte';
	import DOMPurify from 'dompurify';

	let { notices }: { notices: NoticeType[] } = $props();

	const mostSevereNotice = $derived(
		notices.reduce((max, notice) => Math.max(max, notice.severity), 0)
	);

	notices.sort((a, b) => b.severity - a.severity);
</script>

<Accordion.Root type="single">
	<Accordion.Item
		class={[
			'bg-background w-full overflow-hidden rounded-lg border drop-shadow transition-all data-[state=open]:border-neutral-300',
			mostSevereNotice === NoticeSeverity.Major && 'border-red-500',
			mostSevereNotice === NoticeSeverity.Minor && 'border-yellow-500',
			mostSevereNotice === NoticeSeverity.Normal && 'border-blue-500',
			mostSevereNotice === NoticeSeverity.Severe && 'border-red-950'
		]}
	>
		<Accordion.Trigger
			class={[
				'data-[state=open]:bg-background group flex w-full items-center gap-2 overflow-hidden py-3 pr-2 pl-4 text-left transition-all',
				mostSevereNotice === NoticeSeverity.Major && 'bg-red-100',
				mostSevereNotice === NoticeSeverity.Severe && 'bg-red-100',
				mostSevereNotice === NoticeSeverity.Minor && 'bg-amber-100',
				mostSevereNotice === NoticeSeverity.Normal && 'bg-blue-100'
			]}
		>
			{#if mostSevereNotice === NoticeSeverity.Normal}
				<Info size={20} />
			{:else}
				<TriangleAlert size={20} />
			{/if}
			<div class="flex-grow">
				{#if mostSevereNotice === NoticeSeverity.Minor}
					Minor
				{:else if mostSevereNotice === NoticeSeverity.Major}
					Major
				{:else if mostSevereNotice === NoticeSeverity.Severe}
					Severe
				{/if}
				Status Updates
			</div>
			<div
				class="flex h-6 w-6 items-center justify-center transition-all group-data-[state=open]:rotate-180"
			>
				<ChevronDown size={21} />
			</div>
		</Accordion.Trigger>
		<Accordion.Content class="flex flex-col gap-4 border-t border-neutral-200 p-3">
			{#each notices as notice, i (notice.html + i)}
				{#if notice.severity === NoticeSeverity.Major}
					<div class="prose rounded-lg border border-red-600 bg-red-100 p-2">
						{@html DOMPurify.sanitize(notice.html)}
					</div>
				{:else if notice.severity === NoticeSeverity.Minor}
					<div class="prose rounded-lg border border-yellow-600 bg-amber-100 p-2">
						{@html DOMPurify.sanitize(notice.html)}
					</div>
				{:else if notice.severity === NoticeSeverity.Normal}
					<div class="prose rounded-lg border border-blue-600 bg-blue-100 p-2">
						{@html DOMPurify.sanitize(notice.html)}
					</div>
				{:else if notice.severity === NoticeSeverity.Severe}
					<div class="prose rounded-lg border border-red-950 bg-red-200 p-2">
						{@html DOMPurify.sanitize(notice.html)}
					</div>
				{/if}
			{/each}
		</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
