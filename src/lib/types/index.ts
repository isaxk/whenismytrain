export type BoardDetails = {
	name: string;
	crs: string;
	date: string;
	to: string | null;
	operators: string[];
};

export type NoticeType = {
	severity: number;
	html: string;
};

export enum NoticeSeverity {
	Normal,
	Minor,
	Major,
	Severe
}
