import type { App } from "vue";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { zhHans } from "vuetify/locale";

// 导入Vuetify样式
import "vuetify/styles";

// 自定义主题配置
const customTheme = {
	dark: false,
	colors: {
		primary: "#667eea", // 与原Element Plus主色调保持一致
		secondary: "#764ba2",
		accent: "#f093fb",
		error: "#f56565",
		warning: "#ed8936",
		info: "#4299e1",
		success: "#48bb78",
		background: "#ffffff",
		surface: "#ffffff",
		"on-primary": "#ffffff",
		"on-secondary": "#ffffff",
		"on-accent": "#ffffff",
		"on-error": "#ffffff",
		"on-warning": "#ffffff",
		"on-info": "#ffffff",
		"on-success": "#ffffff",
		"on-background": "#2d3748",
		"on-surface": "#2d3748",
	},
};

export function setupVuetify(app: App) {
	const vuetify = createVuetify({
		components,
		directives,
		theme: {
			defaultTheme: "customTheme",
			themes: {
				customTheme,
			},
		},
		locale: {
			locale: "zhHans",
			messages: { zhHans },
		},
		icons: {
			defaultSet: "mdi",
			aliases,
			sets: {
				mdi,
			},
		},
		defaults: {
			VBtn: {
				variant: "flat",
				color: "primary",
			},
			VCard: {
				elevation: 2,
			},
			VTextField: {
				variant: "outlined",
				density: "comfortable",
			},
			VSelect: {
				variant: "outlined",
				density: "comfortable",
			},
			VDialog: {
				maxWidth: "500px",
			},
		},
	});

	app.use(vuetify);
}
