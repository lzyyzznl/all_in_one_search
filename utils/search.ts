import type { Browser } from "wxt/browser";
import { browser } from "wxt/browser";
import type {
	GroupedSearchResults,
	SearchOptions,
	SearchResultItem,
	SearchStats,
	DownloadItem,
	SearchHistoryItem,
	TimeFilter,
} from "./types";

/**
 * 从URL中提取域名
 */
export function extractDomain(url: string): string {
	try {
		const urlObj = new URL(url);
		return urlObj.hostname;
	} catch {
		return "未知域名";
	}
}

/**
 * 从URL中提取路径
 */
export function extractPath(url: string): string {
	try {
		const urlObj = new URL(url);
		return urlObj.pathname + urlObj.search;
	} catch {
		return "";
	}
}

/**
 * 获取时间筛选的起始时间戳
 */
export function getTimeFilterStart(timeFilter: TimeFilter): number {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

	switch (timeFilter) {
		case "today":
			return today.getTime();
		case "week":
			const weekAgo = new Date(today);
			weekAgo.setDate(today.getDate() - 7);
			return weekAgo.getTime();
		case "all":
		default:
			return 0;
	}
}

/**
 * 模糊匹配算法
 */
export function fuzzyMatch(text: string, query: string): boolean {
	if (!query || !text) return false;

	const textLower = text.toLowerCase();
	const queryLower = query.toLowerCase();

	// 直接包含
	if (textLower.includes(queryLower)) {
		return true;
	}

	// 拼音首字母匹配（简单实现）
	const words = queryLower.split(" ");
	return words.every((word) => textLower.includes(word));
}

/**
 * 计算匹配度分数
 */
export function calculateRelevanceScore(
	item: SearchResultItem,
	query: string
): number {
	let score = 0;
	const queryLower = query.toLowerCase();
	const titleLower = item.title.toLowerCase();
	const urlLower = item.url.toLowerCase();

	// 标题完全匹配
	if (titleLower === queryLower) score += 100;
	// 标题开头匹配
	else if (titleLower.startsWith(queryLower)) score += 80;
	// 标题包含
	else if (titleLower.includes(queryLower)) score += 60;

	// URL匹配
	if (urlLower.includes(queryLower)) score += 30;

	// 域名匹配
	if (item.domain.toLowerCase().includes(queryLower)) score += 40;

	// 文件名匹配（下载记录）
	if (item.filename && item.filename.toLowerCase().includes(queryLower)) {
		score += 70;
	}

	// 类型优先级
	if (item.type === "bookmark") score += 15;
	else if (item.type === "download") score += 10;
	else if (item.type === "history") score += 5;

	// 访问频率加分
	if (item.visitCount) {
		score += Math.min(item.visitCount * 2, 20);
	}

	return score;
}

/**
 * 获取所有书签
 */
export async function getAllBookmarks(): Promise<SearchResultItem[]> {
	try {
		const bookmarkTree = await browser.bookmarks.getTree();
		const bookmarks: SearchResultItem[] = [];

		function traverseBookmarks(
			nodes: Browser.bookmarks.BookmarkTreeNode[],
			folderPath: string = ""
		): void {
			for (const node of nodes) {
				if (node.url) {
					// 这是一个书签
					bookmarks.push({
						id: node.id,
						title: node.title || "无标题",
						url: node.url,
						type: "bookmark",
						domain: extractDomain(node.url),
						path: extractPath(node.url),
						folderName: folderPath,
						lastVisited: node.dateAdded,
					});
				} else if (node.children) {
					// 这是一个文件夹，递归遍历
					const newPath = folderPath
						? `${folderPath} > ${node.title}`
						: node.title;
					traverseBookmarks(node.children, newPath);
				}
			}
		}

		traverseBookmarks(bookmarkTree);
		return bookmarks;
	} catch (error) {
		console.error("获取书签失败:", error);
		return [];
	}
}

/**
 * 获取历史记录
 */
