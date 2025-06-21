import type {
	GroupedSearchResults,
	SearchOptions,
	SearchStats,
	RecommendedContent,
} from "./types";

/**
 * Content Script 搜索服务
 * 通过消息传递与 background script 通信来获取搜索结果
 */
export class ContentSearchService {
	/**
	 * 执行搜索
	 */
	static async searchBookmarksAndHistory(
		options: SearchOptions
	): Promise<{ results: GroupedSearchResults; stats: SearchStats }> {
		try {
			const response = await chrome.runtime.sendMessage({
				action: "search-data",
				options,
			});

			if (response && response.success) {
				return {
					results: response.results || {},
					stats: response.stats || {
						totalResults: 0,
						bookmarkCount: 0,
						historyCount: 0,
						downloadCount: 0,
						uniqueDomains: 0,
						searchTime: 0,
					},
				};
			} else {
				throw new Error(response?.error || "搜索请求失败");
			}
		} catch (error) {
			console.error("Content script 搜索失败:", error);
			return {
				results: {},
				stats: {
					totalResults: 0,
					bookmarkCount: 0,
					historyCount: 0,
					downloadCount: 0,
					uniqueDomains: 0,
					searchTime: 0,
				},
			};
		}
	}

	/**
	 * 打开URL
	 */
	static async openUrl(url: string, inNewTab = true): Promise<void> {
		try {
			await chrome.runtime.sendMessage({
				action: "open-url",
				url,
				inNewTab,
			});
		} catch (error) {
			console.error("打开URL失败:", error);
			// 降级方案：直接在当前标签页打开
			if (inNewTab) {
				window.open(url, "_blank");
			} else {
				window.location.href = url;
			}
		}
	}

	/**
	 * 打开下载文件
	 */
	static async openDownloadFile(downloadId: string): Promise<void> {
		try {
			await chrome.runtime.sendMessage({
				action: "open-download",
				downloadId,
			});
		} catch (error) {
			console.error("打开下载文件失败:", error);
		}
	}

	/**
	 * 显示下载文件
	 */
	static async showDownloadFile(downloadId: string): Promise<void> {
		try {
			await chrome.runtime.sendMessage({
				action: "show-download",
				downloadId,
			});
		} catch (error) {
			console.error("显示下载文件失败:", error);
		}
	}

	/**
	 * 保存搜索历史
	 */
	static async saveSearchHistory(query: string): Promise<void> {
		try {
			await chrome.runtime.sendMessage({
				action: "save-search-history",
				query,
			});
		} catch (error) {
			console.error("保存搜索历史失败:", error);
		}
	}

	/**
	 * 获取搜索历史
	 */
	static async getSearchHistory(): Promise<string[]> {
		try {
			const response = await chrome.runtime.sendMessage({
				action: "get-search-history",
			});

			if (response && response.success) {
				return response.history.map((item: any) => item.query) || [];
			}
			return [];
		} catch (error) {
			console.error("获取搜索历史失败:", error);
			return [];
		}
	}

	/**
	 * 获取书签文件夹
	 */
	static async getBookmarkFolders(): Promise<{ id: string; title: string }[]> {
		try {
			const response = await chrome.runtime.sendMessage({
				action: "get-bookmark-folders",
			});

			if (response && response.success) {
				return response.folders || [];
			}
			return [];
		} catch (error) {
			console.error("获取书签文件夹失败:", error);
			return [];
		}
	}

	/**
	 * 创建书签
	 */
	static async createBookmark(
		bookmarkData: chrome.bookmarks.CreateDetails
	): Promise<void> {
		try {
			const response = await chrome.runtime.sendMessage({
				action: "create-bookmark",
				bookmarkData,
			});

			if (!response || !response.success) {
				throw new Error(response?.error || "创建书签失败");
			}
		} catch (error) {
			console.error("创建书签失败:", error);
			throw error;
		}
	}

	/**
	 * 删除书签
	 */
	static async removeBookmark(bookmarkId: string): Promise<void> {
		try {
			const response = await chrome.runtime.sendMessage({
				action: "remove-bookmark",
				bookmarkId,
			});

			if (!response || !response.success) {
				throw new Error(response?.error || "删除书签失败");
			}
		} catch (error) {
			console.error("删除书签失败:", error);
			throw error;
		}
	}

	/**
	 * 根据URL查找书签ID
	 */
	static async findBookmarkByUrl(url: string): Promise<string | null> {
		try {
			const response = await chrome.runtime.sendMessage({
				action: "find-bookmark-by-url",
				url,
			});

			if (response && response.success) {
				return response.bookmarkId || null;
			}
			return null;
		} catch (error) {
			console.error("查找书签失败:", error);
			return null;
		}
	}

	/**
	 * 获取推荐内容
	 */
	static async getRecommendedContent(): Promise<RecommendedContent> {
		try {
			const response = await chrome.runtime.sendMessage({
				action: "get-recommended-content",
			});

			if (response && response.success) {
				return (
					response.recommendedContent || {
						recentHistory: [],
						frequentBookmarks: [],
						latestDownloads: [],
					}
				);
			}
			return {
				recentHistory: [],
				frequentBookmarks: [],
				latestDownloads: [],
			};
		} catch (error) {
			console.error("获取推荐内容失败:", error);
			return {
				recentHistory: [],
				frequentBookmarks: [],
				latestDownloads: [],
			};
		}
	}
}
