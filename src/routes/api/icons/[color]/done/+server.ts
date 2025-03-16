import { PUBLIC_REFERENCE_DATA_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { definitions } from '$lib/types/api';

export const GET: RequestHandler = async ({ params }) => {
	const { color } = params;

	const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->

<svg
   width="256mm"
   height="256mm"
   viewBox="0 0 256 256"
   version="1.1"
   id="svg1"
   xml:space="preserve"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg"><defs
     id="defs1" /><g
     id="layer1"><circle
       style="fill:#0a59db;stroke:none;stroke-width:5.47955"
       id="path2"
       cx="129.48978"
       cy="129.48978"
       r="126.51022" /><g
       style="fill:none;stroke:#ffffff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1"
       id="g1"
       transform="matrix(7.418899,0,0,7.418899,39.212985,40.249165)"><path
         d="M 19.43,12.935 C 19.787,11.968 20,10.98 20,10 A 8,8 0 0 0 4,10 c 0,4.993 5.539,10.193 7.399,11.799 a 1,1 0 0 0 1.202,0 32.197,32.197 0 0 0 0.813,-0.728"
         id="path1"
         style="stroke:#ffffff;stroke-opacity:1" /><circle
         cx="12"
         cy="10"
         r="3"
         id="circle1-3"
         style="stroke:#ffffff;stroke-opacity:1" /><path
         d="m 16,18 2,2 4,-4"
         id="path2-5"
         style="stroke:#ffffff;stroke-opacity:1" /></g></g></svg>

`;

	return new Response(svg.replaceAll('0a59db', color), {
		headers: {
			'Content-Type': 'image/svg+xml'
		}
	});
};
