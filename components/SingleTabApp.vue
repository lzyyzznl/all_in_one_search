<template>
	<v-app
		class="w-screen h-screen min-h-screen min-w-screen bg-gray-50 overflow-hidden flex flex-col"
	>
		<!-- 固定头部区域 -->
		<v-container
			fluid
			class="flex-shrink-0 bg-white border-b border-gray-200 pa-0"
		>
			<!-- 搜索头部 -->
			<v-card class="rounded-0 shadow-none pa-4">
				<!-- 搜索输入框 -->
				<v-row no-gutters class="align-center">
					<v-col>
						<v-text-field
							v-model="searchQuery"
							placeholder="搜索本地文件，或按 Ctrl+Enter 进行网络搜索"
							variant="outlined"
							density="comfortable"
							clearable
							@input="handleSearchInput"
							@keydown.enter.prevent="handleEnterKey"
							@keydown.ctrl.enter.prevent="performWebSearch"
							ref="searchInput"
						>
							<template #prepend-inner>
								<v-icon>mdi-magnify</v-icon>
							</template>
						</v-text-field>
					</v-col>
				</v-row>

				<!-- 搜索历史气泡 -->
				<v-row v-if="searchHistory.length > 0" no-gutters class="mt-3">
					<v-col>
						<v-chip-group>
							<v-chip
								v-for="item in searchHistory"
								:key="item.timestamp"
								color="info"
								variant="outlined"
								size="small"
								class="history-tag"
								@click="selectHistoryItem(item.query)"
							>
								{{ item.query }}
							</v-chip>
						</v-chip-group>
					</v-col>
				</v-row>

				<!-- 搜索选项 - 水平对齐 -->
				<v-divider class="mt-3 mb-3" />
				<v-row class="controls-row align-center" justify="space-between">
					<!-- 数据源多选 -->
					<v-col cols="4" class="filter-control">
						<v-row no-gutters class="align-center ga-2">
							<v-col cols="auto">
								<v-label class="text-body-2">搜索项:</v-label>
							</v-col>
							<v-col>
								<v-select
									v-model="selectedDataSources"
									multiple
									chips
									variant="outlined"
									density="compact"
									:items="[
										{ value: 'bookmarks', title: '书签' },
										{ value: 'history', title: '历史记录' },
										{ value: 'downloads', title: '下载文件' },
									]"
									@update:model-value="updateSearchOptions"
								/>
							</v-col>
						</v-row>
					</v-col>
					<!-- 时间筛选 -->
					<v-col cols="4" class="filter-control">
						<v-row no-gutters class="align-center ga-2">
							<v-col cols="auto">
								<v-label class="text-body-2">时间:</v-label>
							</v-col>
							<v-col>
								<v-select
									v-model="searchOptions.timeFilter"
									variant="outlined"
									density="compact"
									:items="[
										{ value: 'all', title: '全部时间' },
										{ value: 'today', title: '今天' },
										{ value: 'week', title: '本周' },
										{ value: 'month', title: '本月' },
									]"
								/>
							</v-col>
						</v-row>
					</v-col>

					<!-- 排序选择 -->
					<v-col cols="4" class="filter-control">
						<v-row no-gutters class="align-center ga-2">
							<v-col cols="auto">
								<v-label class="text-body-2">排序:</v-label>
							</v-col>
							<v-col>
								<v-select
									v-model="searchOptions.sortBy"
									variant="outlined"
									density="compact"
									:items="[
										{ value: 'relevance', title: '相关性' },
										{ value: 'recent', title: '最近访问' },
										{ value: 'frequency', title: '访问频率' },
									]"
								/>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
			</v-card>

			<!-- 搜索统计 -->
			<v-sheet
				v-if="searchStats"
				class="bg-gray-50 border-b border-gray-200 pa-2"
			>
				<v-chip-group>
					<v-chip size="small" color="info" variant="outlined">
						找到 {{ searchStats.totalResults }} 个结果
					</v-chip>
					<v-chip
						v-if="searchStats.bookmarkCount > 0"
						size="small"
						color="success"
						variant="outlined"
					>
						书签 {{ searchStats.bookmarkCount }}
					</v-chip>
					<v-chip
						v-if="searchStats.historyCount > 0"
						size="small"
						color="warning"
						variant="outlined"
					>
						历史 {{ searchStats.historyCount }}
					</v-chip>
					<v-chip
						v-if="searchStats.downloadCount > 0"
						size="small"
						color="info"
						variant="outlined"
					>
						下载 {{ searchStats.downloadCount }}
					</v-chip>
					<v-chip size="small" variant="outlined">
						{{ searchStats.uniqueDomains }} 个域名
					</v-chip>
					<v-chip size="small" variant="outlined">
						{{ searchStats.searchTime }}ms
					</v-chip>
				</v-chip-group>
			</v-sheet>
		</v-container>

		<!-- 可滚动内容区域 -->
		<v-container fluid class="flex-1 overflow-y-auto overflow-x-hidden pa-0">
			<!-- 加载状态 -->
			<v-row
				v-if="isLoading"
				no-gutters
				class="justify-center align-center pa-8"
				style="min-height: 200px"
			>
				<v-col cols="auto" class="text-center">
					<v-progress-circular indeterminate color="primary" size="60" />
					<v-card-text class="mt-4 text-body-1">搜索中...</v-card-text>
				</v-col>
			</v-row>

			<!-- 搜索结果 -->
			<v-container v-else-if="hasResults" fluid class="results-container pa-4">
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
						<v-card class="domain-group-card ma-2" elevation="2">
							<v-card-title class="domain-header d-flex align-center ga-3 pa-3">
								<img
									:src="getFaviconUrl(String(domain))"
									:alt="String(domain)"
									class="domain-favicon"
								/>
								<span class="domain-name flex-grow-1">{{ domain }}</span>
								<v-chip size="small" color="primary" variant="outlined">{{
									group.totalCount
								}}</v-chip>
							</v-card-title>

							<v-card-text class="result-items pa-3">
								<v-card
									v-for="item in group.items"
									:key="item.id"
									class="result-item-card mb-2"
									:class="{ selected: selectedItem === item.id }"
									:data-id="item.id"
									elevation="1"
									@click="selectAndOpenItem(item)"
								>
									<v-card-text
										class="result-item-content d-flex align-center ga-3 pa-3"
									>
										<div class="item-icon text-h6">
											{{ getItemIcon(item.type) }}
										</div>
										<div class="item-content flex-grow-1">
											<div
												class="item-title text-body-1 font-weight-medium"
												:title="item.title"
											>
												{{ item.title }}
											</div>
											<div
												class="item-url text-body-2 text-medium-emphasis"
												:title="item.url"
											>
												{{ item.url }}
											</div>
											<div class="item-meta d-flex flex-wrap ga-1 mt-1">
												<v-chip
													v-if="item.folderName"
													size="x-small"
													color="warning"
													variant="outlined"
												>
													📁 {{ item.folderName }}
												</v-chip>
												<v-chip
													v-if="item.visitCount && item.type !== 'download'"
													size="x-small"
													color="info"
													variant="outlined"
												>
													{{ item.visitCount }} 次访问
												</v-chip>
												<v-chip
													v-if="item.fileSize && item.type === 'download'"
													size="x-small"
													color="success"
													variant="outlined"
												>
													{{ formatFileSize(item.fileSize) }}
												</v-chip>
												<span
													v-if="item.lastVisited"
													class="last-visited text-caption text-medium-emphasis"
												>
													{{ formatDate(item.lastVisited) }}
												</span>
												<v-chip
													v-if="item.type === 'download' && !item.exists"
													size="x-small"
													color="error"
													variant="flat"
												>
													⚠️ 文件不存在
												</v-chip>
											</div>
										</div>
										<div class="item-actions d-flex flex-column ga-1">
											<v-btn
												v-if="item.type === 'history'"
												size="small"
												color="primary"
												prepend-icon="mdi-star"
												@click.stop="showBookmarkDialog(item)"
											>
												收藏
											</v-btn>
											<v-btn
												v-if="item.type === 'download'"
												size="small"
												color="success"
												prepend-icon="mdi-folder-open"
												@click.stop="showDownloadFile(item)"
											>
												显示文件目录
											</v-btn>
										</div>
									</v-card-text>
								</v-card>
							</v-card-text>
						</v-card>
					</template>

					<!-- 加载更多状态 -->
					<template #loading>
						<v-row no-gutters class="justify-center pa-4">
							<v-col cols="auto" class="text-center">
								<v-progress-circular indeterminate color="primary" size="40" />
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
						<v-icon size="80" color="grey-lighten-1">mdi-magnify-close</v-icon>
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
							<v-card-title class="group-header d-flex align-center ga-2 pa-3">
								<v-icon class="group-icon text-h6">
									{{
										group.type === "history"
											? "🕐"
											: group.type === "bookmarks"
											? "📚"
											: "📥"
									}}
								</v-icon>
								<v-spacer />
								<v-card-text class="group-title text-h6 pa-0">{{
									group.title
								}}</v-card-text>
								<v-spacer />
								<v-chip size="small" variant="outlined">{{
									group.items.length
								}}</v-chip>
							</v-card-title>
							<v-card-text class="group-items pa-4">
								<SearchResultItemComponent
									v-for="item in group.items.slice(0, 6)"
									:key="item.id"
									:item="item"
									:isSelected="selectedItem === item.id"
									:isFloating="false"
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
		</v-container>

		<!-- 快捷键提示 -->
		<v-footer class="shortcuts justify-center ga-2 pa-2">
			<v-chip size="small" variant="outlined"
				>{{ navigationKeys.open }} 打开</v-chip
			>
			<v-chip size="small" variant="outlined"
				>{{ navigationKeys.up }}{{ navigationKeys.down }} 选择</v-chip
			>
			<v-chip size="small" variant="outlined">Esc 关闭</v-chip>
		</v-footer>

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

