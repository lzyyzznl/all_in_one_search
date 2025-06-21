<template>
	<v-app class="modern-search-app">
		<v-container fluid class="pa-0 h-screen d-flex flex-column">
			<!-- 现代化头部区域 -->
			<v-sheet class="modern-header flex-shrink-0" elevation="2">
				<v-container fluid class="py-6">
					<!-- 品牌标题区域 -->
					<v-row no-gutters class="align-center mb-6">
						<v-col>
							<div class="d-flex align-center ga-4">
								<v-avatar size="40" class="brand-avatar">
									<v-icon color="white" size="24">mdi-magnify</v-icon>
								</v-avatar>
								<div>
									<h1 class="brand-title">智能搜索</h1>
									<p class="brand-subtitle">
										快速查找您的书签、历史记录和下载文件
									</p>
								</div>
							</div>
						</v-col>
					</v-row>

					<!-- 现代化搜索输入框 -->
					<v-row no-gutters class="align-center">
						<v-col>
							<v-text-field
								v-model="searchQuery"
								placeholder="搜索本地文件，或按 Ctrl+Enter 进行网络搜索"
								variant="solo"
								density="comfortable"
								clearable
								rounded="xl"
								class="modern-search-input"
								@input="handleSearchInput"
								@keydown.enter.prevent="handleEnterKey"
								@keydown.ctrl.enter.prevent="performWebSearch"
								ref="searchInput"
							>
								<template #append-inner>
									<v-chip
										v-if="!searchQuery"
										size="x-small"
										color="primary"
										variant="tonal"
										class="shortcut-hint"
									>
										Ctrl+Enter 网络搜索
									</v-chip>
								</template>
							</v-text-field>
						</v-col>
					</v-row>

					<!-- 现代化搜索历史 -->
					<v-row v-if="searchHistory.length > 0" no-gutters class="mt-6">
						<v-col>
							<div class="mb-3">
								<v-chip
									size="small"
									color="grey-lighten-1"
									variant="text"
									prepend-icon="mdi-history"
									class="history-label"
								>
									最近搜索
								</v-chip>
							</div>
							<v-chip-group class="modern-history-chips">
								<v-chip
									v-for="item in searchHistory"
									:key="item.timestamp"
									color="primary"
									variant="tonal"
									size="small"
									class="history-chip"
									@click="selectHistoryItem(item.query)"
								>
									{{ item.query }}
								</v-chip>
							</v-chip-group>
						</v-col>
					</v-row>

					<!-- 现代化搜索选项 -->
					<v-divider class="my-6" />
					<v-row class="modern-controls" justify="space-between">
						<!-- 数据源多选 -->
						<v-col cols="12" md="4" class="filter-section">
							<v-select
								v-model="selectedDataSources"
								multiple
								chips
								variant="solo"
								density="compact"
								rounded="lg"
								label="搜索范围"
								prepend-inner-icon="mdi-database"
								class="modern-select"
								:items="[
									{ value: 'bookmarks', title: '📚 书签' },
									{ value: 'history', title: '🕐 历史记录' },
									{ value: 'downloads', title: '📥 下载文件' },
								]"
								@update:model-value="updateSearchOptions"
							/>
						</v-col>
						<!-- 时间筛选 -->
						<v-col cols="12" md="4" class="filter-section">
							<v-select
								v-model="searchOptions.timeFilter"
								variant="solo"
								density="compact"
								rounded="lg"
								label="时间范围"
								prepend-inner-icon="mdi-calendar"
								class="modern-select"
								:items="[
									{ value: 'all', title: '全部时间' },
									{ value: 'today', title: '今天' },
									{ value: 'week', title: '本周' },
									{ value: 'month', title: '本月' },
								]"
							/>
						</v-col>

						<!-- 排序选择 -->
						<v-col cols="12" md="4" class="filter-section">
							<v-select
								v-model="searchOptions.sortBy"
								variant="solo"
								density="compact"
								rounded="lg"
								label="排序方式"
								prepend-inner-icon="mdi-sort"
								class="modern-select"
								:items="[
									{ value: 'relevance', title: '相关性' },
									{ value: 'recent', title: '最近访问' },
									{ value: 'frequency', title: '访问频率' },
								]"
							/>
						</v-col>
					</v-row>
				</v-container>
			</v-sheet>

			<!-- 现代化搜索统计 -->
			<v-sheet
				v-if="searchStats"
				class="search-stats-bar flex-shrink-0"
				elevation="1"
			>
				<v-container fluid>
					<v-row no-gutters class="align-center justify-space-between py-3">
						<v-col>
							<div class="d-flex align-center ga-4 flex-wrap">
								<v-chip
									size="small"
									color="primary"
									variant="elevated"
									prepend-icon="mdi-magnify"
									class="stats-chip-main"
								>
									{{ searchStats.totalResults }} 个结果
								</v-chip>
								<v-chip
									v-if="searchStats.bookmarkCount > 0"
									size="small"
									color="success"
									variant="tonal"
									prepend-icon="mdi-bookmark"
									class="stats-chip"
								>
									{{ searchStats.bookmarkCount }}
								</v-chip>
								<v-chip
									v-if="searchStats.historyCount > 0"
									size="small"
									color="warning"
									variant="tonal"
									prepend-icon="mdi-history"
									class="stats-chip"
								>
									{{ searchStats.historyCount }}
								</v-chip>
								<v-chip
									v-if="searchStats.downloadCount > 0"
									size="small"
									color="info"
									variant="tonal"
									prepend-icon="mdi-download"
									class="stats-chip"
								>
									{{ searchStats.downloadCount }}
								</v-chip>
							</div>
						</v-col>
						<v-col cols="auto">
							<div class="d-flex align-center ga-2">
								<v-chip
									size="small"
									variant="text"
									prepend-icon="mdi-domain"
									class="stats-meta"
								>
									{{ searchStats.uniqueDomains }} 域名
								</v-chip>
								<v-chip
									size="small"
									variant="text"
									prepend-icon="mdi-clock-fast"
									class="stats-meta"
								>
									{{ searchStats.searchTime }}ms
								</v-chip>
							</div>
						</v-col>
					</v-row>
				</v-container>
			</v-sheet>

			<!-- 现代化主内容区域 -->
			<div class="modern-main-content flex-1 overflow-y-auto">
				<!-- 优雅的加载状态 -->
				<v-container v-if="isLoading" fluid class="loading-container">
					<v-row
						no-gutters
						class="justify-center align-center"
						style="min-height: 300px"
					>
						<v-col cols="auto" class="text-center">
							<div class="loading-animation">
								<v-progress-circular
									indeterminate
									color="primary"
									size="64"
									width="4"
									class="mb-6"
								/>
								<h3 class="text-h6 text-primary mb-2">正在搜索</h3>
								<p class="text-body-2 text-medium-emphasis">
									为您查找最相关的结果...
								</p>
							</div>
						</v-col>
					</v-row>
				</v-container>

				<!-- 现代化搜索结果 -->
				<v-container
					v-else-if="hasResults"
					fluid
					class="results-container pa-6"
				>
					<v-infinite-scroll
						@load="loadMoreResults"
						mode="intersect"
						side="end"
						:empty-text="hasMoreResults ? '' : '没有更多结果了'"
					>
						<template
							v-for="[domain, group] in Object.entries(searchResults)"
							:key="domain"
						>
							<v-card class="modern-domain-card mb-6" elevation="3">
								<v-card-title class="domain-header">
									<div class="d-flex align-center ga-3">
										<v-avatar size="28" class="domain-avatar">
											<v-img
												:src="getFaviconUrl(String(domain))"
												:alt="String(domain)"
											/>
										</v-avatar>
										<span class="domain-name">{{ domain }}</span>
										<v-spacer />
										<v-chip
											size="small"
											color="primary"
											variant="tonal"
											class="result-count-chip"
										>
											{{ group.totalCount }} 项
										</v-chip>
									</div>
								</v-card-title>

								<v-divider />
								<v-list class="result-list pa-0">
									<SearchResultItemComponent
										v-for="item in group.items"
										:key="item.id"
										:item="item"
										:isSelected="selectedItem === item.id"
										:isFloating="false"
										:isBookmarked="bookmarkedUrls.has(item.url)"
										:data-id="item.id"
										class="result-item"
										:class="{
											'result-item--selected': selectedItem === item.id,
										}"
										@select="selectAndOpenItem"
										@bookmark="showBookmarkDialog"
										@showFile="showDownloadFile"
										@copy="handleCopyUrl"
									/>
								</v-list>
							</v-card>
						</template>

						<!-- 加载更多状态 -->
						<template #loading>
							<v-row no-gutters class="justify-center pa-4">
								<v-col cols="auto" class="text-center">
									<v-progress-circular
										indeterminate
										color="primary"
										size="40"
									/>
									<v-card-text class="mt-2 text-body-2"
										>加载更多结果...</v-card-text
									>
								</v-col>
							</v-row>
						</template>
					</v-infinite-scroll>
				</v-container>

				<!-- 网络搜索建议 -->
				<v-container
					v-if="searchQuery && !isLoading && defaultSearchEngine"
					fluid
					class="web-search-suggestion pa-4"
				>
					<v-card class="web-search-card ma-2" elevation="2">
						<v-card-text class="pa-4">
							<v-row no-gutters class="align-center ga-2 mb-3">
								<v-col cols="auto">
									<v-img
										:src="getEngineIconUrl(defaultSearchEngine)"
										alt="icon"
										width="18"
										height="18"
										class="search-engine-icon"
									/>
								</v-col>
								<v-col>
									<v-card-text class="suggestion-text pa-0"
										>在{{ defaultSearchEngine.name }}中搜索</v-card-text
									>
								</v-col>
							</v-row>
							<v-row no-gutters class="align-center justify-space-between">
								<v-col>
									<v-card-text class="query-text text-body-1 pa-0"
										>"{{ searchQuery }}"</v-card-text
									>
								</v-col>
								<v-col cols="auto">
									<v-btn
										color="primary"
										size="small"
										prepend-icon="mdi-open-in-new"
										@click="performWebSearch"
									>
										搜索
									</v-btn>
								</v-col>
							</v-row>
						</v-card-text>
					</v-card>
				</v-container>

				<!-- 空状态 -->
				<v-container
					v-else-if="searchQuery && !isLoading"
					fluid
					class="empty-state"
				>
					<v-row no-gutters class="justify-center pa-8">
						<v-col cols="auto" class="text-center">
							<v-icon size="80" color="grey-lighten-1"
								>mdi-magnify-close</v-icon
							>
							<v-card-title class="text-h6 mt-4 mb-2"
								>未找到匹配的结果</v-card-title
							>
							<v-card-text class="text-body-2 text-medium-emphasis">
								可尝试
								<v-chip size="small" color="primary" variant="outlined"
									>Ctrl+Enter</v-chip
								>
								进行网络搜索
							</v-card-text>
						</v-col>
					</v-row>
				</v-container>

				<!-- 初始状态 - 显示推荐内容 -->
				<v-container
					v-else-if="showRecommended"
					fluid
					class="recommended-content pa-4"
				>
					<v-row>
						<v-col
							v-for="group in recommendedGroups"
							:key="group.type"
							cols="12"
							class="mb-4"
						>
							<v-card class="recommended-group" elevation="2">
								<v-card-title
									class="group-header d-flex align-center justify-center pa-3 position-relative"
								>
									<v-icon
										class="group-icon text-h6 position-absolute"
										style="left: 16px"
									>
										{{
											group.type === "history"
												? "🕐"
												: group.type === "bookmarks"
												? "📚"
												: "📥"
										}}
									</v-icon>
									<v-card-text class="group-title text-h6 pa-0 text-center">{{
										group.title
									}}</v-card-text>
									<v-chip
										size="small"
										variant="outlined"
										class="position-absolute"
										style="right: 16px"
										>{{ group.items.length }}</v-chip
									>
								</v-card-title>
								<v-card-text class="group-items pa-4">
									<SearchResultItemComponent
										v-for="item in group.items.slice(0, 6)"
										:key="item.id"
										:item="item"
										:isSelected="selectedItem === item.id"
										:isFloating="false"
										:isBookmarked="bookmarkedUrls.has(item.url)"
										@select="openItem"
										@bookmark="showBookmarkDialog"
										@showFile="showDownloadFile"
										@copy="handleCopyUrl"
									/>
								</v-card-text>
							</v-card>
						</v-col>
					</v-row>
				</v-container>

				<!-- 推荐内容加载状态 -->
				<v-container
					v-else-if="isLoadingRecommended"
					fluid
					class="loading-state pa-8"
				>
					<v-row no-gutters class="justify-center">
						<v-col cols="auto" class="text-center">
							<v-progress-circular indeterminate color="primary" size="40" />
							<v-card-text class="mt-4 text-body-1"
								>正在加载推荐内容...</v-card-text
							>
						</v-col>
					</v-row>
				</v-container>

				<!-- 初始状态 - 功能说明（作为后备） -->
				<v-container v-else fluid class="initial-state pa-4">
					<v-card class="welcome-card ma-2" elevation="2">
						<v-card-text class="text-center pa-8">
							<v-list class="welcome-tips">
								<v-list-item class="tip-item mb-3">
									<template #prepend>
										<v-icon color="primary">mdi-auto-fix</v-icon>
									</template>
									<v-list-item-title>支持模糊搜索</v-list-item-title>
								</v-list-item>
								<v-list-item class="tip-item mb-3">
									<template #prepend>
										<v-icon color="primary">mdi-folder-multiple</v-icon>
									</template>
									<v-list-item-title>结果按域名分组显示</v-list-item-title>
								</v-list-item>
								<v-list-item class="tip-item mb-3">
									<template #prepend>
										<v-icon color="primary">mdi-cursor-default-click</v-icon>
									</template>
									<v-list-item-title>单击直接打开链接</v-list-item-title>
								</v-list-item>
								<v-list-item class="tip-item mb-3">
									<template #prepend>
										<v-icon color="primary">mdi-star</v-icon>
									</template>
									<v-list-item-title>历史记录可添加到书签</v-list-item-title>
								</v-list-item>
								<v-list-item class="tip-item mb-3">
									<template #prepend>
										<v-icon color="primary">mdi-download</v-icon>
									</template>
									<v-list-item-title>支持搜索下载文件</v-list-item-title>
								</v-list-item>
								<v-list-item v-if="mainShortcut" class="tip-item mb-3">
									<template #prepend>
										<v-icon color="primary">mdi-tools</v-icon>
									</template>
									<v-list-item-title
										>快捷键: {{ mainShortcut }}</v-list-item-title
									>
								</v-list-item>
							</v-list>
						</v-card-text>
					</v-card>
				</v-container>
			</div>

			<!-- 现代化快捷键提示 -->
			<v-sheet class="modern-footer flex-shrink-0" elevation="2">
				<v-container fluid>
					<v-row no-gutters class="justify-center align-center py-3">
						<v-col cols="auto">
							<div class="d-flex align-center ga-3">
								<v-chip
									size="small"
									variant="tonal"
									color="primary"
									prepend-icon="mdi-keyboard-return"
								>
									{{ navigationKeys.open }} 打开
								</v-chip>
								<v-chip
									size="small"
									variant="tonal"
									color="primary"
									prepend-icon="mdi-arrow-up-down"
								>
									{{ navigationKeys.up }}{{ navigationKeys.down }} 选择
								</v-chip>
								<v-chip
									size="small"
									variant="tonal"
									color="primary"
									prepend-icon="mdi-keyboard-esc"
								>
									Esc 关闭
								</v-chip>
							</div>
						</v-col>
					</v-row>
				</v-container>
			</v-sheet>
		</v-container>

		<!-- 书签对话框 -->
		<BookmarkDialog
			:show="bookmarkDialog.show"
			:dialog="bookmarkDialog"
			@close="closeBookmarkDialog"
			@save="handleBookmarkSave"
		/>
	</v-app>
