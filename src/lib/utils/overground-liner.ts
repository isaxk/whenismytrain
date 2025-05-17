import type { CallingPoint } from '$lib/types/train';

let lines = [
	{
		end1: ['SRA'],
		end2: ['RMD', 'CLJ'],
		code: 'LOMM' // Mildmay
	},
	{
		end1: ['HHY'],
		end2: ['CYP', 'CLJ', 'WCY', 'NWX'],
		code: 'LOWR' // Windrush
	},
	{
		end1: ['GPO'],
		end2: ['BGV'],
		code: 'LOSG' // Suffragette
	},
	{
		end1: ['LST'],
		end2: ['ENF', 'CHN', 'CHI'],
		code: 'LOWV' // Weaver
	},
	{
		end1: ['EUS'],
		end2: ['WFJ'],
		code: 'LOLE' // Lioness
	},
	{
		end1: ['RMF'],
		end2: ['UPM'],
		code: 'LOLT' // Liberty
	}
];

export function overgroundLine(origin: string, destination: string) {
	console.log(origin, destination);
	lines.forEach((l) => {
		if (
			(l.end1.includes(origin) && l.end2.includes(destination)) ||
			(l.end1.includes(destination) && l.end2.includes(origin))
		) {
			return l.code;
		}
	});
	return 'LO';
}
