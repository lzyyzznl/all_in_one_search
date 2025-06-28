<template>
	<div class="element-popup-container" :class="{ 'newtab-mode': isNewTabMode }">
		<!-- 固定头部区域 -->
		<div class="fixed-header">
			<!-- 搜索头部 -->
			<el-card class="search-header-card" :body-style="{ padding: '16px' }">
				<!-- 搜索输入框 -->
				<div
					class="search-input-container"
					style="display: flex; gap: 8px; align-items: center"
				>
					<el-input
						v-model="searchQuery"
						placeholder="搜索本地文件，或按 Ctrl+Enter 进行网络搜索"
						size="large"
						clearable
						@input="handleSearchInput"
						@keydown.enter.prevent="handleEnterKey"
						@keydown.ctrl.enter.prevent="performWebSearch"
						ref="searchInput"
						style="flex: 1"
					>
						<template #prefix>
							<el-icon><Search /></el-icon>
						</template>
					</el-input>
					<el-button
						size="large"
						:icon="Setting"
						circle
						@click="openSettings"
						title="打开设置"
					/>
				</div>

				<!-- 搜索历史气泡 -->
				<div v-if="searchHistory.length > 0" class="search-history">
					<el-tag
						v-for="item in searchHistory"
						:key="item.timestamp"
						type="info"
						effect="plain"
						size="small"
						class="history-tag"
						@click="selectHistoryItem(item.query)"
					>
						{{ item.query }}
					</el-tag>
				</div>

				<!-- 搜索选项 - 水平对齐 -->
				<div class="search-options">
					<el-row
						:gutter="4"
						align="middle"
						class="controls-row"
						justify="space-between"
					>
						<!-- 数据源多选 -->
						<el-col :span="10" class="filter-control">
							<div class="control-item">
								<span class="control-label">搜索项:</span>
								<el-select
									v-model="selectedDataSources"
									multiple
									collapse-tags
									collapse-tags-tooltip
									size="small"
									class="control-select"
									@change="updateSearchOptions"
								>
									<el-option label="书签" value="bookmarks" />
									<el-option label="历史记录" value="history" />
									<el-option label="下载文件" value="downloads" />
								</el-select>
							</div>
						</el-col>
						<!-- 时间筛选 -->
						<el-col :span="10" class="filter-control">
							<div class="control-item">
								<span class="control-label">时间:</span>
								<el-select
									v-model="searchOptions.timeFilter"
									size="small"
									class="control-select"
								>
									<el-option label="全部时间" value="all" />
									<el-option label="今天" value="today" />
									<el-option label="本周" value="week" />
									<el-option label="本月" value="month" />
								</el-select>
							</div>
						</el-col>

						<!-- 排序选择 -->
						<el-col :span="10" class="filter-control">
							<div class="control-item">
								<span class="control-label">排序:</span>
								<el-select
									v-model="searchOptions.sortBy"
									size="small"
									class="control-select"
								>
									<el-option label="相关性" value="relevance" />
									<el-option label="最近访问" value="recent" />
									<el-option label="访问频率" value="frequency" />
								</el-select>
							</div>
						</el-col>
					</el-row>
				</div>
			</el-card>

			<!-- 搜索统计 -->
			<div v-if="searchStats" class="search-stats">
				<el-space :size="8" wrap>
					<el-tag size="small" type="info" effect="plain">
						找到 {{ searchStats.totalResults }} 个结果
					</el-tag>
					<el-tag
						v-if="searchStats.bookmarkCount > 0"
						size="small"
						type="success"
						effect="plain"
					>
						书签 {{ searchStats.bookmarkCount }}
					</el-tag>
					<el-tag
						v-if="searchStats.historyCount > 0"
						size="small"
						type="warning"
						effect="plain"
					>
						历史 {{ searchStats.historyCount }}
					</el-tag>
					<el-tag
						v-if="searchStats.downloadCount > 0"
						size="small"
						type="info"
						effect="plain"
					>
						下载 {{ searchStats.downloadCount }}
					</el-tag>
					<el-tag size="small" effect="plain">
						{{ searchStats.uniqueDomains }} 个域名
					</el-tag>
					<el-tag size="small" effect="plain">
						{{ searchStats.searchTime }}ms
					</el-tag>
				</el-space>
			</div>
		</div>

		<!-- 可滚动内容区域 -->
		<div class="scrollable-content">
			<!-- 加载状态 -->
			<div v-if="isLoading" v-loading="true" class="loading-container">
				<el-empty description="搜索中..." :image-size="60" />
			</div>

			<!-- 搜索结果或推荐内容 -->
			<div v-else-if="hasCurrentResults" class="results-container">
				<el-card
					v-for="(group, domain) in currentResults"
					:key="domain"
					class="domain-group-card"
					:body-style="{ padding: '12px' }"
					shadow="hover"
				>
					<template #header>
						<div class="domain-header">
							<img
								:src="getFaviconUrl(String(domain))"
								:alt="String(domain)"
								class="domain-favicon"
							/>
							<span class="domain-name">{{ domain }}</span>
							<el-tag size="small" type="primary" effect="plain">{{
								group.totalCount
							}}</el-tag>
						</div>
					</template>

					<div class="result-items">
						<el-card
							v-for="item in group.items"
							:key="item.id"
							class="result-item-card"
							:class="{ selected: selectedItem === item.id }"
							:data-id="item.id"
							:body-style="{ padding: '12px' }"
							shadow="hover"
							@click="selectAndOpenItem(item)"
						>
							<div class="result-item-content">
								<div class="item-icon">
									{{ getItemIcon(item.type) }}
								</div>
								<div class="item-content">
									<div class="item-title" :title="item.title">
										{{ item.title }}
									</div>
									<div class="item-url" :title="item.url">{{ item.url }}</div>
									<div class="item-meta">
										<el-tag
											v-if="item.folderName"
											size="small"
											type="warning"
											effect="plain"
										>
											📁 {{ item.folderName }}
										</el-tag>
										<el-tag
											v-if="item.visitCount && item.type !== 'download'"
											size="small"
											type="info"
											effect="plain"
										>
											{{ item.visitCount }} 次访问
										</el-tag>
										<el-tag
											v-if="item.fileSize && item.type === 'download'"
											size="small"
											type="success"
											effect="plain"
										>
											{{ formatFileSize(item.fileSize) }}
										</el-tag>
										<span v-if="item.lastVisited" class="last-visited">
											{{ formatDate(item.lastVisited) }}
										</span>
										<el-tag
											v-if="item.type === 'download' && !item.exists"
											size="small"
											type="danger"
											effect="dark"
										>
											⚠️ 文件不存在
										</el-tag>
									</div>
								</div>
								<div class="item-actions">
									<el-button
										v-if="item.type === 'history'"
										size="small"
										:type="isItemBookmarked(item) ? 'warning' : 'primary'"
										:icon="Star"
										@click.stop="handleBookmarkAction(item)"
									>
										{{ isItemBookmarked(item) ? "取消收藏" : "收藏" }}
									</el-button>
									<el-button
										v-if="item.type === 'download'"
										size="small"
										type="success"
										:icon="FolderOpened"
										@click.stop="showDownloadFile(item)"
									>
										显示文件目录
									</el-button>
								</div>
							</div>
						</el-card>
					</div>
				</el-card>
			</div>

			<!-- 网络搜索建议 -->
			<div
				v-if="searchQuery && !isLoading && defaultSearchEngine"
				class="web-search-suggestion"
			>
				<el-card
					class="web-search-card"
					:body-style="{ padding: '16px' }"
					shadow="hover"
				>
					<div class="web-search-header">
						<img
							:src="getEngineIconUrl(defaultSearchEngine)"
							alt="icon"
							class="search-engine-icon"
							style="width: 18px; height: 18px; vertical-align: middle"
						/>
						<span class="suggestion-text"
							>在{{ defaultSearchEngine.name }}中搜索</span
						>
					</div>
					<div class="web-search-query">
						<span class="query-text">"{{ searchQuery }}"</span>
						<el-button
							type="primary"
							size="small"
							:icon="TopRight"
							@click="performWebSearch"
						>
							搜索
						</el-button>
					</div>
				</el-card>
			</div>

			<!-- 空状态 -->
			<div v-else-if="searchQuery && !isLoading" class="empty-state">
				<el-empty description="未找到匹配的结果" :image-size="80">
					<template #description>
						<p>未找到匹配的结果</p>
						<p>
							可尝试
							<el-tag size="small" type="primary" effect="light"
								>Ctrl+Enter</el-tag
							>
							进行网络搜索
						</p>
					</template>
				</el-empty>
			</div>

			<!-- 推荐内容加载状态 -->
			<div v-else-if="isLoadingRecommended" class="loading-state">
				<div class="loading-content">
					<el-icon class="loading-icon"><Search /></el-icon>
					<p>正在加载推荐内容...</p>
				</div>
			</div>

			<!-- 初始状态 - 功能说明（作为后备） -->
			<div v-else class="initial-state">
				<el-card
					class="welcome-card"
					:body-style="{ padding: '32px', textAlign: 'center' }"
				>
					<div class="welcome-tips">
						<div class="tip-item">
							<el-icon class="tip-icon"><MagicStick /></el-icon>
							<span>支持模糊搜索</span>
						</div>
						<div class="tip-item">
							<el-icon class="tip-icon"><Collection /></el-icon>
							<span>结果按域名分组显示</span>
						</div>
						<div class="tip-item">
							<el-icon class="tip-icon"><Mouse /></el-icon>
							<span>单击直接打开链接</span>
						</div>
						<div class="tip-item">
							<el-icon class="tip-icon"><Star /></el-icon>
							<span>历史记录可添加到书签</span>
						</div>
						<div class="tip-item">
							<el-icon class="tip-icon"><Download /></el-icon>
							<span>支持搜索下载文件</span>
						</div>
						<div v-if="mainShortcut" class="tip-item">
							<el-icon class="tip-icon"><Tools /></el-icon>
							<span>快捷键: {{ mainShortcut }}</span>
						</div>
					</div>
				</el-card>
			</div>
		</div>

		<!-- 快捷键提示 -->
		<div class="shortcuts">
			<el-tag size="small" effect="plain"
				>{{ navigationKeys.open }} 打开</el-tag
			>
			<el-tag size="small" effect="plain"
				>{{ navigationKeys.up }}{{ navigationKeys.down }} 选择</el-tag
			>
			<el-tag size="small" effect="plain">Esc 关闭</el-tag>
		</div>
	</div>

	<!-- 书签对话框 -->
	<BookmarkDialog
		:show="bookmarkDialog.show"
		:dialog="bookmarkDialog"
		@close="closeBookmarkDialog"
		@save="handleBookmarkSave"
	/>
