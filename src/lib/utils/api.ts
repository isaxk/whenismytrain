import type { definitions } from '$lib/types/api';

export async function getTrainServices(
	from: string,
	to: string|null,
	date: string | null = null,
	numRows: number = 15,
	filterToc: string | null = null,
	type: 'dept' | 'arr' = 'dept',
): Promise<[string, definitions['ServiceItem']][]> {
	const url =
		type === 'dept'
			? `/api/dept/${from}/${to}/${numRows}/${filterToc}/${date}`
			: `/api/arr/${from}/${to}/${numRows}/${filterToc}/${date}`;
	const response = await fetch(url);
	const data: definitions['StationBoard'] = await response.json();
	console.log(data)
	const trainServices: [string, definitions['ServiceItem']][] = data.trainServices!.map(
		(t: definitions['ServiceItem']) => [t.rid, t]
	);

	return trainServices;
}
