<template>
  <div class="element-popup-container" :class="{ 'newtab-mode': isNewTabMode }">
    <!-- 固定头部区域 -->
    <div class="fixed-header">
      <!-- 搜索栏 -->
      <div class="search-section">
        <div class="search-input-container">
          <el-input
            ref="searchInput"
            v-model="searchQuery"
            class="search-input"
            size="large"
            placeholder="搜索收藏夹、历史记录和下载..."
            clearable
            @input="handleSearchInput"
            @keyup.enter="handleSearchNow"
          >
            <template #prefix>
              <el-icon class="search-icon">
                <Search />
              </el-icon>
            </template>
          </el-input>
          
          <el-button
            type="primary"
            size="large"
            class="search-button"
            @click="handleSearchNow"
          >
            搜索
          </el-button>
        </div>

        <!-- 搜索选项 -->
        <div class="search-options">
          <div class="option-group">
            <el-checkbox v-model="searchOptions.includeBookmarks" size="small">
              收藏夹
            </el-checkbox>
            <el-checkbox v-model="searchOptions.includeHistory" size="small">
              历史记录
            </el-checkbox>
            <el-checkbox v-model="searchOptions.includeDownloads" size="small">
              下载记录
            </el-checkbox>
          </div>
          
          <div class="control-group">
            <el-select
              v-model="searchOptions.sortBy"
              size="small"
              class="sort-select"
              @change="handleSearchNow"
            >
              <el-option label="按访问时间" value="visitTime" />
              <el-option label="按标题" value="title" />
              <el-option label="按域名" value="domain" />
            </el-select>
            
            <el-select
              v-model="searchOptions.maxResults"
              size="small"
              class="limit-select"
              @change="handleSearchNow"
            >
              <el-option label="显示50个" :value="50" />
              <el-option label="显示100个" :value="100" />
              <el-option label="显示200个" :value="200" />
              <el-option label="显示500个" :value="500" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div v-if="hasResults" class="action-bar">
        <div class="result-stats">
          <span class="total-count">
            共找到 {{ totalResults }} 个结果，按域名分组显示
          </span>
        </div>
        
        <div class="action-buttons">
          <el-button
            size="small"
            @click="openInNewTab"
          >
            在新标签页中打开
          </el-button>
          
          <el-button
            size="small"
            @click="openSettings"
          >
            设置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 可滚动内容区域 -->
    <div class="scrollable-content">
      <!-- 搜索结果 -->
      <div v-if="hasResults" class="search-results">
        <div
          v-for="(group, domain) in searchResults"
          :key="domain"
          class="domain-group"
        >
          <!-- 域名头部 -->
          <div class="domain-header">
            <img
              :src="getFaviconUrl(String(domain))"
              :alt="String(domain)"
              class="domain-favicon"
              @error="($event.target as HTMLImageElement).src = '/icon/16.png'"
            />
            <span class="domain-name">{{ domain }}</span>
            <el-tag size="small" class="result-count">
              {{ group.items.length }} 个结果
            </el-tag>
          </div>
          
          <!-- 结果列表 -->
          <div class="results-list">
            <SearchResultItem
              v-for="item in group.items"
              :key="item.id"
              :item="item"
              :query="searchQuery"
              :is-selected="selectedItem === item.id"
              :data-id="item.id"
              @open="openItem"
              @click="selectedItem = item.id"
              @bookmark="showBookmarkDialog"
              @showFile="showDownloadFile"
              @copy="handleCopy"
            />
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="searchQuery && !isSearching" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">没有找到相关结果</h3>
        <p class="empty-description">
          尝试使用不同的关键词，或检查搜索选项设置
        </p>
        <div class="empty-suggestions">
          <p>搜索建议：</p>
          <ul>
            <li>使用简短的关键词</li>
            <li>检查拼写是否正确</li>
            <li>尝试使用同义词</li>
            <li>确保已选择相应的搜索范围</li>
          </ul>
        </div>
      </div>

      <!-- 初始状态 -->
      <div v-else-if="!searchQuery" class="welcome-state">
        <div class="welcome-content">
          <div class="welcome-icon">🎯</div>
          <h2 class="welcome-title">快速搜索您的浏览数据</h2>
          <p class="welcome-description">
            在上方输入关键词，搜索您的收藏夹、历史记录和下载文件
          </p>
          
          <div class="feature-list">
            <div class="feature-item">
              <span class="feature-icon">⚡</span>
              <span>智能模糊搜索</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📁</span>
              <span>按域名分组显示</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">⌨️</span>
              <span>快捷键导航</span>
            </div>
          </div>

          <div class="search-history" v-if="searchHistory.length > 0">
            <h4>最近搜索</h4>
            <div class="history-tags">
              <el-tag
                v-for="(term, index) in searchHistory.slice(0, 5)"
                :key="index"
                class="history-tag"
                @click="searchQuery = term.query; handleSearchNow()"
              >
                {{ term.query }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="isSearching" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在搜索...</p>
      </div>
    </div>

    <!-- 书签对话框 -->
    <UnifiedBookmarkDialog
      :show="bookmarkDialog.show"
      :dialog="bookmarkDialog"
      @close="closeBookmarkDialog"
      @save="handleBookmarkSave"
    />
  </div>
</template>

<script setup lang="ts">
/// <reference types="chrome" />
import {
  Search
} from '@element-plus/icons-vue';
import SearchResultItem from './SearchResultItem.vue';
import UnifiedBookmarkDialog from './UnifiedBookmarkDialog.vue';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import {
  formatFileSize,
  getFaviconUrl,
  openDownloadFile,
  openUrl,
  searchBookmarksAndHistory,
  SearchHistoryManager,
  showDownloadFile as showDownloadFileInExplorer
} from '../utils/search';
import { formatShortcut, getNavigationKeys, getShortcut } from '../utils/shortcuts.ts';
import type {
  GroupedSearchResults,
  SearchHistoryItem,
  SearchOptions,
  SearchResultItem as SearchResultItemType,
  SearchStats
} from '../utils/types';

// 检测是否为新标签页模式
const isNewTabMode = computed(() => {
  return window.location.pathname.includes('single_tab.html');
});

// 响应式数据
const searchQuery = ref('');
const searchResults = ref<GroupedSearchResults>({});
const searchStats = ref<SearchStats | null>(null);
const isSearching = ref(false);
const selectedItem = ref<string | null>(null);
const searchInput = ref<HTMLInputElement>();
const searchHistory = ref<SearchHistoryItem[]>([]);

// 防抖相关
const searchTimeout = ref<number | null>(null);
const DEBOUNCE_DELAY = 300; 

// 快捷键显示
const mainShortcut = ref('');
const navigationKeys = ref(getNavigationKeys());

// 键盘导航配置（从设置中加载）
const navigationConfig = reactive({
  up: 'ArrowUp',
  down: 'ArrowDown',
  open: 'Enter',
  close: 'Escape'
});

// 书签对话框状态
const bookmarkDialog = reactive({
  show: false,
  title: '',
  url: '',
  parentId: '',
  item: null as SearchResultItemType | null
});

// 搜索选项
const searchOptions = reactive<SearchOptions>({
  query: '',
  includeBookmarks: true,
  includeHistory: true,
  includeDownloads: true,
  maxResults: 50,
  sortBy: 'relevance',
  timeFilter: 'all'
});

// 计算属性
const hasResults = computed(() => {
  return Object.keys(searchResults.value).length > 0;
});

const totalResults = computed(() => {
  return Object.values(searchResults.value).reduce((total, group) => total + group.items.length, 0);
});

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

  isSearching.value = true;
  
  try {
    const options = {
      ...searchOptions,
      query: searchQuery.value.trim()
    };
    
    const { results, stats } = await searchBookmarksAndHistory(options);
    searchResults.value = results;
    searchStats.value = stats;
    
    // 保存搜索历史
    await SearchHistoryManager.saveSearchHistory(searchQuery.value.trim());
    await loadSearchHistory();
  } catch (error) {
    console.error('搜索失败:', error);
  } finally {
    isSearching.value = false;
  }
};

