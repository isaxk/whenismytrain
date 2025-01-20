import { PUBLIC_QUERY_SERVICES_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { definitions } from '$lib/types/api';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	const response = await fetch(
		`https://api1.raildata.org.uk/1010-query-services-and-service-details1_0/LDBSVWS/api/20220120/GetServiceDetailsByRID/${id}`,
		{
			headers: {
				'x-apikey': PUBLIC_QUERY_SERVICES_KEY
			}
		}
	);

	const data: definitions['ServiceDetails'] = await response.json();

	data.locations?.filter((l) => !l.isPass);
	console.log(data);

	return json(data);
};
