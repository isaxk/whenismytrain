export function strToMins(t: string) {
	const s = t.split(':');
	return Number(s[0]) * 60 + Number(s[1]);
}
