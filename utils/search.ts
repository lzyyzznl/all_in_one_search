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
import { APP_CONSTANTS } from "./constants";

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
			const weekAgo = new Date(today.getTime() - APP_CONSTANTS.TIME.WEEK_IN_MS);
			return weekAgo.getTime();
		case "month":
			const monthAgo = new Date(today);
			monthAgo.setMonth(today.getMonth() - 1);
			return monthAgo.getTime();
		case "all":
		default:
			return 0;
	}
}

/**
 * 模糊匹配算法 - 支持忽略大小写和多种匹配模式
 */
export function fuzzyMatch(text: string, query: string): boolean {
	if (!query || !text) return false;

	// 转换为小写进行匹配，确保大小写不敏感
	const textLower = text.toLowerCase().trim();
	const queryLower = query.toLowerCase().trim();

	// 空查询返回false
	if (!queryLower) return false;

	// 1. 直接包含匹配（最高优先级）
	if (textLower.includes(queryLower)) {
		return true;
	}

	// 2. 分词匹配 - 支持多个关键词用空格分隔
	const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);
	if (queryWords.length > 1) {
		// 所有关键词都要在文本中找到
		return queryWords.every(word => textLower.includes(word));
	}

	// 3. 字符顺序匹配（不需要连续）
	let queryIndex = 0;
	for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
		if (textLower[i] === queryLower[queryIndex]) {
			queryIndex++;
		}
	}

	// 4. 如果字符顺序匹配成功
	if (queryIndex === queryLower.length) {
		return true;
	}

	// 5. 拼音/缩写匹配（针对中英文混合）
	// 例如: "github" 可以匹配 "GitHub"
	const words = textLower.split(/\s+|[_\-\.]/);
	for (const word of words) {
		if (word.startsWith(queryLower)) {
			return true;
		}
	}

	return false;
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

	// 标题匹配度评分
	score += calculateTitleScore(titleLower, queryLower);

	// URL匹配评分
	if (urlLower.includes(queryLower)) {
		score += APP_CONSTANTS.SCORE_WEIGHTS.URL_CONTAINS;
	}

	// 域名匹配评分
	if (item.domain.toLowerCase().includes(queryLower)) {
		score += APP_CONSTANTS.SCORE_WEIGHTS.DOMAIN_MATCH;
	}

	// 文件名匹配评分（下载记录）
	if (item.filename && item.filename.toLowerCase().includes(queryLower)) {
		score += APP_CONSTANTS.SCORE_WEIGHTS.FILENAME_MATCH;
	}

	// 类型优先级评分
	score += getTypeScore(item.type);

	// 访问频率加分
	if (item.visitCount) {
		score += Math.min(
			item.visitCount * APP_CONSTANTS.SCORE_WEIGHTS.VISIT_COUNT_MULTIPLIER,
			APP_CONSTANTS.SCORE_WEIGHTS.MAX_VISIT_COUNT_BONUS
		);
	}

	return score;
}

/**
 * 计算标题匹配度分数
 */
function calculateTitleScore(titleLower: string, queryLower: string): number {
	if (titleLower === queryLower) {
		return APP_CONSTANTS.SCORE_WEIGHTS.EXACT_TITLE_MATCH;
	}
	if (titleLower.startsWith(queryLower)) {
		return APP_CONSTANTS.SCORE_WEIGHTS.TITLE_START_MATCH;
	}
	if (titleLower.includes(queryLower)) {
		return APP_CONSTANTS.SCORE_WEIGHTS.TITLE_CONTAINS;
	}
	return 0;
}

/**
 * 获取类型优先级分数
 */
function getTypeScore(type: SearchResultItem["type"]): number {
	switch (type) {
		case "bookmark":
			return APP_CONSTANTS.SCORE_WEIGHTS.BOOKMARK_PRIORITY;
		case "download":
			return APP_CONSTANTS.SCORE_WEIGHTS.DOWNLOAD_PRIORITY;
		case "history":
			return APP_CONSTANTS.SCORE_WEIGHTS.HISTORY_PRIORITY;
		default:
			return 0;
	}
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
						lastVisited: node.dateAdded || Date.now(),
						visitCount: 0, // 书签默认访问次数为0，实际访问次数需要从历史记录获取
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
				lastVisited: item.lastVisitTime || 0,
				visitCount: item.visitCount || 0,
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
		history = await getHistory(
			options.maxResults,
			options.timeFilter,
			options.query
		);
	}

	// 获取下载记录
	if (options.includeDownloads) {
		downloads = await getDownloads(
			options.maxResults,
			options.timeFilter,
			options.query
		);
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
/**
 * 获取推荐内容
 */
export async function getRecommendedContent(): Promise<{
	recentHistory: SearchResultItem[];
	frequentBookmarks: SearchResultItem[];
	latestDownloads: SearchResultItem[];
}> {
	try {
		// 获取最近7天的历史记录，按访问时间排序
		const recentHistory = await getHistory(20, "week");

		// 获取所有书签
		const allBookmarks = await getAllBookmarks();

		// 获取历史记录以便计算书签的实际访问频率
		const allHistory = await getHistory(1000, "all");
		const historyMap = new Map<string, SearchResultItem>();
		allHistory.forEach((item) => {
			historyMap.set(item.url, item);
		});

		// 为书签添加实际访问频率数据
		const bookmarksWithVisitCount = allBookmarks.map((bookmark) => {
			const historyItem = historyMap.get(bookmark.url);
			return {
				...bookmark,
				visitCount: historyItem?.visitCount || 0,
				lastVisited:
					historyItem?.lastVisited || bookmark.lastVisited || Date.now(),
			};
		});

		// 按访问频率和添加时间排序常用书签
		const frequentBookmarks = bookmarksWithVisitCount
			.sort((a, b) => {
				// 首先按访问频率排序
				const visitDiff = (b.visitCount || 0) - (a.visitCount || 0);
				if (visitDiff !== 0) return visitDiff;
				// 访问频率相同时按最近访问时间排序
				return (b.lastVisited || 0) - (a.lastVisited || 0);
			})
			.slice(0, 15);

		// 获取最近的下载文件
		const latestDownloads = await getDownloads(10, "week");

		return {
			recentHistory: recentHistory.slice(0, 15),
			frequentBookmarks,
			latestDownloads: latestDownloads.slice(0, 10),
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

export class SearchHistoryManager {
	private static readonly STORAGE_KEY =
		APP_CONSTANTS.STORAGE_KEYS.SEARCH_HISTORY;
	private static readonly MAX_HISTORY = APP_CONSTANTS.SEARCH.MAX_HISTORY_ITEMS;

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