</template>

<script setup lang="ts">
/// <reference types="chrome" />
// 新标签页完整搜索功能组件
import BookmarkDialog from "./BookmarkDialog.vue";
import {
	computed,
	nextTick,
	onMounted,
	onUnmounted,
	reactive,
	ref,
	watch,
} from "vue";
import {
	formatFileSize,
	getFaviconUrl,
	openDownloadFile,
	openUrl,
	searchBookmarksAndHistory,
	SearchHistoryManager,
	showDownloadFile as showDownloadFileInExplorer,
	getAllBookmarks,
	findBookmarkByUrl,
	removeBookmark,
} from "../utils/search";
// import { getDefaultSearchEngine } from "../utils/searchEngines"; // 暂时未使用
import {
	formatShortcut,
	getNavigationKeys,
	getShortcut,
} from "../utils/shortcuts";
import { ContentSearchService } from "../utils/contentSearch";
import type {
	GroupedSearchResults,
	SearchHistoryItem,
	SearchOptions,
	SearchResultItem,
	SearchStats,
	RecommendedContent,
	RecommendedGroup,
	SearchEngine,
} from "../utils/types";
import SearchResultItemComponent from "./SearchResultItem.vue";

// 响应式数据
const searchQuery = ref("");
const searchResults = ref<GroupedSearchResults>({});
const searchStats = ref<SearchStats | null>(null);
const isLoading = ref(false);
const selectedItem = ref<string | null>(null);
const searchInput = ref<HTMLInputElement>();
const searchHistory = ref<SearchHistoryItem[]>([]);

