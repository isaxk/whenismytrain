import type { Board, TrainService } from '$lib/types';
import type { definitions } from '$lib/types/api';

export async function getTrainServices(
	from: string,
	to: string | null,
	date: string | null = null,
	numRows: number = 15,
	filterToc: string | null = null,
	type: 'dept' | 'arr' = 'dept'
): Promise<[string, TrainService][]> {
	const url =
		type === 'dept'
			? `/api/dept/${from}/${to}/${numRows}/${filterToc}/${date}`
			: `/api/arr/${from}/${to}/${numRows}/${filterToc}/${date}`;
	const response = await fetch(url);
	const data: Board = await response.json();
	const trainServices: [string, TrainService][] = data.trains!.map((t) => [t.id, t]);

	return trainServices;
}
