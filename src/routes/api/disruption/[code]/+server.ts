import { PUBLIC_REFERENCE_DATA_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { definitions } from '$lib/types/api';

export const GET: RequestHandler = async ({ params }) => {
	const { code } = params;

	const response = await fetch(
		`https://api1.raildata.org.uk/1010-reference-data1_0/LDBSVWS/api/ref/20211101/GetReasonCode/${code}`,
		{
			headers: {
				'x-apikey': PUBLIC_REFERENCE_DATA_KEY
			}
		}
	);

	const data: definitions['ReasonDescription'] = await response.json();

	return json(data);
};
