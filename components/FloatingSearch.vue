<template>
  <div class="floating-search-overlay" v-if="isVisible" @click="closeFloatingSearch">
    <div class="floating-search-container" @click.stop>
      <!-- 搜索框 -->
      <div class="search-box">
        <input
          ref="searchInput"
          v-model="searchQuery"
          type="text"
          placeholder="搜索收藏夹、历史记录和下载文件..."
          class="search-input"
          @input="debouncedSearch"
          @keydown.escape="closeFloatingSearch"
          @keydown.arrow-down.prevent="navigateDown"
          @keydown.arrow-up.prevent="navigateUp"
          @keydown.enter.prevent="openSelectedItem"
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

      <!-- 空状态 -->
      <div v-else-if="searchQuery && !isLoading" class="empty-state">
        <p>未找到匹配的结果</p>
      </div>

      <!-- 使用提示 -->
      <div class="usage-hints">
        <span>↑↓ 选择</span>
        <span>Enter 打开</span>
        <span>Esc 关闭</span>
      </div>
    </div>

    <!-- 书签对话框 -->
    <UnifiedBookmarkDialog
      :show="showBookmarkDialog"
      :dialog="bookmarkDialogState"
      @close="closeBookmarkDialog"
      @save="saveBookmark"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useContentSearch } from '../utils/composables/useContentSearch';
import { useUI } from '../utils/composables/useUI';
import { useNotification } from '../utils/composables/useNotification';
import { APP_CONSTANTS } from '../utils/constants';
import type { SearchResultItem } from '../utils/types';
import SearchResultItemComponent from './SearchResultItem.vue';
import UnifiedBookmarkDialog from './UnifiedBookmarkDialog.vue';

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
  showDownloadItem
} = useContentSearch();

const isVisible = ref(false);
const selectedItem = ref<string | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const searchTimeout = ref<number | null>(null);

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
    });
  } else {
    searchQuery.value = '';
    searchResults.value = {};
    selectedItem.value = null;
  }
};

// 关闭浮动搜索
const closeFloatingSearch = () => {
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
  if (!selectedItem.value) return;
  
  const items = getAllItems();
  const item = items.find(item => item.id === selectedItem.value);
  if (item) {
    handleSelectItem(item);
  }
};

const getAllItems = (): SearchResultItem[] => {
  const items: SearchResultItem[] = [];
  Object.values(searchResults.value).forEach(group => {
    items.push(...group.items.slice(0, 5));
  });
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
      show: true,
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

// 组件挂载和卸载
onMounted(() => {
  console.log("FloatingSearch 组件已挂载");
  // 监听全局事件
  window.addEventListener('toggle-floating-search', () => {
    console.log("FloatingSearch 收到全局事件，切换显示状态");
    toggleFloatingSearch();
  });
  console.log("全局事件监听器已注册");
});

onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  console.log("FloatingSearch 组件已卸载");
  // 移除全局事件监听器
  window.removeEventListener('toggle-floating-search', toggleFloatingSearch);
});
</script>

<style scoped>
.floating-search-overlay {
  @apply fixed top-0 left-0 w-screen h-screen bg-primary bg-opacity-15 backdrop-blur-lg z-modal flex-center fade-in;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  pointer-events: auto !important;
}

.floating-search-container {
  @apply bg-white rounded-xl shadow-2xl w-90% max-w-2xl max-h-80vh overflow-hidden slide-up;
}

.search-box {
  @apply flex items-center p-5 border-b border-gray-200;
}

.search-input {
  @apply flex-1 p-3 border-2 border-gray-200 rounded-lg text-base outline-none transition-colors;
}

.search-input:focus {
  @apply border-primary;
}

.search-button {
  @apply gradient-primary border-none rounded-full w-11 h-11 ml-3 cursor-pointer text-lg text-white flex-center transition-transform;
}

.search-button:hover {
  @apply scale-105;
}

.search-options {
  @apply flex gap-4 p-3 px-5 bg-gray-50 border-b border-gray-200;
}

.checkbox-label {
  @apply flex items-center gap-1.5 cursor-pointer text-sm text-gray-600;
}

.checkbox-label input[type="checkbox"] {
  @apply w-4 h-4;
}

.search-results {
  @apply max-h-100 overflow-y-auto custom-scrollbar;
}

.results-container {
  @apply p-4;
}

.domain-group {
  @apply mb-5;
}

.domain-header {
  @apply flex items-center gap-2 p-2 px-3 bg-gray-100 rounded-lg mb-2;
}

.domain-favicon {
  @apply w-4 h-4 rounded-sm;
}

.domain-name {
  @apply flex-1 font-medium text-gray-700;
}

.result-count {
  @apply bg-primary text-white px-2 py-0.5 rounded-full text-xs font-medium;
}

.results-list {
  @apply flex flex-col gap-1;
}

.empty-state {
  @apply p-10 text-center text-gray-500;
}

.usage-hints {
  @apply flex gap-4 p-3 px-5 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 justify-center;
}
</style> 