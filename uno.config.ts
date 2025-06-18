import {
	defineConfig,
	presetAttributify,
	presetIcons,
	presetTypography,
	presetWind3,
	transformerDirectives,
	transformerVariantGroup,
} from "unocss";

export default defineConfig({
	// 预设配置
	presets: [
		presetWind3(),
		presetAttributify(),
		presetIcons({
			// 图标预设配置
			collections: {
				mdi: () =>
					import("@iconify-json/mdi/icons.json").then((i) => i.default),
			},
			extraProperties: {
				display: "inline-block",
				"vertical-align": "middle",
			},
		}),
		presetTypography(),
	],

	// 转换器配置
	transformers: [transformerDirectives(), transformerVariantGroup()],

	// 主题配置 - 基于原有Less变量
	theme: {
		colors: {
			// 主色系 - 蓝白色系
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
			secondary: "#06b6d4",

			// 状态颜色
			success: "#67c23a",
			warning: "#e6a23c",
			danger: "#f56c6c",
			error: {
				DEFAULT: "#f44336",
				dark: "#d32f2f",
			},
			info: "#909399",

			// 背景和卡片颜色
			bg: "#f8fafc",
			card: "#ffffff",

			// 文本颜色
			text: {
				DEFAULT: "#334155",
				light: "#64748b",
				disabled: "#94a3b8",
			},

			// 边框和悬停
			border: "#e2e8f0",
			hover: "#f1f5f9",

			// 扩展颜色
			accent: {
				blue: "#dbeafe",
				"blue-dark": "#bfdbfe",
			},
			background: {
				light: "#f1f5f9",
			},

			// 灰色系
			gray: {
				50: "#f9fafb",
				100: "#f3f4f6",
				200: "#e5e7eb",
				300: "#d1d5db",
				400: "#9ca3af",
				500: "#6b7280",
				600: "#4b5563",
				700: "#374151",
				800: "#1f2937",
				900: "#111827",
				950: "#030712",
			},
		},

		// 字体配置
		fontFamily: {
			sans: ['"Segoe UI"', "Tahoma", "Geneva", "Verdana", "sans-serif"],
			mono: ['"Cascadia Code"', '"Fira Code"', '"Consolas"', "monospace"],
		},
		fontSize: {
			xs: ["12px", "16px"],
			sm: ["13px", "18px"],
			base: ["14px", "20px"],
			lg: ["16px", "24px"],
			xl: ["18px", "28px"],
			"2xl": ["24px", "32px"],
		},
		fontWeight: {
			normal: "400",
			medium: "500",
			semibold: "600",
			bold: "700",
		},

		// 圆角配置
		borderRadius: {
			xs: "2px",
			sm: "4px",
			md: "6px",
			lg: "8px",
			xl: "12px",
		},

		// 阴影配置 - 蓝色系
		boxShadow: {
			sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
			md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
			lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
			xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
		},

		// 动画时长
		transitionDuration: {
			fast: "0.1s",
			DEFAULT: "0.2s",
			slow: "0.3s",
		},

		// 缓动函数
		transitionTimingFunction: {
			"ease-in-out": "cubic-bezier(0.645, 0.045, 0.355, 1)",
		},

		// 间距配置
		spacing: {
			xs: "4px",
			sm: "8px",
			md: "12px",
			lg: "16px",
			xl: "20px",
			"2xl": "24px",
			"3xl": "32px",
		},

		// Z-index层级
		zIndex: {
			base: "1000",
			dropdown: "1000",
			popup: "2000",
			modal: "3000",
			overlay: "10000",
			notification: "4000",
		},
	},

	// 快捷方式 - 替代Less mixins
	shortcuts: {
		// 覆盖层基础样式
		"overlay-base":
			"fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-blur-sm z-overlay",

		// 模态框容器
		"modal-container":
			"bg-white rounded-lg shadow-xl max-w-90vw max-h-90vh overflow-hidden",

		// 按钮基础样式
		"btn-base":
			"px-4 py-2 border-none rounded font-medium cursor-pointer transition-all duration-200 font-sans disabled:cursor-not-allowed disabled:opacity-60",

		// 主要按钮
		"btn-primary":
			"btn-base bg-gradient-to-br from-primary to-purple-600 text-white hover:from-primary-dark hover:to-purple-700 hover:-translate-y-0.5 hover:shadow-lg disabled:bg-gray-300 disabled:text-gray-400 disabled:transform-none disabled:shadow-none",

		// 次要按钮
		"btn-secondary": "btn-base bg-gray-200 text-gray-600 hover:bg-gray-300",

		// 表单输入框
		"form-input":
			"w-full px-3 py-2 border border-gray-200 rounded text-sm font-sans transition-colors box-border focus:outline-none focus:border-primary focus:shadow-primary focus:shadow-opacity-10 read-only:bg-gray-50 read-only:text-gray-500",

		// 错误状态输入框
		"form-input-error":
			"form-input border-danger focus:border-danger focus:shadow-danger focus:shadow-opacity-10",

		// 自定义滚动条
		"custom-scrollbar":
			"[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-sm [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb:hover]:bg-gray-400",

		// 渐变背景
		"gradient-primary": "bg-gradient-to-br from-primary to-purple-600",

		// 居中flex
		"flex-center": "flex items-center justify-center",

		// 卡片样式
		card: "bg-card border border-gray-200 rounded-lg shadow-sm",

		// 悬停效果
		"hover-lift":
			"transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg",

		btn: "px-4 py-2 rounded inline-block bg-primary text-white cursor-pointer hover:bg-primary-600 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50",
		icon: "w-6 h-6 fill-current",
		input:
			"px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500",
	},

	// 内容提取配置
	content: {
		pipeline: {
			include: [
				// 包含的文件类型
				/\.(vue|html|js|ts|jsx|tsx)$/,
			],
			exclude: [
				// 排除的文件
				/node_modules/,
				/\.git/,
			],
		},
	},

	// 自定义规则
	rules: [
		// 添加一些自定义的工具类
		[
			"gradient-text",
			{
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				"-webkit-background-clip": "text",
				"-webkit-text-fill-color": "transparent",
				"background-clip": "text",
			},
		],
		["font-weight-medium", { "font-weight": "500" }],
		["font-weight-semibold", { "font-weight": "600" }],
		["transition-base", { transition: "all 0.2s ease-in-out" }],
	],

	// 变体配置
	variants: [
		// 添加自定义变体
		(matcher) => {
			if (!matcher.startsWith("hover:")) return matcher;
			return {
				matcher: matcher.slice(6),
				selector: (s) => `${s}:hover`,
			};
		},
	],

	safelist: [
		"i-mdi-magnify",
		"i-mdi-close",
		"i-mdi-settings",
		"i-mdi-bookmark",
		"i-mdi-file",
		"i-mdi-download",
	],
});
