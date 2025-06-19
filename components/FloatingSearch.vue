<template>
  <div class="floating-search-overlay" v-if="isVisible" @click="closeFloatingSearch">
    <div class="floating-search-container" @click.stop>
      <!-- 搜索框 -->
      <div class="search-box">
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="搜索本地文件，或按 Ctrl+Enter 进行网络搜索"
          class="search-input"
          @input="debouncedSearch"
          @keydown.escape="forceCloseAll"
          @keydown.arrow-down.prevent="navigateDown"
          @keydown.arrow-up.prevent="navigateUp"
          @keydown.enter.prevent="openSelectedItem"
          @keydown.ctrl.enter.prevent="performWebSearch"
        />
        <button class="search-button" @click="performSearchClick">
          🔍
        </button>
      </div>

      <!-- 搜索选项 -->
      <div class="search-options">
        <label class="checkbox-label">
          <input type="checkbox" value="bookmarks" v-model="selectedDataSources" />
          <span>书签</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" value="history" v-model="selectedDataSources" />
          <span>历史记录</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" value="downloads" v-model="selectedDataSources" />
          <span>下载文件</span>
        </label>
      </div>

      <!-- 搜索结果 -->
      <div class="search-results" v-if="Object.keys(searchResults).length > 0">
        <div class="results-container">
          <div v-for="(group, domain) in searchResults" :key="domain" class="domain-group">
            <div class="domain-header">
              <img :src="getSiteFaviconUrl(String(domain))" :alt="String(domain)" class="domain-favicon" />
              <span class="domain-name">{{ domain }}</span>
              <span class="result-count">{{ group.totalCount }}</span>
            </div>
            <div class="results-list">
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
            </div>
          </div>
        </div>
      </div>

      <!-- 网络搜索建议 -->
      <div v-if="searchQuery && !isLoading && Object.keys(searchResults).length === 0 && defaultSearchEngine" class="web-search-suggestion-float" @click="performWebSearch">
        <div class="suggestion-content">
          <img :src="getEngineIconUrl(defaultSearchEngine)" alt="icon" class="search-engine-icon" style="width:16px;height:16px;vertical-align:middle;" />
          <span class="suggestion-text">在 {{ defaultSearchEngine.name }} 中搜索 "{{ searchQuery }}"</span>
          <span class="action-hint">↵</span>
        </div>
      </div>
      
      <!-- 推荐内容 -->
      <div v-else-if="showRecommended" class="recommended-content">
        <div class="recommended-container">
          <div v-for="group in recommendedGroups" :key="group.type" class="recommended-group">
            <div class="group-header">
              <span class="group-icon">
                {{ group.type === 'history' ? '🕐' : group.type === 'bookmarks' ? '📚' : '📥' }}
              </span>
              <span class="group-title">{{ group.title }}</span>
              <span class="item-count">{{ group.items.length }}</span>
            </div>
            <div class="group-items">
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
            </div>
          </div>
        </div>
      </div>

      <!-- 推荐内容加载状态 -->
      <div v-else-if="isLoadingRecommended" class="loading-state">
        <p>正在加载推荐内容...</p>
      </div>

      <!-- 空状态 -->
      <div v-else-if="searchQuery && !isLoading" class="empty-state">
        <p>未找到匹配的结果</p>
        <p class="web-search-hint">
          可尝试 <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 进行网络搜索
        </p>
      </div>

      <!-- 使用提示 -->
      <div class="usage-hints">
        <span>↑↓ 选择</span>
        <span>Enter 打开</span>
        <span>Esc 关闭</span>
      </div>
    </div>

    <!-- 书签对话框 -->
    <BookmarkDialog
      :show="showBookmarkDialog"
      :dialog="bookmarkDialogState"
      @close="closeBookmarkDialog"
      @save="saveBookmark"
      @click.stop
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useContentSearch } from '../utils/composables/useContentSearch';
import { useUI } from '../utils/composables/useUI';
import { useNotification } from '../utils/composables/useNotification';
import { APP_CONSTANTS } from '../utils/constants';
import type { SearchResultItem, SearchEngine } from '../utils/types';
import SearchResultItemComponent from './SearchResultItem.vue';
import BookmarkDialog from './BookmarkDialog.vue';

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
  isLoadingRecommended
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
  title: '',
  url: '',
  parentId: '',
  item: null as SearchResultItem | null
});

