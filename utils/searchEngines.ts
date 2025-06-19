import { browser } from "wxt/browser";
import { APP_CONSTANTS } from "./constants";
import type { SearchEngine, WebSearchOptions } from "./types";

/**
 * 预定义的搜索引擎配置
 */
export const SEARCH_ENGINES: Record<string, SearchEngine> = {
	google: {
		id: "google",
		name: "Google",
		baseUrl: "https://www.google.com/search",
		queryParam: "q",
		icon: "🔍",
		description: "全球最大的搜索引擎",
	},
	baidu: {
		id: "baidu",
		name: "百度",
		baseUrl: "https://www.baidu.com/s",
		queryParam: "wd",
		icon: "🅱️",
		description: "中国最大的中文搜索引擎",
	},
	bing: {
		id: "bing",
		name: "Bing",
		baseUrl: "https://www.bing.com/search",
		queryParam: "q",
		icon: "🅱️",
		description: "微软搜索引擎",
	},
};

/**
 * 默认搜索引擎ID
 */
const DEFAULT_SEARCH_ENGINE_ID = "google";

/**
 * 存储键名
 */
const STORAGE_KEY_PREFERRED_ENGINE = "preferredSearchEngine";
const STORAGE_KEY_DEFAULT_ENGINE = "defaultSearchEngine";

/**
 * 搜索引擎管理类
 */
export class SearchEngineManager {
	/**
	 * 获取所有可用的搜索引擎
	 */
	static getAllEngines(): SearchEngine[] {
		return Object.values(SEARCH_ENGINES);
	}

	/**
	 * 根据ID获取搜索引擎
	 */
	static getEngineById(id: string): SearchEngine | null {
		return SEARCH_ENGINES[id] || null;
	}

	/**
	 * 检测浏览器默认搜索引擎
	 */
	static async detectDefaultSearchEngine(): Promise<SearchEngine> {
		try {
			// 首先尝试从存储中获取用户偏好
			const stored = await browser.storage.local.get([
				STORAGE_KEY_PREFERRED_ENGINE,
				STORAGE_KEY_DEFAULT_ENGINE,
			]);

			// 如果用户设置了偏好搜索引擎，优先使用
			if (stored[STORAGE_KEY_PREFERRED_ENGINE]) {
				const engine = this.getEngineById(stored[STORAGE_KEY_PREFERRED_ENGINE]);
				if (engine) {
					return engine;
				}
			}

			// 尝试使用Chrome Search API检测默认搜索引擎
			if (browser.search) {
				// 检查是否支持search API
				const cachedEngine = stored[STORAGE_KEY_DEFAULT_ENGINE];
				if (cachedEngine) {
					const engine = this.getEngineById(cachedEngine);
					if (engine) {
						return engine;
					}
				}
			}

			// 基于当前地区和语言推测默认搜索引擎
			const defaultEngine = this.guessDefaultEngine();

			// 缓存检测结果
			await browser.storage.local.set({
				[STORAGE_KEY_DEFAULT_ENGINE]: defaultEngine.id,
			});

			return defaultEngine;
		} catch (error) {
			console.error("检测默认搜索引擎失败:", error);
			return SEARCH_ENGINES[DEFAULT_SEARCH_ENGINE_ID]!;
		}
	}

	/**
	 * 基于地区和语言推测默认搜索引擎
	 */
	private static guessDefaultEngine(): SearchEngine {
		try {
			const language = navigator.language || "en";
			const region = language.toLowerCase();

			// 根据语言地区推测
			if (region.startsWith("zh")) {
				// 中文用户优先使用百度
				return SEARCH_ENGINES.baidu!;
			} else if (region.startsWith("ru")) {
				// 俄语用户优先使用Yandex
				return SEARCH_ENGINES.yandex!;
			} else {
				// 其他地区默认使用Google
				return SEARCH_ENGINES.google!;
			}
		} catch (error) {
			console.error("推测默认搜索引擎失败:", error);
			return SEARCH_ENGINES[DEFAULT_SEARCH_ENGINE_ID]!;
		}
	}

	/**
	 * 设置用户偏好的搜索引擎
	 */
	static async setPreferredEngine(engineId: string): Promise<void> {
		try {
			await browser.storage.local.set({
				[STORAGE_KEY_PREFERRED_ENGINE]: engineId,
			});
		} catch (error) {
			console.error("设置偏好搜索引擎失败:", error);
			throw error;
		}
	}

	/**
	 * 获取用户偏好的搜索引擎
	 */
	static async getPreferredEngine(): Promise<SearchEngine | null> {
		try {
			const stored = await browser.storage.local.get([
				STORAGE_KEY_PREFERRED_ENGINE,
			]);
			if (stored[STORAGE_KEY_PREFERRED_ENGINE]) {
				return this.getEngineById(stored[STORAGE_KEY_PREFERRED_ENGINE]);
			}
			return null;
		} catch (error) {
			console.error("获取偏好搜索引擎失败:", error);
			return null;
		}
	}

	/**
	 * 构建搜索URL
	 */
	static buildSearchUrl(engine: SearchEngine, query: string): string {
		try {
			const encodedQuery = encodeURIComponent(query.trim());
			const url = new URL(engine.baseUrl);
			url.searchParams.set(engine.queryParam, query.trim());
			return url.toString();
		} catch (error) {
			console.error("构建搜索URL失败:", error);
			// 降级方案：直接拼接
			const encodedQuery = encodeURIComponent(query.trim());
			return `${engine.baseUrl}?${engine.queryParam}=${encodedQuery}`;
		}
	}

	/**
	 * 执行网络搜索
	 */
	static async performWebSearch(options: WebSearchOptions): Promise<void> {
		try {
			const searchUrl = this.buildSearchUrl(options.engine, options.query);

			if (options.inNewTab) {
				await browser.tabs.create({ url: searchUrl });
			} else {
				await browser.tabs.update({ url: searchUrl });
			}
		} catch (error) {
			console.error("执行网络搜索失败:", error);
			throw error;
		}
	}

	/**
	 * 获取搜索建议文本
	 */
	static getSearchSuggestionText(engine: SearchEngine, query: string): string {
		return `在${engine.name}中搜索"${query}"`;
	}

	/**
	 * 验证搜索引擎配置
	 */
	static validateEngine(engine: SearchEngine): boolean {
		return !!(engine.id && engine.name && engine.baseUrl && engine.queryParam);
	}
}

/**
 * 导出默认搜索引擎管理器实例
 */
export const searchEngineManager = SearchEngineManager;

/**
 * 导出常用功能的简化接口
 */
export async function getDefaultSearchEngine(): Promise<SearchEngine> {
	return SearchEngineManager.detectDefaultSearchEngine();
}

export function buildWebSearchUrl(engineId: string, query: string): string {
	const engine = SearchEngineManager.getEngineById(engineId);
	if (!engine) {
		throw new Error(`未找到搜索引擎: ${engineId}`);
	}
	return SearchEngineManager.buildSearchUrl(engine, query);
}

export async function performWebSearch(
	engineId: string,
	query: string,
	inNewTab: boolean = true
): Promise<void> {
	const engine = SearchEngineManager.getEngineById(engineId);
	if (!engine) {
		throw new Error(`未找到搜索引擎: ${engineId}`);
	}

	await SearchEngineManager.performWebSearch({
		engine,
		query,
		inNewTab,
	});
}