export async function getHistory(
	maxResults: number = 1000,
	timeFilter: TimeFilter = "all",
	query: string = ""
): Promise<SearchResultItem[]> {
	try {
		const startTime = getTimeFilterStart(timeFilter);

		const historyItems = await browser.history.search({
			text: query,
			maxResults,
			startTime,
		});

		return historyItems
			.filter((item) => item.url) // 过滤掉没有url的记录
			.map((item: Browser.history.HistoryItem) => ({
				id: item.id,
				title: item.title || "无标题",
				url: item.url!,
				type: "history" as const,
				domain: extractDomain(item.url!),
				path: extractPath(item.url!),
				lastVisited: item.lastVisitTime,
				visitCount: item.visitCount,
			}));
	} catch (error) {
		console.error("获取历史记录失败:", error);
		return [];
	}
}

/**
 * 获取下载记录
 */
export async function getDownloads(
	maxResults: number = 1000,
	timeFilter: TimeFilter = "all",
	query: string = ""
): Promise<SearchResultItem[]> {
	try {
		const startTime = getTimeFilterStart(timeFilter);
		const startTimeISO =
			startTime > 0 ? new Date(startTime).toISOString() : undefined;

		const searchOptions: any = {
			limit: maxResults,
			startedAfter: startTimeISO,
			orderBy: ["-startTime"],
		};
		if (query) {
			searchOptions.filenameRegex = query;
		}

		const downloadItems = await browser.downloads.search(searchOptions);

		return downloadItems
			.filter((item) => item.filename && item.url)
			.map((item: any) => ({
				id: item.id.toString(),
				title: getFileNameFromPath(item.filename),
				url: item.url,
				type: "download" as const,
				domain: extractDomain(item.url),
				path: item.filename,
				filename: getFileNameFromPath(item.filename),
				lastVisited: new Date(item.startTime).getTime(),
				fileSize: item.fileSize || 0,
				startTime: item.startTime,
				exists: item.exists,
			}));
	} catch (error) {
		console.error("获取下载记录失败:", error);
		return [];
	}
}

/**
 * 从文件路径中提取文件名
 */
function getFileNameFromPath(filePath: string): string {
	if (!filePath) return "未知文件";
	const fileName = filePath.split(/[/\\]/).pop() || "未知文件";
	return fileName;
}

/**
 * 搜索书签、历史记录和下载记录
 */
export async function searchBookmarksAndHistory(
	options: SearchOptions
): Promise<{ results: GroupedSearchResults; stats: SearchStats }> {
	const startTime = Date.now();

	let bookmarks: SearchResultItem[] = [];
	let history: SearchResultItem[] = [];
	let downloads: SearchResultItem[] = [];

	// 获取书签
	if (options.includeBookmarks) {
		bookmarks = await getAllBookmarks();
		// 时间筛选书签
		bookmarks = filterItemsByTime(bookmarks, options.timeFilter);
	}

	// 获取历史记录
	if (options.includeHistory) {
		history = await getHistory(options.maxResults, options.timeFilter, options.query);
	}

	// 获取下载记录
	if (options.includeDownloads) {
		downloads = await getDownloads(options.maxResults, options.timeFilter, options.query);
	}

	// URL去重：如果书签和历史记录有相同URL，只保留书签
	let allItems: SearchResultItem[] = [];

	// 先添加书签
	allItems = allItems.concat(bookmarks);

	// 创建书签URL集合用于去重
	const bookmarkUrls = new Set(bookmarks.map((item) => item.url));

	// 过滤历史记录，排除已有书签的URL
	const filteredHistory = history.filter((item) => !bookmarkUrls.has(item.url));
	allItems = allItems.concat(filteredHistory);

	// 添加下载记录（下载记录通常不会与书签/历史记录重复）
	allItems = allItems.concat(downloads);

	// 过滤和搜索
	let filteredItems = allItems.filter(
		(item) =>
			fuzzyMatch(item.title, options.query) ||
			fuzzyMatch(item.url, options.query) ||
			fuzzyMatch(item.domain, options.query) ||
			(item.filename && fuzzyMatch(item.filename, options.query))
	);

	// 计算相关性分数并排序
	filteredItems = filteredItems
		.map((item) => ({
			...item,
			relevanceScore: calculateRelevanceScore(item, options.query),
		}))
		.sort((a, b) => {
			switch (options.sortBy) {
				case "recent":
					return (b.lastVisited || 0) - (a.lastVisited || 0);
				case "frequency":
					return (b.visitCount || 0) - (a.visitCount || 0);
				case "relevance":
				default:
					return (b as any).relevanceScore - (a as any).relevanceScore;
			}
		})
		.slice(0, options.maxResults);

	// 按域名分组
	const groupedResults: GroupedSearchResults = {};
	let bookmarkCount = 0;
	let historyCount = 0;
	let downloadCount = 0;

	filteredItems.forEach((item) => {
		const domain = item.domain;
		if (!groupedResults[domain]) {
			groupedResults[domain] = {
				domain,
				items: [],
				totalCount: 0,
			};
		}
		groupedResults[domain].items.push(item);
		groupedResults[domain].totalCount++;

		// 统计各类型数量
		switch (item.type) {
			case "bookmark":
				bookmarkCount++;
				break;
			case "history":
				historyCount++;
				break;
			case "download":
				downloadCount++;
				break;
		}
	});

	const stats: SearchStats = {
		totalResults: filteredItems.length,
		bookmarkCount,
		historyCount,
		downloadCount,
		uniqueDomains: Object.keys(groupedResults).length,
		searchTime: Date.now() - startTime,
	};

	return { results: groupedResults, stats };
}

