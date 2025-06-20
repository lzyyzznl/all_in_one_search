<template>
	<v-overlay
		v-model="isVisible"
		class="backdrop-blur-12 backdrop-saturate-180"
		@click="closeFloatingSearch"
		persistent
	>
		<v-card
			class="mx-auto max-h-80vh overflow-y-auto animate-slide-up"
			max-width="600"
			@click.stop
		>
			<v-card-text class="pa-4">
				<!-- 搜索框 -->
				<div class="search-box mb-4">
					<v-text-field
						ref="searchInput"
						v-model="searchQuery"
						placeholder="搜索本地文件，或按 Ctrl+Enter 进行网络搜索"
						variant="outlined"
						density="comfortable"
						clearable
						@input="debouncedSearch"
						@keydown.escape="forceCloseAll"
						@keydown.arrow-down.prevent="navigateDown"
						@keydown.arrow-up.prevent="navigateUp"
						@keydown.enter.prevent="openSelectedItem"
						@keydown.ctrl.enter.prevent="performWebSearch"
					>
						<template #prepend-inner>
							<v-icon>mdi-magnify</v-icon>
						</template>
						<template #append-inner>
							<v-btn
								icon="mdi-magnify"
								variant="text"
								size="small"
								@click="performSearchClick"
							/>
						</template>
					</v-text-field>
				</div>

				<!-- 搜索选项 -->
				<div class="search-options mb-4">
					<v-chip-group
						v-model="selectedDataSources"
						multiple
						selected-class="text-primary"
					>
						<v-chip value="bookmarks" filter variant="outlined">
							<v-icon start>mdi-bookmark</v-icon>
							书签
						</v-chip>
						<v-chip value="history" filter variant="outlined">
							<v-icon start>mdi-history</v-icon>
							历史记录
						</v-chip>
						<v-chip value="downloads" filter variant="outlined">
							<v-icon start>mdi-download</v-icon>
							下载文件
						</v-chip>
					</v-chip-group>
				</div>

				<!-- 搜索结果 -->
				<div
					class="search-results"
					v-if="Object.keys(searchResults).length > 0"
				>
					<div class="results-container">
						<v-expansion-panels
							v-for="(group, domain) in searchResults"
							:key="domain"
							class="domain-group mb-2"
							variant="accordion"
						>
							<v-expansion-panel>
								<v-expansion-panel-title>
									<div class="d-flex align-center ga-3">
										<img
											:src="getSiteFaviconUrl(String(domain))"
											:alt="String(domain)"
											class="w-4 h-4 rounded-sm"
										/>
										<span class="flex-grow-1">{{ domain }}</span>
										<v-chip size="small" color="primary" variant="outlined">{{
											group.totalCount
										}}</v-chip>
									</div>
								</v-expansion-panel-title>
								<v-expansion-panel-text>
									<v-list class="results-list">
										<SearchResultItemComponent
											v-for="item in group.items.slice(0, 5)"
											:key="item.id"
											:item="item"
											:isSelected="selectedItem === item.id"
											:isFloating="true"
											@select="handleSelectItem"
											@bookmark="handleBookmarkItem"
											@showFile="handleShowFileItem"
											@copy="handleCopyItem"
										/>
									</v-list>
								</v-expansion-panel-text>
							</v-expansion-panel>
						</v-expansion-panels>
					</div>
				</div>

				<!-- 网络搜索建议 -->
				<v-card
					v-if="
						searchQuery &&
						!isLoading &&
						Object.keys(searchResults).length === 0 &&
						defaultSearchEngine
					"
					class="mb-4 cursor-pointer transition-all duration-200 hover:translate-y--1 hover:shadow-lg"
					variant="outlined"
					@click="performWebSearch"
				>
					<v-card-text class="pa-3">
						<div class="suggestion-content d-flex align-center ga-2">
							<img
								:src="getEngineIconUrl(defaultSearchEngine)"
								alt="icon"
								class="search-engine-icon"
								style="width: 16px; height: 16px"
							/>
							<span class="suggestion-text flex-grow-1"
								>在 {{ defaultSearchEngine.name }} 中搜索 "{{
									searchQuery
								}}"</span
							>
							<v-chip size="small" variant="outlined">↵</v-chip>
						</div>
					</v-card-text>
				</v-card>

				<!-- 推荐内容 -->
				<div v-else-if="showRecommended" class="recommended-content">
					<div class="recommended-container">
						<div
							v-for="group in recommendedGroups"
							:key="group.type"
							class="recommended-group mb-4"
						>
							<div class="group-header d-flex align-center ga-2 mb-2">
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
							<v-list class="group-items">
								<SearchResultItemComponent
									v-for="item in group.items.slice(0, 6)"
									:key="item.id"
									:item="item"
									:isSelected="selectedItem === item.id"
									:isFloating="true"
									@select="handleSelectItem"
									@bookmark="handleBookmarkItem"
									@showFile="handleShowFileItem"
									@copy="handleCopyItem"
								/>
							</v-list>
						</div>
					</div>
				</div>

				<!-- 推荐内容加载状态 -->
				<div
					v-else-if="isLoadingRecommended"
					class="loading-state text-center pa-4"
				>
					<v-progress-circular indeterminate color="primary" />
					<div class="mt-2">正在加载推荐内容...</div>
				</div>

				<!-- 空状态 -->
				<div
					v-else-if="searchQuery && !isLoading"
					class="empty-state text-center pa-4"
				>
					<v-icon size="48" color="grey-lighten-1">mdi-magnify-close</v-icon>
					<div class="text-h6 mt-2 mb-2">未找到匹配的结果</div>
					<div class="text-body-2 text-medium-emphasis">
						可尝试
						<v-chip size="small" variant="outlined">Ctrl + Enter</v-chip>
						进行网络搜索
					</div>
				</div>

				<!-- 使用提示 -->
				<div class="usage-hints d-flex justify-center ga-4 mt-4">
					<v-chip size="small" variant="outlined">↑↓ 选择</v-chip>
					<v-chip size="small" variant="outlined">Enter 打开</v-chip>
					<v-chip size="small" variant="outlined">Esc 关闭</v-chip>
				</div>
			</v-card-text>
		</v-card>

		<!-- 书签对话框 -->
		<BookmarkDialog
			:show="showBookmarkDialog"
			:dialog="bookmarkDialogState"
			@close="closeBookmarkDialog"
			@save="saveBookmark"
			@click.stop
		/>
	</v-overlay>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useContentSearch } from "../utils/composables/useContentSearch";
