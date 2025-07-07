<script lang="ts">
	import type { Formation } from '$lib/types/train';
	import { loadPercentage } from '$lib/utils';
	import { Accessibility, Toilet } from 'lucide-svelte';

	let { formation }: { formation: Formation } = $props();
</script>

<div class="flex min-h-20 w-full gap-0.5 overflow-x-scroll px-4 pt-4 pb-1">
	<!-- right angle at bottom-left -->
	<div class="-ml-2 h-full w-8 min-w-8 overflow-hidden rounded-r-sm text-zinc-100">
		<svg
			class="h-full w-full"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				class="fill-current stroke-zinc-200 stroke-2"
				d="M60 0 L100 0 L100 100 L40 100 A10 10 0 0 1 30 90 L50 10 A10 10 0 0 1 60 0 Z"
			/>
		</svg>
	</div>
	{#each formation as coach, i (JSON.stringify(coach) + i)}
		<div class="group flex">
			<div
				class="relative flex min-w-12 flex-col items-center justify-center rounded border border-zinc-200 py-1"
			>
				<div class="z-[10] flex flex-col items-center">
					<div>
						{coach.number}
					</div>
					{#if formation.some((f) => f.toilet)}
						<div class="flex h-4 items-center gap-0.5">
							{#if coach.toilet}
								<Toilet size={12} />
							{/if}
							{#if coach.toiletIsAccessible}
								<Accessibility size={12} />
							{/if}
							{#if coach.coachClass === 'First'}
								<div class="text-xs font-semibold">
									1<span class="text-[10px] font-normal">st</span>
								</div>
							{/if}
						</div>
					{/if}
				</div>

				{#if coach.loading}
					<div
						class={[
							'absolute right-0 bottom-0  left-0 min-h-2 w-full',
							loadPercentage(coach.loading)
						]}
						style:height="{coach.loading}%"
					></div>
				{/if}
			</div>
		</div>
	{/each}
</div>
