import type { BoardItem, Details } from '$lib/types/board';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, url, fetch }) => {
	const { crs } = params;

	const to = url.searchParams.get('to') || null;
	const time = url.searchParams.get('time') || null;

	const board: Promise<{ details: Details; trains: BoardItem[] }> = fetch(
		`/api/board/${crs}/${to}/${time}`
	).then(async (r) => await r.json());
	return { board, crs, to, time };
};
