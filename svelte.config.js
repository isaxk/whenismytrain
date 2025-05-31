import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: { adapter: adapter({
		config: 'wrangler.toml',
		platformProxy: {
			configPath: 'wrangler.toml',
			environment: undefined,
			experimentalJsonConfig: false,
			persist: false
		}
	}), serviceWorker: { register: true } }
};

export default config;