// 加载搜索历史
const loadSearchHistory = async () => {
  try {
    searchHistory.value = await SearchHistoryManager.getSearchHistory();
  } catch (error) {
    console.error('加载搜索历史失败:', error);
  }
};

// 监听搜索选项变化
watch(() => [searchOptions.timeFilter, searchOptions.sortBy, searchOptions.includeBookmarks, searchOptions.includeHistory, searchOptions.includeDownloads], () => {
  if (searchQuery.value.trim()) {
    handleSearchNow();
  }
}, { deep: true });

// 选择并打开项目
const openItem = async (item: SearchResultItemType) => {
  if (item.type === 'download') {
    await openDownloadFile(item.id);
  } else {
    await openUrl(item.url);
    window.close(); // 关闭弹窗
  }
};

// 显示下载文件
const showDownloadFile = async (item: SearchResultItemType) => {
  await showDownloadFileInExplorer(item.id);
};

// 复制URL
const handleCopy = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    console.log('URL已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
  }
};

// 获取书签栏ID的辅助函数
const getBookmarkBarId = (bookmarks: chrome.bookmarks.BookmarkTreeNode[]): string | null => {
  // 书签栏通常是第一个根级别文件夹
  for (const node of bookmarks) {
    if (node.children) {
      for (const child of node.children) {
        if (child.title === '书签栏' || child.title === 'Bookmarks bar' || child.title === 'Bookmarks') {
          return child.id;
        }
      }
      // 如果没找到特定名称，返回第一个文件夹（通常是书签栏）
      if (node.children.length > 0 && !node.children[0].url) {
        return node.children[0].id;
      }
    }
  }
  return null;
};