// 防抖相关
const searchTimeout = ref<number | null>(null);
const DEBOUNCE_DELAY = 300;

// 选中的数据源 - 默认全选
const selectedDataSources = ref<string[]>([
	"bookmarks",
	"history",
	"downloads",
]);

// 推荐内容相关状态
const recommendedContent = ref<RecommendedContent>({
	recentHistory: [],
	frequentBookmarks: [],
	latestDownloads: [],
});
const recommendedGroups = ref<RecommendedGroup[]>([]);
const showRecommended = ref(false);
const isLoadingRecommended = ref(false);

// 书签URL集合，用于检查URL是否已经被收藏
const bookmarkedUrls = ref<Set<string>>(new Set());

// 快捷键显示
const mainShortcut = ref("");
const navigationKeys = ref(getNavigationKeys());

// 默认搜索引擎
const defaultSearchEngine = ref<SearchEngine | null>(null);

// 键盘导航配置（从设置中加载）
const navigationConfig = reactive({
	up: "ArrowUp",
	down: "ArrowDown",
	open: "Enter",
	close: "Escape",
});

// 书签对话框状态
const bookmarkDialog = reactive({
	show: false,
	title: "",
	url: "",
	parentId: "",
	item: null as SearchResultItem | null,
});

// 搜索选项
const searchOptions = reactive<SearchOptions>({
	query: "",
	includeBookmarks: true,
	includeHistory: true,
	includeDownloads: true,
	maxResults: 20, // 每页显示数量，减少初始加载
	sortBy: "relevance",
	timeFilter: "all",
});

