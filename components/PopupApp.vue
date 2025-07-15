<template>
	<div
		class="w-[780px] h-[600px] p-0 overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 rounded-xl shadow-2xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col backdrop-blur-sm"
		:class="{
			'w-full h-screen max-w-none max-h-none m-0 rounded-none shadow-none border-none':
				isNewTabMode,
		}"
	>
		<!-- 固定头部区域 -->
		<div
			class="flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 z-10"
		>
			<!-- 搜索头部 -->
			<div class="p-4">
				<!-- 搜索输入框 -->
				<div class="flex items-center gap-3 mb-4">
					<div class="relative flex-1">
						<!-- 阴影补全层 -->
						<div
							v-if="shadowCompletion"
							class="absolute inset-0 pointer-events-none z-10 flex items-center"
							:style="{
								paddingLeft: `calc(${inputStyles.paddingLeft} + 32px)`,
								paddingRight: inputStyles.paddingRight,
							}"
						>
							<span
								class="text-slate-400 dark:text-slate-500 opacity-60 whitespace-nowrap overflow-hidden"
								:style="{
									fontSize: inputStyles.fontSize,
									fontFamily: inputStyles.fontFamily,
									lineHeight: inputStyles.lineHeight,
									marginLeft: getTextWidth(searchQuery) + 5 + 'px',
								}"
								>{{ shadowCompletion }}</span
							>
						</div>

						<!-- 搜索输入框 -->
						<el-input
							v-model="searchQuery"
							placeholder="搜索本地文件，或按 Ctrl+Enter 进行网络搜索，按 Tab 补全"
							size="large"
							clearable
							@input="handleSearchInput"
							@keydown.enter.prevent="handleEnterKey"
							@keydown.ctrl.enter.prevent="performWebSearch"
							@keydown.tab.prevent="handleTabCompletion"
							@focus="handleSearchFocus"
							@blur="handleSearchBlur"
							ref="searchInput"
							class="bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm backdrop-blur-sm transition-all duration-300"
						>
							<template #prefix>
								<el-icon class="text-slate-400 dark:text-slate-500"
									><Search
								/></el-icon>
							</template>
						</el-input>
					</div>

					<el-button
						size="large"
						:icon="Setting"
						circle
						@click="openSettings"
						title="打开设置"
						class="bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200 backdrop-blur-sm"
					/>
				</div>

				<!-- 搜索历史气泡 -->
				<div
					v-if="searchHistory.length > 0"
					class="mb-4 flex flex-wrap gap-2 items-center"
				>
					<el-tag
						v-for="item in displayedHistory"
						:key="item.timestamp"
						type="info"
						effect="plain"
						size="small"
						class="cursor-pointer rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 transform hover:scale-105"
						@click="selectHistoryItem(item.query)"
					>
						{{ item.query }}
					</el-tag>

					<!-- 更多历史记录下拉菜单 -->
					<el-dropdown
						v-if="hasMoreHistory"
						trigger="click"
						placement="bottom-start"
						class="cursor-pointer"
					>
						<el-tag
							type="primary"
							effect="plain"
							size="small"
							class="cursor-pointer rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 transform hover:scale-105"
						>
							<span class="flex items-center gap-1">
								<span>更多 ({{ searchHistory.length - 5 }})</span>
								<el-icon class="text-xs"><ArrowDown /></el-icon>
							</span>
						</el-tag>
						<template #dropdown>
							<el-dropdown-menu class="max-h-60 overflow-y-auto">
								<el-dropdown-item
									v-for="item in searchHistory.slice(5)"
									:key="item.timestamp"
									@click="selectHistoryItem(item.query)"
									class="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20"
								>
									{{ item.query }}
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>

				<!-- 搜索选项 -->
				<div class="flex items-center justify-between gap-4 flex-wrap">
					<!-- 域名过滤 -->
					<div class="flex items-center gap-3 flex-1 min-w-[120px]">
						<span
							class="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0"
							>域名:</span
						>
						<el-select
							v-model="selectedDomains"
							multiple
							collapse-tags
							collapse-tags-tooltip
							size="small"
							:placeholder="
								availableDomains.length > 0 ? '全部域名' : '暂无域名'
							"
							class="w-full"
							@change="handleDomainFilterChange"
						>
							<el-option
								v-for="domain in availableDomains"
								:key="domain"
								:label="domain"
								:value="domain"
							>
								<div class="flex items-center gap-2">
									<img
										:src="getFaviconUrl(domain)"
										:alt="domain"
										class="w-4 h-4 rounded-sm"
									/>
									<span>{{ domain }}</span>
								</div>
							</el-option>
						</el-select>
					</div>

					<!-- 数据源多选 -->
					<div class="flex items-center gap-3 flex-1 min-w-[160px]">
						<span
							class="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0"
							>搜索项:</span
						>
						<el-select
							v-model="selectedDataSources"
							multiple
							collapse-tags
							:max-collapse-tags="1"
							size="small"
							placeholder="全部数据源"
							class="w-full min-w-0 single-line-select"
							:popper-class="'data-source-popper'"
							@change="updateSearchOptions"
						>
							<el-option label="书签" value="bookmarks" />
							<el-option label="历史记录" value="history" />
							<el-option label="下载文件" value="downloads" />
						</el-select>
					</div>

					<!-- 时间筛选 -->
					<div class="flex items-center gap-3 flex-1 min-w-[120px]">
						<span
							class="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0"
							>时间:</span
						>
						<el-select
							v-model="searchOptions.timeFilter"
							size="small"
							class="w-full"
						>
							<el-option label="全部时间" value="all" />
							<el-option label="今天" value="today" />
							<el-option label="本周" value="week" />
							<el-option label="本月" value="month" />
						</el-select>
					</div>

					<!-- 排序选择 -->
					<div class="flex items-center gap-3 flex-1 min-w-[120px]">
						<span
							class="text-sm font-medium text-slate-600 dark:text-slate-400 flex-shrink-0"
							>排序:</span
						>
						<el-select
							v-model="searchOptions.sortBy"
							size="small"
							class="w-full"
						>
							<el-option label="相关性" value="relevance" />
							<el-option label="最近访问" value="recent" />
							<el-option label="访问频率" value="frequency" />
						</el-select>
					</div>
				</div>
			</div>
		</div>

		<!-- 搜索结果统计区域（固定） -->
		<div
			v-if="searchStats"
			class="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-slate-200/60 dark:border-slate-700/60 backdrop-blur-md z-10"
		>
			<el-space :size="8" wrap>
				<el-tag
					size="small"
					type="primary"
					effect="light"
					class="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 backdrop-blur-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
					:class="{
						'ring-2 ring-blue-400/60 dark:ring-blue-500/60 bg-blue-50/80 dark:bg-blue-900/30':
							displayFilters.length === 0,
					}"
					@click="handleStatsTagClick('all')"
					title="点击显示全部结果"
				>
					找到 {{ searchStats.totalResults }} 个结果
				</el-tag>
				<el-tag
					v-if="searchStats.bookmarkCount > 0"
					size="small"
					type="success"
					effect="light"
					class="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 backdrop-blur-sm cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200"
					:class="{
						'ring-2 ring-green-400/60 dark:ring-green-500/60 bg-green-50/80 dark:bg-green-900/30':
							displayFilters.includes('bookmark'),
					}"
					@click="handleStatsTagClick('bookmarks')"
					title="点击筛选书签结果（可多选）"
				>
					书签 {{ searchStats.bookmarkCount }}
				</el-tag>
				<el-tag
					v-if="searchStats.historyCount > 0"
					size="small"
					type="warning"
					effect="light"
					class="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 backdrop-blur-sm cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors duration-200"
					:class="{
						'ring-2 ring-amber-400/60 dark:ring-amber-500/60 bg-amber-50/80 dark:bg-amber-900/30':
							displayFilters.includes('history'),
					}"
					@click="handleStatsTagClick('history')"
					title="点击筛选历史记录结果（可多选）"
				>
					历史 {{ searchStats.historyCount }}
				</el-tag>
				<el-tag
					v-if="searchStats.downloadCount > 0"
					size="small"
					type="info"
					effect="light"
					class="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 backdrop-blur-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
					:class="{
						'ring-2 ring-blue-400/60 dark:ring-blue-500/60 bg-blue-50/80 dark:bg-blue-900/30':
							displayFilters.includes('download'),
					}"
					@click="handleStatsTagClick('downloads')"
					title="点击筛选下载文件结果（可多选）"
				>
					下载 {{ searchStats.downloadCount }}
				</el-tag>
				<el-tag
					size="small"
					effect="light"
					class="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 backdrop-blur-sm"
				>
					{{ searchStats.uniqueDomains }} 个域名
				</el-tag>
				<el-tag
					size="small"
					effect="light"
					class="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 backdrop-blur-sm"
				>
					{{ searchStats.searchTime }}ms
				</el-tag>
			</el-space>
		</div>

		<!-- 可滚动内容区域 -->
		<div
			class="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-white/50 to-slate-50/50 dark:from-slate-900/50 dark:to-slate-800/50 scrollable-content"
			:style="{
				contain: 'layout style paint',
				willChange: isScrolling ? 'scroll-position' : 'auto',
				transform: 'translate3d(0,0,0)',
			}"
		>
			<!-- 加载状态 -->
			<div v-if="isLoading" v-loading="true" class="p-8">
				<el-empty description="搜索中..." :image-size="60" />
			</div>

			<!-- 搜索结果或推荐内容 -->
			<div v-else-if="hasCurrentResults" class="p-4 space-y-3">
				<div
					v-for="item in flattenedResults"
					:key="item.id"
					class="bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg backdrop-blur-sm group cursor-pointer"
					:class="{
						'ring-2 ring-blue-400/60 dark:ring-blue-500/60 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg transform scale-[1.02]':
							selectedItem === item.id,
					}"
					:style="{
						transition: isLowPerformanceDevice
							? 'none'
							: 'transform 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.2s ease-out, border-color 0.2s ease-out',
						willChange: selectedItem === item.id ? 'transform' : 'auto',
						transform: 'translate3d(0,0,0)',
					}"
					:data-id="item.id"
					@click="selectAndOpenItem(item)"
				>
					<div class="flex items-center gap-4 p-3">
						<div class="flex items-center gap-2 flex-shrink-0">
							<img
								:src="getFaviconUrl(extractDomain(item.url))"
								:alt="extractDomain(item.url)"
								class="w-4 h-4 rounded-sm"
							/>
							<div class="text-lg opacity-80">
								{{ getItemIcon(item.type) }}
							</div>
						</div>
						<div class="flex-1 min-w-0">
							<div
								class="font-semibold text-slate-800 dark:text-slate-200 text-base leading-tight mb-1 truncate"
								:title="item.title"
							>
								{{ item.title }}
							</div>
							<div
								class="text-sm text-slate-500 dark:text-slate-400 mb-2 truncate"
								:title="item.url"
							>
								{{ item.url }}
							</div>
							<div class="flex gap-2 text-xs flex-wrap">
								<el-tag
									v-if="item.folderName"
									size="small"
									type="warning"
									effect="light"
									class="bg-slate-100/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 backdrop-blur-sm"
								>
									📁 {{ item.folderName }}
								</el-tag>
								<el-tag
									v-if="item.visitCount && item.type !== 'download'"
									size="small"
									type="info"
									effect="light"
									class="bg-slate-100/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 backdrop-blur-sm"
								>
									{{ item.visitCount }} 次访问
								</el-tag>
								<el-tag
									v-if="item.fileSize && item.type === 'download'"
									size="small"
									type="success"
									effect="light"
									class="bg-slate-100/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 backdrop-blur-sm"
								>
									{{ formatFileSize(item.fileSize) }}
								</el-tag>
								<span
									v-if="item.lastVisited"
									class="text-slate-400 dark:text-slate-500 font-medium"
								>
									{{ formatDate(item.lastVisited) }}
								</span>
								<el-tag
									v-if="item.type === 'download' && !item.exists"
									size="small"
									type="danger"
									effect="dark"
									class="bg-slate-100/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 backdrop-blur-sm"
								>
									⚠️ 文件不存在
								</el-tag>
							</div>
						</div>
						<div
							class="flex gap-2 transform"
							:class="{
								'opacity-100 translate-x-0': selectedItem === item.id,
								'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0':
									selectedItem !== item.id,
							}"
							:style="{
								transition: isLowPerformanceDevice
									? 'none'
									: 'opacity 0.2s ease-out, transform 0.2s ease-out',
								willChange:
									selectedItem === item.id ? 'opacity, transform' : 'auto',
							}"
						>
							<el-button
								v-if="item.type === 'history'"
								size="small"
								:type="isItemBookmarked(item) ? 'warning' : 'primary'"
								:icon="Star"
								@click.stop="handleBookmarkAction(item)"
								class="bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-600 hover:shadow-md backdrop-blur-sm"
							>
								{{ isItemBookmarked(item) ? "取消收藏" : "收藏" }}
							</el-button>
							<el-button
								v-if="item.type === 'bookmark'"
								size="small"
								type="warning"
								:icon="Star"
								@click.stop="handleRemoveBookmark(item)"
								class="bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-600 hover:shadow-md backdrop-blur-sm"
							>
								取消收藏
							</el-button>
							<el-button
								v-if="item.type === 'download'"
								size="small"
								type="success"
								:icon="FolderOpened"
								@click.stop="showDownloadFile(item)"
								class="bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-600 hover:shadow-md backdrop-blur-sm"
							>
								显示文件目录
							</el-button>
							<el-button
								v-if="item.type === 'history'"
								size="small"
								type="danger"
								:icon="Delete"
								@click.stop="handleRemoveHistory(item)"
								title="删除历史记录"
								class="bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-600 hover:shadow-md backdrop-blur-sm"
							>
								删除
							</el-button>
							<el-button
								v-if="item.type === 'history' || item.type === 'bookmark'"
								size="small"
								type="info"
								:icon="DocumentCopy"
								@click.stop="copyUrl(item.url)"
								title="复制链接"
								class="bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-600 hover:shadow-md backdrop-blur-sm"
							>
								复制
							</el-button>
						</div>
					</div>
				</div>
			</div>

			<!-- 网络搜索建议 -->
			<div
				v-if="searchQuery && !isLoading && defaultSearchEngine"
				class="px-4 pb-4"
			>
				<div
					class="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-dashed border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100/80 hover:to-indigo-100/80 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 cursor-pointer transform hover:scale-[1.01] rounded-xl p-4"
					@click="performWebSearch"
				>
					<div class="flex items-center gap-3 mb-3">
						<img
							:src="getEngineIconUrl(defaultSearchEngine)"
							alt="icon"
							class="w-6 h-6 rounded-md shadow-sm"
						/>
						<span
							class="font-semibold text-slate-800 dark:text-slate-200 text-lg"
						>
							在{{ defaultSearchEngine.name }}中搜索
						</span>
					</div>
					<div class="flex items-center justify-between gap-4">
						<span
							class="italic text-blue-700 dark:text-blue-300 font-semibold flex-1 truncate text-lg"
						>
							"{{ searchQuery }}"
						</span>
						<el-button
							type="primary"
							size="default"
							:icon="TopRight"
							class="bg-blue-500 hover:bg-blue-600 border border-blue-500 hover:border-blue-600 shadow-md hover:shadow-lg"
						>
							搜索
						</el-button>
					</div>
				</div>
			</div>

			<!-- 空状态 -->
			<div v-else-if="searchQuery && !isLoading" class="p-8">
				<el-empty description="未找到匹配的结果" :image-size="100">
					<template #description>
						<div class="text-center space-y-3">
							<p class="text-slate-600 dark:text-slate-400 text-lg font-medium">
								未找到匹配的结果
							</p>
							<p class="text-slate-500 dark:text-slate-500">
								可尝试
								<el-tag size="small" type="primary" effect="light" class="mx-1">
									Ctrl+Enter
								</el-tag>
								进行网络搜索
							</p>
						</div>
					</template>
				</el-empty>
			</div>

			<!-- 推荐内容加载状态 -->
			<div
				v-else-if="isLoadingRecommended"
				class="flex items-center justify-center p-8"
			>
				<div class="text-center text-slate-500 dark:text-slate-400">
					<el-icon class="text-3xl mb-4 animate-spin text-blue-500"
						><Search
					/></el-icon>
					<p class="m-0 text-base font-medium">正在加载推荐内容...</p>
				</div>
			</div>
		</div>

		<!-- 快捷键提示 -->
		<div
			class="flex-shrink-0 flex gap-2 p-3 bg-gradient-to-r from-slate-50/80 to-slate-100/80 dark:from-slate-900/80 dark:to-slate-800/80 border-t border-slate-200/60 dark:border-slate-700/60 flex-wrap"
		>
			<el-tag
				size="small"
				type="info"
				effect="plain"
				class="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 backdrop-blur-sm"
			>
				{{ navigationKeys.open }} 打开
			</el-tag>
			<el-tag
				size="small"
				type="info"
				effect="plain"
				class="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 backdrop-blur-sm"
			>
				{{ navigationKeys.up }}{{ navigationKeys.down }} 选择
			</el-tag>
			<el-tag
				size="small"
				type="info"
				effect="plain"
				class="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 backdrop-blur-sm"
			>
				Ctrl+C 复制
			</el-tag>
			<el-tag
				size="small"
				type="info"
				effect="plain"
				class="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 backdrop-blur-sm"
			>
				Ctrl+B 收藏
			</el-tag>
			<el-tag
				size="small"
				type="info"
				effect="plain"
				class="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 backdrop-blur-sm"
			>
				Ctrl+F 显示文件
			</el-tag>
			<el-tag
				size="small"
				type="info"
				effect="plain"
				class="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 backdrop-blur-sm"
			>
				Ctrl+D 删除历史
			</el-tag>
			<el-tag
				size="small"
				type="info"
				effect="plain"
				class="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 backdrop-blur-sm"
			>
				Esc 关闭
			</el-tag>
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
	DocumentCopy,
	Download,
	FolderOpened,
	MagicStick,
	Mouse,
	Search,
	Star,
	Tools,
	TopRight,
	Setting,
	ArrowDown,
	Delete,
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
import { ThemeManager } from "../utils/theme";
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

