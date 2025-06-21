<template>
	<v-overlay
		v-model="isVisible"
		class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999999]"
		@click="closeFloatingSearch"
	>
		<div
			class="w-[600px] max-w-[90vw] min-h-[400px] max-h-[80vh] bg-white rounded-3xl p-6 shadow-xl border border-gray-200 flex flex-col"
			@click.stop
		>
			<!-- 简洁搜索框 -->
			<div class="shrink-0 mb-4">
				<v-text-field
					ref="searchInputEl"
					v-model="searchInput"
					placeholder="🔍 搜索本地文件，或按 Ctrl+Enter 进行网络搜索"
					variant="solo"
					density="comfortable"
					clearable
					rounded="xl"
					:loading="isLoading"
					@input="debouncedSearch"
					@keydown.esc="forceCloseAll"
					@keydown.ctrl.enter="performWebSearch"
					@keydown.enter="handleEnterKey"
					@keydown.up="handleArrowKey('up')"
					@keydown.down="handleArrowKey('down')"
				>
					<template #prepend-inner>
						<v-icon color="primary" size="20">mdi-magnify</v-icon>
					</template>
					<template #append-inner>
						<v-btn
							icon
							size="small"
							variant="text"
							@click="toggleAdvancedSearch"
							class="opacity-70 hover:opacity-100 transition-opacity"
						>
							<v-icon size="18">{{
								showAdvanced ? "mdi-chevron-up" : "mdi-tune"
							}}</v-icon>
						</v-btn>
					</template>
				</v-text-field>

				<!-- 高级搜索选项 - 可折叠 -->
				<v-expand-transition>
					<div
						v-if="showAdvanced"
						class="bg-gray-50 rounded-xl p-3 border border-gray-200 mt-3"
					>
						<div class="flex gap-2 flex-wrap">
							<v-chip-group v-model="selectedDataSources" multiple>
								<v-chip
									filter
									value="bookmarks"
									color="success"
									variant="tonal"
									size="small"
								>
									📚 书签
								</v-chip>
								<v-chip
									filter
									value="history"
									color="warning"
									variant="tonal"
									size="small"
								>
									🕐 历史
								</v-chip>
								<v-chip
									filter
									value="downloads"
									color="info"
									variant="tonal"
									size="small"
								>
									📥 下载
								</v-chip>
							</v-chip-group>
						</div>
					</div>
				</v-expand-transition>
			</div>

			<!-- 搜索结果/推荐内容 - 紧贴搜索框 -->
			<div
				v-if="isLoading"
				class="flex-1 flex items-center justify-center text-slate-500"
			>
				<v-progress-circular
					indeterminate
					color="primary"
					size="32"
					width="3"
				/>
				<span class="ml-3 text-sm">搜索中...</span>
			</div>

			<!-- 搜索结果 -->
			<div v-else-if="hasResults" class="flex-1 overflow-y-auto mt-2">
				<template
					v-for="[domain, group] in Object.entries(searchResults)"
					:key="domain"
				>
					<div
						class="bg-white rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all mb-4"
					>
						<div
							class="flex items-center mb-2 text-sm font-semibold text-gray-600"
						>
							<v-avatar size="16" class="mr-2">
								<v-img
									:src="getSiteFaviconUrl(String(domain))"
									:alt="String(domain)"
								/>
							</v-avatar>
							<span class="flex-1 ml-2">{{ domain }}</span>
							<v-chip
								size="x-small"
								color="primary"
								variant="text"
								class="ml-2"
							>
								{{ group.totalCount }}
							</v-chip>
						</div>

						<v-list class="bg-transparent" density="compact">
							<v-list-item
								v-for="item in group.items.slice(0, 5)"
								:key="item.id"
								class="rounded-lg my-1 transition-all hover:bg-blue-50"
								:class="{
									'bg-blue-100 border-l-3 border-blue-500':
										selectedItem === item.id,
								}"
								@click="selectAndOpenItem(item)"
							>
								<template #prepend>
									<span class="text-base mr-2 w-5 text-center">{{
										getItemIcon(item.type)
									}}</span>
								</template>

								<v-list-item-title class="text-sm font-medium text-gray-800">
									{{ item.title }}
								</v-list-item-title>

								<v-list-item-subtitle class="text-xs text-gray-500">
									{{ item.url }}
								</v-list-item-subtitle>

								<template #append>
									<div class="flex gap-1.5 items-center">
										<v-btn
											v-if="item.type === 'history'"
											size="small"
											color="orange"
											variant="tonal"
											icon="mdi-star"
											@click.stop="handleShowBookmarkDialog(item)"
											class="w-8 h-8"
										/>
										<v-btn
											v-if="item.type === 'download'"
											size="small"
											color="green"
											variant="tonal"
											icon="mdi-folder"
											@click.stop="showDownloadFile(item)"
											class="w-8 h-8"
										/>
										<v-btn
											size="small"
											color="blue"
											variant="tonal"
											icon="mdi-content-copy"
											@click.stop="handleCopyUrl(item.url)"
											class="w-8 h-8"
										/>
									</div>
								</template>
							</v-list-item>
						</v-list>
					</div>
				</template>
			</div>

			<!-- 推荐内容 -->
			<div v-else-if="showRecommended" class="flex-1 overflow-y-auto mt-2">
				<div
					v-for="group in recommendedGroups"
					:key="group.type"
					class="bg-gray-50 rounded-xl p-3 border border-gray-200 mb-3"
				>
					<div
						class="flex items-center mb-2 text-sm font-semibold text-gray-600"
					>
						<v-icon size="16" class="mr-2">
							{{
								group.type === "history"
									? "mdi-history"
									: group.type === "bookmarks"
									? "mdi-bookmark"
									: "mdi-download"
							}}
						</v-icon>
						<span class="ml-2">{{ group.title }}</span>
					</div>

					<v-list class="bg-transparent" density="compact">
						<v-list-item
							v-for="item in group.items.slice(0, 3)"
							:key="item.id"
							class="rounded-md my-1 transition-colors hover:bg-blue-50"
							@click="selectAndOpenItem(item)"
						>
							<template #prepend>
								<span class="text-base mr-2 w-5 text-center">{{
									getItemIcon(item.type)
								}}</span>
							</template>

							<v-list-item-title class="text-sm font-medium text-gray-800">
								{{ item.title }}
							</v-list-item-title>

							<v-list-item-subtitle class="text-xs text-gray-500">
								{{ item.url }}
							</v-list-item-subtitle>
						</v-list-item>
					</v-list>
				</div>
			</div>

			<!-- 空状态 -->
			<div
				v-else-if="searchInput && !isLoading"
				class="flex-1 flex flex-col items-center justify-center text-center text-gray-500"
			>
				<v-icon size="48" color="grey-lighten-2">mdi-magnify-close</v-icon>
				<p class="text-sm text-medium-emphasis mt-2">未找到匹配的结果</p>
			</div>
		</div>
	</v-overlay>

	<!-- 书签对话框 -->
	<BookmarkDialog
		:show="showBookmarkDialog"
		:dialog="bookmarkDialogState"
		@close="closeBookmarkDialog"
		@save="saveBookmark"
	/>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useContentSearch } from "../utils/composables/useContentSearch";
