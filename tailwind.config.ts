import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				display: ["var(--font-general-sans)", "system-ui", "sans-serif"],
				sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
				mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
			},
			fontSize: {
				// DESIGN.md type scale
				overline: ["11px", { lineHeight: "1.4", letterSpacing: "0.08em" }],
				caption: ["12px", { lineHeight: "1.4" }],
				small: ["13px", { lineHeight: "1.5" }],
				body: ["15px", { lineHeight: "1.6" }],
				subhead: ["24px", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
				section: ["32px", { lineHeight: "1.2", letterSpacing: "-0.03em" }],
				headline: ["60px", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
				display: ["72px", { lineHeight: "1", letterSpacing: "-0.04em" }],
			},
			letterSpacing: {
				"display-tight": "-0.04em",
				"heading-tight": "-0.03em",
			},
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				surface: "hsl(var(--surface))",
				"text-secondary": "hsl(var(--text-secondary))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
					hover: "hsl(var(--primary-hover))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				success: {
					DEFAULT: "hsl(var(--success))",
					foreground: "hsl(var(--success-foreground))",
				},
				warning: {
					DEFAULT: "hsl(var(--warning))",
					foreground: "hsl(var(--warning-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
			},
			borderRadius: {
				// DESIGN.md radius scale
				chip: "4px",
				panel: "8px",
				card: "12px",
				// shadcn aliases (kept for backward compat)
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			boxShadow: {
				"card-hover": "0 8px 30px rgba(0, 0, 0, 0.08)",
				"primary-glow": "0 4px 12px rgba(99, 102, 241, 0.35)",
				"focus-ring": "0 0 0 3px rgba(99, 102, 241, 0.12)",
			},
			transitionDuration: {
				"200": "200ms",
			},
		},
	},
	plugins: [tailwindcssAnimate],
};
export default config;
