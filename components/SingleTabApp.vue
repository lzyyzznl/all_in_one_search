<template>
	<v-app
		class="w-screen h-screen min-h-screen min-w-screen bg-gray-50 overflow-hidden flex flex-col"
	>
		<!-- 固定头部区域 -->
		<div class="flex-shrink-0 w-full bg-white border-b border-gray-200 m-0 p-0">
			<!-- 搜索头部 -->
			<v-card class="rounded-0 shadow-none pa-4">
				<!-- 搜索输入框 -->
				<div class="search-input-container d-flex ga-2 align-center">
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
						class="flex-grow-1"
					>
						<template #prepend-inner>
							<v-icon>mdi-magnify</v-icon>
						</template>
					</v-text-field>
					<v-btn
						size="large"
						icon="mdi-cog"
						@click="openSettings"
						title="打开设置"
					/>
				</div>

				<!-- 搜索历史气泡 -->
				<div
					v-if="searchHistory.length > 0"
					class="search-history d-flex flex-wrap ga-2 mt-3"
				>
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
				</div>

				<!-- 搜索选项 - 水平对齐 -->
				<div class="search-options mt-3">
					<v-row class="controls-row align-center" justify="space-between">
						<!-- 数据源多选 -->
						<v-col cols="4" class="filter-control">
							<div class="control-item d-flex align-center ga-2">
								<span class="control-label text-body-2">搜索项:</span>
								<v-select
									v-model="selectedDataSources"
									multiple
									chips
									variant="outlined"
									density="compact"
									class="control-select"
									@update:model-value="updateSearchOptions"
								>
									<v-list-item value="bookmarks" title="书签" />
									<v-list-item value="history" title="历史记录" />
									<v-list-item value="downloads" title="下载文件" />
								</v-select>
							</div>
						</v-col>
						<!-- 时间筛选 -->
						<v-col cols="4" class="filter-control">
							<div class="control-item d-flex align-center ga-2">
								<span class="control-label text-body-2">时间:</span>
								<v-select
									v-model="searchOptions.timeFilter"
									variant="outlined"
									density="compact"
									class="control-select"
								>
									<v-list-item value="all" title="全部时间" />
									<v-list-item value="today" title="今天" />
									<v-list-item value="week" title="本周" />
									<v-list-item value="month" title="本月" />
								</v-select>
							</div>
						</v-col>

						<!-- 排序选择 -->
						<v-col cols="4" class="filter-control">
							<div class="control-item d-flex align-center ga-2">
								<span class="control-label text-body-2">排序:</span>
								<v-select
									v-model="searchOptions.sortBy"
									variant="outlined"
									density="compact"
									class="control-select"
								>
									<v-list-item value="relevance" title="相关性" />
									<v-list-item value="recent" title="最近访问" />
									<v-list-item value="frequency" title="访问频率" />
								</v-select>
							</div>
						</v-col>
					</v-row>
				</div>
			</v-card>

			<!-- 搜索统计 -->
			<div
				v-if="searchStats"
				class="bg-gray-50 border-b border-gray-200 d-flex flex-wrap ga-2 pa-2"
			>
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
			</div>
		</div>

		<!-- 可滚动内容区域 -->
		<div class="flex-1 overflow-y-auto overflow-x-hidden w-full m-0 p-0">
			<!-- 加载状态 -->
			<div
				v-if="isLoading"
				class="loading-container d-flex justify-center align-center pa-8"
			>
				<div class="text-center">
					<v-progress-circular indeterminate color="primary" size="60" />
					<div class="mt-4 text-body-1">搜索中...</div>
				</div>
			</div>

			<!-- 搜索结果 -->
			<div v-else-if="hasResults" class="results-container">
				<v-card
					v-for="(group, domain) in searchResults"
					:key="domain"
					class="domain-group-card ma-2"
					elevation="2"
				>
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
			</div>

			<!-- 网络搜索建议 -->
			<div
				v-if="searchQuery && !isLoading && defaultSearchEngine"
				class="web-search-suggestion"
			>
				<v-card class="web-search-card ma-2" elevation="2">
					<v-card-text class="pa-4">
						<div class="web-search-header d-flex align-center ga-2 mb-3">
							<img
								:src="getEngineIconUrl(defaultSearchEngine)"
								alt="icon"
								class="search-engine-icon"
								style="width: 18px; height: 18px"
							/>
							<span class="suggestion-text"
								>在{{ defaultSearchEngine.name }}中搜索</span
							>
						</div>
						<div
							class="web-search-query d-flex align-center justify-space-between"
						>
							<span class="query-text text-body-1">"{{ searchQuery }}"</span>
							<v-btn
								color="primary"
								size="small"
								prepend-icon="mdi-open-in-new"
								@click="performWebSearch"
							>
								搜索
							</v-btn>
						</div>
					</v-card-text>
				</v-card>
			</div>

			<!-- 空状态 -->
			<div v-else-if="searchQuery && !isLoading" class="empty-state">
				<div class="text-center pa-8">
					<v-icon size="80" color="grey-lighten-1">mdi-magnify-close</v-icon>
					<div class="text-h6 mt-4 mb-2">未找到匹配的结果</div>
					<div class="text-body-2 text-medium-emphasis">
						可尝试
						<v-chip size="small" color="primary" variant="outlined"
							>Ctrl+Enter</v-chip
						>
						进行网络搜索
					</div>
				</div>
			</div>

			<!-- 初始状态 - 显示推荐内容 -->
			<div v-else-if="showRecommended" class="recommended-content">
				<div class="recommended-container">
					<div
						v-for="group in recommendedGroups"
						:key="group.type"
						class="recommended-group mb-4"
					>
						<div class="group-header d-flex align-center ga-2 pa-3">
							<span class="group-icon text-h6">
								{{
									group.type === "history"
										? "🕐"
										: group.type === "bookmarks"
										? "📚"
										: "📥"
								}}
							</span>
							<span class="group-title text-h6 flex-grow-1">{{
								group.title
							}}</span>
							<v-chip size="small" variant="outlined">{{
								group.items.length
							}}</v-chip>
						</div>
						<div class="group-items">
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
						</div>
					</div>
				</div>
			</div>

			<!-- 推荐内容加载状态 -->
			<div
				v-else-if="isLoadingRecommended"
				class="loading-state text-center pa-8"
			>
				<v-progress-circular indeterminate color="primary" size="40" />
				<div class="mt-4 text-body-1">正在加载推荐内容...</div>
			</div>

			<!-- 初始状态 - 功能说明（作为后备） -->
			<div v-else class="initial-state">
				<v-card class="welcome-card ma-2" elevation="2">
					<v-card-text class="text-center pa-8">
						<div class="welcome-tips">
							<div class="tip-item d-flex align-center ga-3 mb-3">
								<v-icon color="primary">mdi-auto-fix</v-icon>
								<span>支持模糊搜索</span>
							</div>
							<div class="tip-item d-flex align-center ga-3 mb-3">
								<v-icon color="primary">mdi-folder-multiple</v-icon>
								<span>结果按域名分组显示</span>
							</div>
							<div class="tip-item d-flex align-center ga-3 mb-3">
								<v-icon color="primary">mdi-cursor-default-click</v-icon>
								<span>单击直接打开链接</span>
							</div>
							<div class="tip-item d-flex align-center ga-3 mb-3">
								<v-icon color="primary">mdi-star</v-icon>
								<span>历史记录可添加到书签</span>
							</div>
							<div class="tip-item d-flex align-center ga-3 mb-3">
								<v-icon color="primary">mdi-download</v-icon>
								<span>支持搜索下载文件</span>
							</div>
							<div
								v-if="mainShortcut"
								class="tip-item d-flex align-center ga-3 mb-3"
							>
								<v-icon color="primary">mdi-tools</v-icon>
								<span>快捷键: {{ mainShortcut }}</span>
							</div>
						</div>
					</v-card-text>
				</v-card>
			</div>
		</div>

		<!-- 快捷键提示 -->
		<div
			class="shortcuts d-flex justify-center ga-2 pa-2"
			style="flex-shrink: 0"
		>
			<v-chip size="small" variant="outlined"
				>{{ navigationKeys.open }} 打开</v-chip
			>
			<v-chip size="small" variant="outlined"
				>{{ navigationKeys.up }}{{ navigationKeys.down }} 选择</v-chip
			>
			<v-chip size="small" variant="outlined">Esc 关闭</v-chip>
		</div>

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
import { getDefaultSearchEngine } from "../utils/searchEngines";
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
	maxResults: 50,
	sortBy: "relevance",
	timeFilter: "all",
});

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
const handleSearch = async () => {
	if (!searchQuery.value.trim()) {
		searchResults.value = {};
		searchStats.value = null;
		return;
	}

	isLoading.value = true;

	try {
		const options = {
			...searchOptions,
			query: searchQuery.value.trim(),
		};

		const { results, stats } = await searchBookmarksAndHistory(options);
		searchResults.value = results;
		searchStats.value = stats;

		// 保存搜索历史
		await SearchHistoryManager.saveSearchHistory(searchQuery.value.trim());
		await loadSearchHistory();
	} catch (error) {
		console.error("搜索失败:", error);
	} finally {
		isLoading.value = false;
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
			document.execCommand("copy");
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

// 打开设置页面
const openSettings = () => {
	chrome.runtime.openOptionsPage();
};

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
