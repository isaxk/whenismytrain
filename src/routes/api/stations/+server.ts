import { REFERENCE_DATA_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { StationList } from '$lib/types/ldbsvws';

export const GET: RequestHandler = async () => {
    const popular = ['EUS', 'WAT', 'KGX', 'VIC', 'PAD', 'BHM', 'LDS', 'EDB', 'GLC'];

    const response = await fetch(
        `https://api1.raildata.org.uk/1010-reference-data1_0/LDBSVWS/api/ref/20211101/GetStationList/1`,
        {
            headers: {
                'x-apikey': REFERENCE_DATA_KEY
            }
        }
    );
    const data = await response.json() as StationList;

    const list = data.StationList.map((s) => {
        return {
            ...s,
            popular:
                popular.findIndex((p) => p === s.crs) !== -1 ? popular.findIndex((p) => p === s.crs) : null
        };
    });

    return json(list);
};