</template>

<script setup lang="ts">
/// <reference types="chrome" />
import {
	Collection,
	Download,
	FolderOpened,
	MagicStick,
	Mouse,
	Search,
	Star,
	Tools,
	TopRight,
	Setting,
} from "@element-plus/icons-vue";
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
import {
	isUrlBookmarked,
	removeBookmarkByUrl,
} from "../utils/bookmarksApiWrapper";
import {
	getDefaultSearchEngine,
	SearchEngineManager,
} from "../utils/searchEngines";
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
	SearchEngine,
} from "../utils/types";
import SearchResultItemComponent from "./SearchResultItem.vue";

// 检测是否为新标签页模式
const isNewTabMode = computed(() => {
	return window.location.pathname.includes("single_tab.html");
});

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
const isLoadingRecommended = ref(false);

// 收藏状态跟踪
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

		// 更新收藏状态
		bookmarkedUrls.value.add(data.url);

		closeBookmarkDialog();
		console.log("书签添加成功！");
	} catch (error) {
		console.error("添加书签失败:", error);
		throw error; // 重新抛出错误，让对话框处理
	}
};

// 处理收藏/取消收藏操作
const handleBookmarkAction = async (item: SearchResultItem) => {
	if (item.type !== "history") return;

	try {
		const isBookmarked = isItemBookmarked(item);

		if (isBookmarked) {
			// 取消收藏
			const success = await removeBookmarkByUrl(item.url);
			if (success) {
				bookmarkedUrls.value.delete(item.url);
				console.log("取消收藏成功！");
			} else {
				console.error("取消收藏失败");
			}
		} else {
			// 收藏
			await showBookmarkDialog(item);
		}
	} catch (error) {
		console.error("收藏操作失败:", error);
	}
};

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

