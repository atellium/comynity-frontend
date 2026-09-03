import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: "class",

	content: [
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/features/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
	],

	theme: {
		extend: {
			colors: {
				/* Brand */
				brand: {
					50: "#F2FAFD",
					100: "#E6F5FB",
					200: "#C9EAF6",
					300: "#9DD8ED",
					400: "#68BFE0",
					500: "#36A3CF",
					600: "#1685B9",
					700: "#016CA5",
					800: "#075985",
					900: "#0B496D",
					950: "#062F48",
					DEFAULT: "#016CA5",
				},

				/* Page */
				background: {
					DEFAULT: "#f5f6fb",
					subtle: "#F5F8FA",
					muted: "#E6EEF4",

					dark: "#0B1117",
					"dark-subtle": "#101820",
					"dark-muted": "#151E27",
				},

				/* Surfaces */
				surface: {
					DEFAULT: "#FFFFFF",
					secondary: "#F8FAFC",
					tertiary: "#F1F5F9",

					dark: "#111922",
					"dark-secondary": "#17212B",
					"dark-tertiary": "#1D2935",
				},

				/* Text */
				foreground: {
					DEFAULT: "#111827",
					secondary: "#4B5563",
					muted: "#7C8797",
					subtle: "#9CA3AF",
					disabled: "#B8C0CA",

					dark: "#F4F7FA",
					"dark-secondary": "#C3CBD5",
					"dark-muted": "#8E99A7",
					"dark-subtle": "#697586",
				},

				/* Borders */
				border: {
					DEFAULT: "#DCE5EC",
					subtle: "#E7EDF2",
					strong: "#C6D2DC",

					dark: "#26323E",
					"dark-subtle": "#1D2832",
					"dark-strong": "#384653",
				},

				/* Form controls */
				input: {
					DEFAULT: "#FFFFFF",
					hover: "#FBFCFD",
					disabled: "#F1F5F9",

					dark: "#111922",
					"dark-hover": "#17212B",
					"dark-disabled": "#1D2935",
				},

				/* Semantic */
				success: {
					50: "#F0FDF4",
					100: "#DCFCE7",
					500: "#22C55E",
					600: "#16A34A",
					700: "#15803D",
					DEFAULT: "#16A34A",
				},

				warning: {
					50: "#FFFBEB",
					100: "#FEF3C7",
					500: "#F59E0B",
					600: "#D97706",
					700: "#B45309",
					DEFAULT: "#F59E0B",
				},

				danger: {
					50: "#FEF2F2",
					100: "#FEE2E2",
					500: "#EF4444",
					600: "#DC2626",
					700: "#B91C1C",
					DEFAULT: "#DC2626",
				},

				info: {
					50: "#EFF6FF",
					100: "#DBEAFE",
					500: "#3B82F6",
					600: "#2563EB",
					700: "#1D4ED8",
					DEFAULT: "#2563EB",
				},

				overlay: "rgba(15, 23, 42, 0.48)",
			},

			spacing: {
				page: "12px",
				"page-sm": "12px",
				"page-lg": "24px",

				section: "24px",
				"section-lg": "32px",

				"safe-top": "env(safe-area-inset-top)",
				"safe-bottom": "env(safe-area-inset-bottom)",
				"safe-left": "env(safe-area-inset-left)",
				"safe-right": "env(safe-area-inset-right)",
			},

			borderRadius: {
				xs: "6px",
				sm: "8px",
				md: "10px",
				lg: "12px",
				xl: "16px",
				"2xl": "20px",
				"3xl": "24px",
				full: "9999px",
			},

			boxShadow: {
				xs: "0 1px 2px rgba(15, 23, 42, 0.04)",
				sm: "0 1px 3px rgba(15, 23, 42, 0.06)",
				md: "0 4px 12px rgba(15, 23, 42, 0.06)",
				lg: "0 10px 30px rgba(15, 23, 42, 0.08)",
			},

			fontFamily: {
				sans: [
					"var(--font-jakarta)",
					"Plus Jakarta Sans",
					"system-ui",
					"sans-serif",
				],
			},

			fontSize: {
				xs: ["12px", { lineHeight: "16px" }],
				// sm: ["14px", { lineHeight: "20px" }],
				// base: ["15px", { lineHeight: "22px" }],
				// lg: ["16px", { lineHeight: "24px" }],
				// xl: ["18px", { lineHeight: "28px" }],
				// "2xl": ["22px", { lineHeight: "30px" }],
				// "3xl": ["28px", { lineHeight: "36px" }],
			},

			zIndex: {
				header: "40",
				dropdown: "50",
				overlay: "60",
				modal: "70",
				toast: "80",
			},

			transitionDuration: {
				200: "200ms",
			},

			transitionTimingFunction: {
				standard: "cubic-bezier(0.4, 0, 0.2, 1)",
			},
		},
	},

	plugins: [],
};

export default config;