// 显示书签对话框
const showBookmarkDialog = async (item: SearchResultItemType) => {
  bookmarkDialog.item = item;
  bookmarkDialog.title = item.title;
  bookmarkDialog.url = item.url;
  
  // 恢复上次选择的文件夹，如果没有则默认选择书签栏
  try {
    const result = await chrome.storage.local.get(['lastSelectedFolder']);
    const lastFolder = result.lastSelectedFolder;
    
    if (lastFolder) {
      bookmarkDialog.parentId = lastFolder;
    } else {
      // 获取书签栏ID
      const bookmarks = await chrome.bookmarks.getTree();
      const bookmarkBarId = getBookmarkBarId(bookmarks);
      bookmarkDialog.parentId = bookmarkBarId || '';
    }
  } catch (error) {
    console.error('获取上次选择的文件夹失败:', error);
    // 默认选择书签栏
    try {
      const bookmarks = await chrome.bookmarks.getTree();
      const bookmarkBarId = getBookmarkBarId(bookmarks);
      bookmarkDialog.parentId = bookmarkBarId || '';
    } catch (err) {
      console.error('获取书签栏失败:', err);
      bookmarkDialog.parentId = '';
    }
  }
  
  bookmarkDialog.show = true;
};

// 关闭书签对话框
const closeBookmarkDialog = () => {
  bookmarkDialog.show = false;
  bookmarkDialog.title = '';
  bookmarkDialog.url = '';
  bookmarkDialog.parentId = '';
  bookmarkDialog.item = null;
};

// 处理书签保存
const handleBookmarkSave = async (data: { title: string; url: string; parentId: string }) => {
  try {
    const bookmarkData: chrome.bookmarks.CreateDetails = {
      title: data.title,
      url: data.url
    };
    
    if (data.parentId) {
      bookmarkData.parentId = data.parentId;
      // 保存用户选择的文件夹
      await chrome.storage.local.set({ lastSelectedFolder: data.parentId });
    }
    
    await chrome.bookmarks.create(bookmarkData);
    closeBookmarkDialog();
    console.log('书签添加成功！');
  } catch (error) {
    console.error('添加书签失败:', error);
    throw error;
  }
};

// 加载快捷键配置
const loadShortcutConfig = async () => {
  try {
    // 加载主快捷键
    const shortcut = await getShortcut('_execute_action');
    mainShortcut.value = formatShortcut(shortcut);
    
    // 可选：加载备用快捷键
    const altShortcut = await getShortcut('open-search-alt');
    if (altShortcut && !mainShortcut.value) {
      mainShortcut.value = formatShortcut(altShortcut);
    }
  } catch (error) {
    console.error('加载快捷键配置失败:', error);
    mainShortcut.value = 'Ctrl+Shift+S'; // 默认值
  }
};

