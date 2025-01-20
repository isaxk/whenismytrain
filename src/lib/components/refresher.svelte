<script>
	import { scrollY } from 'svelte/reactivity/window';
	import { fade } from 'svelte/transition';

	export let resistance = 0.1;
	export let onRefresh = () => {};

	let startY = 0;
	let currentY = 0;
	let pulling = false;
	let rotateDeg = 0;
	let shouldRefresh = false;
	let translateY = 0;
	let atTop = false;

	const touchStart = (event) => {
		startY = event.touches[0].clientY;
		if ((scrollY.current ?? 0) < 50) atTop = true;
		else atTop = false;
	};

	const touchMove = (event) => {
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

	const refresh = async () => {
		await onRefresh();
		translateY = 0;
		pulling = false;
		shouldRefresh = false;
	};
</script>

<div on:touchstart={touchStart} on:touchmove={touchMove} on:touchend={touchEnd} class="refresher">
	{#if pulling}
		<div class="indicator" in:fade={{ duration: 200 }}>
			<div
				class="icon"
				style={shouldRefresh
					? 'animation-play-state: running;'
					: `transform: rotate(${rotateDeg}deg); opacity: ${rotateDeg / 270}; animation-play-state: paused;`}
			></div>
		</div>
	{/if}

	<div class="content-wrapper" style="transform: translateY({translateY}px)">
		<slot />
	</div>
</div>

<style>
	.refresher {
		background-color: transparent;
		height: 100%;
		position: relative;
	}

	.indicator {
		left: 0;
		position: fixed;
		right: 0;
		top: 140px + env(safe-area-inset-top);
		transition: 1s;
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
		background-color: #fff;
		transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	@keyframes spin {
		100% {
			transform: rotate(360deg);
		}
	}
</style>
