// 书签接口
export interface BookmarkItem {
	id: string;
	title: string;
	url?: string;
	dateAdded?: number;
	parentId?: string;
	children?: BookmarkItem[];
	index?: number;
}

// 历史记录接口
export interface HistoryItem {
	id: string;
	url: string;
	title?: string;
	lastVisitTime?: number;
	visitCount?: number;
	typedCount?: number;
}

// 下载记录接口
export interface DownloadItem {
	id: string;
	filename: string;
	url: string;
	startTime: string;
	endTime?: string;
	state: 'in_progress' | 'interrupted' | 'complete';
	fileSize: number;
	mime: string;
	exists: boolean;
}

// 搜索历史记录接口
export interface SearchHistoryItem {
	query: string;
	timestamp: number;
}

// 时间筛选选项
export type TimeFilter = "all" | "today" | "week" | "month";

// 排序选项
export type SortBy = "relevance" | "recent" | "frequency";

// 数据源类型
export type DataSourceType = "bookmarks" | "history" | "downloads";

// 搜索结果类型
export type SearchResultType = "bookmark" | "history" | "download";

// 搜索结果项接口
export interface SearchResultItem {
	readonly id: string;
	readonly title: string;
	readonly url: string;
	readonly type: SearchResultType;
	readonly lastVisited?: number;
	readonly visitCount?: number;
	readonly domain: string;
	readonly favicon?: string;
	readonly path?: string;
	readonly folderName?: string; // 书签所在文件夹名称
	readonly fileSize?: number; // 文件大小（下载记录）
	readonly filename?: string; // 文件名（下载记录）
	readonly startTime?: string; // 下载开始时间
	readonly exists?: boolean; // 文件是否存在
}

// 按域名分组的搜索结果
export interface GroupedSearchResults {
	[domain: string]: {
		domain: string;
		items: SearchResultItem[];
		totalCount: number;
	};
}

// 搜索选项
export interface SearchOptions {
	readonly query: string;
	readonly includeBookmarks: boolean;
	readonly includeHistory: boolean;
	readonly includeDownloads: boolean;
	readonly maxResults: number;
	readonly sortBy: SortBy;
	readonly timeFilter: TimeFilter;
}

// 搜索统计
export interface SearchStats {
	totalResults: number;
	bookmarkCount: number;
	historyCount: number;
	downloadCount: number;
	uniqueDomains: number;
	searchTime: number; // 搜索耗时(ms)
}

// 应用状态
export interface AppState {
	searchQuery: string;
	searchResults: GroupedSearchResults;
	searchStats: SearchStats;
	isLoading: boolean;
	searchOptions: SearchOptions;
	selectedItem: string | null;
	searchHistory: SearchHistoryItem[];
}