// 加载搜索设置
const loadSearchSettings = async () => {
  try {
    const result = await chrome.storage.local.get(['searchSettings']);
    if (result.searchSettings) {
      // 应用搜索设置到当前的搜索选项
      if (result.searchSettings.defaultMaxResults) {
        (searchOptions as any).maxResults = Number(result.searchSettings.defaultMaxResults);
      }
      if (result.searchSettings.defaultSortBy) {
        (searchOptions as any).sortBy = result.searchSettings.defaultSortBy;
      }
      
      console.log('已加载搜索设置:', result.searchSettings);
    }
  } catch (error) {
    console.error('加载搜索设置失败:', error);
  }
};

// 加载导航设置
const loadNavigationSettings = async () => {
  try {
    const result = await chrome.storage.local.get(['navigationSettings']);
    if (result.navigationSettings) {
      Object.assign(navigationConfig, result.navigationSettings);
      console.log('已加载导航设置:', result.navigationSettings);
    }
  } catch (error) {
    console.error('加载导航设置失败:', error);
  }
};

// 键盘导航
const handleKeyDown = (event: KeyboardEvent) => {
  if (!hasResults.value) return;
  
  const allItems = Object.values(searchResults.value)
    .flatMap(group => group.items);
  
  if (!allItems.length) return;
  
  const currentIndex = selectedItem.value ? 
    allItems.findIndex(item => item.id === selectedItem.value) : -1;
  
  switch (event.code) {
    case navigationConfig.down:
      event.preventDefault();
      const nextIndex = currentIndex < allItems.length - 1 ? currentIndex + 1 : 0;
      selectedItem.value = allItems[nextIndex].id;
      // 滚动到可见区域，但确保在可滚动容器内
      const nextElement = document.querySelector(`[data-id="${allItems[nextIndex].id}"]`);
      if (nextElement) {
        const scrollableContainer = document.querySelector('.scrollable-content');
        if (scrollableContainer) {
          const containerRect = scrollableContainer.getBoundingClientRect();
          const elementRect = nextElement.getBoundingClientRect();
          
          if (elementRect.bottom > containerRect.bottom) {
            nextElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
          } else if (elementRect.top < containerRect.top) {
            nextElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
          }
        }
      }
      break;
    case navigationConfig.up:
      event.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : allItems.length - 1;
      selectedItem.value = allItems[prevIndex].id;
      // 滚动到可见区域，但确保在可滚动容器内
      const prevElement = document.querySelector(`[data-id="${allItems[prevIndex].id}"]`);
      if (prevElement) {
        const scrollableContainer = document.querySelector('.scrollable-content');
        if (scrollableContainer) {
          const containerRect = scrollableContainer.getBoundingClientRect();
          const elementRect = prevElement.getBoundingClientRect();
          
          if (elementRect.top < containerRect.top) {
            prevElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
          } else if (elementRect.bottom > containerRect.bottom) {
            prevElement.scrollIntoView({ block: 'end', behavior: 'smooth' });
          }
        }
      }
      break;
    case navigationConfig.open:
      if (selectedItem.value) {
        const item = allItems.find(item => item.id === selectedItem.value);
        if (item) openItem(item);
      }
      break;
    case navigationConfig.close:
      window.close();
      break;
  }
};

// 监听storage变化
const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>) => {
  // 监听搜索设置变化
  if (changes.searchSettings) {
    const newSettings = changes.searchSettings.newValue;
    if (newSettings) {
      if (newSettings.defaultMaxResults) {
        (searchOptions as any).maxResults = Number(newSettings.defaultMaxResults);
      }
      if (newSettings.defaultSortBy) {
        (searchOptions as any).sortBy = newSettings.defaultSortBy;
      }
      console.log('搜索设置已更新:', newSettings);
      
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
      console.log('导航设置已更新:', newSettings);
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
  
  // 聚焦搜索框
  await nextTick();
  searchInput.value?.focus();
  
  // 绑定键盘事件
  document.addEventListener('keydown', handleKeyDown);
  
  // 监听storage变化
  chrome.storage.onChanged.addListener(handleStorageChange);
});

// 组件卸载
onUnmounted(() => {
  // 清理防抖定时器
  if (searchTimeout.value !== null) {
    window.clearTimeout(searchTimeout.value);
  }
  
  document.removeEventListener('keydown', handleKeyDown);
  chrome.storage.onChanged.removeListener(handleStorageChange);
});

// 打开设置页面
const openSettings = () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('settings.html')
  });
};

