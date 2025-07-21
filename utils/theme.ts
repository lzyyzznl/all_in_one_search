export type Theme = "light" | "dark" | "auto";

const THEME_STORAGE_KEY = "app-theme";

export class ThemeManager {
	private static theme: Theme = "light";

	/**
	 * 初始化主题
	 */
	static init(): void {
		// 从localStorage读取保存的主题设置
		const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
		if (savedTheme && ["light", "dark", "auto"].includes(savedTheme)) {
			this.theme = savedTheme;
		}

		// 应用主题
		this.applyTheme();

		// 监听系统主题变化
		if (window.matchMedia) {
			window
				.matchMedia("(prefers-color-scheme: dark)")
				.addEventListener("change", () => {
					if (this.theme === "auto") {
						this.applyTheme();
					}
				});
		}
	}

	/**
	 * 设置主题
	 */
	static setTheme(theme: Theme): void {
		this.theme = theme;
		localStorage.setItem(THEME_STORAGE_KEY, theme);
		this.applyTheme();
	}

	/**
	 * 获取当前主题
	 */
	static getTheme(): Theme {
		return this.theme;
	}

	/**
	 * 获取当前实际显示的主题（解析auto）
	 */
	static getCurrentTheme(): "light" | "dark" {
		if (this.theme === "auto") {
			return window.matchMedia &&
				window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
		}
		return this.theme;
	}

	/**
	 * 切换主题（在light和dark之间切换）
	 */
	static toggleTheme(): void {
		const currentTheme = this.getCurrentTheme();
		this.setTheme(currentTheme === "dark" ? "light" : "dark");
	}

	/**
	 * 应用主题到DOM
	 */
	private static applyTheme(): void {
		const currentTheme = this.getCurrentTheme();

		if (currentTheme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}

	/**
	 * 获取主题图标
	 */
	static getThemeIcon(): string {
		const currentTheme = this.getCurrentTheme();
		return currentTheme === "dark" ? "🌙" : "☀️";
	}

	/**
	 * 获取主题名称
	 */
	static getThemeName(): string {
		switch (this.theme) {
			case "light":
				return "浅色主题";
			case "dark":
				return "深色主题";
			case "auto":
				return "跟随系统";
			default:
				return "未知主题";
		}
	}
}
