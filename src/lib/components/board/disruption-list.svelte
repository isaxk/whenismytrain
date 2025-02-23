<script lang="ts">
	import { flyAndScale } from '$lib/utils/transitions';
	import { Dialog } from 'bits-ui';

	import { AlertCircle, X } from 'lucide-svelte';
	import { fade } from 'svelte/transition';
	import Header from '../ui/header.svelte';
	import type { definitions } from '$lib/types/api';
	import { Drawer } from 'vaul-svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import type { Board } from '$lib/types';

	let {
		board
	}: {
		board: Promise<{
			board: Board;
			trains: unknown;
			operators: unknown;
		}>;
	} = $props();

	let messages: definitions['NRCCMessage'][] = $state([]);

	$effect(() => {
		board.then((data) => {
			messages = data.board.alerts;
		});
	});

	const md = new MediaQuery('min-width: 768px');
</script>

{#snippet trigger()}
	{#each messages.toSorted((a) => {
		if (a.severity === 'Major') {
			return -1;
		} else {
			return 1;
		}
	}) as message}
		<div
			class={[
				'prose prose-p:m-0 w-full overflow-hidden text-ellipsis text-nowrap rounded-lg border px-2 py-2 text-left text-sm leading-5',
				message.severity === 'Normal' && 'bg-blue-00/80 border-blue-300',
				message.severity === 'Major' && 'border-red-300 bg-red-100/80',
				message.severity === 'Minor' && 'border-amber-300 bg-amber-100/80',
				message.severity === 'Severe' && 'border-black bg-red-950/95 text-white'
			]}
		>
			{@html message.xhtmlMessage}
		</div>
	{/each}
{/snippet}

{#snippet content()}
	<div class="flex flex-grow flex-col gap-2 overflow-y-scroll px-4">
		{#each messages.toSorted((a) => {
			if (a.severity === 'Major') {
				return -1;
			} else {
				return 1;
			}
		}) as message}
			<div
				class={[
					'prose prose-p:m-0 rounded-lg border px-2 py-2 text-left drop-shadow',
					message.severity === 'Normal' && 'border-blue-300 bg-background',
					message.severity === 'Major' && 'border-red-300 bg-red-100/80',
					message.severity === 'Minor' && 'border-amber-300 bg-amber-100/80',
					message.severity === 'Severe' && 'border-black bg-red-950/95 text-white'
				]}
			>
				{@html message.xhtmlMessage}
			</div>
		{/each}
	</div>
{/snippet}

{#if messages && messages.length > 0}
	{#if md.current}
		<Dialog.Root>
			<Dialog.Trigger class="flex w-full flex-col gap-2 px-4 pb-2 md:px-0 md:pt-0"
				>{@render trigger()}
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay
					class="fixed inset-0 z-40 bg-black/80"
					transition={fade}
					transitionConfig={{ duration: 150 }}
				/>
				<Dialog.Content
					transition={flyAndScale}
					class="fixed left-1/2 top-1/2 z-40 h-[80%] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background pt-2"
				>
					<Header BackIcon={X} type="dialog" title="Disruption" />
					{@render content()}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	{:else}
		<Drawer.Root>
			<Drawer.Trigger class="flex w-full flex-col gap-2 px-4 pb-2 md:px-0 md:pt-0"
				>{@render trigger()}</Drawer.Trigger
			>
			<Drawer.Portal>
				<Drawer.Overlay class="fixed inset-0 z-40 bg-black/80" />
				<Drawer.Content
					class="fixed bottom-0 left-0 right-0 z-40 flex h-drawer flex-col rounded-t-lg bg-background pt-2.5"
					><Header
						BackIcon={X}
						type="drawer"
						title="Disruption"
					/>{@render content()}</Drawer.Content
				>
			</Drawer.Portal>
		</Drawer.Root>
	{/if}
{/if}