// 将推荐内容转换为与查询结果相同的格式
const recommendedResults = computed<GroupedSearchResults>(() => {
	const results: GroupedSearchResults = {};

	// 根据选中的数据源过滤并分组推荐内容
	let allItems: SearchResultItem[] = [];

	// 收集所有选中的数据源（书签优先）
	if (selectedDataSources.value.includes("bookmarks")) {
		allItems.push(...recommendedContent.value.frequentBookmarks);
	}

	if (selectedDataSources.value.includes("history")) {
		allItems.push(...recommendedContent.value.recentHistory);
	}

	if (selectedDataSources.value.includes("downloads")) {
		allItems.push(...recommendedContent.value.latestDownloads);
	}

	// URL去重：如果书签和历史记录有相同URL，只保留书签
	const bookmarkUrls = new Set(
		allItems.filter((item) => item.type === "bookmark").map((item) => item.url)
	);

	// 过滤掉已有书签的历史记录
	const deduplicatedItems = allItems.filter((item) => {
		if (item.type === "history" && bookmarkUrls.has(item.url)) {
			return false;
		}
		return true;
	});

	// 按域名分组，与查询结果保持相同格式
	deduplicatedItems.forEach((item) => {
		const domain = item.domain;
		if (!results[domain]) {
			results[domain] = {
				domain,
				items: [],
				totalCount: 0,
			};
		}
		results[domain].items.push(item);
		results[domain].totalCount++;
	});

	return results;
});

