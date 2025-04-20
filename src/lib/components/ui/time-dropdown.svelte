<script lang="ts">
	import { Label, Popover, Switch } from 'bits-ui';
	import dayjs from 'dayjs';
	import { Clock } from 'lucide-svelte';
	import { fly } from 'svelte/transition';

	let {
		time = $bindable(null),
		onselect = () => {}
	}: { time: string | null; onselect: (time: string) => void } = $props();

	let value = $derived(time ? time[0] + time[1] + ':' + time[2] + time[3] : null);
	let now = $derived(time === null);

	$effect(() => {
		if (now) value = dayjs().format('HH:mm');
	});
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<div
				{...props}
				class="bg-card border-border hover:bg-muted flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-sm transition-all"
			>
				<Clock size={14} />
				{time ? time[0] + time[1] + ':' + time[2] + time[3] : 'now'}
			</div>
		{/snippet}
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Content
			sideOffset={4}
			class="bg-background border-border z-40 rounded-lg border p-4 drop-shadow-md"
		>
			<div class="flex items-center gap-2">
				<div class="flex gap-1">
					<Switch.Root
						onCheckedChange={() => (changed = true)}
						bind:checked={now}
						id="dnd"
						name="hello"
						class="focus-visible:ring-foreground focus-visible:ring-offset-background data-[state=checked]:bg-primary data-[state=unchecked]:bg-accent data-[state=unchecked]:shadow-mini-inset peer inline-flex h-[22px] min-h-[22px] w-[40px] shrink-0 cursor-pointer items-center rounded-full px-[3px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Switch.Thumb
							class="bg-background data-[state=unchecked]:shadow-mini pointer-events-none block size-[18px] shrink-0 rounded-full transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 "
						/>
					</Switch.Root>
					<Label.Root for="dnd" class="text-sm font-medium">now</Label.Root>
				</div>

				<div
					class={[
						'bg-card border-border flex-grow rounded-lg border drop-shadow transition-all',
						now && 'opacity-50'
					]}
				>
					<input
						type="time"
						onchange={() => (changed = true)}
						bind:value
						disabled={now}
						class="w-full p-2"
					/>
				</div>
				<div
					class={[
						'overflow-hidden transition-all',
						(now ? null : value) !== time && (value || now) ? 'w-20' : 'w-0'
					]}
				>
					{#if (now ? null : value) !== time && (value || now)}
						<div class="w-full" transition:fly={{ duration: 200, x: -30 }}>
							<Popover.Close
								class="bg-primary min-w-20 rounded-md px-3 py-2 text-white"
								onclick={() => {
									time = now ? null : value;
									onselect(now ? null : value);
								}}>Done</Popover.Close
							>
						</div>
					{/if}
				</div>
			</div>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