// 性能优化相关
const isScrolling = ref(false);
const scrollAnimationFrame = ref<number | null>(null);
const elementCache = new Map<string, HTMLElement>();
const isLowPerformanceDevice = ref(false);

// 节流函数
const throttle = (func: Function, limit: number) => {
	let inThrottle: boolean;
	return function (this: any, ...args: any[]) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
};

// 优化的滚动到视图函数
const smoothScrollToElement = (element: HTMLElement) => {
	if (isScrolling.value || !element) return;

	const scrollableContainer = document.querySelector(".scrollable-content");
	if (!scrollableContainer) return;

	const containerRect = scrollableContainer.getBoundingClientRect();
	const elementRect = element.getBoundingClientRect();

	// 检查元素是否已经在视口内
	const isVisible =
		elementRect.top >= containerRect.top &&
		elementRect.bottom <= containerRect.bottom;

	if (isVisible) return;

	isScrolling.value = true;

	// 取消之前的动画帧
	if (scrollAnimationFrame.value) {
		cancelAnimationFrame(scrollAnimationFrame.value);
	}

	scrollAnimationFrame.value = requestAnimationFrame(() => {
		try {
			// 在低性能设备上使用更简单的滚动
			const scrollOptions: ScrollIntoViewOptions = {
				block: elementRect.top < containerRect.top ? "start" : "end",
				behavior: isLowPerformanceDevice.value ? "auto" : "smooth",
			};

			element.scrollIntoView(scrollOptions);
		} finally {
			// 延迟重置滚动状态，避免过快的连续操作
			setTimeout(
				() => {
					isScrolling.value = false;
				},
				isLowPerformanceDevice.value ? 50 : 100
			);
		}
	});
};