// 显示推荐内容的条件
const showRecommended = computed(() => {
	return !searchQuery.value && Object.keys(recommendedResults.value).length > 0;
});

// 当前显示的搜索结果（查询结果或推荐内容）
const currentResults = computed(() => {
	return searchQuery.value ? searchResults.value : recommendedResults.value;
});

// 当前是否有结果
const hasCurrentResults = computed(() => {
	return Object.keys(currentResults.value).length > 0;
});

// 加载推荐内容
const loadRecommendedContent = async (): Promise<void> => {
	try {
		isLoadingRecommended.value = true;
		const content = await ContentSearchService.getRecommendedContent();
		recommendedContent.value = content;

		// 加载完推荐内容后更新收藏状态
		await updateBookmarkedUrls();
	} catch (error) {
		console.error("加载推荐内容失败:", error);
	} finally {
		isLoadingRecommended.value = false;
	}
};

// 更新收藏状态
const updateBookmarkedUrls = async (): Promise<void> => {
	try {
		const allUrls = new Set<string>();

		// 收集当前显示的所有历史记录URL
		Object.values(currentResults.value).forEach((group) => {
			group.items.forEach((item) => {
				if (item.type === "history") {
					allUrls.add(item.url);
				}
			});
		});

		// 检查每个URL的收藏状态
		const newBookmarkedUrls = new Set<string>();
		for (const url of allUrls) {
			const isBookmarked = await isUrlBookmarked(url);
			if (isBookmarked) {
				newBookmarkedUrls.add(url);
			}
		}

		bookmarkedUrls.value = newBookmarkedUrls;
	} catch (error) {
		console.error("更新收藏状态失败:", error);
	}
};

// 检查某个项目是否已被收藏
const isItemBookmarked = (item: SearchResultItem): boolean => {
	return item.type === "history" && bookmarkedUrls.value.has(item.url);
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

// 获取选中数据源的显示文本
const getSelectedText = (): string => {
	const labels: Record<string, string> = {
		bookmarks: "书签",
		history: "历史记录",
		downloads: "下载文件",
	};
	return selectedDataSources.value.map((key) => labels[key]).join("、");
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
	} else {
		// 如果没有搜索查询，更新推荐内容的收藏状态
		updateBookmarkedUrls();
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

		// 更新收藏状态
		await updateBookmarkedUrls();
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

// 监听搜索选项变化（除了数据源选择，因为那个有单独的处理）
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
		window.close(); // 关闭弹窗
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

// 递归查找文件夹ID
const findFolderById = (folder: any, targetId: string): boolean => {
	if (folder.id === targetId) return true;
	if (folder.children) {
		return folder.children.some((child: any) =>
			findFolderById(child, targetId)
		);
	}
	return false;
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
				// 滚动到可见区域，但确保在可滚动容器内
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
				// 滚动到可见区域，但确保在可滚动容器内
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
			// 可选：关闭弹窗
			if (!isNewTabMode.value) {
				window.close();
			}
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
			console.log("搜索设置已更新:", newSettings);
			// 新增：设置变更时刷新默认搜索引擎
			loadDefaultSearchEngine();
			// 如果有搜索查询，重新搜索以应用新设置
			if (searchQuery.value.trim()) {
				handleSearchNow();
			}
		}
	}

	// 监听导航设置变化
	if (changes.navigationSettings) {
		const newSettings = changes.navigationSettings.newValue;
		if (newSettings) {
			Object.assign(navigationConfig, newSettings);
			console.log("导航设置已更新:", newSettings);
		}
	}
};

