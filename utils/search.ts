import { browser } from "wxt/browser";
import type { Browser } from "wxt/browser";
import type {
	BookmarkItem,
	HistoryItem,
	SearchResultItem,
	GroupedSearchResults,
	SearchOptions,
	SearchStats,
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

	// 书签优先级稍高
	if (item.type === "bookmark") score += 10;

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
	maxResults: number = 1000
): Promise<SearchResultItem[]> {
	try {
		const historyItems = await browser.history.search({
			text: "",
			maxResults,
			startTime: 0,
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
 * 搜索书签和历史记录
 */
export async function searchBookmarksAndHistory(
	options: SearchOptions
): Promise<{ results: GroupedSearchResults; stats: SearchStats }> {
	const startTime = Date.now();

	let allItems: SearchResultItem[] = [];

	// 获取书签
	if (options.includeBookmarks) {
		const bookmarks = await getAllBookmarks();
		allItems = allItems.concat(bookmarks);
	}

	// 获取历史记录
	if (options.includeHistory) {
		const history = await getHistory(options.maxResults);
		allItems = allItems.concat(history);
	}

	// 过滤和搜索
	let filteredItems = allItems.filter(
		(item) =>
			fuzzyMatch(item.title, options.query) ||
			fuzzyMatch(item.url, options.query) ||
			fuzzyMatch(item.domain, options.query)
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
		});

	// 限制结果数量
	filteredItems = filteredItems.slice(0, options.maxResults);

	// 按域名分组
	const grouped: GroupedSearchResults = {};

	for (const item of filteredItems) {
		if (!grouped[item.domain]) {
			grouped[item.domain] = {
				domain: item.domain,
				items: [],
				totalCount: 0,
			};
		}
		grouped[item.domain].items.push(item);
		grouped[item.domain].totalCount++;
	}

	// 计算统计信息
	const bookmarkCount = filteredItems.filter(
		(item) => item.type === "bookmark"
	).length;
	const historyCount = filteredItems.filter(
		(item) => item.type === "history"
	).length;

	const stats: SearchStats = {
		totalResults: filteredItems.length,
		bookmarkCount,
		historyCount,
		uniqueDomains: Object.keys(grouped).length,
		searchTime: Date.now() - startTime,
	};

	return { results: grouped, stats };
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
 * 获取网站图标
 */
export function getFaviconUrl(domain: string): string {
	return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
}
