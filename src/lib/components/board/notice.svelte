<script lang="ts">
	import { NoticeSeverity, type NoticeType } from '$lib/types';
	import DOMPurify from 'dompurify';

	let { notice }: { notice: NoticeType } = $props();
</script>

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
