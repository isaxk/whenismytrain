import type { Train } from "$lib/types/train";

export const currentService = $state<{value:Train|null}>({value:null})