import { browser } from '$app/environment';
import { localStore } from './local-store.svelte';

export const savedBoards = localStore<{ from: string; to: string | null; time: string | null }[]>(
	'saved-boards-2',
	[]
);

export const savedServices = localStore<
	{
		id: string;
		focus: string;
		cache: {
			destination: string;
			date: string;
		};
	}[]
>('saved-trains', []);
