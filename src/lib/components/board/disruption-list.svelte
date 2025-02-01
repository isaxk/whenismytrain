<script lang="ts">
	import { flyAndScale } from '$lib/utils/transitions';
	import { Dialog } from 'bits-ui';

	import { AlertCircle, X } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import Header from '../ui/header.svelte';
	import type { definitions } from '$lib/types/api';

	let { messages }: { messages: definitions['NRCCMessage'][] } = $props();
</script>

{#if messages && messages.length > 0}
	<div class="flex flex-col gap-2 px-4 pt-4">
		{#each messages.toSorted((a) => {
			if (a.severity === 'Major') {
				return -1;
			} else {
				return 1;
			}
		}) as message}
			<Dialog.Root>
				<Dialog.Trigger
					class={[
						'prose rounded-lg border px-2 py-2 text-left text-sm',
						message.severity === 'Normal' && 'bg-blue-00/80 border-blue-300',
						message.severity === 'Major' && 'border-red-300 bg-red-100/80',
						message.severity === 'Minor' && 'border-amber-300 bg-amber-100/80',
						message.severity === 'Severe' && 'border-black bg-red-950/95 text-white'
					]}
				>
					<div class="line-clamp-1 leading-5 md:line-clamp-2">
						{@html message.xhtmlMessage}
					</div>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay
						class="fixed inset-0 z-20 bg-black/80"
						transition={fade}
						transitionConfig={{ duration: 150 }}
					/>
					<Dialog.Content
						transition={flyAndScale}
						class="fixed left-1/2 top-1/2 z-40 h-max w-[480px] max-w-full -translate-x-1/2 -translate-y-1/2 rounded-lg bg-zinc-50 pt-2"
					>
						<Header title="{message.severity} Disruption" type="dialog" BackIcon={X} />

						<div class="px-4 pb-4 pt-1">
							<div
								class={[
									'prose rounded border p-2',
									message.severity === 'Normal' && 'bg-blue-00/80 border-blue-300',
									message.severity === 'Major' && 'border-red-300 bg-red-100/80',
									message.severity === 'Minor' && 'border-amber-300 bg-amber-100/80',
									message.severity === 'Severe' && 'border-black bg-red-950/95 text-white'
								]}
							>
								{@html message.xhtmlMessage}
							</div>
						</div>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		{/each}
	</div>
{/if}
