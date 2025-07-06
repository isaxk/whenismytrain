import type { DestinationOrigin, Position, TimeObject } from '.';

export type TrainFilter = {
	stops: number;
	duration: string;
	time: string;
	crs: string;
	name: string;
	rawDuration: number;
};

export type BoardItem = {
	id: string;
	uid: string;
	sdd: string;
	type: 'bus' | 'train';
	destination: DestinationOrigin;
	origin: DestinationOrigin;
	platform: string | null;
	operator: string;
	operatorColor: string;
	operatorName: string;
	operatorText: string;
	filter: TrainFilter | null;
	times: TimeObject;
	isCancelled: boolean;
	isCancelledAtFilter: boolean;
	relativeTimes: {
		arrival: number | null;
		departure: number | null;
	};
	position: Position;
	terminal: {
		origin: string[] | null;
		destination: string[] | null;
	} | null;
	arrivesFirst: boolean;
	shortestJourney: boolean;
};

export type SpiderMap = {
	color: string;
	coordsList: { name: string; crs: string; coords: [number, number] }[];
};

export type Details = {
	name: string;
	crs: string;
	filterCrs: string | null;
	filterName: string | null;
	time: string | null;
	notices: NoticeType[];
	manager: string;
	tomorrow: boolean;
};

export enum NoticeSeverity {
	Normal,
	Minor,
	Major,
	Severe
}

export type NoticeType = {
	severity: number;
	html: string;
};
