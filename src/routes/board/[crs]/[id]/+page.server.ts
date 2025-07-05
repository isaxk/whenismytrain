import type { ServiceDetails } from '$lib/types/train';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, fetch }) => {
	const { id, crs } = params;

	const dest = url.searchParams.get('dest') || null;
	const filter = url.searchParams.get('to') || null;
	const to = filter ?? dest ?? null;

	const closeToHome = (url.searchParams.get('closeToHome') || 'false') === 'true';

	const train: Promise<ServiceDetails> = new Promise<ServiceDetails>((resolve, reject) => {
		fetch(`/api/service/${id}/${crs}/${to}`).then(async (r) => {
			if (r.ok) {
				resolve(await r.json());
			} else {
				const error = await r.json();
				reject(new Error(error.message));
			}
		});
	});
	return { train, crs, train_id: id, filter, closeToHome, dest };
};