// 监听全局消息
const handleMessage = (message: any) => {
  if (message.action === 'toggle-floating-search') {
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
    performSearch(searchQuery.value);
  }, APP_CONSTANTS.SEARCH.DEBOUNCE_DELAY);
};

// 搜索按钮点击
const performSearchClick = () => {
  performSearch(searchQuery.value);
};

// 监听数据源变化
watch(selectedDataSources, () => {
  updateSearchOptions();
  if (searchQuery.value.trim()) {
    performSearch(searchQuery.value);
  }
}, { deep: true });

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
    searchQuery.value = '';
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
  searchQuery.value = '';
  searchResults.value = {};
  selectedItem.value = null;
};

// 键盘导航
const navigateDown = () => {
  const items = getAllItems();
  if (items.length === 0) return;
  
  const currentIndex = selectedItem.value ? items.findIndex(item => item.id === selectedItem.value) : -1;
  const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
  selectedItem.value = items[nextIndex]?.id || null;
  scrollToSelectedItem();
};

const navigateUp = () => {
  const items = getAllItems();
  if (items.length === 0) return;
  
  const currentIndex = selectedItem.value ? items.findIndex(item => item.id === selectedItem.value) : -1;
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
  const item = items.find(item => item.id === selectedItem.value);
  if (item) {
    handleSelectItem(item);
  }
};

const getAllItems = (): SearchResultItem[] => {
  const items: SearchResultItem[] = [];
  
  // 如果有搜索结果，返回搜索结果
  if (Object.keys(searchResults.value).length > 0) {
    Object.values(searchResults.value).forEach(group => {
      items.push(...group.items.slice(0, 5));
    });
  } 
  // 如果显示推荐内容，返回推荐内容
  else if (showRecommended.value) {
    recommendedGroups.value.forEach(group => {
      items.push(...group.items.slice(0, 6));
    });
  }
  
  return items;
};

const scrollToSelectedItem = () => {
  if (!selectedItem.value) return;
  
  const element = document.querySelector(`[data-id="${selectedItem.value}"]`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

// 处理项目操作
const handleSelectItem = async (item: SearchResultItem) => {
  try {
    await openSearchItem(item, true);
    closeFloatingSearch();
  } catch (error) {
    console.error('打开项目失败:', error);
  }
};

const handleBookmarkItem = async (item: SearchResultItem) => {
  if (item.type !== 'history') return;
  
  try {
    bookmarkDialogState.value = {
      show: false,
      title: item.title,
      url: item.url,
      parentId: '',
      item: item
    };
    showBookmarkDialog.value = true;
  } catch (error) {
    console.error('显示书签对话框失败:', error);
  }
};

const handleShowFileItem = async (item: SearchResultItem) => {
  if (item.type !== 'download') return;
  
  try {
    await showDownloadItem(item);
  } catch (error) {
    console.error('显示文件失败:', error);
  }
};

const handleCopyItem = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    success('已复制到剪贴板');
  } catch (err) {
    console.error('复制失败:', err);
    showError('复制失败');
  }
};

const closeBookmarkDialog = () => {
  showBookmarkDialog.value = false;
};

// 强制关闭所有界面（ESC键使用）
const forceCloseAll = () => {
  showBookmarkDialog.value = false;
  isVisible.value = false;
  searchQuery.value = '';
  searchResults.value = {};
  selectedItem.value = null;
};

const saveBookmark = async (data: { title: string; url: string; parentId: string }) => {
  try {
    // 使用bookmarksApiWrapper来创建书签
    const { createBookmark } = await import('../utils/bookmarksApiWrapper');
    
    // 准备符合Chrome API的参数
    const bookmarkData: chrome.bookmarks.CreateDetails = {
      title: data.title,
      url: data.url
    };
    
    // 只有当parentId不为空时才添加
    if (data.parentId) {
      bookmarkData.parentId = data.parentId;
    }
    
    await createBookmark(bookmarkData);
    
    success('书签已保存');
    showBookmarkDialog.value = false;
  } catch (error) {
    console.error('保存书签失败:', error);
    showError('保存书签失败');
  }
};

