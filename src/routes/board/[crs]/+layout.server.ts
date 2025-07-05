import type { BoardItem, Details } from '$lib/types/board';
import type { LayoutServerLoad } from './$types';

const londonTerminals = [
	'PAD',
	'LST',
	'KGX',
	'STP',
	'WAT',
	'EUS',
	'LDB',
	'BFR',
	'VIC',
	'FST',
	'CST',
	'CHX',
	'MYB',
	'MOG'
];

export const load: LayoutServerLoad = async ({ params, url, fetch }) => {
	const { crs } = params;

	const to = url.searchParams.get('to') || null;
	const time = url.searchParams.get('time') || null;
	const tomorrow = url.searchParams.get('tomorrow') == 'true';

	const board: Promise<{ details: Details; trains: BoardItem[] }> = fetch(
		`/api/board/${crs}/${to}/${time}/${tomorrow}`
	).then(async (r) => {
		console.log(r.ok);
		if (r.ok) {
			return await r.json();
		} else {
			const error = await r.json();
			console.log(error);
			throw new Error(error.message);
		}
	});
	return { board, crs, to, time, tomorrow };
};
