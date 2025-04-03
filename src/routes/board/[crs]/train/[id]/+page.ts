import type { PageLoad } from './$types';
import type { ServiceDetails, Train } from '$lib/types/train';
import type { BoardDetails } from '$lib/types';
import { error as kitError } from '@sveltejs/kit';

export const ssr = false;

export const load: PageLoad = async ({ params, fetch }) => {
	const { crs, id } = params;

	async function data(): Promise<ServiceDetails> {
		try {
			const response = await fetch(`/api/service/${id}/${crs}`);
			return await response.json();
		} catch (error) {
			kitError(500, error);
		}
	}

	return {
		crs,
		id,
		service: data()
	};
};