// 执行网络搜索
const performWebSearch = async () => {
  if (!searchQuery.value.trim() || !defaultSearchEngine.value) {
    return;
  }
  try {
    await chrome.runtime.sendMessage({
      action: 'perform-web-search',
      engineId: defaultSearchEngine.value.id,
      query: searchQuery.value.trim(),
      inNewTab: true
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
    const settingsResult = await chrome.storage.local.get(['searchSettings']);
    const preferredId = settingsResult?.searchSettings?.preferredSearchEngine;
    if (preferredId) {
      // 2. 查所有可用引擎
      const allEnginesResp = await chrome.runtime.sendMessage({ action: 'get-all-search-engines' });
      if (allEnginesResp?.success && Array.isArray(allEnginesResp.engines)) {
        const found = allEnginesResp.engines.find((e: any) => e.id === preferredId);
        if (found) {
          defaultSearchEngine.value = found;
          return;
        }
      }
    }
    // 3. 没有设置或找不到，兜底用浏览器默认
    const response = await chrome.runtime.sendMessage({ action: 'get-default-search-engine' });
    if (response?.success && response.engine) {
      defaultSearchEngine.value = response.engine;
    } else {
      defaultSearchEngine.value = null;
    }
  } catch (error) {
    console.error('获取默认搜索引擎失败:', error);
    defaultSearchEngine.value = null;
  }
};

// 获取搜索引擎图标URL
const getEngineIconUrl = (engine: SearchEngine | null) => {
  if (!engine || !chrome?.runtime?.getURL) return '';
  switch (engine.id) {
    case 'baidu':
      return chrome.runtime.getURL('searchEngineIcon/baidu.png');
    case 'google':
      return chrome.runtime.getURL('searchEngineIcon/google.png');
    case 'bing':
      return chrome.runtime.getURL('searchEngineIcon/bing.png');
    default:
      return '';
  }
};

// 组件挂载和卸载
onMounted(() => {
  console.log("FloatingSearch 组件已挂载");
  // 监听全局事件
  chrome.runtime.onMessage.addListener(handleMessage);
  console.log("全局事件监听器已注册");
  // 新增：监听storage变化，变更时刷新默认搜索引擎
  chrome.storage.onChanged.addListener(handleStorageChange);
});

onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  console.log("FloatingSearch 组件已卸载");
  // 移除全局事件监听器
  chrome.runtime.onMessage.removeListener(handleMessage);
  // 新增：移除storage监听
  chrome.storage.onChanged.removeListener(handleStorageChange);
});

// 新增：storage变更回调，变更时刷新默认搜索引擎
const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>) => {
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
.floating-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(102, 126, 234, 0.15);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
  pointer-events: auto !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.floating-search-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

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

.search-box {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  border-color: #667eea;
}

.search-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  margin-left: 12px;
  cursor: pointer;
  font-size: 18px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.search-button:hover {
  transform: scale(1.05);
}

.search-options {
  display: flex;
  gap: 16px;
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #4a5568;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.results-container {
  padding: 16px;
}

.domain-group {
  margin-bottom: 20px;
}

.domain-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f1f5f9;
  border-radius: 8px;
  margin-bottom: 8px;
}

.domain-favicon {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.domain-name {
  flex: 1;
  font-weight: 500;
  color: #2d3748;
}

.result-count {
  background: #667eea;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #888;
  font-size: 14px;

  .web-search-hint {
    margin-top: 8px;
    font-size: 13px;
    color: #aaa;
  }

  kbd {
    background-color: #333;
    border-radius: 3px;
    border: 1px solid #555;
    color: #eee;
    padding: 2px 4px;
    font-size: 12px;
  }
}

.usage-hints {
  display: flex;
  gap: 16px;
  padding: 12px 20px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #718096;
  justify-content: center;
}

/* 推荐内容样式 */
.recommended-content {
  max-height: 60vh;
  overflow-y: auto;
}

.recommended-container {
  padding: 0 20px 20px;
}

.recommended-group {
  margin-bottom: 24px;
}

.recommended-group:last-child {
  margin-bottom: 0;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0 8px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 8px;
}

.group-icon {
  font-size: 16px;
}

.group-title {
  font-weight: 600;
  color: #334155;
  font-size: 14px;
  flex: 1;
}

.item-count {
  background: #f1f5f9;
  color: #64748b;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.group-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.loading-state {
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.loading-state p {
  margin: 0;
  font-size: 16px;
}

/* 浮动搜索特有样式 */
.web-search-suggestion-float {
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.web-search-suggestion-float:hover {
  background-color: #f0f2f5;
}

.suggestion-content {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.search-engine-icon {
  font-size: 16px;
}

.suggestion-text {
  flex: 1;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-hint {
  font-weight: bold;
  color: #667eea;
}
</style> 