import { useUI } from "../utils/composables/useUI";
import { useNotification } from "../utils/composables/useNotification";
import { APP_CONSTANTS } from "../utils/constants";
import type { SearchResultItem, SearchEngine } from "../utils/types";
import SearchResultItemComponent from "./SearchResultItem.vue";
import BookmarkDialog from "./BookmarkDialog.vue";

const { getSiteFaviconUrl } = useUI();
const { success, error: showError } = useNotification();

const {
	searchQuery,
	searchResults,
	selectedDataSources,
	isLoading,
	performSearch,
	updateSearchOptions,
	openSearchItem,
	showDownloadItem,
	recommendedGroups,
	showRecommended,
	loadRecommendedContent,
	isLoadingRecommended,
} = useContentSearch();

const isVisible = ref(false);
const selectedItem = ref<string | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const searchTimeout = ref<number | null>(null);
const defaultSearchEngine = ref<SearchEngine | null>(null);

// 书签对话框相关状态
const showBookmarkDialog = ref(false);
const bookmarkDialogState = ref({
	show: false,
	title: "",
	url: "",
	parentId: "",
	item: null as SearchResultItem | null,
});

// 注意：不再需要 handleMessage 函数，因为我们只使用 window 自定义事件

// 防抖搜索
const debouncedSearch = () => {
	if (searchTimeout.value) {
		clearTimeout(searchTimeout.value);
	}

	searchTimeout.value = window.setTimeout(() => {
		performSearch(searchQuery.value);
	}, APP_CONSTANTS.SEARCH.DEBOUNCE_DELAY);
};

