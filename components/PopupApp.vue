<template>
  <div class="popup-container">
    <!-- 搜索头部 -->
    <div class="search-header">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索收藏夹和历史记录..."
          class="search-input"
          autocomplete="off"
          @input="handleSearch"
          @keydown.enter="handleSearch"
          ref="searchInput"
        />
      </div>
      
      <!-- 搜索选项 -->
      <div class="search-options">
        <label class="option-item">
          <input v-model="searchOptions.includeBookmarks" type="checkbox" />
          <span>书签</span>
        </label>
        <label class="option-item">
          <input v-model="searchOptions.includeHistory" type="checkbox" />
          <span>历史记录</span>
        </label>
        <span class="sort-label">排序规则：</span>
        <select v-model="searchOptions.sortBy" class="sort-select">
          <option value="relevance">相关性</option>
          <option value="recent">最近访问</option>
          <option value="frequency">访问频率</option>
        </select>
        <button 
          class="open-new-tab-btn"
          @click="openInNewTab"
          title="在新标签页打开"
        >
          ↗ 新标签页打开此窗口
        </button>
      </div>
    </div>

    <!-- 搜索统计 -->
    <div v-if="searchStats" class="search-stats">
      <span>找到 {{ searchStats.totalResults }} 个结果</span>
      <span v-if="searchStats.bookmarkCount > 0">（书签 {{ searchStats.bookmarkCount }}）</span>
      <span v-if="searchStats.historyCount > 0">（历史 {{ searchStats.historyCount }}）</span>
      <span>{{ searchStats.uniqueDomains }} 个域名</span>
      <span class="search-time">{{ searchStats.searchTime }}ms</span>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner">⏳</div>
      <span>搜索中...</span>
    </div>

    <!-- 搜索结果 -->
    <div v-else-if="hasResults" class="results-container">
      <div
        v-for="(group, domain) in searchResults"
        :key="domain"
        class="domain-group"
      >
        <div class="domain-header">
          <img :src="getFaviconUrl(String(domain))" :alt="String(domain)" class="domain-favicon" />
          <span class="domain-name">{{ domain }}</span>
          <span class="domain-count">({{ group.totalCount }})</span>
        </div>
        
        <div class="result-items">
          <div
            v-for="item in group.items"
            :key="item.id"
            class="result-item"
            :class="{ 'selected': selectedItem === item.id }"
            @click="selectAndOpenItem(item)"
          >
            <div class="item-icon">
              {{ item.type === 'bookmark' ? '🔖' : '🕒' }}
            </div>
            <div class="item-content">
              <div class="item-title" :title="item.title">{{ item.title }}</div>
              <div class="item-url" :title="item.url">{{ item.url }}</div>
              <div class="item-meta">
                <span v-if="item.folderName" class="folder-name">📁 {{ item.folderName }}</span>
                <span v-if="item.visitCount" class="visit-count">{{ item.visitCount }} 次访问</span>
                <span v-if="item.lastVisited" class="last-visited">
                  {{ formatDate(item.lastVisited) }}
                </span>
              </div>
            </div>
            <div class="item-actions">
              <button 
                v-if="item.type === 'history'"
                @click.stop="showBookmarkDialog(item)"
                class="bookmark-btn"
                title="添加到书签"
              >
                ⭐ 添加到收藏夹
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="searchQuery && !isLoading" class="empty-state">
      <div class="empty-icon">🔍</div>
      <div class="empty-message">未找到匹配的结果</div>
      <div class="empty-suggestion">尝试不同的关键词或调整搜索选项</div>
    </div>

    <!-- 初始状态 -->
    <div v-else class="initial-state">
      <div class="welcome-tips">
        <div>💡 支持模糊搜索</div>
        <div>💡 结果按域名分组显示</div>
        <div>💡 单击直接打开链接</div>
        <div>💡 历史记录可添加到书签</div>
      </div>
    </div>

    <!-- 快捷键提示 -->
    <div class="shortcuts">
      <span>Enter 打开</span>
      <span>↑↓ 选择</span>
      <span>Esc 关闭</span>
    </div>
  </div>

  <!-- 书签对话框 -->
  <div v-if="bookmarkDialog.show" class="bookmark-dialog-overlay" @click="closeBookmarkDialog">
    <div class="bookmark-dialog" @click.stop>
      <h3>添加到书签</h3>
      <div class="bookmark-form">
        <div class="form-group">
          <label for="bookmark-title">标题：</label>
          <input 
            id="bookmark-title"
            v-model="bookmarkDialog.title" 
            type="text" 
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label for="bookmark-url">URL：</label>
          <input 
            id="bookmark-url"
            v-model="bookmarkDialog.url" 
            type="text" 
            class="form-input"
            readonly
          />
        </div>
        <div class="form-group">
          <label for="bookmark-folder">文件夹：</label>
          <select id="bookmark-folder" v-model="bookmarkDialog.parentId" class="form-select">
            <option value="">请选择文件夹</option>
            <option 
              v-for="folder in bookmarkFolders" 
              :key="folder.id" 
              :value="folder.id"
            >
              {{ folder.title }}
            </option>
          </select>
        </div>
      </div>
      <div class="dialog-actions">
        <button @click="closeBookmarkDialog" class="btn btn-cancel">取消</button>
        <button @click="saveBookmark" class="btn btn-primary">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/// <reference types="chrome" />
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { searchBookmarksAndHistory, openUrl, getFaviconUrl } from '../utils/search';
import type { 
  GroupedSearchResults, 
  SearchOptions, 
  SearchStats, 
  SearchResultItem 
} from '../utils/types';

