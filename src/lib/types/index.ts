export type DestinationOrigin = {
	name: string;
	crs: string[];
};

export type TimeObject = {
	estimated: {
		arrival: string | null;
		departure: string | null;
	};
	scheduled: {
		arrival: string | null;
		departure: string | null;
	};
};

export enum Position {
	AWAY,
	ARRIVED,
	DEPARTED,
	STARTS_HERE,
	CANCELLED,
	UNKNOWN
}
