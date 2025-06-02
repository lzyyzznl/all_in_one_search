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

// 搜索结果项接口
export interface SearchResultItem {
	id: string;
	title: string;
	url: string;
	type: "bookmark" | "history";
	lastVisited?: number;
	visitCount?: number;
	domain: string;
	favicon?: string;
	path?: string;
	folderName?: string; // 书签所在文件夹名称
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
	maxResults: number;
	sortBy: "relevance" | "recent" | "frequency";
}

// 搜索统计
export interface SearchStats {
	totalResults: number;
	bookmarkCount: number;
	historyCount: number;
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
}
