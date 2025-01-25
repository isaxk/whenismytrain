<script lang="ts">
	import { scrollY } from 'svelte/reactivity/window';
	import { fade } from 'svelte/transition';


	let {resistance=0.1, onRefresh =()=>{},refreshing=false,children} = $props();

	let startY = $state(0);
	let currentY = $state(0);
	let pulling = $state(false);
	let rotateDeg = $state(0);
	let shouldRefresh = $state(false);
	let translateY = $state(0);
	let atTop = $state(false);

	const touchStart = (event: TouchEvent) => {
		startY = event.touches[0].clientY;
		if ((scrollY.current ?? 0) < 50) atTop = true;
		else atTop = false;
	};

	const touchMove = (event: TouchEvent) => {
		currentY = event.touches[0].clientY;

		if (currentY - startY > 20 && atTop) {
			pulling = true;
			rotateDeg = (currentY - startY) * 2;
			translateY = (currentY - startY) * resistance;

			if (rotateDeg > 359) {
				shouldRefresh = true;
			} else {
				shouldRefresh = false;
			}
		} else {
			pulling = false;
		}
	};


	const touchEnd = () => {
		if (shouldRefresh) {
			rotateDeg = 0;
			translateY = 60;
			setTimeout(refresh, 600);
		} else {
			translateY = 0;
			pulling = false;
			shouldRefresh = false;
		}
	};

	$effect(()=>{
		if(refreshing) {
			rotateDeg = 0;
			translateY = 60;
		}
		else {
			translateY = 0
		}
	})

	const refresh = async () => {
		await onRefresh();
		translateY = 0;
		pulling = false;
		shouldRefresh = false;
	};
</script>


<div ontouchstart={touchStart} ontouchmove={touchMove} ontouchend={touchEnd} class="refresher">
	
	{#if pulling || refreshing}
		<div class="fixed md:absolute top-[calc(135px+max(4px,env(safe-area-inset-top)))] md:top-7 left-0 right-0 duration-200" in:fade={{ duration: 200 }}>
			<div
				class="icon"
				style={shouldRefresh || refreshing
					? 'animation-play-state: running;'
					: `transform: rotate(${rotateDeg}deg); opacity: ${rotateDeg / 270}; animation-play-state: paused;`}
			></div>
		</div>
	{/if}

	<div class="content-wrapper" style="transform: translateY({translateY}px)">
		{@render children()}
	</div>
</div>

<style>
	.refresher {
		background-color: transparent;
		height: 100%;
		position: relative;
		width: 100%;
	}


	.icon {
		animation: spin 1s linear infinite;
		border: 2px solid transparent;
		border-radius: 50%;
		border-top-color: black;
		height: 20px;
		margin: auto;
		width: 20px;
		transform-origin: center;
	}

	.content-wrapper {
		transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	@keyframes spin {
		100% {
			transform: rotate(360deg);
		}
	}
</style>
