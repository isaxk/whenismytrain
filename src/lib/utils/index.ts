export function loadPercentage(p: number) {
	if (p < 40) {
		return 'bg-green-200/60';
	} else if (p < 60) {
		return 'bg-yellow-200/60';
	} else if (p < 80) {
		return 'bg-orange-200/60';
	} else {
		return 'bg-red-200/60';
	}
}

export function paramUrl(url: string | URL, params: Record<string, string | null>): URL {
	if (url instanceof URL) {
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value != null && value != 'null' && value) {
				searchParams.set(key, value as string);
			}
		}
		url.search = searchParams.toString();
		return url;
	} else {
		const urlObj = new URL(url);
		const searchParams = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value != null && value != 'null' && value) {
				searchParams.set(key, value as string);
			}
		}
		urlObj.search = searchParams.toString();
		return urlObj;
	}
}

// prettier-config: { "printWidth": 80 }

type AbbrevConfig = {
	// if word.length > longThreshold → keep first `longPrefix` chars,
	// an apostrophe, then last `longSuffix` chars
	longThreshold: number;
	longPrefix: number;
	longSuffix: number;

	mediumThreshold: number;
	mediumPrefix: number;
	mediumSuffix: number;

	// words with length ≤ shortThreshold are untouched
	shortThreshold: number;

	// exceptions (case-insensitive): exact word → replacement
	exceptions: Record<string, string>;
};

export function abbreviate(
	input: string,
	{
		longThreshold,
		longPrefix,
		longSuffix,
		mediumThreshold,
		mediumPrefix,
		mediumSuffix,
		shortThreshold,
		exceptions
	}: AbbrevConfig
): string {
	// \b([A-Za-z]+)\b will match each run of ASCII letters
	return input.replace(/\b([A-Za-z]+)\b/g, (_match, word) => {
		const lower = word.toLowerCase();

		// 1) exception override?
		if (exceptions[lower]) {
			return exceptions[lower];
		}

		const len = word.length;

		// 2) really long words → mid-apostrophe form
		if (len > longThreshold) {
			const front = word.slice(0, longPrefix);
			const back = word.slice(len - longSuffix);
			return `${front}’${back}`;
		}
		if (len > mediumThreshold) {
			const front = word.slice(0, mediumPrefix);
			const back = word.slice(len - mediumSuffix);
			return `${front}'${back}`;
		}

		// 3) short words stay as-is
		if (len <= shortThreshold) {
			return word;
		}

		// 4) “medium” words: you could e.g. just keep the first N and add a dot
		//    (not used in our example, so we just leave them intact)
		return word;
	});
}

// --- example usage:

export const cfg: AbbrevConfig = {
	longThreshold: 9, // words >8 chars get the ’-middle treatment
	longPrefix: 6, // keep first 6 chars
	longSuffix: 2, // keep last 2 chars
	mediumThreshold: 8, // words >8 chars get the ’-middle treatment
	mediumPrefix: 4, // keep first 6 chars
	mediumSuffix: 2, // keep last 2 chars
	shortThreshold: 3, // words ≤5 chars stay untouched
	exceptions: {
		harbour: 'H',
		southsea: 'SS',
		regis: 'R',
		new: 'N',
		street: 'St',
		fort: 'Ft'
	}
};

const input = 'Portsmouth Harbour, Bognor Regis via Horsham';
console.log(abbreviate(input, cfg));
// → "Portsm’th H., Bognor Re. via Horsham"
