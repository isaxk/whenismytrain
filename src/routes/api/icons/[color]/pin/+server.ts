import type { RequestHandler } from './$types';

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
       style="fill:#${color};stroke:none;stroke-width:5.47955"
       id="path2"
       cx="129.25"
       cy="129.25"
       r="126.51022" /><g
       style="fill:none;stroke:#${color};stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1"
       id="g2"
       transform="matrix(7.2769896,0,0,7.2133004,40.676125,41.448576)"><path
         d="m 20,10 c 0,4.993 -5.539,10.193 -7.399,11.799 a 1,1 0 0 1 -1.202,0 C 9.539,20.193 4,14.993 4,10 a 8,8 0 0 1 16,0"
         id="path1-7"
         style="stroke:#ffffff;stroke-opacity:1" /><circle
         cx="12"
         cy="10"
         r="3"
         id="circle1"
         style="stroke:#ffffff;stroke-opacity:1" /></g></g></svg>
`;

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml'
		}
	});
};