// 搜索按钮点击
const performSearchClick = () => {
	performSearch(searchQuery.value);
};

// 监听数据源变化
watch(
	selectedDataSources,
	() => {
		updateSearchOptions();
		if (searchQuery.value.trim()) {
			performSearch(searchQuery.value);
		}
	},
	{ deep: true }
);

// 显示/隐藏浮动搜索
const toggleFloatingSearch = () => {
	isVisible.value = !isVisible.value;

	if (isVisible.value) {
		nextTick(() => {
			searchInput.value?.focus();
			// 加载推荐内容
			loadRecommendedContent();
		});
		// 加载默认搜索引擎
		if (!defaultSearchEngine.value) {
			loadDefaultSearchEngine();
		}
	} else {
		searchQuery.value = "";
		searchResults.value = {};
		selectedItem.value = null;
	}
};

// 关闭浮动搜索
const closeFloatingSearch = () => {
	// 如果书签对话框正在显示，则不关闭浮动搜索框
	if (showBookmarkDialog.value) {
		return;
	}

	isVisible.value = false;
	searchQuery.value = "";
	searchResults.value = {};
	selectedItem.value = null;
};

// 键盘导航
const navigateDown = () => {
	const items = getAllItems();
	if (items.length === 0) return;

	const currentIndex = selectedItem.value
		? items.findIndex((item) => item.id === selectedItem.value)
		: -1;
	const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
	selectedItem.value = items[nextIndex]?.id || null;
	scrollToSelectedItem();
};

const navigateUp = () => {
	const items = getAllItems();
	if (items.length === 0) return;

	const currentIndex = selectedItem.value
		? items.findIndex((item) => item.id === selectedItem.value)
		: -1;
	const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
	selectedItem.value = items[prevIndex]?.id || null;
	scrollToSelectedItem();
};

const openSelectedItem = () => {
	if (!selectedItem.value) {
		// 如果没有选中项，则响应Enter键执行常规搜索
		performSearch(searchQuery.value);
		return;
	}

	const items = getAllItems();
	const item = items.find((item) => item.id === selectedItem.value);
	if (item) {
		handleSelectItem(item);
	}
};

const getAllItems = (): SearchResultItem[] => {
	const items: SearchResultItem[] = [];

	// 如果有搜索结果，返回搜索结果
	if (Object.keys(searchResults.value).length > 0) {
		Object.values(searchResults.value).forEach((group) => {
			items.push(...group.items.slice(0, 5));
		});
	}
	// 如果显示推荐内容，返回推荐内容
	else if (showRecommended.value) {
		recommendedGroups.value.forEach((group) => {
			items.push(...group.items.slice(0, 6));
		});
	}

	return items;
};

const scrollToSelectedItem = () => {
	if (!selectedItem.value) return;

	const element = document.querySelector(`[data-id="${selectedItem.value}"]`);
	if (element) {
		element.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}
};

// 处理项目操作
const handleSelectItem = async (item: SearchResultItem) => {
	try {
		await openSearchItem(item, true);
		closeFloatingSearch();
	} catch (error) {
		console.error("打开项目失败:", error);
	}
};

const handleBookmarkItem = async (item: SearchResultItem) => {
	if (item.type !== "history") return;

	try {
		bookmarkDialogState.value = {
			show: false,
			title: item.title,
			url: item.url,
			parentId: "",
			item: item,
		};
		showBookmarkDialog.value = true;
	} catch (error) {
		console.error("显示书签对话框失败:", error);
	}
};

