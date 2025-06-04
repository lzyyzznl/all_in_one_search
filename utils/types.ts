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
export type TimeFilter = 'all' | 'today' | 'week';

// 搜索结果项接口
export interface SearchResultItem {
	id: string;
	title: string;
	url: string;
	type: "bookmark" | "history" | "download";
	lastVisited?: number;
	visitCount?: number;
	domain: string;
	favicon?: string;
	path?: string;
	folderName?: string; // 书签所在文件夹名称
	fileSize?: number; // 文件大小（下载记录）
	filename?: string; // 文件名（下载记录）
	startTime?: string; // 下载开始时间
	exists?: boolean; // 文件是否存在
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
	query: string;
	includeBookmarks: boolean;
	includeHistory: boolean;
	includeDownloads: boolean;
	maxResults: number;
	sortBy: "relevance" | "recent" | "frequency";
	timeFilter: TimeFilter;
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
