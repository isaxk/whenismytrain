import type { BoardItem, Details } from '$lib/types/board';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, url, fetch }) => {
	const { crs } = params;

	const to = url.searchParams.get('to') || null;

	const board: Promise<{ details: Details; trains: BoardItem[] }> = fetch(
		`/api/board/${crs}/${to}/null`
	).then(async (r) => await r.json());
	return { board, crs, to };
};