// 缓存DOM元素查询
const getCachedElement = (itemId: string): HTMLElement | null => {
	if (elementCache.has(itemId)) {
		const cached = elementCache.get(itemId);
		// 检查元素是否仍在DOM中
		if (cached && document.contains(cached)) {
			return cached;
		} else {
			elementCache.delete(itemId);
		}
	}

	const element = document.querySelector(
		`[data-id="${itemId}"]`
	) as HTMLElement;
	if (element) {
		elementCache.set(itemId, element);
	}
	return element;
};

// 节流的键盘导航处理
const throttledHandleNavigation = throttle((direction: "up" | "down") => {
	if (!hasCurrentResults.value) return;

	const allItems = Object.values(currentResults.value).flatMap(
		(group) => group.items
	);
	if (!allItems.length) return;

	const currentIndex = selectedItem.value
		? allItems.findIndex((item) => item.id === selectedItem.value)
		: -1;

	let newIndex: number;
	if (direction === "down") {
		newIndex = currentIndex < allItems.length - 1 ? currentIndex + 1 : 0;
	} else {
		newIndex = currentIndex > 0 ? currentIndex - 1 : allItems.length - 1;
	}

	const newItem = allItems[newIndex];
	if (newItem) {
		selectedItem.value = newItem.id;

		// 使用优化的滚动函数
		const element = getCachedElement(newItem.id);
		if (element) {
			smoothScrollToElement(element);
		}
	}
}, 16); // 约60fps的限制