// 无限滚动相关状态
const currentPage = ref(1);
const hasMoreResults = ref(false);
const isLoadingMore = ref(false);
const allSearchResults = ref<GroupedSearchResults>({});
const totalResultsCount = ref(0);

// 计算属性
const hasResults = computed(() => {
	return Object.keys(searchResults.value).length > 0;
});

// 处理推荐内容分组
const updateRecommendedGroups = () => {
	const groups: RecommendedGroup[] = [];

	if (recommendedContent.value.recentHistory.length > 0) {
		groups.push({
			type: "history",
			title: "最近访问",
			items: recommendedContent.value.recentHistory,
		});
	}

	if (recommendedContent.value.frequentBookmarks.length > 0) {
		groups.push({
			type: "bookmarks",
			title: "常用书签",
			items: recommendedContent.value.frequentBookmarks,
		});
	}

	if (recommendedContent.value.latestDownloads.length > 0) {
		groups.push({
			type: "downloads",
			title: "最近下载",
			items: recommendedContent.value.latestDownloads,
		});
	}

	recommendedGroups.value = groups;
	showRecommended.value = groups.length > 0;
};

// 加载书签URL集合
const loadBookmarkedUrls = async (): Promise<void> => {
	try {
		const bookmarks = await getAllBookmarks();
		bookmarkedUrls.value = new Set(bookmarks.map((bookmark) => bookmark.url));
	} catch (error) {
		console.error("加载书签URL失败:", error);
		bookmarkedUrls.value = new Set();
	}
};

// 加载推荐内容
const loadRecommendedContent = async (): Promise<void> => {
	try {
		isLoadingRecommended.value = true;
		const content = await ContentSearchService.getRecommendedContent();
		recommendedContent.value = content;
		updateRecommendedGroups();
	} catch (error) {
		console.error("加载推荐内容失败:", error);
	} finally {
		isLoadingRecommended.value = false;
	}
};

// 获取搜索引擎图标URL
const getEngineIconUrl = (engine: SearchEngine | null): string => {
	if (!engine || !chrome?.runtime?.getURL) return "";
	switch (engine.id) {
		case "baidu":
			return chrome.runtime.getURL("searchEngineIcon/baidu.png");
		case "google":
			return chrome.runtime.getURL("searchEngineIcon/google.png");
		case "bing":
			return chrome.runtime.getURL("searchEngineIcon/bing.png");
		default:
			return "";
	}
};

// 合并搜索结果
const mergeSearchResults = (newResults: GroupedSearchResults) => {
	for (const [domain, group] of Object.entries(newResults)) {
		if (allSearchResults.value[domain]) {
			// 合并同域名的结果，避免重复
			const existingIds = new Set(
				allSearchResults.value[domain].items.map((item) => item.id)
			);
			const newItems = group.items.filter((item) => !existingIds.has(item.id));
			allSearchResults.value[domain].items.push(...newItems);
			allSearchResults.value[domain].totalCount += newItems.length;
		} else {
			allSearchResults.value[domain] = { ...group };
		}
	}
	searchResults.value = { ...allSearchResults.value };
};

// 计算总结果数量
const getTotalResultsCount = (results: GroupedSearchResults): number => {
	return Object.values(results).reduce(
		(total, group) => total + group.items.length,
		0
	);
};

