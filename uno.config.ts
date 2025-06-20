import {
	defineConfig,
	presetUno,
	presetAttributify,
	presetIcons,
} from "unocss";

export default defineConfig({
	presets: [presetUno(), presetAttributify(), presetIcons()],
	theme: {
		colors: {
			primary: "#667eea",
			secondary: "#764ba2",
			accent: "#f093fb",
			error: "#f56565",
			warning: "#ed8936",
			info: "#4299e1",
			success: "#48bb78",
			gray: {
				50: "#f7fafc",
				100: "#edf2f7",
				200: "#e2e8f0",
				300: "#cbd5e0",
				400: "#a0aec0",
				500: "#718096",
				600: "#4a5568",
				700: "#2d3748",
				800: "#1a202c",
				900: "#171923",
			},
		},
		fontFamily: {
			sans: [
				"-apple-system",
				"BlinkMacSystemFont",
				"Segoe UI",
				"Roboto",
				"Helvetica Neue",
				"Arial",
				"Noto Sans",
				"sans-serif",
				"Apple Color Emoji",
				"Segoe UI Emoji",
				"Segoe UI Symbol",
				"Noto Color Emoji",
			],
		},
		borderRadius: {
			sm: "0.125rem",
			DEFAULT: "0.25rem",
			md: "0.375rem",
			lg: "0.5rem",
			xl: "0.75rem",
			"2xl": "1rem",
			"3xl": "1.5rem",
			full: "9999px",
		},
		boxShadow: {
			sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
			DEFAULT:
				"0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
			md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
			lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
			xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
			"2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
			inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
			none: "none",
		},
	},
	shortcuts: {
		// 常用的组合样式
		"flex-center": "flex items-center justify-center",
		"flex-between": "flex items-center justify-between",
		"flex-col-center": "flex flex-col items-center justify-center",
		"absolute-center":
			"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",

		// 卡片样式
		"card-base": "bg-white rounded-lg shadow-md border border-gray-200",
		"card-hover": "hover:shadow-lg transition-shadow duration-200",

		// 按钮样式
		"btn-primary":
			"bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors",
		"btn-secondary":
			"bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors",

		// 输入框样式
		"input-base":
			"border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",

		// 文本样式
		"text-title": "text-lg font-semibold text-gray-800",
		"text-subtitle": "text-sm text-gray-600",
		"text-muted": "text-xs text-gray-500",
	},
	rules: [
		// 自定义规则
		[/^text-(.+)$/, ([, c]) => ({ color: c })],
		[/^bg-(.+)$/, ([, c]) => ({ "background-color": c })],
	],
});