// 检测设备性能
const detectPerformance = () => {
	// 简单的性能检测
	const start = performance.now();
	const iterations = 10000;

	for (let i = 0; i < iterations; i++) {
		// 简单的计算任务
		Math.random() * Math.random();
	}

	const duration = performance.now() - start;
	// 如果简单计算超过5ms，认为是低性能设备
	isLowPerformanceDevice.value = duration > 5;

	console.log(
		`性能检测: ${duration.toFixed(2)}ms, 低性能设备: ${
			isLowPerformanceDevice.value
		}`
	);
};

// 选中的数据源 - 默认空（逻辑上等于全选）
const selectedDataSources = ref<string[]>([]);

// 独立的显示过滤器 - 用于概述栏标签过滤，不影响搜索范围
const displayFilters = ref<string[]>([]);

// 推荐内容相关状态
const recommendedContent = ref<RecommendedContent>({
	recentHistory: [],
	frequentBookmarks: [],
	latestDownloads: [],
});
const isLoadingRecommended = ref(false);

// 收藏状态跟踪
const bookmarkedUrls = ref<Set<string>>(new Set());

// 域名过滤
const selectedDomains = ref<string[]>([]);

// 快捷键显示
const mainShortcut = ref("");
const navigationKeys = ref(getNavigationKeys());

