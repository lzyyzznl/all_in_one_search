import { defineConfig } from "wxt";

export default defineConfig({
	// 使用 Vue 模块
	modules: ["@wxt-dev/module-vue"],

	// 插件基本信息
	manifest: {
		name: "浏览器收藏夹历史记录搜索器",
		description: "快速模糊搜索浏览器收藏夹和历史记录，按域名分组显示结果",
		version: "1.0.0",

		// 权限配置
		permissions: [
			"bookmarks",
			"history",
			"activeTab",
			"storage",
			"tabs",
			"commands",
		],

		// 快捷键配置
		commands: {
			_execute_action: {
				suggested_key: {
					default: "Ctrl+Shift+S",
					mac: "Command+Shift+S",
				},
				description: "默认打开收藏夹历史记录搜索器",
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
	}),
});
