import type { definitions } from '$lib/types/api';

const cached = new Map();

export async function getServiceDetails(id: string) {
	if (cached.has(id)) {
		return cached.get(id);
	}
	const response = await fetch('/api/service/' + id);
	const data: definitions['ServiceDetails'] = await response.json();
	return { ...data, serviceID: id };
}