import { useUI } from "../utils/composables/useUI";
import { useNotification } from "../utils/composables/useNotification";
import { APP_CONSTANTS } from "../utils/constants";
import type { SearchResultItem, SearchEngine } from "../utils/types";
import BookmarkDialog from "./BookmarkDialog.vue";
// 移除未使用的 SearchResultItemComponent 导入

const { getSiteFaviconUrl } = useUI();
const { success, error: showError } = useNotification();

const {
	searchQuery: rawSearchQuery,
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
} = useContentSearch();

const isVisible = ref(false);
const searchInputEl = ref<HTMLInputElement | null>(null);
const searchInput = ref<string>("");
const searchTimeout = ref<number | null>(null);
const defaultSearchEngine = ref<SearchEngine | null>(null);
const selectedItem = ref<string>("");
const showAdvanced = ref<boolean>(false);

// 计算是否有搜索结果
const hasResults = computed(() => {
	return Object.keys(searchResults.value).length > 0;
});

// 切换高级搜索选项
const toggleAdvancedSearch = () => {
	showAdvanced.value = !showAdvanced.value;
};

// 选择并打开项目
const selectAndOpenItem = (item: SearchResultItem) => {
	selectedItem.value = item.id;
	handleSelectItem(item);
};

// 显示书签对话框的处理函数
const handleShowBookmarkDialog = (item: SearchResultItem) => {
	handleBookmarkItem(item);
};

// 显示下载文件
const showDownloadFile = (item: SearchResultItem) => {
	handleShowFileItem(item);
};

// updateSearchOptions 已从 useContentSearch 导入

