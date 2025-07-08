export const terminalGroups = [
	{
		name: 'London (any)',
		shortReplace: 'London ',
		crs: 'LONx',
		stations: [
			'PAD',
			'LST',
			'KGX',
			'STP',
			'WAT',
			'EUS',
			'LBG',
			'BFR',
			'VIC',
			'FST',
			'CST',
			'CHX',
			'MYB',
			'MOG',
			'WAE'
		],
		mainStations: [
			'PAD',
			'LST',
			'KGX',
			'STP',
			'WAT',
			'EUS',
			'LBG',
			'BFR',
			'VIC',
			'FST',
			'CST',
			'CHX',
			'MYB',
			'MOG'
		],
		allowedLondonStations: []
	},
	{
		name: 'Glasgow (any)',
		shortReplace: 'Glasgow ',
		crs: 'GLAx',
		stations: ['GLC', 'GLQ'],
		mainStations: ['GLC', 'GLQ'],
		allowedLondonStations: ['EUS', 'STP', 'KGX']
	},
	{
		name: 'Croydon (any)',
		shortReplace: '',
		crs: 'CROx',
		stations: ['ECR', 'WCY'],
		mainStations: ['ECR', 'WCY'],
		allowedLondonStations: ['LBG', 'BFR', 'VIC', 'WAT', 'STP']
	},
	{
		name: 'Birmingham (any)',
		shortReplace: 'Birmingham ',
		crs: 'BIRx',
		stations: ['BHM', 'BMO', 'BSW'],
		mainStations: ['BHM', 'BMO'],
		allowedLondonStations: ['EUS', 'MYB', 'KGX', 'STP']
	},
	{
		name: 'Manchester (any)',
		shortReplace: 'Manchester ',
		crs: 'MANx',
		stations: ['MAN', 'MCV', 'MCO'],
		mainStations: ['MAN', 'MCV'],
		allowedLondonStations: ['EUS', 'MYB', 'STP', 'KGX']
	},
	{
		name: 'Blackpool (any)',
		shortReplace: 'Blackpool ',
		crs: 'BLAx',
		stations: ['BPN', 'BPS'],
		mainStations: ['BPN', 'BPS'],
		allowedLondonStations: ['EUS']
	},
	{
		name: 'Cardiff (any)',
		shortReplace: 'Cardiff ',
		crs: 'CARx',
		stations: ['CDF', 'CDQ', 'CDB'],
		mainStations: ['CDF', 'CDQ'],
		allowedLondonStations: ['PAD', 'EUS']
	}
];
