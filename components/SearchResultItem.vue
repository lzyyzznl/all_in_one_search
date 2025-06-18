<template>
  <div
    class="result-item"
    :class="{ 'selected': isSelected, 'floating': isFloating }"
    :data-id="dataId || item.id"
    @click="handleClick"
    @keydown.enter="handleOpen"
    tabindex="0"
  >
    <div class="item-icon">
      {{ itemIcon }}
    </div>
    <div class="item-content">
      <div class="item-title" :title="item.title">{{ highlightedTitle }}</div>
      <div class="item-url" :title="item.url">{{ item.url }}</div>
      <div class="item-meta">
        <span v-if="item.folderName" class="folder-tag">
          📁 {{ item.folderName }}
        </span>
        <span v-if="item.visitCount && item.type !== 'download'" class="visit-count">
          {{ item.visitCount }} 次访问
        </span>
        <span v-if="item.fileSize && item.type === 'download'" class="file-size">
          {{ formattedFileSize }}
        </span>
        <span v-if="item.lastVisited" class="last-visited">
          {{ formattedDate }}
        </span>
        <span v-if="item.type === 'download' && !item.exists" class="file-missing">
          ⚠️ 文件不存在
        </span>
      </div>
    </div>
    <div class="item-actions" v-if="showActions">
      <button 
        v-if="item.type === 'history'"
        class="action-button bookmark-button"
        @click.stop="handleBookmark"
        :title="isFloating ? '收藏' : '添加到书签'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
        </svg>
        <span v-if="!isFloating">收藏</span>
      </button>
      <button 
        v-if="item.type === 'download'"
        class="action-button folder-button"
        @click.stop="handleShowFile"
        :title="isFloating ? '显示文件目录' : '在文件管理器中显示'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <span v-if="!isFloating">显示</span>
      </button>
      <button 
        class="action-button copy-button"
        @click.stop="handleCopy"
        :title="isFloating ? '复制链接' : '复制URL'"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span v-if="!isFloating">复制</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SearchResultItem } from '../utils/types';
import { formatFileSize } from '../utils/search';

interface Props {
  item: SearchResultItem;
  query?: string;
  isSelected?: boolean;
  isFloating?: boolean;
  showActions?: boolean;
  dataId?: string;
}

interface Emits {
  (e: 'click'): void;
  (e: 'open', item: SearchResultItem): void;
  (e: 'bookmark', item: SearchResultItem): void;
  (e: 'showFile', item: SearchResultItem): void;
  (e: 'copy', url: string): void;
  // 兼容新的事件名
  (e: 'select', item: SearchResultItem): void;
}

const props = withDefaults(defineProps<Props>(), {
  query: '',
  isSelected: false,
  isFloating: false,
  showActions: true,
  dataId: ''
});

const emit = defineEmits<Emits>();

// 获取项目图标
const itemIcon = computed(() => {
  switch (props.item.type) {
    case 'bookmark': return '🔖';
    case 'history': return '🕒';
    case 'download': return '📥';
    default: return '📄';
  }
});

// 高亮标题
const highlightedTitle = computed(() => {
  if (!props.query) return props.item.title;
  
  const regex = new RegExp(`(${props.query})`, 'gi');
  return props.item.title.replace(regex, '<mark>$1</mark>');
});

// 格式化日期
const formattedDate = computed(() => {
  if (!props.item.lastVisited) return '';
  
  const date = new Date(props.item.lastVisited);
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
});

// 格式化文件大小
const formattedFileSize = computed(() => 
  props.item.fileSize ? formatFileSize(props.item.fileSize) : ''
);

// 事件处理
function handleClick(): void {
  emit('click');
}

function handleOpen(): void {
  emit('open', props.item);
}

function handleBookmark(): void {
  emit('bookmark', props.item);
}

function handleShowFile(): void {
  emit('showFile', props.item);
}

function handleCopy(): void {
  emit('copy', props.item.url);
}
</script>

<style>
.result-item {
  @apply flex items-center gap-3 p-2 px-3 rounded-lg cursor-pointer transition-all duration-200 outline-none relative;
}

.result-item:hover,
.result-item:focus,
.result-item.selected {
  @apply bg-primary/10 translate-x-1;
}

.result-item.selected {
  @apply bg-primary/20 shadow-md shadow-primary/30;
}

.item-icon {
  @apply text-base flex-shrink-0;
}

.item-content {
  @apply flex-1 min-w-0;
}

.item-title {
  @apply font-medium text-gray-800 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap;
}

.item-title :deep(mark) {
  @apply bg-yellow-200 text-yellow-800;
}

.item-url {
  @apply text-xs text-gray-500 mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap;
}

.item-meta {
  @apply flex gap-2 text-xs text-gray-400 flex-wrap;
}

.folder-tag {
  @apply text-yellow-600 font-medium;
}

.visit-count {
  @apply text-blue-600;
}

.file-size {
  @apply text-green-600 font-medium;
}

.last-visited {
  @apply text-gray-500;
}

.file-missing {
  @apply text-red-600 font-medium;
}

.item-actions {
  @apply flex gap-1.5 opacity-0 transition-opacity duration-200;
}

.result-item:hover .item-actions {
  @apply opacity-100;
}

.action-button {
  @apply flex items-center gap-1 p-1 px-2 border-none rounded bg-transparent text-gray-500 cursor-pointer transition-all duration-200 text-xs;
}

.action-button:hover {
  @apply bg-black/5 text-gray-700;
}

.bookmark-button:hover {
  @apply bg-teal-100 text-teal-700;
}

.folder-button:hover {
  @apply bg-green-100 text-green-700;
}

.copy-button:hover {
  @apply bg-blue-100 text-blue-700;
}

/* 浮动搜索模式的样式调整 */
.result-item.floating {
  @apply bg-transparent;
}

.result-item.floating:hover,
.result-item.floating:focus,
.result-item.floating.selected {
  @apply bg-primary/10;
}

.result-item.floating .action-button {
  @apply p-1.5 rounded-full bg-white/90 text-gray-600 shadow-sm;
}

.result-item.floating .action-button span {
  @apply hidden;
}

.result-item.floating .action-button:hover {
  @apply bg-white shadow-md;
}
</style> 