const handleShowFileItem = async (item: SearchResultItem) => {
	if (item.type !== "download") return;

	try {
		await showDownloadItem(item);
	} catch (error) {
		console.error("显示文件失败:", error);
	}
};

const handleCopyItem = async (url: string) => {
	try {
		await navigator.clipboard.writeText(url);
		success("已复制到剪贴板");
	} catch (err) {
		console.error("复制失败:", err);
		showError("复制失败");
	}
};

const closeBookmarkDialog = () => {
	showBookmarkDialog.value = false;
};

// 强制关闭所有界面（ESC键使用）
const forceCloseAll = () => {
	showBookmarkDialog.value = false;
	isVisible.value = false;
	searchQuery.value = "";
	searchResults.value = {};
	selectedItem.value = null;
};

const saveBookmark = async (data: {
	title: string;
	url: string;
	parentId: string;
}) => {
	try {
		// 使用bookmarksApiWrapper来创建书签
		const { createBookmark } = await import("../utils/bookmarksApiWrapper");

		// 准备符合Chrome API的参数
		const bookmarkData: chrome.bookmarks.CreateDetails = {
			title: data.title,
			url: data.url,
		};

		// 只有当parentId不为空时才添加
		if (data.parentId) {
			bookmarkData.parentId = data.parentId;
		}

		await createBookmark(bookmarkData);

		success("书签已保存");
		showBookmarkDialog.value = false;
	} catch (error) {
		console.error("保存书签失败:", error);
		showError("保存书签失败");
	}
};

// 执行网络搜索
const performWebSearch = async () => {
	if (!searchQuery.value.trim() || !defaultSearchEngine.value) {
		return;
	}
	try {
		await chrome.runtime.sendMessage({
			action: "perform-web-search",
			engineId: defaultSearchEngine.value.id,
			query: searchQuery.value.trim(),
			inNewTab: true,
		});
		forceCloseAll(); // 搜索后关闭
	} catch (e) {
		console.error("执行网络搜索失败:", e);
		showError("网络搜索失败");
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

// 获取搜索引擎图标URL
const getEngineIconUrl = (engine: SearchEngine | null) => {
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

// 处理 window 自定义事件
const handleWindowEvent = (event: Event) => {
	if (event.type === "toggle-floating-search") {
		toggleFloatingSearch();
		if (isVisible.value && !defaultSearchEngine.value) {
			loadDefaultSearchEngine();
		}
	}
};

// 组件挂载和卸载
onMounted(() => {
	// 只监听 window 自定义事件，不监听 chrome.runtime.onMessage
	// 因为 content script 会派发 window 自定义事件
	window.addEventListener("toggle-floating-search", handleWindowEvent);

	// 监听storage变化，变更时刷新默认搜索引擎
	chrome.storage.onChanged.addListener(handleStorageChange);
});

onUnmounted(() => {
	if (searchTimeout.value) {
		clearTimeout(searchTimeout.value);
	}

	// 移除 window 自定义事件监听器
	window.removeEventListener("toggle-floating-search", handleWindowEvent);

	// 移除storage监听
	chrome.storage.onChanged.removeListener(handleStorageChange);
});

// 新增：storage变更回调，变更时刷新默认搜索引擎
const handleStorageChange = (
	changes: Record<string, chrome.storage.StorageChange>
) => {
	if (changes.searchSettings) {
		loadDefaultSearchEngine();
	}
};

// @ts-ignore
// 兼容Vite环境下的import.meta.env类型声明
declare global {
	interface ImportMeta {
		env: {
			BASE_URL: string;
			[key: string]: any;
		};
	}
}
</script>

<style scoped>
/* 动画定义 */
@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(20px) scale(0.95);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

.animate-slide-up {
	animation: slideUp 0.3s ease-out;
}

/* 推荐内容样式 */
.recommended-content {
	max-height: 60vh;
	overflow-y: auto;
}
</style>
