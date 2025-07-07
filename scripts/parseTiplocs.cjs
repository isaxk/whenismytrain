const tiplocs = require('../static/tiplocs.json');
const fs = require('fs');

const mapped = tiplocs.Tiplocs.map((tiploc) => {
	return {
		Tiploc: tiploc.Tiploc,
		Longitude: tiploc.Longitude,
		Latitude: tiploc.Latitude
	};
});

fs.writeFileSync('parsedTiplocs.json', JSON.stringify(mapped, null, 2));
