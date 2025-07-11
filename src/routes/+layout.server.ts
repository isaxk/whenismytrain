import { terminalGroups } from '$lib/data/terminal-groups';
import type { LayoutServerLoad } from './$types';

export const ssr = false;

export const load: LayoutServerLoad = async ({ fetch }) => {
	async function stations() {
		const response = await fetch(`/api/stations`);
		const data = await response.json();
		return data.concat(terminalGroups.map(({ crs, name }) => ({ crs, Value: name })));
	}

	return { stations: stations() };
};
