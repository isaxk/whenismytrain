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