// 默认搜索引擎
const defaultSearchEngine = ref<SearchEngine | null>(null);

// 阴影补全相关
const shadowCompletion = ref("");

// 输入框样式
const inputStyles = reactive({
	fontSize: "14px",
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
	lineHeight: "1.4",
	paddingLeft: "11px",
	paddingRight: "11px",
});

// 创建测量文本宽度的canvas元素
let textMeasureCanvas: HTMLCanvasElement | null = null;

// 获取文本宽度
const getTextWidth = (text: string): number => {
	if (!text) return 0;

	if (!textMeasureCanvas) {
		textMeasureCanvas = document.createElement("canvas");
	}

	const context = textMeasureCanvas.getContext("2d");
	if (!context) return 0;

	// 设置与输入框相同的字体样式
	context.font = `${inputStyles.fontSize} ${inputStyles.fontFamily}`;

	return context.measureText(text).width;
};

// 获取输入框的实际样式
const updateInputStyles = () => {
	nextTick(() => {
		const inputElement = (searchInput.value as any)?.$el?.querySelector(
			"input"
		);
		if (inputElement) {
			const computedStyles = window.getComputedStyle(inputElement);
			inputStyles.fontSize = computedStyles.fontSize;
			inputStyles.fontFamily = computedStyles.fontFamily;
			inputStyles.lineHeight = computedStyles.lineHeight;
			inputStyles.paddingLeft = computedStyles.paddingLeft;
			inputStyles.paddingRight = computedStyles.paddingRight;
		}
	});
};

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

// 显示的搜索历史（前5条）
const displayedHistory = computed(() => {
	return searchHistory.value.slice(0, 5);
});

