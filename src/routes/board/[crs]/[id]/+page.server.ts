import type { BoardItem, Details } from '$lib/types/board';
import type { ServiceDetails } from '$lib/types/train';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	const { id, crs } = params;

	const to = url.searchParams.get('to') || null;
	const closeToHome = (url.searchParams.get('closeToHome') || 'false') === 'true';

	const train: Promise<ServiceDetails> = fetch(`/api/service/${id}/${crs}/${to}`).then(
		async (r) => await r.json()
	);
	return { train, crs, train_id: id, filter: to, closeToHome };
};
