<template>
  <el-card
    class="result-item-card"
    :class="{ selected: isSelected }"
    :data-id="item.id"
    :body-style="{ padding: '12px' }"
    shadow="hover"
    @click="$emit('select', item)"
  >
    <div class="result-item-content">
      <div class="item-icon">
        {{ itemIcon }}
      </div>
      <div class="item-content">
        <div class="item-title" :title="item.title">{{ item.title }}</div>
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
            {{ formattedFileSize }}
          </el-tag>
          <span v-if="item.lastVisited" class="last-visited">
            {{ formattedDate }}
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
          type="primary"
          :icon="Star"
          @click.stop="$emit('bookmark', item)"
        >
          收藏
        </el-button>
        <el-button 
          v-if="item.type === 'download'"
          size="small"
          type="success"
          :icon="FolderOpened"
          @click.stop="$emit('showFile', item)"
        >
          显示
        </el-button>
        <el-button 
          size="small"
          type="info"
          :icon="CopyDocument"
          @click.stop="$emit('copy', item.url)"
        >
          复制
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Star, FolderOpened, CopyDocument } from '@element-plus/icons-vue';
import type { SearchResultItem } from '../utils/types';
import { useUI } from '../utils/composables/useUI';

interface Props {
  item: SearchResultItem;
  isSelected?: boolean;
}

interface Emits {
  (e: 'select', item: SearchResultItem): void;
  (e: 'bookmark', item: SearchResultItem): void;
  (e: 'showFile', item: SearchResultItem): void;
  (e: 'copy', url: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
});

defineEmits<Emits>();

const { getItemIcon, formatDate, formatFileSizeDisplay } = useUI();

const itemIcon = computed(() => getItemIcon(props.item.type));

const formattedDate = computed(() => 
  props.item.lastVisited ? formatDate(props.item.lastVisited) : ''
);

const formattedFileSize = computed(() => 
  props.item.fileSize ? formatFileSizeDisplay(props.item.fileSize) : ''
);
</script>

<style scoped>
.result-item-card {
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-item-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-item-card.selected {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 8px var(--el-color-primary-light-5);
}

.result-item-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.item-icon {
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 2px;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-url {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.last-visited {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}
</style> 