// 是否有更多历史记录
const hasMoreHistory = computed(() => {
	return searchHistory.value.length > 5;
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

// 处理书签删除操作
const handleRemoveBookmark = async (item: SearchResultItem) => {
	if (item.type !== "bookmark") return;

	try {
		const success = await removeBookmarkByUrl(item.url);
		if (success) {
			console.log("书签删除成功！");
			// 重新搜索以更新结果
			if (searchQuery.value.trim()) {
				handleSearchNow();
			} else {
				// 如果没有搜索查询，重新加载推荐内容
				await loadRecommendedContent();
			}
		} else {
			console.error("书签删除失败");
		}
	} catch (error) {
		console.error("删除书签失败:", error);
	}
};

// 处理历史记录删除操作
const handleRemoveHistory = async (item: SearchResultItem) => {
	if (item.type !== "history") return;

	try {
		// 调用Chrome API删除历史记录
		await chrome.history.deleteUrl({ url: item.url });
		console.log("历史记录删除成功！");

		// 更新收藏状态（移除已删除的URL）
		bookmarkedUrls.value.delete(item.url);

		// 重新搜索以更新结果
		if (searchQuery.value.trim()) {
			handleSearchNow();
		} else {
			// 如果没有搜索查询，重新加载推荐内容
			await loadRecommendedContent();
		}
	} catch (error) {
		console.error("删除历史记录失败:", error);
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

// 获取当前可用的域名（从查询结果或推荐内容中）
const availableDomains = computed(() => {
	if (searchQuery.value) {
		// 有查询时，返回搜索结果中的域名
		return Object.keys(searchResults.value);
	} else {
		// 没有查询时，返回推荐内容中的域名
		const domains = new Set<string>();
		Object.values(recommendedResults.value).forEach((group) => {
			group.items.forEach((item) => {
				const domain = extractDomain(item.url);
				if (domain && domain !== item.url) {
					domains.add(domain);
				}
			});
		});
		return Array.from(domains).sort();
	}
});

// 根据显示过滤器和域名过滤搜索结果
const filteredSearchResults = computed<GroupedSearchResults>(() => {
	let results = searchResults.value;

	// 首先根据域名过滤
	if (selectedDomains.value.length > 0) {
		const domainFiltered: GroupedSearchResults = {};
		selectedDomains.value.forEach((domain) => {
			if (results[domain]) {
				domainFiltered[domain] = results[domain];
			}
		});
		results = domainFiltered;
	}

	// 然后根据数据类型过滤
	if (displayFilters.value.length > 0) {
		const typeFiltered: GroupedSearchResults = {};
		Object.entries(results).forEach(([domain, group]) => {
			const filteredItems = group.items.filter((item) =>
				displayFilters.value.includes(item.type)
			);
			if (filteredItems.length > 0) {
				typeFiltered[domain] = {
					...group,
					items: filteredItems,
					totalCount: filteredItems.length,
				};
			}
		});
		results = typeFiltered;
	}

	return results;
});

// 将推荐内容转换为与查询结果相同的格式
const recommendedResults = computed<GroupedSearchResults>(() => {
	const results: GroupedSearchResults = {};
	// 当没有选择时默认全选，或者选中了历史记录
	const isAllSelected = selectedDataSources.value.length === 0;
	if (isAllSelected || selectedDataSources.value.includes("history")) {
		// 按访问时间排序，最近访问的在前面
		const sortedHistory = [...recommendedContent.value.recentHistory].sort(
			(a, b) => (b.lastVisited || 0) - (a.lastVisited || 0)
		);
		// 创建一个虚拟的"推荐内容"组，平铺显示所有项目
		if (sortedHistory.length > 0) {
			results["最近访问"] = {
				domain: "最近访问",
				items: sortedHistory,
				totalCount: sortedHistory.length,
			};
		}
	}
	return results;
});

// 根据域名和显示过滤器过滤推荐内容
const filteredRecommendedResults = computed<GroupedSearchResults>(() => {
	let results = recommendedResults.value;

	// 根据域名过滤
	if (selectedDomains.value.length > 0) {
		const domainFiltered: GroupedSearchResults = {};
		Object.entries(results).forEach(([groupName, group]) => {
			const filteredItems = group.items.filter((item) => {
				const domain = extractDomain(item.url);
				return selectedDomains.value.includes(domain);
			});
			if (filteredItems.length > 0) {
				domainFiltered[groupName] = {
					...group,
					items: filteredItems,
					totalCount: filteredItems.length,
				};
			}
		});
		results = domainFiltered;
	}

	// 根据数据类型过滤
	if (displayFilters.value.length > 0) {
		const typeFiltered: GroupedSearchResults = {};
		Object.entries(results).forEach(([groupName, group]) => {
			const filteredItems = group.items.filter((item) =>
				displayFilters.value.includes(item.type)
			);
			if (filteredItems.length > 0) {
				typeFiltered[groupName] = {
					...group,
					items: filteredItems,
					totalCount: filteredItems.length,
				};
			}
		});
		results = typeFiltered;
	}

	return results;
});

// 显示推荐内容的条件
const showRecommended = computed(() => {
	return (
		!searchQuery.value &&
		Object.keys(filteredRecommendedResults.value).length > 0
	);
});

// 当前显示的搜索结果（查询结果或推荐内容）
const currentResults = computed(() => {
	return searchQuery.value
		? filteredSearchResults.value
		: filteredRecommendedResults.value;
});

// 平铺的搜索结果（不分组）
const flattenedResults = computed(() => {
	const results: SearchResultItem[] = [];
	Object.values(currentResults.value).forEach((group) => {
		results.push(...group.items);
	});
	return results;
});

// 当前是否有结果
const hasCurrentResults = computed(() => {
	return flattenedResults.value.length > 0;
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

// 处理域名过滤变化
const handleDomainFilterChange = () => {
	// 域名过滤变化时不需要重新搜索，因为已经通过计算属性处理
	console.log("域名过滤已更新:", selectedDomains.value);
};

// 重置域名过滤（显示全部）
const resetDomainFilter = () => {
	selectedDomains.value = [];
};

// 更新搜索选项
const updateSearchOptions = () => {
	// 当没有选择时，默认为全选
	const isAllSelected = selectedDataSources.value.length === 0;
	searchOptions.includeBookmarks =
		isAllSelected || selectedDataSources.value.includes("bookmarks");
	searchOptions.includeHistory =
		isAllSelected || selectedDataSources.value.includes("history");
	searchOptions.includeDownloads =
		isAllSelected || selectedDataSources.value.includes("downloads");
	// 如果当前有搜索查询，重新搜索
	if (searchQuery.value.trim()) {
		handleSearchNow();
	} else {
		// 如果没有搜索查询，更新推荐内容的收藏状态
		updateBookmarkedUrls();
	}
};

// 清理过期的DOM缓存
const cleanupCache = () => {
	const currentIds = new Set(flattenedResults.value.map((item) => item.id));
	for (const [id] of elementCache) {
		if (!currentIds.has(id)) {
			elementCache.delete(id);
		}
	}
};

// 处理输入事件（带防抖）
const handleSearchInput = () => {
	// 更新阴影补全
	shadowCompletion.value = calculateShadowCompletion(searchQuery.value);

	// 清除之前的定时器
	if (searchTimeout.value !== null) {
		window.clearTimeout(searchTimeout.value);
		searchTimeout.value = null;
	}

	// 如果输入为空，立即清空结果
	if (!searchQuery.value.trim()) {
		searchResults.value = {};
		searchStats.value = null;
		shadowCompletion.value = "";
		// 清理DOM缓存
		cleanupCache();
		return;
	}
	// 设置新的防抖定时器
	searchTimeout.value = window.setTimeout(() => {
		handleSearch();
	}, DEBOUNCE_DELAY);
};

// 计算阴影补全建议
const calculateShadowCompletion = (input: string): string => {
	if (!input.trim()) return "";

	const query = input.trim().toLowerCase();
	// 从搜索历史中找到最佳匹配（以输入内容开头的）
	const bestMatch = searchHistory.value.find((item) =>
		item.query.toLowerCase().startsWith(query)
	);

	if (bestMatch && bestMatch.query.toLowerCase() !== query) {
		// 返回补全部分（去掉已输入的部分）
		return bestMatch.query.slice(input.length);
	}

	return "";
};

// 处理搜索框聚焦
const handleSearchFocus = () => {
	// 聚焦时更新阴影补全
	shadowCompletion.value = calculateShadowCompletion(searchQuery.value);
};

// 处理搜索框失焦
const handleSearchBlur = () => {
	// 失焦时清空阴影补全
	shadowCompletion.value = "";
};

// 处理Tab键补全
const handleTabCompletion = () => {
	// 如果有阴影补全内容，进行补全
	if (shadowCompletion.value) {
		searchQuery.value += shadowCompletion.value;
		shadowCompletion.value = "";
		// 更新新的阴影补全
		shadowCompletion.value = calculateShadowCompletion(searchQuery.value);
	}
};

// 处理统计标签点击 - 只影响显示过滤，不影响搜索范围
const handleStatsTagClick = (dataSource: string) => {
	if (dataSource === "all") {
		// 点击总结果标签，清空显示过滤（显示全部）
		displayFilters.value = [];
	} else {
		// 将UI标识符转换为数据类型名称
		const typeMapping: Record<string, string> = {
			bookmarks: "bookmark",
			history: "history",
			downloads: "download",
		};

		const actualType = typeMapping[dataSource];
		if (!actualType) return;

		// 切换选择状态（支持多选）
		const index = displayFilters.value.indexOf(actualType);
		if (index > -1) {
			// 如果已选中，则取消选择
			displayFilters.value.splice(index, 1);
		} else {
			// 如果未选中，则添加选择
			displayFilters.value.push(actualType);
		}
	}
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
		// 清理DOM缓存
		cleanupCache();
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

// 监听搜索状态变化，在推荐内容和查询结果之间切换时清空过滤
watch(
	() => !!searchQuery.value,
	(hasQuery, wasQuery) => {
		// 当从有查询切换到无查询，或从无查询切换到有查询时，清空过滤
		if (hasQuery !== wasQuery) {
			selectedDomains.value = [];
			displayFilters.value = []; // 清空显示过滤器
			// 清理DOM缓存
			cleanupCache();
		}
	}
);

// 监听结果变化，清理过期缓存
watch(
	() => flattenedResults.value.length,
	() => {
		// 延迟清理缓存，确保DOM已更新
		nextTick(() => {
			cleanupCache();
		});
	}
);

// 监听搜索项变化，重置概述栏选择
watch(
	() => selectedDataSources.value,
	() => {
		// 当搜索项发生变化时，重置显示过滤器
		displayFilters.value = [];
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
const copyUrl = async (url: string) => {
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
	for (const group of Object.values(currentResults.value)) {
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
	// 如果书签对话框打开，优先处理对话框的键盘事件
	if (bookmarkDialog.show) {
		if (event.code === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			closeBookmarkDialog();
		}
		return; // 对话框打开时，不处理其他键盘事件
	}

	// 对于导航键，如果有修饰键，让Vue的事件处理器接管
	const isNavigationKey = [
		navigationConfig.down,
		navigationConfig.up,
		navigationConfig.open,
		navigationConfig.close,
	].includes(event.code);

	if (
		isNavigationKey &&
		(event.ctrlKey || event.altKey || event.shiftKey || event.metaKey)
	) {
		return;
	}

	// Tab键处理已移至专门的处理函数

	switch (event.code) {
		case navigationConfig.down:
			event.preventDefault();
			throttledHandleNavigation("down");
			break;
		case navigationConfig.up:
			event.preventDefault();
			throttledHandleNavigation("up");
			break;
		case navigationConfig.open:
			event.preventDefault();
			event.stopPropagation();
			if (selectedItem.value) {
				const item = findItemById(selectedItem.value);
				if (item) openItem(item);
			}
			break;
		case navigationConfig.close:
			// 如果有阴影补全，先清空阴影
			if (shadowCompletion.value) {
				shadowCompletion.value = "";
			} else {
				window.close();
			}
			break;
		case "KeyC":
			if (event.ctrlKey && selectedItem.value) {
				event.preventDefault();
				const item = findItemById(selectedItem.value);
				if (item && (item.type === "history" || item.type === "bookmark")) {
					copyUrl(item.url);
				}
			}
			break;
		case "KeyB":
			if (event.ctrlKey && selectedItem.value) {
				event.preventDefault();
				const item = findItemById(selectedItem.value);
				if (item && item.type === "history") {
					handleBookmarkAction(item);
				}
			}
			break;
		case "KeyF":
			if (event.ctrlKey && selectedItem.value) {
				event.preventDefault();
				const item = findItemById(selectedItem.value);
				if (item && item.type === "download") {
					showDownloadFile(item);
				}
			}
			break;
		case "KeyD":
			if (event.ctrlKey && selectedItem.value) {
				event.preventDefault();
				const item = findItemById(selectedItem.value);
				if (item && item.type === "history") {
					handleRemoveHistory(item);
				}
			}
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
	// 性能检测
	detectPerformance();

	// 初始化主题
	ThemeManager.init();
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
	// 初始化搜索选项（确保与selectedDataSources状态一致）
	updateSearchOptions();
	// 聚焦搜索框
	await nextTick();
	searchInput.value?.focus();
	// 更新输入框样式
	updateInputStyles();
	// 绑定键盘事件，使用捕获模式确保优先处理
	document.addEventListener("keydown", handleKeyDown, true);
	// 监听storage变化
	chrome.storage.onChanged.addListener(handleStorageChange);
});

// 组件卸载
onUnmounted(() => {
	// 清理防抖定时器
	if (searchTimeout.value !== null) {
		window.clearTimeout(searchTimeout.value);
	}
	// 清理滚动动画帧
	if (scrollAnimationFrame.value !== null) {
		cancelAnimationFrame(scrollAnimationFrame.value);
	}
	// 清理元素缓存
	elementCache.clear();

	document.removeEventListener("keydown", handleKeyDown, true);
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
	// 只处理搜索相关的逻辑，不处理已选中项的打开
	if (!selectedItem.value) {
		// 如果没有选中项，尝试打开第一个结果或执行搜索
		const firstGroup = Object.values(currentResults.value)[0];
		if (firstGroup && firstGroup.items.length > 0) {
			const firstItem = firstGroup.items[0];
			if (firstItem) {
				openItem(firstItem);
			}
		} else {
			handleSearchNow();
		}
	}
	// 如果有选中项，让键盘导航处理器处理
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

// 提取域名
const extractDomain = (url: string): string => {
	try {
		const parsedUrl = new URL(url);
		return parsedUrl.hostname;
	} catch (error) {
		console.error("提取域名失败:", error);
		return url;
	}
};
</script>
