import type { ServiceDetails } from '$lib/types/train';
import { localStore } from '$lib/utils/localStore.svelte';
import { SvelteMap } from 'svelte/reactivity';

export const saved = localStore<{ id: string; focus: string; filter: string }[]>(
	'saved-services-v2',
	[]
);

export const cache = new SvelteMap<string, ServiceDetails>();

export const expandedMap = $state({ current: false });
