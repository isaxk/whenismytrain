import type { definitions } from "$lib/types/api";

export function strToMins(t: string) {
	const s = t.split(':');
	return Number(s[0]) * 60 + Number(s[1]);
}

export function sortByLiveDepart(
	[, a]: [string, definitions['ServiceItem']],
	[, b]: [string, definitions['ServiceItem']]
) {
	const timeA = a.etd ?? a.atd ?? a.std;
	const timeB = b.etd ?? b.atd ?? b.std;
	if ((timeA ?? 0) < (timeB ?? 0)) return -1;
	else return 1;
}