// 获取项目图标
const getItemIcon = (type: string): string => {
	switch (type) {
		case "bookmark":
			return "🔖";
		case "history":
			return "🕒";
		case "download":
			return "📥";
		default:
			return "📄";
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
const updateSearchOptions = () => {
	searchOptions.includeBookmarks =
		selectedDataSources.value.includes("bookmarks");
	searchOptions.includeHistory = selectedDataSources.value.includes("history");
	searchOptions.includeDownloads =
		selectedDataSources.value.includes("downloads");

	// 如果当前有搜索查询，重新搜索
	if (searchQuery.value.trim()) {
		handleSearchNow();
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
		closeBookmarkDialog();
		console.log("书签添加成功！");
	} catch (error) {
		console.error("添加书签失败:", error);
		throw error;
	}
};

// 显示书签对话框
const showBookmarkDialog = async (item: SearchResultItem) => {
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
/* 搜索历史样式 */
.search-history {
	max-height: 100px;
	overflow-y: auto;
}

.history-tag {
	cursor: pointer;
	transition: all 0.2s ease;
}

.history-tag:hover {
	transform: scale(1.05);
}

/* 搜索选项样式 */
.search-options {
	border-top: 1px solid #e0e0e0;
	padding-top: 16px;
}

/* 结果容器样式 */
.results-container {
	padding: 16px;
}

.domain-group-card {
	margin-bottom: 16px;
	border-radius: 12px;
	overflow: hidden;
}

.domain-header {
	background: #f8fafc;
	border-bottom: 1px solid #e2e8f0;
}

.domain-favicon {
	width: 20px;
	height: 20px;
	border-radius: 4px;
}

.domain-name {
	font-weight: 600;
	color: #2d3748;
}

.result-items {
	background: white;
}

.result-item-card {
	border-radius: 8px;
	transition: all 0.2s ease;
	cursor: pointer;
}

.result-item-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-item-card.selected {
	border: 2px solid #1976d2;
	background: #e3f2fd;
}

.item-icon {
	font-size: 20px;
	width: 24px;
	text-align: center;
}

.item-title {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-bottom: 4px;
}

.item-url {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-bottom: 8px;
}

.last-visited {
	margin-left: auto;
}

/* 网络搜索建议样式 */
.web-search-suggestion {
	padding: 16px;
}

.web-search-card {
	border-radius: 12px;
	border: 2px dashed #e0e0e0;
}

.search-engine-icon {
	border-radius: 4px;
}

.query-text {
	font-style: italic;
	color: #1976d2;
}

/* 推荐内容样式 */
.recommended-content {
	padding: 16px;
}

.recommended-group {
	background: white;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.group-header {
	background: #f8fafc;
	border-bottom: 1px solid #e2e8f0;
}

.group-icon {
	font-size: 24px;
}

.group-title {
	color: #2d3748;
	font-weight: 600;
}

.group-items {
	padding: 16px;
}

/* 响应式调整 */
@media (max-width: 768px) {
	.v-row {
		flex-direction: column;
		gap: 16px;
	}

	.px-2 {
		padding-left: 0 !important;
		padding-right: 0 !important;
	}

	.d-flex.align-center.ga-2 {
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
	}

	.min-w-15 {
		min-width: auto !important;
	}

	.flex-1 {
		width: 100%;
	}
}
</style>