// 在新标签页打开搜索界面
const openInNewTab = () => {
  const params = new URLSearchParams();
  params.set('q', searchQuery.value);
  params.set('bookmarks', searchOptions.includeBookmarks.toString());
  params.set('history', searchOptions.includeHistory.toString());
  params.set('downloads', searchOptions.includeDownloads.toString());
  params.set('sort', searchOptions.sortBy);
  params.set('time', searchOptions.timeFilter);
  
  chrome.tabs.create({
    url: chrome.runtime.getURL(`single_tab.html?${params.toString()}`)
  });
};

// 导出函数供模板使用
defineExpose({
  getFaviconUrl,
  formatFileSize,
  openInNewTab
});
</script>

<style>
/* 引入UnoCSS样式 */
@import '../entrypoints/styles/uno.css';

/* 全局Element Plus样式定制 */
.element-popup-container {
  @apply w-195 max-h-138 p-0 overflow-hidden bg-bg text-text font-sans font-normal rounded shadow border border-gray-200 flex flex-col;
}

.element-popup-container.newtab-mode {
  @apply w-full h-screen max-w-none max-h-none m-0 rounded-none shadow-none border-none;
}

.fixed-header {
  @apply flex-shrink-0 bg-bg border-b border-gray-200 z-10;
}

.scrollable-content {
  @apply flex-1 overflow-y-auto overflow-x-hidden bg-bg custom-scrollbar;
}

/* 搜索区域样式 */
.search-section {
  @apply p-4 space-y-3;
}

.search-input-container {
  @apply flex gap-3;
}

.search-input {
  @apply flex-1;
}

.search-button {
  @apply px-6;
}

.search-options {
  @apply flex justify-between items-center;
}

.option-group {
  @apply flex gap-4;
}

.control-group {
  @apply flex gap-2;
}

.sort-select, .limit-select {
  @apply w-24;
}

/* 操作栏样式 */
.action-bar {
  @apply flex justify-between items-center px-4 py-2 bg-gray-50 border-t border-gray-200;
}

.result-stats {
  @apply text-sm text-gray-600;
}

.action-buttons {
  @apply flex gap-2;
}

/* 搜索结果样式 */
.search-results {
  @apply p-4;
}

.domain-group {
  @apply mb-6;
}

.domain-header {
  @apply flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3;
}

.domain-favicon {
  @apply w-5 h-5 rounded-sm;
}

.domain-name {
  @apply flex-1 font-medium text-gray-700;
}

.result-count {
  @apply bg-primary text-white;
}

.results-list {
  @apply space-y-1;
}

/* 空状态样式 */
.empty-state {
  @apply p-12 text-center;
}

.empty-icon {
  @apply text-6xl mb-4;
}

.empty-title {
  @apply text-xl font-semibold text-gray-700 mb-2;
}

.empty-description {
  @apply text-gray-500 mb-6;
}

.empty-suggestions {
  @apply text-left max-w-md mx-auto text-sm text-gray-600;
}

.empty-suggestions ul {
  @apply list-disc list-inside space-y-1 mt-2;
}

/* 欢迎状态样式 */
.welcome-state {
  @apply p-12;
}

.welcome-content {
  @apply text-center max-w-md mx-auto;
}

.welcome-icon {
  @apply text-6xl mb-4;
}

.welcome-title {
  @apply text-2xl font-semibold text-gray-800 mb-3;
}

.welcome-description {
  @apply text-gray-600 mb-8;
}

.feature-list {
  @apply space-y-3 mb-8;
}

.feature-item {
  @apply flex items-center justify-center gap-2 text-gray-700;
}

.feature-icon {
  @apply text-lg;
}

.search-history h4 {
  @apply text-sm font-medium text-gray-700 mb-3;
}

.history-tags {
  @apply flex flex-wrap gap-2 justify-center;
}

.history-tag {
  @apply cursor-pointer hover:bg-primary hover:text-white transition-colors;
}

/* 加载状态样式 */
.loading-state {
  @apply p-12 text-center;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mx-auto mb-4;
}

/* Element Plus 组件样式定制 */
.el-input__wrapper {
  @apply bg-white border-2 border-gray-200 shadow-none;
}

.el-input__wrapper:hover {
  @apply border-primary;
}

.el-input__wrapper.is-focus {
  @apply border-primary shadow-sm;
}

.el-button--primary {
  @apply gradient-primary border-primary;
}
</style>
