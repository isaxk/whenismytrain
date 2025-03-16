import { circInOut, quadIn, quadInOut, quartInOut, quartOut } from 'svelte/easing';
import { crossfade } from 'svelte/transition';

export const [send, receive] = crossfade({ duration: 400 });

const [a, b] = crossfade({ duration: 200 });

export const pos = {
	send: a,
	receive: b
};
