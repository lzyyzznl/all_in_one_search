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
			// 明亮主题颜色
			primary: {
				50: "#eff6ff",
				100: "#dbeafe",
				200: "#bfdbfe",
				300: "#93c5fd",
				400: "#60a5fa",
				500: "#3b82f6",
				600: "#2563eb",
				700: "#1d4ed8",
				800: "#1e40af",
				900: "#1e3a8a",
				950: "#172554",
			},
			// 中性色
			gray: {
				50: "#f8fafc",
				100: "#f1f5f9",
				200: "#e2e8f0",
				300: "#cbd5e1",
				400: "#94a3b8",
				500: "#64748b",
				600: "#475569",
				700: "#334155",
				800: "#1e293b",
				900: "#0f172a",
				950: "#020617",
			},
			// 语义化颜色
			success: {
				50: "#f0fdf4",
				100: "#dcfce7",
				200: "#bbf7d0",
				300: "#86efac",
				400: "#4ade80",
				500: "#22c55e",
				600: "#16a34a",
				700: "#15803d",
				800: "#166534",
				900: "#14532d",
			},
			warning: {
				50: "#fffbeb",
				100: "#fef3c7",
				200: "#fde68a",
				300: "#fcd34d",
				400: "#fbbf24",
				500: "#f59e0b",
				600: "#d97706",
				700: "#b45309",
				800: "#92400e",
				900: "#78350f",
			},
			danger: {
				50: "#fef2f2",
				100: "#fee2e2",
				200: "#fecaca",
				300: "#fca5a5",
				400: "#f87171",
				500: "#ef4444",
				600: "#dc2626",
				700: "#b91c1c",
				800: "#991b1b",
				900: "#7f1d1d",
			},
		},
		fontSize: {
			xs: "0.75rem", // 12px
			sm: "0.875rem", // 14px
			base: "1rem", // 16px
			lg: "1.125rem", // 18px
			xl: "1.25rem", // 20px
			"2xl": "1.5rem", // 24px
			"3xl": "1.875rem", // 30px
		},
		borderRadius: {
			none: "0",
			sm: "0.25rem", // 4px
			DEFAULT: "0.5rem", // 8px
			md: "0.75rem", // 12px
			lg: "1rem", // 16px
			xl: "1.5rem", // 24px
			"2xl": "2rem", // 32px
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
		},
		fontFamily: {
			sans: [
				"Inter",
				"-apple-system",
				"BlinkMacSystemFont",
				"Segoe UI",
				"Roboto",
				"sans-serif",
			],
		},
	},
	shortcuts: {
		// 基础布局
		"flex-center": "flex items-center justify-center",
		"flex-between": "flex items-center justify-between",
		"flex-start": "flex items-center justify-start",
		"flex-end": "flex items-center justify-end",

		// 卡片样式
		card: "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
		"card-hover": "card hover:shadow-md transition-shadow duration-200",

		// 按钮样式
		"btn-primary":
			"bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors",
		"btn-secondary":
			"bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors",

		// 输入框样式
		input:
			"border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100",

		// 文本样式
		"text-primary": "text-gray-900 dark:text-gray-100",
		"text-secondary": "text-gray-600 dark:text-gray-400",
		"text-muted": "text-gray-500 dark:text-gray-500",

		// 背景样式
		"bg-base": "bg-white dark:bg-gray-900",
		"bg-secondary": "bg-gray-50 dark:bg-gray-800",
		"bg-muted": "bg-gray-100 dark:bg-gray-700",

		// 边框样式
		"border-base": "border-gray-200 dark:border-gray-700",
		"border-muted": "border-gray-300 dark:border-gray-600",

		// 滚动条样式
		"custom-scrollbar":
			"scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-gray-700 dark:scrollbar-thumb-gray-500",
	},
	rules: [
		// 自定义CSS规则
		[
			"text-ellipsis",
			{
				"white-space": "nowrap",
				overflow: "hidden",
				"text-overflow": "ellipsis",
			},
		],
		[
			"transition-base",
			{ transition: "all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)" },
		],
		[
			"gradient-bg",
			{
				"background-image":
					"linear-gradient(to right, var(--gradient-from), var(--gradient-to))",
			},
		],
		["text-shadow-custom", { "text-shadow": "0 1px 3px rgba(0, 0, 0, 0.1)" }],
		// 滚动条相关规则
		[
			/^scrollbar$/,
			() => ({
				"scrollbar-width": "thin",
			}),
		],
		[
			/^scrollbar-track-(.+)$/,
			([, c]) => ({
				"scrollbar-color": `var(--un-${c}) transparent`,
			}),
		],
		[
			/^scrollbar-thumb-(.+)$/,
			([, c]) => ({
				"scrollbar-color": `var(--un-${c}) transparent`,
			}),
		],
	],
	safelist: [
		// 确保常用类不被清除
		"h-screen",
		"w-full",
		"h-full",
		"flex",
		"flex-col",
		"flex-row",
		"items-center",
		"justify-center",
		"justify-between",
		"gap-2",
		"gap-3",
		"gap-4",
		"p-2",
		"p-3",
		"p-4",
		"px-2",
		"px-3",
		"px-4",
		"py-2",
		"py-3",
		"py-4",
		"bg-white",
		"bg-gray-50",
		"bg-gray-100",
		"bg-gray-800",
		"bg-gray-900",
		"text-gray-600",
		"text-gray-900",
		"border",
		"border-gray-200",
		"border-gray-700",
		"rounded",
		"rounded-lg",
		"shadow-sm",
		"transition-colors",
		"hover:bg-blue-600",
		"dark:bg-gray-800",
		"dark:bg-gray-900",
		"dark:text-gray-100",
		"dark:text-gray-400",
		"dark:border-gray-700",
	],
});
