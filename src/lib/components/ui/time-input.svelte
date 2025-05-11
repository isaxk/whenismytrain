<script lang="ts">
	import { Label, RadioGroup, Switch, Tabs } from 'bits-ui';
	import dayjs from 'dayjs';
	import { Radio } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	let { value = null, onChange = (v: string | null) => v, tomorrow = $bindable() } = $props();

	let displayedTime = $derived(
		value ? value.substring(0, 2) + ':' + value.substring(2, 4) : dayjs().format('HH:mm')
	);

	let now = $state(true);

	$effect(() => {
		if (value) {
			radioVal = tomorrow ? 'tomorrow' : 'today';
		}
	});

	$effect(() => {
		if (radioVal === 'tomorrow') {
			onChange(entered);
			displayedTime = entered;
			tomorrow = true;
		} else if (radioVal === 'today') {
			onChange(entered);
			displayedTime = entered;
			tomorrow = false;
		} else if (radioVal === 'now') {
			onChange(null);
			tomorrow = false;
		}
	});

	let radioVal = $state('now');

	let entered = $state(
		value ? value.substring(0, 2) + ':' + value.substring(2, 4) : dayjs().format('HH:mm')
	);
</script>

<div class="py-2">
	<RadioGroup.Root
		bind:value={radioVal}
		class="bg-background border-border overflow-hidden rounded-md border drop-shadow-xs"
	>
		<div class="flex">
			<RadioGroup.Item
				value="now"
				id="now"
				class="border-border w-full rounded-tl-md bg-white py-1 transition-all data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
				>Now</RadioGroup.Item
			>
			<RadioGroup.Item
				value="today"
				id="today"
				class="border-border w-full bg-white py-1 transition-all data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
				>Later</RadioGroup.Item
			>
			<RadioGroup.Item
				value="tomorrow"
				id="tomorrow"
				class="border-border w-full rounded-tr-md bg-white py-1 transition-all data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
				>Tomorrow</RadioGroup.Item
			>
		</div>
		{#if radioVal !== 'now'}
			<div
				transition:slide={{ duration: 150 }}
				class={[
					'border-border flex w-full flex-grow justify-center rounded-b border-t px-2 py-1.5 drop-shadow-xs'
				]}
			>
				<input
					type="time"
					class="w-96 max-w-full text-center md:w-full"
					value={displayedTime}
					onchange={(v) => {
						entered = v.target?.value ?? null;
						onChange(entered);
					}}
				/>
			</div>
		{/if}
	</RadioGroup.Root>
</div>
