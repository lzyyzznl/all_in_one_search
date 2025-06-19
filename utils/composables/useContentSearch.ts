import { ref, computed, reactive, watch } from "vue";
import type {
	SearchOptions,
	GroupedSearchResults,
	SearchStats,
	SearchResultItem,
	DataSourceType,
	TimeFilter,
	SortBy,
	RecommendedContent,
	RecommendedGroup,
} from "../types";
import { ContentSearchService } from "../contentSearch";
import { APP_CONSTANTS } from "../constants";

export function useContentSearch() {
	// 响应式状态
	const searchQuery = ref("");
	const isLoading = ref(false);
	const searchResults = ref<GroupedSearchResults>({});
	const searchStats = ref<SearchStats | null>(null);
	const selectedItem = ref<string | null>(null);
	const searchHistory = ref<string[]>([]);

	// 推荐内容状态
	const recommendedContent = ref<RecommendedContent>({
		recentHistory: [],
		frequentBookmarks: [],
		latestDownloads: [],
	});
	const isLoadingRecommended = ref(false);

	// 搜索选项 - 使用可变版本
	const searchOptions = reactive({
		query: "",
		includeBookmarks: true,
		includeHistory: true,
		includeDownloads: true,
		maxResults: APP_CONSTANTS.SEARCH.MAX_RESULTS,
		sortBy: "relevance" as SortBy,
		timeFilter: "all" as TimeFilter,
	});

	// 数据源选择
	const selectedDataSources = ref<DataSourceType[]>([
		"bookmarks",
		"history",
		"downloads",
	]);

	// 计算属性
	const hasResults = computed(() => {
		return Object.keys(searchResults.value).length > 0;
	});

	const isEmpty = computed(() => {
		return (
			!isLoading.value && !hasResults.value && searchQuery.value.length > 0
		);
	});

	// 推荐内容分组
	const recommendedGroups = computed((): RecommendedGroup[] => {
		const groups: RecommendedGroup[] = [];

		if (recommendedContent.value.recentHistory.length > 0) {
			groups.push({
				title: "最近浏览",
				items: recommendedContent.value.recentHistory,
				type: "history",
			});
		}

		if (recommendedContent.value.frequentBookmarks.length > 0) {
			groups.push({
				title: "常用书签",
				items: recommendedContent.value.frequentBookmarks,
				type: "bookmarks",
			});
		}

		if (recommendedContent.value.latestDownloads.length > 0) {
			groups.push({
				title: "最近下载",
				items: recommendedContent.value.latestDownloads,
				type: "downloads",
			});
		}

		return groups;
	});

	// 是否显示推荐内容
	const showRecommended = computed(() => {
		return !searchQuery.value.trim() && recommendedGroups.value.length > 0;
	});

	// 监听搜索查询变化
	let searchTimeout: NodeJS.Timeout;
	watch(searchQuery, (newQuery) => {
		clearTimeout(searchTimeout);

		if (newQuery.length >= APP_CONSTANTS.SEARCH.MIN_QUERY_LENGTH) {
			searchTimeout = setTimeout(() => {
				performSearch(newQuery);
			}, APP_CONSTANTS.SEARCH.DEBOUNCE_DELAY);
		} else {
			searchResults.value = {};
			searchStats.value = null;
		}
	});

	// 搜索函数
	async function performSearch(query: string): Promise<void> {
		if (!query.trim()) return;

		isLoading.value = true;
		selectedItem.value = null;

		try {
			const options: SearchOptions = {
				query: query.trim(),
				includeBookmarks: searchOptions.includeBookmarks,
				includeHistory: searchOptions.includeHistory,
				includeDownloads: searchOptions.includeDownloads,
				maxResults: searchOptions.maxResults,
				sortBy: searchOptions.sortBy,
				timeFilter: searchOptions.timeFilter,
			};

			const { results, stats } =
				await ContentSearchService.searchBookmarksAndHistory(options);
			searchResults.value = results;
			searchStats.value = stats;

			// 保存搜索历史
			await ContentSearchService.saveSearchHistory(query.trim());
		} catch (error) {
			console.error("搜索失败:", error);
			searchResults.value = {};
			searchStats.value = null;
		} finally {
			isLoading.value = false;
		}
	}

	// 更新搜索选项
	function updateSearchOptions(): void {
		searchOptions.includeBookmarks =
			selectedDataSources.value.includes("bookmarks");
		searchOptions.includeHistory =
			selectedDataSources.value.includes("history");
		searchOptions.includeDownloads =
			selectedDataSources.value.includes("downloads");

		if (searchQuery.value) {
			performSearch(searchQuery.value);
		}
	}

	// 选择搜索历史项
	function selectHistoryItem(query: string): void {
		searchQuery.value = query;
	}

	// 清空搜索
	function clearSearch(): void {
		searchQuery.value = "";
		searchResults.value = {};
		searchStats.value = null;
		selectedItem.value = null;
	}

	// 打开搜索结果项
	async function openSearchItem(
		item: SearchResultItem,
		inNewTab = true
	): Promise<void> {
		try {
			if (item.type === "download") {
				await ContentSearchService.openDownloadFile(item.id);
			} else {
				await ContentSearchService.openUrl(item.url, inNewTab);
			}
		} catch (error) {
			console.error("打开项目失败:", error);
		}
	}

	// 显示下载文件
	async function showDownloadItem(item: SearchResultItem): Promise<void> {
		try {
			await ContentSearchService.showDownloadFile(item.id);
		} catch (error) {
			console.error("显示文件失败:", error);
		}
	}

	// 加载搜索历史
	async function loadSearchHistory(): Promise<void> {
		try {
			const history = await ContentSearchService.getSearchHistory();
			searchHistory.value = history;
		} catch (error) {
			console.error("加载搜索历史失败:", error);
		}
	}

	// 加载推荐内容
	async function loadRecommendedContent(): Promise<void> {
		isLoadingRecommended.value = true;
		try {
			const content = await ContentSearchService.getRecommendedContent();
			recommendedContent.value = content;
		} catch (error) {
			console.error("加载推荐内容失败:", error);
		} finally {
			isLoadingRecommended.value = false;
		}
	}

	return {
		// 状态
		searchQuery,
		isLoading,
		searchResults,
		searchStats,
		selectedItem,
		searchHistory,
		searchOptions,
		selectedDataSources,
		recommendedContent,
		isLoadingRecommended,

		// 计算属性
		hasResults,
		isEmpty,
		recommendedGroups,
		showRecommended,

		// 方法
		performSearch,
		updateSearchOptions,
		selectHistoryItem,
		clearSearch,
		openSearchItem,
		showDownloadItem,
		loadSearchHistory,
		loadRecommendedContent,
	};
}
