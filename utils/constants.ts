// 应用常量定义
export const APP_CONSTANTS = {
	// 搜索相关常量
	SEARCH: {
		MAX_RESULTS: 1000,
		MAX_HISTORY_ITEMS: 5,
		DEBOUNCE_DELAY: 300,
		MIN_QUERY_LENGTH: 1,
	},

	// UI 相关常量
	UI: {
		CARD_PADDING: "16px",
		SMALL_CARD_PADDING: "12px",
		DEFAULT_ICON_SIZE: 60,
		FAVICON_SIZE: 16,
	},

	// 存储键名
	STORAGE_KEYS: {
		SEARCH_HISTORY: "searchHistory",
		USER_SETTINGS: "userSettings",
		SHORTCUT_CONFIG: "shortcut",
		PREFERRED_SEARCH_ENGINE: "preferredSearchEngine",
		DEFAULT_SEARCH_ENGINE: "defaultSearchEngine",
	},

	// 时间相关
	TIME: {
		DAY_IN_MS: 24 * 60 * 60 * 1000,
		WEEK_IN_MS: 7 * 24 * 60 * 60 * 1000,
	},

	// 快捷键
	SHORTCUTS: {
		EXECUTE_ACTION: "_execute_action",
		DEFAULT_KEY: "Ctrl+Shift+S",
		MAC_KEY: "Command+Shift+S",
	},

	// 文件类型图标
	ICONS: {
		BOOKMARK: "📚",
		HISTORY: "🕐",
		DOWNLOAD: "📥",
		FOLDER: "📁",
		WARNING: "⚠️",
		WEB_SEARCH: "🌐",
		SEARCH_ENGINE: "🔍",
	},

	// 评分权重
	SCORE_WEIGHTS: {
		EXACT_TITLE_MATCH: 100,
		TITLE_START_MATCH: 80,
		TITLE_CONTAINS: 60,
		URL_CONTAINS: 30,
		DOMAIN_MATCH: 40,
		FILENAME_MATCH: 70,
		BOOKMARK_PRIORITY: 15,
		DOWNLOAD_PRIORITY: 10,
		HISTORY_PRIORITY: 5,
		MAX_VISIT_COUNT_BONUS: 20,
		VISIT_COUNT_MULTIPLIER: 2,
	},
} as const;

// 导出类型以确保类型安全
export type AppConstants = typeof APP_CONSTANTS;
