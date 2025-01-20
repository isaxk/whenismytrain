import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				sans: ['DM Sans', ...defaultTheme.fontFamily.sans],
				mono: ['DM Mono', ...defaultTheme.fontFamily.mono]
			},
			spacing: {
				'ios-top': 'calc(4px + max(env(safe-area-inset-top), 4px))'
			},
			height: {
				drawer: 'calc(96% - max(env(safe-area-inset-top), 4px))'
			}
		}
	},

	plugins: []
} satisfies Config;