// 响应式数据
const searchQuery = ref('');
const searchResults = ref<GroupedSearchResults>({});
const searchStats = ref<SearchStats | null>(null);
const isLoading = ref(false);
const selectedItem = ref<string | null>(null);
const searchInput = ref<HTMLInputElement>();

// 书签对话框状态
const bookmarkDialog = reactive({
  show: false,
  title: '',
  url: '',
  parentId: '',
  item: null as SearchResultItem | null
});

// 书签文件夹列表
const bookmarkFolders = ref<{id: string, title: string}[]>([]);

// 搜索选项
const searchOptions = reactive<SearchOptions>({
  query: '',
  includeBookmarks: true,
  includeHistory: true,
  maxResults: 50,
  sortBy: 'relevance'
});

// 计算属性
const hasResults = computed(() => {
  return Object.keys(searchResults.value).length > 0;
});

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
      query: searchQuery.value.trim()
    };
    
    const { results, stats } = await searchBookmarksAndHistory(options);
    searchResults.value = results;
    searchStats.value = stats;
  } catch (error) {
    console.error('搜索失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 监听搜索选项变化
watch(searchOptions, () => {
  if (searchQuery.value.trim()) {
    handleSearch();
  }
}, { deep: true });

// 回车处理
const handleEnter = () => {
  if (selectedItem.value) {
    const item = findItemById(selectedItem.value);
    if (item) {
      openItem(item);
    }
  } else {
    // 打开第一个结果
    const firstGroup = Object.values(searchResults.value)[0];
    if (firstGroup && firstGroup.items.length > 0) {
      openItem(firstGroup.items[0]);
    }
  }
};

// 选择并打开项目（单击）
const selectAndOpenItem = (item: SearchResultItem) => {
  selectedItem.value = item.id;
  openItem(item);
};

// 打开项目
const openItem = async (item: SearchResultItem) => {
  await openUrl(item.url);
  window.close(); // 关闭弹窗
};

// 根据ID查找项目
const findItemById = (itemId: string): SearchResultItem | null => {
  for (const group of Object.values(searchResults.value)) {
    const item = group.items.find(item => item.id === itemId);
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
    return date.toLocaleDateString('zh-CN');
  }
};

// 显示书签对话框
const showBookmarkDialog = (item: SearchResultItem) => {
  bookmarkDialog.item = item;
  bookmarkDialog.title = item.title;
  bookmarkDialog.url = item.url;
  bookmarkDialog.parentId = '';
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

// 保存书签
const saveBookmark = async () => {
  if (!bookmarkDialog.title || !bookmarkDialog.url) {
    alert('请填写标题和URL');
    return;
  }
  
  try {
    const bookmarkData: chrome.bookmarks.CreateDetails = {
      title: bookmarkDialog.title,
      url: bookmarkDialog.url
    };
    
    if (bookmarkDialog.parentId) {
      bookmarkData.parentId = bookmarkDialog.parentId;
    }
    
    await chrome.bookmarks.create(bookmarkData);
    alert('书签添加成功！');
    closeBookmarkDialog();
  } catch (error) {
    console.error('添加书签失败:', error);
    alert('添加书签失败，请重试');
  }
};

// 获取书签文件夹
const loadBookmarkFolders = async () => {
  try {
    const bookmarks = await chrome.bookmarks.getTree();
    const folders: {id: string, title: string}[] = [];
    
    const traverseBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[], depth = 0) => {
      for (const node of nodes) {
        if (!node.url) { // 文件夹
          const prefix = '  '.repeat(depth);
          folders.push({
            id: node.id,
            title: `${prefix}${node.title || '未命名文件夹'}`
          });
          if (node.children) {
            traverseBookmarks(node.children, depth + 1);
          }
        }
      }
    };
    
    traverseBookmarks(bookmarks);
    bookmarkFolders.value = folders;
  } catch (error) {
    console.error('获取书签文件夹失败:', error);
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
  
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      const nextIndex = currentIndex < allItems.length - 1 ? currentIndex + 1 : 0;
      selectedItem.value = allItems[nextIndex].id;
      // 滚动到可见区域
      document.querySelector(`[data-id="${allItems[nextIndex].id}"]`)?.scrollIntoView({
        block: 'nearest'
      });
      break;
    case 'ArrowUp':
      event.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : allItems.length - 1;
      selectedItem.value = allItems[prevIndex].id;
      // 滚动到可见区域
      document.querySelector(`[data-id="${allItems[prevIndex].id}"]`)?.scrollIntoView({
        block: 'nearest'
      });
      break;
    case 'Enter':
      if (selectedItem.value) {
        const item = findItemById(selectedItem.value);
        if (item) openItem(item);
      }
      break;
    case 'Escape':
      window.close();
      break;
  }
};

// 组件挂载
onMounted(async () => {
  // 聚焦搜索框
  await nextTick();
  searchInput.value?.focus();
  
  // 绑定键盘事件
  document.addEventListener('keydown', handleKeyDown);
  
  // 加载书签文件夹
  await loadBookmarkFolders();
});

// 在新标签页打开搜索界面
const openInNewTab = () => {
  const params = new URLSearchParams();
  params.set('q', searchQuery.value);
  params.set('bookmarks', searchOptions.includeBookmarks.toString());
  params.set('history', searchOptions.includeHistory.toString());
  params.set('sort', searchOptions.sortBy);
  
  chrome.tabs.create({
    url: chrome.runtime.getURL(`newtab.html?${params.toString()}`)
  });
};

// 导出函数供模板使用
defineExpose({
  getFaviconUrl,
  openInNewTab
});
</script>

<style lang="less" scoped>
@import '../entrypoints/styles/popup.less';

// 仅保留对话框相关样式
.bookmark-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.bookmark-dialog {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
  
  h3 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 16px;
  }
}

.bookmark-form {
  margin-bottom: 16px;
  
  .form-group {
    margin-bottom: 12px;
    
    label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      color: #333;
      font-size: 12px;
    }
  }
}

.form-input, .form-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
}

.dialog-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  
  .btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
    
    &-cancel {
      background: #6c757d;
      color: white;
      
      &:hover {
        background: #5a6268;
      }
    }
    
    &-primary {
      background: #667eea;
      color: white;
      
      &:hover {
        background: #5a67d8;
      }
    }
  }
}
</style>
