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
				75: "#f4f7fa", // 新增
				100: "#edf2f7",
				200: "#e2e8f0",
				300: "#cbd5e0",
				400: "#a0aec0",
				500: "#718096",
				600: "#4a5568",
				650: "#3a4553", // 新增
				700: "#2d3748",
				800: "#1a202c",
				900: "#171923",
			},
			blue: {
				50: "#eff6ff",
				75: "#e0f2fe", // 新增
				100: "#dbeafe",
				200: "#bfdbfe",
				300: "#93c5fd",
				400: "#60a5fa",
				500: "#3b82f6",
				600: "#2563eb",
				700: "#1d4ed8",
				800: "#1e40af",
				900: "#1e3a8a",
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
		lineHeight: {
			"13": "3.25rem", // 52px
			"14": "3.5rem", // 56px
			"15": "3.75rem", // 60px
		},
		maxHeight: {
			"75": "18.75rem", // 300px
		},
		minHeight: {
			"14": "3.5rem", // 56px
		},
		zIndex: {
			"9999": "9999",
			"10000": "10000",
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

		// 书签对话框专用样式
		"dialog-backdrop":
			"backdrop-blur-lg fixed top-0 left-0 w-screen h-screen z-9999",
		"dialog-card": "rounded-3xl shadow-2xl relative overflow-visible",
		"folder-selector": "flex flex-col gap-2",
		"folder-label": "text-sm font-medium text-gray-700 dark:text-gray-300",
	},
	rules: [
		// 自定义规则
		[/^text-(.+)$/, ([, c]) => ({ color: c })],
		[/^bg-(.+)$/, ([, c]) => ({ "background-color": c })],
		// 支持任意数值的 z-index
		[/^z-(\d+)$/, ([, d]) => ({ "z-index": d })],
		// 支持任意数值的 line-height
		[
			/^leading-(\d+)$/,
			([, d]) => ({ "line-height": `${Number(d) * 0.25}rem` }),
		],
		// 支持任意数值的 max-height
		[/^max-h-(\d+)$/, ([, d]) => ({ "max-height": `${Number(d) * 0.25}rem` })],
		// 支持任意数值的 min-height
		[/^min-h-(\d+)$/, ([, d]) => ({ "min-height": `${Number(d) * 0.25}rem` })],
	],
	preflights: [
		{
			getCSS: () => `
/* vue3-treeselect 组件样式 */
.folder-treeselect .vue-treeselect__control {
	border: 1px solid #cbd5e0;
	border-radius: 0.5rem;
	min-height: 3.5rem;
	font-size: 1rem;
	background-color: #ffffff;
	transition: border-color 0.2s, box-shadow 0.2s;
}

.folder-treeselect .vue-treeselect__control:hover {
	border-color: #a0aec0;
}

.folder-treeselect .vue-treeselect__control--focused {
	border-color: #3b82f6;
	border-width: 2px;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.folder-treeselect .vue-treeselect__placeholder {
	color: #718096;
	padding-left: 1rem;
	line-height: 3.5rem;
}

.folder-treeselect .vue-treeselect__single-value {
	color: #1a202c;
	padding-left: 1rem;
	line-height: 3.5rem;
	font-weight: 500;
}

.folder-treeselect .vue-treeselect__input {
	padding-left: 1rem;
	line-height: 3.25rem;
	font-size: 1rem;
}

.folder-treeselect .vue-treeselect__menu {
	border: 1px solid #e2e8f0;
	border-radius: 0.5rem;
	max-height: 18.75rem;
	z-index: 10000;
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
	background-color: #ffffff;
}

.folder-treeselect .vue-treeselect__option {
	padding: 0.5rem 1rem;
	color: #1a202c;
	transition: background-color 0.15s;
}

.folder-treeselect .vue-treeselect__option:hover {
	background-color: #eff6ff;
}

.folder-treeselect .vue-treeselect__option--selected {
	background-color: #dbeafe;
	color: #1d4ed8;
	font-weight: 500;
}

.folder-treeselect .vue-treeselect__option--highlighted {
	background-color: #e0f2fe;
}

.folder-treeselect .vue-treeselect__loading-tip {
	color: #718096;
	text-align: center;
	padding: 1rem;
}

.folder-treeselect .vue-treeselect__no-options-tip {
	color: #718096;
	padding: 1rem;
	text-align: center;
}

/* 深色模式 */
.dark .folder-treeselect .vue-treeselect__control {
	background-color: #1a202c;
	border-color: #4a5568;
	color: #e2e8f0;
}

.dark .folder-treeselect .vue-treeselect__control:hover {
	border-color: #718096;
}

.dark .folder-treeselect .vue-treeselect__control--focused {
	border-color: #60a5fa;
	box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.dark .folder-treeselect .vue-treeselect__placeholder {
	color: #a0aec0;
}

.dark .folder-treeselect .vue-treeselect__single-value {
	color: #e2e8f0;
}

.dark .folder-treeselect .vue-treeselect__menu {
	background-color: #1a202c;
	border-color: #4a5568;
}

.dark .folder-treeselect .vue-treeselect__option {
	color: #e2e8f0;
}

.dark .folder-treeselect .vue-treeselect__option:hover {
	background-color: #2d3748;
}

.dark .folder-treeselect .vue-treeselect__option--selected {
	background-color: #1e3a8a;
	color: #93c5fd;
}

.dark .folder-treeselect .vue-treeselect__option--highlighted {
	background-color: #3a4553;
}
			`,
		},
	],
});