// 加载更多结果
const loadMoreResults = async ({ done }: any) => {
	if (!hasMoreResults.value || isLoadingMore.value) {
		done("empty");
		return;
	}

	currentPage.value += 1;
	await handleSearch(true);

	// 检查是否还有更多结果
	if (hasMoreResults.value) {
		done("ok");
	} else {
		done("empty");
	}
};

// 更新搜索选项
const updateSearchOptions = async () => {
	searchOptions.includeBookmarks =
		selectedDataSources.value.includes("bookmarks");
	searchOptions.includeHistory = selectedDataSources.value.includes("history");
	searchOptions.includeDownloads =
		selectedDataSources.value.includes("downloads");

	// 如果当前有搜索查询，重新搜索
	if (searchQuery.value.trim()) {
		handleSearchNow();
	} else {
		// 重新加载书签URL和推荐内容
		await loadBookmarkedUrls();
		await loadRecommendedContent();
	}
};

// 处理输入事件（带防抖）
const handleSearchInput = () => {
	// 清除之前的定时器
	if (searchTimeout.value !== null) {
		window.clearTimeout(searchTimeout.value);
		searchTimeout.value = null;
	}

	// 如果输入为空，立即清空结果
	if (!searchQuery.value.trim()) {
		searchResults.value = {};
		searchStats.value = null;
		return;
	}

	// 设置新的防抖定时器
	searchTimeout.value = window.setTimeout(() => {
		handleSearch();
	}, DEBOUNCE_DELAY);
};

// 立即搜索（回车或手动触发）
const handleSearchNow = () => {
	// 清除防抖定时器
	if (searchTimeout.value !== null) {
		window.clearTimeout(searchTimeout.value);
		searchTimeout.value = null;
	}

	handleSearch();
};

// 搜索处理函数
const handleSearch = async (isLoadMore = false) => {
	if (!searchQuery.value.trim()) {
		searchResults.value = {};
		allSearchResults.value = {};
		searchStats.value = null;
		currentPage.value = 1;
		hasMoreResults.value = false;
		return;
	}

	if (isLoadMore) {
		isLoadingMore.value = true;
	} else {
		isLoading.value = true;
		currentPage.value = 1;
		allSearchResults.value = {};
	}

	try {
		const options = {
			...searchOptions,
			query: searchQuery.value.trim(),
			maxResults: searchOptions.maxResults * currentPage.value, // 累积加载
		};

		const { results, stats } = await searchBookmarksAndHistory(options);

		if (isLoadMore) {
			// 合并新结果到现有结果中
			mergeSearchResults(results);
		} else {
			allSearchResults.value = results;
			searchResults.value = results;
			// 保存搜索历史
			await SearchHistoryManager.saveSearchHistory(searchQuery.value.trim());
			await loadSearchHistory();
		}

		searchStats.value = stats;

		// 计算是否还有更多结果
		const currentTotal = getTotalResultsCount(allSearchResults.value);
		totalResultsCount.value = currentTotal;
		hasMoreResults.value =
			currentTotal >= searchOptions.maxResults * currentPage.value;
	} catch (error) {
		console.error("搜索失败:", error);
	} finally {
		isLoading.value = false;
		isLoadingMore.value = false;
	}
};

// 选择历史记录项
const selectHistoryItem = (query: string) => {
	searchQuery.value = query;
	handleSearchNow();
};

// 加载搜索历史
const loadSearchHistory = async () => {
	try {
		searchHistory.value = await SearchHistoryManager.getSearchHistory();
	} catch (error) {
		console.error("加载搜索历史失败:", error);
	}
};

// 监听搜索选项变化
watch(
	() => [searchOptions.timeFilter, searchOptions.sortBy],
	() => {
		if (searchQuery.value.trim()) {
			handleSearchNow();
		}
	},
	{ deep: true }
);

// 选择并打开项目（单击）
const selectAndOpenItem = async (item: SearchResultItem) => {
	selectedItem.value = item.id;
	await openItem(item);
};

// 打开项目
const openItem = async (item: SearchResultItem) => {
	if (item.type === "download") {
		await openDownloadFile(item.id);
	} else {
		await openUrl(item.url);
	}
};

// 显示下载文件
const showDownloadFile = async (item: SearchResultItem) => {
	if (item.type !== "download") return;
	try {
		await showDownloadFileInExplorer(item.id);
	} catch (error) {
		console.error("显示下载文件失败:", error);
	}
};

// 复制URL到剪贴板
const handleCopyUrl = async (url: string) => {
	try {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			await navigator.clipboard.writeText(url);
			console.log("已复制到剪贴板:", url);
		} else {
			// 降级方案：使用传统方法
			const textArea = document.createElement("textarea");
			textArea.value = url;
			textArea.style.position = "absolute";
			textArea.style.left = "-9999px";
			document.body.appendChild(textArea);
			textArea.select();
			// 使用 try-catch 包装弃用的方法以消除警告
			try {
				document.execCommand("copy");
			} catch (execError) {
				console.warn("execCommand 复制失败:", execError);
			}
			document.body.removeChild(textArea);
			console.log("已复制到剪贴板:", url);
		}
	} catch (error) {
		console.error("复制失败:", error);
	}
};

// 根据ID查找项目
const findItemById = (itemId: string): SearchResultItem | null => {
	for (const group of Object.values(searchResults.value)) {
		const item = group.items.find((item) => item.id === itemId);
		if (item) return item;
	}
	return null;
};

