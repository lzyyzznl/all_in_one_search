<template>
	<div class="mt-3">
		<!-- 搜索历史气泡 -->
		<div v-if="searchHistory.length > 0" class="mb-3 flex flex-wrap gap-1.5">
			<el-tag
				v-for="item in searchHistory"
				:key="item"
				type="info"
				effect="plain"
				size="small"
				class="cursor-pointer transition-transform duration-200 hover:scale-105 hover:opacity-80"
				@click="$emit('selectHistory', item)"
			>
				{{ item }}
			</el-tag>
		</div>

		<!-- 搜索选项 - 水平对齐 -->
		<div class="bg-secondary border border-base rounded-lg p-3">
			<el-row
				:gutter="4"
				align="middle"
				class="items-center"
				justify="space-between"
			>
				<!-- 数据源多选 -->
				<el-col :span="10" class="flex items-center">
					<div class="flex items-center gap-2 w-full">
						<span class="text-xs text-secondary whitespace-nowrap flex-shrink-0"
							>搜索项:</span
						>
						<el-select
							:model-value="selectedDataSources"
							multiple
							collapse-tags
							collapse-tags-tooltip
							size="small"
							class="flex-1 min-w-0"
							@update:model-value="$emit('updateDataSources', $event)"
						>
							<el-option label="书签" value="bookmarks" />
							<el-option label="历史记录" value="history" />
							<el-option label="下载文件" value="downloads" />
						</el-select>
					</div>
				</el-col>

				<!-- 时间筛选 -->
				<el-col :span="10" class="flex items-center">
					<div class="flex items-center gap-2 w-full">
						<span class="text-xs text-secondary whitespace-nowrap flex-shrink-0"
							>时间:</span
						>
						<el-select
							:model-value="timeFilter"
							size="small"
							class="flex-1 min-w-0"
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
				<el-col :span="10" class="flex items-center">
					<div class="flex items-center gap-2 w-full">
						<span class="text-xs text-secondary whitespace-nowrap flex-shrink-0"
							>排序:</span
						>
						<el-select
							:model-value="sortBy"
							size="small"
							class="flex-1 min-w-0"
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
import type { DataSourceType, TimeFilter, SortBy } from "../utils/types";

interface Props {
	searchHistory: string[];
	selectedDataSources: DataSourceType[];
	timeFilter: TimeFilter;
	sortBy: SortBy;
}

interface Emits {
	(e: "selectHistory", query: string): void;
	(e: "updateDataSources", sources: DataSourceType[]): void;
	(e: "updateTimeFilter", filter: TimeFilter): void;
	(e: "updateSortBy", sort: SortBy): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>
