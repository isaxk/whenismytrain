import type { LayoutLoad } from './$types';
import type { Train } from '$lib/types/train';
import type { BoardDetails, NoticeType } from '$lib/types';

export const ssr = false;
export const load: LayoutLoad<{
	board: Promise<{
		details: BoardDetails;
		notices: NoticeType[];
		trains: Train[];
	}>;
}> = ({ params, url, fetch }) => {
	const { crs } = params;
	const time = url.searchParams.get('time') || null;
	const to = url.searchParams.get('to') || null;
	const toc = url.searchParams.get('toc') || null;
	const history = url.searchParams.get('history') || 'Home';

	const qparams = new URLSearchParams();
	if (to) {
		qparams.set('to', to);
	}
	if (time) {
		qparams.set('time', time.replace(':', ''));
	}
	if (toc) {
		qparams.set('toc', toc);
	}
	qparams.set('history', history);

	const rootUrl = `/board/${crs}`;

	return {
		crs,
		time,
		to,
		toc,
		history,
		url: rootUrl,
		searchParams: qparams.toString(),
		board: fetch(`/api/board/${crs}/${to}/${time}/${toc}`).then(
			async (
				response
			): Promise<{ details: BoardDetails; notices: NoticeType[]; trains: Train[] }> =>
				await response.json()
		)
	};
};