// 格式化日期
const formatDate = (timestamp: number): string => {
	const date = new Date(timestamp);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffMins < 60) {
		return `${diffMins} 分钟前`;
	} else if (diffHours < 24) {
		return `${diffHours} 小时前`;
	} else if (diffDays < 7) {
		return `${diffDays} 天前`;
	} else {
		return date.toLocaleDateString("zh-CN");
	}
};

// 获取书签栏ID的辅助函数
const getBookmarkBarId = (
	bookmarks: chrome.bookmarks.BookmarkTreeNode[]
): string | null => {
	// 书签栏通常是第一个根级别文件夹
	for (const node of bookmarks) {
		if (node.children) {
			for (const child of node.children) {
				if (
					child.title === "书签栏" ||
					child.title === "Bookmarks bar" ||
					child.title === "Bookmarks"
				) {
					return child.id;
				}
			}
			// 如果没找到特定名称，返回第一个文件夹（通常是书签栏）
			if (node.children.length > 0) {
				const firstChild = node.children[0];
				if (firstChild && !firstChild.url) {
					return firstChild.id;
				}
			}
		}
	}
	return null;
};

// 处理书签保存
const handleBookmarkSave = async (data: {
	title: string;
	url: string;
	parentId: string;
}) => {
	try {
		const bookmarkData: chrome.bookmarks.CreateDetails = {
			title: data.title,
			url: data.url,
		};

		if (data.parentId) {
			bookmarkData.parentId = data.parentId;
			// 保存用户选择的文件夹
			await chrome.storage.local.set({ lastSelectedFolder: data.parentId });
		}

		await chrome.bookmarks.create(bookmarkData);

		// 更新书签URL集合
		bookmarkedUrls.value.add(data.url);

		closeBookmarkDialog();
		console.log("书签添加成功！");
	} catch (error) {
		console.error("添加书签失败:", error);
		throw error;
	}
};

// 处理删除书签
const handleRemoveBookmark = async (item: SearchResultItem) => {
	try {
		const bookmarkId = await findBookmarkByUrl(item.url);
		if (bookmarkId) {
			await chrome.bookmarks.remove(bookmarkId);
			// 从集合中移除URL
			bookmarkedUrls.value.delete(item.url);
			console.log("书签删除成功！");
		}
	} catch (error) {
		console.error("删除书签失败:", error);
	}
};

// 显示书签对话框或处理收藏切换
const showBookmarkDialog = async (item: SearchResultItem) => {
	// 检查是否已收藏，如果已收藏则直接取消收藏
	if (bookmarkedUrls.value.has(item.url)) {
		await handleRemoveBookmark(item);
		return;
	}

	// 如果未收藏，则显示添加书签对话框
	bookmarkDialog.item = item;
	bookmarkDialog.title = item.title;
	bookmarkDialog.url = item.url;

	// 恢复上次选择的文件夹，如果没有则默认选择书签栏
	try {
		const result = await chrome.storage.local.get(["lastSelectedFolder"]);
		const lastFolder = result.lastSelectedFolder;

		if (lastFolder) {
			bookmarkDialog.parentId = lastFolder;
		} else {
			// 获取书签栏ID
			const bookmarks = await chrome.bookmarks.getTree();
			const bookmarkBarId = getBookmarkBarId(bookmarks);
			bookmarkDialog.parentId = bookmarkBarId || "";
		}
	} catch (error) {
		console.error("获取上次选择的文件夹失败:", error);
		// 默认选择书签栏
		try {
			const bookmarks = await chrome.bookmarks.getTree();
			const bookmarkBarId = getBookmarkBarId(bookmarks);
			bookmarkDialog.parentId = bookmarkBarId || "";
		} catch (err) {
			console.error("获取书签栏失败:", err);
			bookmarkDialog.parentId = "";
		}
	}

	bookmarkDialog.show = true;
};

// 关闭书签对话框
const closeBookmarkDialog = () => {
	bookmarkDialog.show = false;
	bookmarkDialog.title = "";
	bookmarkDialog.url = "";
	bookmarkDialog.parentId = "";
	bookmarkDialog.item = null;
};

// 加载快捷键配置
const loadShortcutConfig = async () => {
	try {
		// 加载主快捷键
		const shortcut = await getShortcut("_execute_action");
		mainShortcut.value = formatShortcut(shortcut);

		// 可选：加载备用快捷键
		const altShortcut = await getShortcut("open-search-alt");
		if (altShortcut && !mainShortcut.value) {
			mainShortcut.value = formatShortcut(altShortcut);
		}
	} catch (error) {
		console.error("加载快捷键配置失败:", error);
		mainShortcut.value = "Ctrl+Shift+S"; // 默认值
	}
};

// 加载搜索设置
const loadSearchSettings = async () => {
	try {
		const result = await chrome.storage.local.get(["searchSettings"]);
		if (result.searchSettings) {
			// 应用搜索设置到当前的搜索选项
			if (result.searchSettings.defaultMaxResults) {
				searchOptions.maxResults = Number(
					result.searchSettings.defaultMaxResults
				);
			}
			if (result.searchSettings.defaultSortBy) {
				searchOptions.sortBy = result.searchSettings.defaultSortBy;
			}

			console.log("已加载搜索设置:", result.searchSettings);
		}
	} catch (error) {
		console.error("加载搜索设置失败:", error);
	}
};

// 加载导航设置
const loadNavigationSettings = async () => {
	try {
		const result = await chrome.storage.local.get(["navigationSettings"]);
		if (result.navigationSettings) {
			Object.assign(navigationConfig, result.navigationSettings);
			console.log("已加载导航设置:", result.navigationSettings);
		}
	} catch (error) {
		console.error("加载导航设置失败:", error);
	}
};

