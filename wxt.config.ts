import { defineConfig } from "wxt";
import { APP_CONSTANTS } from "./utils/constants";
import UnoCSS from "unocss/vite";

export default defineConfig({
	// 使用 Vue 模块
	modules: ["@wxt-dev/module-vue"],

	runner: {
		// 启动配置
		startUrls: ["https://www.bing.com/search?q=wxt", "https://www.bing.com"], // 可选：启动时打开的页面
	},

	// 插件基本信息
	manifest: {
		name: "收藏夹、历史记录、下载记录、搜索引擎超强四合一",
		description:
			"⚡ 超快速浏览器数据搜索工具！集成收藏夹、历史记录、下载文件三合一搜索，支持Tab补全、域名分组、搜索历史，现代化UI设计，提升您的工作效率。",
		version: "1.0.1",
		// 权限配置
		permissions: [
			"bookmarks",
			"history",
			"downloads",
			"downloads.open",
			"storage",
			"commands",
		],

		// 快捷键配置
		commands: {
			[APP_CONSTANTS.SHORTCUTS.EXECUTE_ACTION]: {
				suggested_key: {
					default: APP_CONSTANTS.SHORTCUTS.DEFAULT_KEY,
					mac: APP_CONSTANTS.SHORTCUTS.MAC_KEY,
				},
				description: "打开All-in-One Browser Search",
			},
		},

		// 操作按钮配置
		action: {
			default_title: "All-in-One Browser Search",
			default_popup: "popup.html",
		},

		// 图标配置
		icons: {
			16: "icon/16.png",
			32: "icon/32.png",
			48: "icon/48.png",
			128: "icon/128.png",
		},
	},

	// 开发配置
	vite: () => ({
		plugins: [UnoCSS()] as any,
		define: {
			__VUE_OPTIONS_API__: true,
			__VUE_PROD_DEVTOOLS__: false,
		},
		css: {
			preprocessorOptions: {
				less: {
					// Less 选项
					javascriptEnabled: true,
					math: "parens-division",
				},
			},
		},
		resolve: {
			alias: {
				"@": "/src",
			},
		},
		optimizeDeps: {
			include: ["element-plus", "@element-plus/icons-vue"],
		},
	}),
});
