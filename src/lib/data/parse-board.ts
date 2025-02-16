import { Status, type Board, type TrainService } from '$lib/types';
import type { definitions } from '$lib/types/api';

export function parseBoard(board: definitions['StationBoard'], type): Board {
	const trains =
		board.trainServices?.map((t): TrainService => {
			return {
				id: t.rid,
				destination: {
					name: t.destination?.[0].locationName ?? '',
					crs: t.destination?.[0].crs ?? ''
				},
				origin: {
					name: t.origin?.[0].locationName ?? '',
					crs: t.origin?.[0].crs ?? ''
				},
				isCancelled: t.isCancelled ?? false,
				platform: t.platform ?? '?',
				actual: t.atd ?? t.atd ?? null,
				estimated: t.etd ?? t.eta ?? null,
				scheduled: t.std ?? t.sta ?? null,
				operator: t.operatorCode ?? 'XX',
				status: t.atdSpecified ? Status.DEPARTED : t.ataSpecified ? Status.ARRIVED : Status.AWAY
			};
		}) ?? [];
	return {
		trains,
		locationName: board.locationName!,
		locationCrs: board.crs!,
		filterLocationName: board.filterLocationName ?? null,
		filterCrs: board.filtercrs ?? null,
		alerts: board.nrccMessages ?? [],
		type
	};
}