// 书签对话框相关状态
const showBookmarkDialog = ref(false);
const bookmarkDialogState = ref({
	show: false,
	title: "",
	url: "",
	parentId: "",
	item: null as SearchResultItem | null,
});

// 移除未使用的接口和计算属性

// 搜索查询计算属性
const searchQuery = computed({
	get: () => rawSearchQuery.value,
	set: (value: string | number) => {
		rawSearchQuery.value = String(value);
	},
});

// 监听全局消息
const handleMessage = (message: any) => {
	if (message.action === "toggle-floating-search") {
		toggleFloatingSearch();
		if (isVisible.value && !defaultSearchEngine.value) {
			loadDefaultSearchEngine();
		}
	}
};

// 防抖搜索
const debouncedSearch = () => {
	if (searchTimeout.value) {
		clearTimeout(searchTimeout.value);
	}

	searchTimeout.value = window.setTimeout(() => {
		if (searchInput.value) {
			searchQuery.value = searchInput.value;
			performSearch(String(searchInput.value));
		}
	}, APP_CONSTANTS.SEARCH.DEBOUNCE_DELAY);
};

// 获取项目图标
const getItemIcon = (type: string) => {
	switch (type) {
		case "bookmark":
			return "📚";
		case "history":
			return "🕐";
		case "download":
			return "📥";
		default:
			return "📄";
	}
};

// 处理回车键
const handleEnterKey = () => {
	if (searchInput.value.trim()) {
		performSearch(searchInput.value);
	}
};

// 处理方向键
const handleArrowKey = (direction: "up" | "down") => {
	// 简单的键盘导航实现
	console.log("Arrow key pressed:", direction);
};

// 监听数据源变化
watch(
	selectedDataSources,
	() => {
		updateSearchOptions();
		const query = String(rawSearchQuery.value).trim();
		if (query) {
			performSearch(query);
		}
	},
	{ deep: true }
);

// 显示/隐藏浮动搜索
const toggleFloatingSearch = () => {
	isVisible.value = !isVisible.value;
	if (isVisible.value) {
		nextTick(() => {
			searchInputEl.value?.focus();
			// 加载推荐内容
			loadRecommendedContent();
		});
		// 加载默认搜索引擎
		if (!defaultSearchEngine.value) {
			loadDefaultSearchEngine();
		}
	} else {
		rawSearchQuery.value = "";
		searchResults.value = {};
	}
};

// 关闭浮动搜索
const closeFloatingSearch = () => {
	if (showBookmarkDialog.value) {
		return;
	}
	isVisible.value = false;
	rawSearchQuery.value = "";
	searchResults.value = {};
};

// 强制关闭所有界面
const forceCloseAll = () => {
	showBookmarkDialog.value = false;
	isVisible.value = false;
	rawSearchQuery.value = "";
	searchResults.value = {};
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

const handleCopyUrl = async (url: string) => {
	try {
		await navigator.clipboard.writeText(url);
		success("已复制到剪贴板");
	} catch (err) {
		console.error("复制失败:", err);
		showError("复制失败");
	}
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
	const query = String(rawSearchQuery.value).trim();
	if (!query || !defaultSearchEngine.value) {
		return;
	}
	try {
		await chrome.runtime.sendMessage({
			action: "perform-web-search",
			engineId: defaultSearchEngine.value.id,
			query,
			inNewTab: true,
		});
		forceCloseAll();
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

// 组件挂载和卸载
onMounted(() => {
	console.log("VuetifyFloatingSearch 组件已挂载");
	// 监听全局事件
	chrome.runtime.onMessage.addListener(handleMessage);
	console.log("全局事件监听器已注册");
	// 监听storage变化
	chrome.storage.onChanged.addListener(handleStorageChange);
});

onUnmounted(() => {
	if (searchTimeout.value) {
		clearTimeout(searchTimeout.value);
	}
	console.log("VuetifyFloatingSearch 组件已卸载");
	// 移除全局事件监听器
	chrome.runtime.onMessage.removeListener(handleMessage);
	// 移除storage监听
	chrome.storage.onChanged.removeListener(handleStorageChange);
});

// storage变更回调
const handleStorageChange = (
	changes: Record<string, chrome.storage.StorageChange>
) => {
	if (changes.searchSettings) {
		loadDefaultSearchEngine();
	}
};

const closeBookmarkDialog = () => {
	showBookmarkDialog.value = false;
};
</script>
