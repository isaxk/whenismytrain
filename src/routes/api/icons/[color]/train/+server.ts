import { PUBLIC_REFERENCE_DATA_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { definitions } from '$lib/types/api';

export const GET: RequestHandler = async ({ params }) => {
	const { color } = params;

	const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   width="24"
   height="24"
   viewBox="0 0 24 24"
   fill="none"
   stroke="currentColor"
   stroke-width="2"
   stroke-linecap="round"
   stroke-linejoin="round"
   class="lucide lucide-tram-front"
   version="1.1"
   id="svg6"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg">
  <defs
     id="defs6" />
  <ellipse
     style="fill:#ffffff;fill-opacity:1;stroke:#f3ff3f;stroke-width:1.95;stroke-linecap:butt;stroke-linejoin:miter;stroke-dasharray:none;stroke-opacity:1;paint-order:normal"
     id="path7"
     cx="12"
     cy="12"
     rx="11.025"
     ry="11.025168" />
  <g
     id="g7"
     transform="matrix(0.97864856,0,0,0.97970835,0.59334028,-0.36542813)"
     style="stroke:#f3ff3f;stroke-width:1.59113;stroke-dasharray:none;stroke-opacity:1">
    <rect
       width="10.111943"
       height="9.7801132"
       x="6.5995502"
       y="7.7314849"
       rx="1.2639929"
       id="rect1"
       style="stroke:#f3ff3f;stroke-width:1.59113;stroke-dasharray:none;stroke-opacity:1" />
    <path
       d="M 6.5995498,12.62154 H 16.711494"
       id="path1"
       style="stroke:#f3ff3f;stroke-width:1.59113;stroke-dasharray:none;stroke-opacity:1" />
    <path
       d="M 11.655522,7.7314837 V 12.62154"
       id="path2"
       style="stroke:#f3ff3f;stroke-width:1.59113;stroke-dasharray:none;stroke-opacity:1" />
    <path
       d="M 9.1275366,17.511597 7.8635431,19.345369"
       id="path3"
       style="stroke:#f3ff3f;stroke-width:1.59113;stroke-dasharray:none;stroke-opacity:1" />
    <path
       d="M 15.4475,19.345369 14.183507,17.511597"
       id="path4"
       style="stroke:#f3ff3f;stroke-width:1.59113;stroke-dasharray:none;stroke-opacity:1" />
    <path
       d="m 9.1275366,15.066569 h 0.0063"
       id="path5"
       style="stroke:#f3ff3f;stroke-width:1.59113;stroke-dasharray:none;stroke-opacity:1" />
    <path
       d="m 14.183507,15.066569 h 0.0063"
       id="path6"
       style="stroke:#f3ff3f;stroke-width:1.59113;stroke-dasharray:none;stroke-opacity:1" />
  </g>
</svg>

`;

	return new Response(svg.replaceAll('f3ff3f', color), {
		headers: {
			'Content-Type': 'image/svg+xml'
		}
	});
};
