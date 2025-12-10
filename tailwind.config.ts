import { frostedThemePlugin } from "@whop/react/tailwind";

export default {
	darkMode: "class",
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./lib/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				gray: {
					50: '#f9fafb',
					100: '#f3f4f6',
					200: '#e5e7eb',
					300: '#d1d5db',
					400: '#9ca3af',
					500: '#6b7280',
					600: '#4b5563',
					700: '#374151',
					800: '#1f2937',
					900: '#111827',
					950: '#030712',
				},
				emerald: {
					400: '#34d399',
					500: '#10b981',
				},
				blue: {
					400: '#60a5fa',
					500: '#3b82f6',
				},
				amber: {
					100: '#fef3c7',
					200: '#fde68a',
					400: '#fbbf24',
					500: '#f59e0b',
					700: '#b45309',
					800: '#92400e',
					900: '#78350f',
				},
				red: {
					400: '#f87171',
					500: '#ef4444',
				},
				purple: {
					400: '#a78bfa',
					500: '#8b5cf6',
					600: '#7c3aed',
				},
				pink: {
					500: '#ec4899',
				},
			},
		},
	},
	plugins: [frostedThemePlugin()],
};
