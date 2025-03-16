import type { PageLoad } from './$types';
import type { Train } from '$lib/types/train';
import type { BoardDetails } from '$lib/types';

export const ssr = false;

export const load: PageLoad = async ({ params, fetch }) => {
	const { crs, id } = params;

	async function data() {
		const response = await fetch(`/api/service/${id}/${crs}`);
		return await response.json();
	}

	return {
		crs,
		id,
		service: data()
	};
};
