import { defineConfig } from "wxt";
import { APP_CONSTANTS } from "./utils/constants";

export default defineConfig({
	// 使用 Vue 模块
	modules: ["@wxt-dev/module-vue"],

	runner: {
		// 启动配置
		startUrls: ["https://baidu.com"], // 可选：启动时打开的页面
	},

	// 插件基本信息
	manifest: {
		name: "浏览器收藏夹历史记录搜索器",
		description: "快速模糊搜索浏览器收藏夹和历史记录，按域名分组显示结果",
		version: "1.0.0",

		// 权限配置
		permissions: [
			"bookmarks",
			"history",
			"downloads",
			"downloads.open",
			"activeTab",
			"storage",
			"tabs",
			"commands",
			"search",
		],

		// 快捷键配置
		commands: {
			[APP_CONSTANTS.SHORTCUTS.EXECUTE_ACTION]: {
				suggested_key: {
					default: APP_CONSTANTS.SHORTCUTS.DEFAULT_KEY,
					mac: APP_CONSTANTS.SHORTCUTS.MAC_KEY,
				},
				description: "默认打开收藏夹历史记录搜索器",
			},
			[APP_CONSTANTS.SHORTCUTS.FLOATING_SEARCH]: {
				suggested_key: {
					default: APP_CONSTANTS.SHORTCUTS.FLOATING_DEFAULT_KEY,
					mac: APP_CONSTANTS.SHORTCUTS.FLOATING_MAC_KEY,
				},
				description: "在页面中央显示浮动搜索框",
			},
		},

		// 操作按钮配置
		action: {
			default_title: "搜索收藏夹和历史记录",
			default_popup: "popup.html",
		},

		// 图标配置
		icons: {
			16: "icon/16.png",
			32: "icon/32.png",
			48: "icon/48.png",
			128: "icon/128.png",
		},

		// 新增 web_accessible_resources 配置
		web_accessible_resources: [
			{
				resources: ["searchEngineIcon/*.png"],
				matches: ["<all_urls>"],
			},
		],
	},

	// 开发配置
	vite: () => ({
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