/**
 * 根据时间筛选项目
 */
function filterItemsByTime(
	items: SearchResultItem[],
	timeFilter: TimeFilter
): SearchResultItem[] {
	if (timeFilter === "all") return items;

	const startTime = getTimeFilterStart(timeFilter);
	return items.filter((item) => {
		const itemTime = item.lastVisited || 0;
		return itemTime >= startTime;
	});
}

/**
 * 打开URL
 */
export async function openUrl(
	url: string,
	inNewTab: boolean = true
): Promise<void> {
	try {
		if (inNewTab) {
			await browser.tabs.create({ url });
		} else {
			await browser.tabs.update({ url });
		}
	} catch (error) {
		console.error("打开URL失败:", error);
	}
}

/**
 * 打开下载文件
 */
export async function openDownloadFile(downloadId: string): Promise<void> {
	try {
		await browser.downloads.open(parseInt(downloadId));
	} catch (error) {
		console.error("打开下载文件失败:", error);
		// 如果打开失败，可能是权限问题，尝试在文件管理器中显示
		await showDownloadFile(downloadId);
	}
}

/**
 * 在文件管理器中显示下载文件
 */
export async function showDownloadFile(downloadId: string): Promise<void> {
	try {
		await browser.downloads.show(parseInt(downloadId));
	} catch (error) {
		console.error("在文件管理器中显示文件失败:", error);
	}
}

/**
 * 获取网站图标URL
 */
export function getFaviconUrl(domain: string): string {
	return `https://www.google.com/s2/favicons?domain=${domain}`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * 搜索历史记录管理
 */
export class SearchHistoryManager {
	private static readonly STORAGE_KEY = "searchHistory";
	private static readonly MAX_HISTORY = 5;

	/**
	 * 保存搜索历史
	 */
	static async saveSearchHistory(query: string): Promise<void> {
		if (!query.trim()) return;

		try {
			const history = await this.getSearchHistory();

			// 移除重复项
			const filteredHistory = history.filter((item) => item.query !== query);

			// 添加新项到开头
			const newHistory = [
				{ query, timestamp: Date.now() },
				...filteredHistory,
			].slice(0, this.MAX_HISTORY);

			await browser.storage.local.set({
				[this.STORAGE_KEY]: newHistory,
			});
		} catch (error) {
			console.error("保存搜索历史失败:", error);
		}
	}

	/**
	 * 获取搜索历史
	 */
	static async getSearchHistory(): Promise<SearchHistoryItem[]> {
		try {
			const result = await browser.storage.local.get([this.STORAGE_KEY]);
			return result[this.STORAGE_KEY] || [];
		} catch (error) {
			console.error("获取搜索历史失败:", error);
			return [];
		}
	}

	/**
	 * 清空搜索历史
	 */
	static async clearSearchHistory(): Promise<void> {
		try {
			await browser.storage.local.remove([this.STORAGE_KEY]);
		} catch (error) {
			console.error("清空搜索历史失败:", error);
		}
	}
}
