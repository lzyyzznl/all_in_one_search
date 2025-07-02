import type { App } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import zhCn from "element-plus/es/locale/lang/zh-cn";

export function setupElementPlus(app: App) {
	// 注册 Element Plus
	app.use(ElementPlus, {
		locale: zhCn,
		size: "default",
		zIndex: 3000,
	});

	// 注册所有图标
	for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
		app.component(key, component);
	}
}