// 键盘导航
const handleKeyDown = (event: KeyboardEvent) => {
	if (!hasResults.value) return;

	const allItems = Object.values(searchResults.value).flatMap(
		(group) => group.items
	);

	if (!allItems.length) return;

	const currentIndex = selectedItem.value
		? allItems.findIndex((item) => item.id === selectedItem.value)
		: -1;

	switch (event.code) {
		case navigationConfig.down:
			event.preventDefault();
			const nextIndex =
				currentIndex < allItems.length - 1 ? currentIndex + 1 : 0;
			const nextItem = allItems[nextIndex];
			if (nextItem) {
				selectedItem.value = nextItem.id;
				// 滚动到可见区域
				const nextElement = document.querySelector(
					`[data-id="${nextItem.id}"]`
				);
				if (nextElement) {
					const scrollableContainer = document.querySelector(
						".scrollable-content"
					);
					if (scrollableContainer) {
						const containerRect = scrollableContainer.getBoundingClientRect();
						const elementRect = nextElement.getBoundingClientRect();

						if (elementRect.bottom > containerRect.bottom) {
							nextElement.scrollIntoView({ block: "end", behavior: "smooth" });
						} else if (elementRect.top < containerRect.top) {
							nextElement.scrollIntoView({
								block: "start",
								behavior: "smooth",
							});
						}
					}
				}
			}
			break;
		case navigationConfig.up:
			event.preventDefault();
			const prevIndex =
				currentIndex > 0 ? currentIndex - 1 : allItems.length - 1;
			const prevItem = allItems[prevIndex];
			if (prevItem) {
				selectedItem.value = prevItem.id;
				// 滚动到可见区域
				const prevElement = document.querySelector(
					`[data-id="${prevItem.id}"]`
				);
				if (prevElement) {
					const scrollableContainer = document.querySelector(
						".scrollable-content"
					);
					if (scrollableContainer) {
						const containerRect = scrollableContainer.getBoundingClientRect();
						const elementRect = prevElement.getBoundingClientRect();

						if (elementRect.top < containerRect.top) {
							prevElement.scrollIntoView({
								block: "start",
								behavior: "smooth",
							});
						} else if (elementRect.bottom > containerRect.bottom) {
							prevElement.scrollIntoView({ block: "end", behavior: "smooth" });
						}
					}
				}
			}
			break;
		case navigationConfig.open:
			if (selectedItem.value) {
				const item = findItemById(selectedItem.value);
				if (item) openItem(item);
			}
			break;
		case navigationConfig.close:
			window.close();
			break;
	}
};

// 执行网络搜索
const performWebSearch = async () => {
	if (!searchQuery.value.trim() || !defaultSearchEngine.value) {
		return;
	}

	try {
		const response = await chrome.runtime.sendMessage({
			action: "perform-web-search",
			engineId: defaultSearchEngine.value.id,
			query: searchQuery.value.trim(),
			inNewTab: true,
		});

		if (response?.success) {
			console.log("网络搜索成功");
		} else {
			console.error("网络搜索失败:", response?.error);
		}
	} catch (error) {
		console.error("执行网络搜索失败:", error);
	}
};

// 加载默认搜索引擎
const loadDefaultSearchEngine = async () => {
	try {
		// 1. 先查用户设置
		const settingsResult = await chrome.storage.local.get(["searchSettings"]);
		const preferredId = settingsResult?.searchSettings?.preferredSearchEngine;
		if (preferredId) {
			// 2. 查所有可用引擎
			const allEnginesResp = await chrome.runtime.sendMessage({
				action: "get-all-search-engines",
			});
			if (allEnginesResp?.success && Array.isArray(allEnginesResp.engines)) {
				const found = allEnginesResp.engines.find(
					(e: any) => e.id === preferredId
				);
				if (found) {
					defaultSearchEngine.value = found;
					return;
				}
			}
		}
		// 3. 没有设置或找不到，兜底用浏览器默认
		const response = await chrome.runtime.sendMessage({
			action: "get-default-search-engine",
		});
		if (response?.success && response.engine) {
			defaultSearchEngine.value = response.engine;
		} else {
			defaultSearchEngine.value = null;
		}
	} catch (error) {
		console.error("获取默认搜索引擎失败:", error);
		defaultSearchEngine.value = null;
	}
};

// 监听storage变化
const handleStorageChange = (
	changes: Record<string, chrome.storage.StorageChange>
) => {
	// 监听搜索设置变化
	if (changes.searchSettings) {
		const newSettings = changes.searchSettings.newValue;
		if (newSettings) {
			if (newSettings.defaultMaxResults) {
				searchOptions.maxResults = Number(newSettings.defaultMaxResults);
			}
			if (newSettings.defaultSortBy) {
				searchOptions.sortBy = newSettings.defaultSortBy;
			}
			if (newSettings.preferredSearchEngine) {
				loadDefaultSearchEngine();
			}
		}
	}

	// 监听导航设置变化
	if (changes.navigationSettings) {
		const newSettings = changes.navigationSettings.newValue;
		if (newSettings) {
			Object.assign(navigationConfig, newSettings);
		}
	}
};

// 设置按钮已移除

// 处理回车键
const handleEnterKey = () => {
	if (selectedItem.value) {
		const item = findItemById(selectedItem.value);
		if (item) {
			openItem(item);
		}
	} else {
		handleSearchNow();
	}
};

