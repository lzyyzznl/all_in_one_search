<template>
  <div
    class="result-item"
    :class="{ 'selected': isSelected, 'floating': isFloating }"
    :data-id="item.id"
    @click="handleSelect"
    @keydown.enter="handleSelect"
    tabindex="0"
  >
    <div class="item-icon">
      {{ itemIcon }}
    </div>
    <div class="item-content">
      <div class="item-title" :title="item.title">{{ item.title }}</div>
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
import { useUI } from '../utils/composables/useUI';

interface Props {
  item: SearchResultItem;
  isSelected?: boolean;
  isFloating?: boolean; // 是否在浮动搜索中使用
  showActions?: boolean; // 是否显示操作按钮
}

interface Emits {
  (e: 'select', item: SearchResultItem): void;
  (e: 'bookmark', item: SearchResultItem): void;
  (e: 'showFile', item: SearchResultItem): void;
  (e: 'copy', url: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isFloating: false,
  showActions: true,
});

const emit = defineEmits<Emits>();

const { getItemIcon, formatDate, formatFileSizeDisplay } = useUI();

const itemIcon = computed(() => getItemIcon(props.item.type));

const formattedDate = computed(() => 
  props.item.lastVisited ? formatDate(props.item.lastVisited) : ''
);

const formattedFileSize = computed(() => 
  props.item.fileSize ? formatFileSizeDisplay(props.item.fileSize) : ''
);

function handleSelect(): void {
  emit('select', props.item);
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

<style scoped>
.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  position: relative;
}

.result-item:hover,
.result-item:focus,
.result-item.selected {
  background: rgba(102, 126, 234, 0.1);
  transform: translateX(4px);
}

.result-item.selected {
  background: rgba(102, 126, 234, 0.2);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.item-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-url {
  font-size: 12px;
  color: #718096;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #a0aec0;
  flex-wrap: wrap;
}

.folder-tag {
  color: #d69e2e;
  font-weight: 500;
}

.visit-count {
  color: #3182ce;
}

.file-size {
  color: #38a169;
  font-weight: 500;
}

.last-visited {
  color: #718096;
}

.file-missing {
  color: #e53e3e;
  font-weight: 500;
}

.item-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.result-item:hover .item-actions {
  opacity: 1;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #718096;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.action-button:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #2d3748;
}

.bookmark-button:hover {
  background: rgba(56, 178, 172, 0.1);
  color: #319795;
}

.folder-button:hover {
  background: rgba(56, 161, 105, 0.1);
  color: #38a169;
}

.copy-button:hover {
  background: rgba(49, 130, 206, 0.1);
  color: #3182ce;
}

/* 浮动搜索模式的样式调整 */
.result-item.floating {
  background: transparent;
}

.result-item.floating:hover,
.result-item.floating:focus,
.result-item.floating.selected {
  background: rgba(102, 126, 234, 0.1);
}

.result-item.floating .action-button {
  padding: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #4a5568;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-item.floating .action-button span {
  display: none;
}

.result-item.floating .action-button:hover {
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
</style> 