// 组件挂载
onMounted(async () => {
	// 加载快捷键配置
	await loadShortcutConfig();

	// 加载搜索设置
	await loadSearchSettings();

	// 加载导航设置
	await loadNavigationSettings();

	// 加载搜索历史
	await loadSearchHistory();

	// 加载推荐内容
	await loadRecommendedContent();

	// 加载默认搜索引擎
	await loadDefaultSearchEngine();

	// 聚焦搜索框
	await nextTick();
	searchInput.value?.focus();

	// 绑定键盘事件
	document.addEventListener("keydown", handleKeyDown);

	// 监听storage变化
	chrome.storage.onChanged.addListener(handleStorageChange);
});

// 组件卸载
onUnmounted(() => {
	// 清理防抖定时器
	if (searchTimeout.value !== null) {
		window.clearTimeout(searchTimeout.value);
	}

	document.removeEventListener("keydown", handleKeyDown);
	chrome.storage.onChanged.removeListener(handleStorageChange);
});

// 打开设置页面
const openSettings = () => {
	chrome.tabs.create({
		url: chrome.runtime.getURL("settings.html"),
	});
};

// 在新标签页打开搜索界面
const openInNewTab = () => {
	const params = new URLSearchParams();
	params.set("q", searchQuery.value);
	params.set("bookmarks", searchOptions.includeBookmarks.toString());
	params.set("history", searchOptions.includeHistory.toString());
	params.set("downloads", searchOptions.includeDownloads.toString());
	params.set("sort", searchOptions.sortBy);
	params.set("time", searchOptions.timeFilter);

	chrome.tabs.create({
		url: chrome.runtime.getURL(`single_tab.html?${params.toString()}`),
	});
};

// 导出函数供模板使用
defineExpose({
	getFaviconUrl,
	formatFileSize,
	openInNewTab,
});

const handleEnterKey = () => {
	if (selectedItem.value) {
		const item = findItemById(selectedItem.value);
		if (item) {
			openItem(item);
		}
	} else {
		const firstGroup = Object.values(searchResults.value)[0];
		if (firstGroup && firstGroup.items.length > 0) {
			const firstItem = firstGroup.items[0];
			if (firstItem) {
				openItem(firstItem);
			}
		} else {
			handleSearchNow();
		}
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
</script>

<style lang="less" scoped>
@import "../entrypoints/styles/element-popup.less";

.loading-state {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 40px;

	.loading-content {
		text-align: center;
		color: var(--el-text-color-secondary);

		.loading-icon {
			font-size: 24px;
			margin-bottom: 12px;
			animation: rotation 2s infinite linear;
		}

		p {
			margin: 0;
			font-size: 14px;
		}
	}
}

@keyframes rotation {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}

/* 网络搜索建议样式 */
.web-search-suggestion {
	padding: 0 16px 16px;

	.web-search-card {
		border: 1px dashed var(--el-color-primary);

		.web-search-header {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-bottom: 12px;

			.search-engine-icon {
				font-size: 18px;
			}

			.suggestion-text {
				font-weight: 500;
				color: var(--el-text-color-primary);
			}
		}

		.web-search-query {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;

			.query-text {
				font-style: italic;
				color: var(--el-color-primary);
				font-weight: 500;
				flex: 1;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}

		&:hover {
			border-color: var(--el-color-primary-light-3);
			background-color: var(--el-color-primary-light-9);
		}
	}
}
</style>
