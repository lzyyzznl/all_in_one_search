<template>
	<v-dialog
		v-model="isVisible"
		fullscreen
		transition="dialog-bottom-transition"
		:scrim="true"
		:persistent="false"
		@click:outside="closeFloatingSearch"
	>
		<v-card class="flex flex-col h-full">
			<v-toolbar color="primary" density="compact">
				<v-autocomplete
					ref="searchInputEl"
					:model-value="rawSearchQuery"
					@update:model-value="(val: string | number) => rawSearchQuery.value = String(val)"
					:loading="isLoading"
					:items="searchItems"
					:search-input="searchInput"
					@update:search-input="(val: string | number | null) => { searchInput = val ? String(val) : ''; debouncedSearch(); }"
					placeholder="搜索本地文件，或按 Ctrl+Enter 进行网络搜索"
					hide-no-data
					hide-selected
					item-title="title"
					item-value="id"
					:return-object="false"
					class="flex-1 mr-4"
					@keydown.esc="forceCloseAll"
					@keydown.ctrl.enter="performWebSearch"
				>
					<!-- 自定义搜索结果项的展示 -->
					<template v-slot:item="{ item, props }">
						<v-list-item
							v-bind="props"
							:title="item.raw.title"
							:subtitle="item.raw.url"
							@click="handleSelectItem(item.raw)"
						>
							<template v-slot:prepend>
								<v-avatar size="small" class="mr-2">
									<v-img
										:src="getSiteFaviconUrl(item.raw.domain)"
										:alt="item.raw.domain"
									></v-img>
								</v-avatar>
							</template>
							<template v-slot:append>
								<v-btn
									v-if="item.raw.type === 'history'"
									icon="mdi-bookmark-outline"
									size="small"
									variant="text"
									@click.stop="handleBookmarkItem(item.raw)"
								></v-btn>
								<v-btn
									v-if="item.raw.type === 'download'"
									icon="mdi-folder-open"
									size="small"
									variant="text"
									@click.stop="handleShowFileItem(item.raw)"
								></v-btn>
								<v-btn
									icon="mdi-content-copy"
									size="small"
									variant="text"
									@click.stop="handleCopyItem(item.raw.url)"
								></v-btn>
							</template>
						</v-list-item>
					</template>
				</v-autocomplete>

				<v-btn icon="mdi-close" @click="closeFloatingSearch"></v-btn>
			</v-toolbar>

			<!-- 搜索选项 -->
			<v-card-text>
				<v-chip-group v-model="selectedDataSources" multiple>
					<v-chip filter value="bookmarks" label> 书签 </v-chip>
					<v-chip filter value="history" label> 历史记录 </v-chip>
					<v-chip filter value="downloads" label> 下载文件 </v-chip>
				</v-chip-group>
			</v-card-text>

			<!-- 搜索结果 -->
			<v-card-text
				v-if="Object.keys(searchResults).length > 0"
				class="search-results"
			>
				<v-expansion-panels>
					<v-expansion-panel
						v-for="(group, domain) in searchResults"
						:key="domain"
					>
						<v-expansion-panel-title>
							<div class="d-flex align-center">
								<v-avatar size="small" class="mr-2">
									<v-img :src="getSiteFaviconUrl(domain)" :alt="domain"></v-img>
								</v-avatar>
								<span>{{ domain }}</span>
								<span class="ml-2">({{ group.totalCount }})</span>
							</div>
						</v-expansion-panel-title>
						<v-expansion-panel-text>
							<v-list>
								<v-list-item
									v-for="item in group.items.slice(0, 5)"
									:key="item.id"
									:title="item.title"
									:subtitle="item.url"
									@click="handleSelectItem(item)"
								>
									<template v-slot:append>
										<v-btn
											v-if="item.type === 'history'"
											icon="mdi-bookmark-outline"
											size="small"
											variant="text"
											@click.stop="handleBookmarkItem(item)"
										></v-btn>
										<v-btn
											v-if="item.type === 'download'"
											icon="mdi-folder-open"
											size="small"
											variant="text"
											@click.stop="handleShowFileItem(item)"
										></v-btn>
										<v-btn
											icon="mdi-content-copy"
											size="small"
											variant="text"
											@click.stop="handleCopyItem(item.url)"
										></v-btn>
									</template>
								</v-list-item>
							</v-list>
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>
			</v-card-text>

			<!-- 网络搜索建议 -->
			<v-card-text
				v-else-if="rawSearchQuery && !isLoading && defaultSearchEngine"
				class="web-search-suggestion"
			>
				<v-list-item
					:title="
						'在 ' + defaultSearchEngine.name + ' 中搜索 ' + rawSearchQuery
					"
					prepend-icon="$magnify"
					@click="performWebSearch"
				>
					<template v-slot:append>
						<v-chip color="primary" size="small">Ctrl + Enter</v-chip>
					</template>
				</v-list-item>
			</v-card-text>

			<!-- 推荐内容 -->
			<v-card-text v-else-if="showRecommended" class="recommended-content">
				<v-expansion-panels>
					<v-expansion-panel
						v-for="group in recommendedGroups"
						:key="group.type"
						:title="group.title"
						:text="String(group.items.length) + ' 个项目'"
					>
						<template v-slot:title>
							<div class="d-flex align-center">
								<v-icon class="mr-2">
									{{
										group.type === "history"
											? "mdi-clock"
											: group.type === "bookmarks"
											? "mdi-bookmark"
											: "mdi-download"
									}}
								</v-icon>
								<span>{{ group.title }}</span>
							</div>
						</template>
						<v-expansion-panel-text>
							<v-list>
								<v-list-item
									v-for="item in group.items.slice(0, 6)"
									:key="item.id"
									:title="item.title"
									:subtitle="item.url"
									@click="handleSelectItem(item)"
								>
									<template v-slot:append>
										<v-btn
											v-if="item.type === 'history'"
											icon="mdi-bookmark-outline"
											size="small"
											variant="text"
											@click.stop="handleBookmarkItem(item)"
										></v-btn>
										<v-btn
											v-if="item.type === 'download'"
											icon="mdi-folder-open"
											size="small"
											variant="text"
											@click.stop="handleShowFileItem(item)"
										></v-btn>
										<v-btn
											icon="mdi-content-copy"
											size="small"
											variant="text"
											@click.stop="handleCopyItem(item.url)"
										></v-btn>
									</template>
								</v-list-item>
							</v-list>
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>
			</v-card-text>

			<!-- 加载状态 -->
			<v-card-text v-else-if="isLoadingRecommended" class="loading-state">
				<v-progress-circular
					indeterminate
					color="primary"
				></v-progress-circular>
				<div class="text-body-1 mt-2">正在加载推荐内容...</div>
			</v-card-text>

			<!-- 空状态 -->
			<v-card-text
				v-else-if="rawSearchQuery && !isLoading"
				class="empty-state text-center"
			>
				<v-icon size="x-large" color="grey">mdi-magnify-off</v-icon>
				<div class="text-body-1 mt-2">未找到匹配的结果</div>
				<div class="text-caption mt-1">
					可尝试 <v-chip size="x-small" color="primary">Ctrl</v-chip> +
					<v-chip size="x-small" color="primary">Enter</v-chip> 进行网络搜索
				</div>
			</v-card-text>

			<!-- 使用提示 -->
			<v-footer app class="pa-4">
				<v-row justify="center" align="center">
					<v-chip size="small" class="mx-1">↑↓ 选择</v-chip>
					<v-chip size="small" class="mx-1">Enter 打开</v-chip>
					<v-chip size="small" class="mx-1">Esc 关闭</v-chip>
				</v-row>
			</v-footer>
		</v-card>
	</v-dialog>

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
	isLoadingRecommended,
} = useContentSearch();

const isVisible = ref(false);
const searchInputEl = ref<HTMLInputElement | null>(null);
const searchInput = ref<string>("");
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

interface AutocompleteItem {
	title: string;
	id: string;
	raw: SearchResultItem;
}

// 计算搜索结果项
const searchItems = computed<AutocompleteItem[]>(() => {
	const items: AutocompleteItem[] = [];
	Object.values(searchResults.value).forEach((group) => {
		items.push(
			...group.items.slice(0, 5).map((item) => ({
				title: item.title,
				id: item.id,
				raw: item,
			}))
		);
	});
	return items;
});

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

const handleCopyItem = async (url: string) => {
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

<style scoped>
.loading-state,
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 48px 0;
}

.web-search-suggestion {
	cursor: pointer;
}

.web-search-suggestion:hover {
	background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
