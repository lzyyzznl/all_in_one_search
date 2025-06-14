<template>
  <div class="search-controls">
    <!-- 搜索历史气泡 -->
    <div v-if="searchHistory.length > 0" class="search-history">
      <el-tag
        v-for="item in searchHistory" 
        :key="item"
        type="info"
        effect="plain"
        size="small"
        class="history-tag"
        @click="$emit('selectHistory', item)"
      >
        {{ item }}
      </el-tag>
    </div>
    
    <!-- 搜索选项 - 水平对齐 -->
    <div class="search-options">
      <el-row :gutter="4" align="middle" class="controls-row" justify="space-between">
        <!-- 数据源多选 -->
        <el-col :span="10" class="filter-control">
          <div class="control-item">
            <span class="control-label">搜索项:</span>
            <el-select
              :model-value="selectedDataSources"
              multiple
              collapse-tags
              collapse-tags-tooltip
              size="small"
              class="control-select"
              @update:model-value="$emit('updateDataSources', $event)"
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
              :model-value="timeFilter" 
              size="small" 
              class="control-select"
              @update:model-value="$emit('updateTimeFilter', $event)"
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
              :model-value="sortBy" 
              size="small" 
              class="control-select"
              @update:model-value="$emit('updateSortBy', $event)"
            >
              <el-option label="相关性" value="relevance" />
              <el-option label="最近访问" value="recent" />
              <el-option label="访问频率" value="frequency" />
            </el-select>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DataSourceType, TimeFilter, SortBy } from '../utils/types';

interface Props {
  searchHistory: string[];
  selectedDataSources: DataSourceType[];
  timeFilter: TimeFilter;
  sortBy: SortBy;
}

interface Emits {
  (e: 'selectHistory', query: string): void;
  (e: 'updateDataSources', sources: DataSourceType[]): void;
  (e: 'updateTimeFilter', filter: TimeFilter): void;
  (e: 'updateSortBy', sort: SortBy): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped>
.search-controls {
  margin-top: 12px;
}

.search-history {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.history-tag {
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-tag:hover {
  transform: scale(1.05);
  opacity: 0.8;
}

.search-options {
  background: var(--el-bg-color-page);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.controls-row {
  align-items: center;
}

.filter-control {
  display: flex;
  align-items: center;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.control-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  white-space: nowrap;
  flex-shrink: 0;
}

.control-select {
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .controls-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .filter-control {
    width: 100%;
  }
}
</style> 