// 组件挂载时的初始化
onMounted(async () => {
	// 聚焦搜索框
	await nextTick();
	if (searchInput.value) {
		searchInput.value.focus();
	}

	// 加载配置
	await loadShortcutConfig();
	await loadSearchSettings();
	await loadNavigationSettings();
	await loadDefaultSearchEngine();
	await loadSearchHistory();
	await loadBookmarkedUrls();

	// 加载推荐内容
	if (!searchQuery.value.trim()) {
		await loadRecommendedContent();
	}

	// 监听键盘事件
	document.addEventListener("keydown", handleKeyDown);

	// 监听storage变化
	chrome.storage.onChanged.addListener(handleStorageChange);
});

// 组件卸载时清理
onUnmounted(() => {
	document.removeEventListener("keydown", handleKeyDown);
	chrome.storage.onChanged.removeListener(handleStorageChange);
});
</script>

<style scoped>
/* 现代化应用样式 */
.modern-search-app {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	min-height: 100vh;
	overflow: hidden;
}

/* 现代化头部样式 */
.modern-header {
	background: rgba(255, 255, 255, 0.95) !important;
	backdrop-filter: blur(20px);
	border-bottom: 1px solid rgba(255, 255, 255, 0.2);
	z-index: 10;
}

.brand-avatar {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.brand-title {
	font-size: 1.75rem;
	font-weight: 700;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	margin-bottom: 0;
}

.brand-subtitle {
	color: #64748b;
	font-size: 0.875rem;
	margin-bottom: 0;
	font-weight: 500;
}

/* 现代化搜索输入框 */
.modern-search-input :deep(.v-field) {
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
	border-radius: 24px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	border: 1px solid rgba(255, 255, 255, 0.2);
	transition: all 0.3s ease;
}

.modern-search-input :deep(.v-field:hover) {
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
	transform: translateY(-2px);
}

.modern-search-input :deep(.v-field--focused) {
	box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
	border-color: #667eea;
}

.shortcut-hint {
	font-size: 0.75rem;
	font-weight: 500;
}

/* 现代化历史记录 */
.history-label {
	font-weight: 600;
	color: #64748b;
}

.modern-history-chips .history-chip {
	transition: all 0.3s ease;
	cursor: pointer;
}

.modern-history-chips .history-chip:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

/* 现代化控制选项 */
.modern-controls .modern-select :deep(.v-field) {
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(10px);
	border-radius: 16px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	transition: all 0.3s ease;
}

.modern-controls .modern-select :deep(.v-field:hover) {
	background: rgba(255, 255, 255, 0.9);
	transform: translateY(-1px);
}

/* 搜索统计栏 */
.search-stats-bar {
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	z-index: 9;
}

.stats-chip-main {
	font-weight: 600;
	box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.stats-chip {
	font-weight: 500;
}

.stats-meta {
	color: #64748b;
	font-size: 0.75rem;
}

/* 现代化主内容区域 */
.modern-main-content {
	background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
	position: relative;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 1rem 0;
}

.loading-container {
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(10px);
	border-radius: 24px;
	margin: 2rem;
	min-height: 300px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.loading-animation {
	padding: 2rem;
}

/* 现代化搜索结果 */
.results-container {
	background: transparent;
	padding: 1.5rem !important;
}

.modern-domain-card {
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-radius: 20px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	transition: all 0.3s ease;
	overflow: hidden;
	margin-bottom: 2rem !important;
}

.modern-domain-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.domain-header {
	background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
	padding: 1rem 1.5rem;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.domain-avatar {
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.domain-name {
	font-weight: 600;
	color: #1e293b;
	font-size: 1.1rem;
}

.result-count-chip {
	font-weight: 600;
}

/* 现代化结果列表 */
.result-list .result-item {
	transition: all 0.3s ease;
	cursor: pointer;
	border-radius: 12px;
	margin: 0.5rem;
}

.result-list .result-item:hover {
	background: rgba(102, 126, 234, 0.05);
	transform: translateX(8px);
}

.result-list .result-item--selected {
	background: linear-gradient(
		135deg,
		rgba(102, 126, 234, 0.1) 0%,
		rgba(118, 75, 162, 0.1) 100%
	);
	border-left: 4px solid #667eea;
}

.item-type-avatar {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	color: white;
	font-weight: bold;
}

.item-title {
	font-weight: 600;
	color: #1e293b;
	font-size: 1rem;
}

.item-url {
	color: #64748b;
	font-size: 0.875rem;
}

.item-meta {
	margin-top: 0.5rem;
}

.item-actions .v-btn {
	transition: all 0.3s ease;
}

.item-actions .v-btn:hover {
	transform: scale(1.1);
}

/* 现代化底部 */
.modern-footer {
	background: rgba(255, 255, 255, 0.95);
	backdrop-filter: blur(20px);
	border-top: 1px solid rgba(0, 0, 0, 0.05);
	z-index: 10;
}

/* 响应式设计 */
@media (max-width: 768px) {
	.brand-title {
		font-size: 1.5rem;
	}

	.modern-controls {
		gap: 1rem;
	}

	.modern-controls .v-col {
		margin-bottom: 1rem;
	}

	.modern-domain-card {
		margin: 0.5rem;
	}

	.result-list .result-item:hover {
		transform: none;
	}
}

/* 动画效果 */
@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.modern-domain-card {
	animation: fadeInUp 0.5s ease-out;
}

/* 滚动条样式 */
:deep(.v-main) {
	scrollbar-width: thin;
	scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
}

:deep(.v-main::-webkit-scrollbar) {
	width: 6px;
}

:deep(.v-main::-webkit-scrollbar-track) {
	background: transparent;
}

:deep(.v-main::-webkit-scrollbar-thumb) {
	background: rgba(102, 126, 234, 0.3);
	border-radius: 3px;
}

:deep(.v-main::-webkit-scrollbar-thumb:hover) {
	background: rgba(102, 126, 234, 0.5);
}
</style>
