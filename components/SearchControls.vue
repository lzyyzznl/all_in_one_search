<template>
	<div class="mt-3">
		<!-- 搜索历史气泡 -->
		<div v-if="searchHistory.length > 0" class="d-flex flex-wrap ga-2 mb-3">
			<v-chip
				v-for="item in searchHistory"
				:key="item"
				color="info"
				variant="outlined"
				size="small"
				class="cursor-pointer transition-transform hover:scale-105 hover:opacity-80"
				@click="$emit('selectHistory', item)"
			>
				{{ item }}
			</v-chip>
		</div>

		<!-- 搜索选项 - 水平对齐 -->
		<v-card elevation="1">
			<v-card-text class="pa-3">
				<v-row class="align-center" no-gutters>
					<!-- 数据源多选 -->
					<v-col cols="12" md="4" class="px-2">
						<div class="d-flex align-center ga-2 w-full">
							<span
								class="text-body-2 text-medium-emphasis whitespace-nowrap flex-shrink-0 min-w-15"
								>搜索项:</span
							>
							<v-select
								:model-value="selectedDataSources"
								multiple
								chips
								variant="outlined"
								density="compact"
								class="flex-1 min-w-0"
								@update:model-value="$emit('updateDataSources', $event)"
							>
								<v-list-item value="bookmarks" title="书签" />
								<v-list-item value="history" title="历史记录" />
								<v-list-item value="downloads" title="下载文件" />
							</v-select>
						</div>
					</v-col>

					<!-- 时间筛选 -->
					<v-col cols="12" md="4" class="px-2">
						<div class="d-flex align-center ga-2 w-full">
							<span
								class="text-body-2 text-medium-emphasis whitespace-nowrap flex-shrink-0 min-w-15"
								>时间:</span
							>
							<v-select
								:model-value="timeFilter"
								variant="outlined"
								density="compact"
								class="flex-1 min-w-0"
								@update:model-value="$emit('updateTimeFilter', $event)"
							>
								<v-list-item value="all" title="全部时间" />
								<v-list-item value="today" title="今天" />
								<v-list-item value="week" title="本周" />
								<v-list-item value="month" title="本月" />
							</v-select>
						</div>
					</v-col>

					<!-- 排序选择 -->
					<v-col cols="12" md="4" class="px-2">
						<div class="d-flex align-center ga-2 w-full">
							<span
								class="text-body-2 text-medium-emphasis whitespace-nowrap flex-shrink-0 min-w-15"
								>排序:</span
							>
							<v-select
								:model-value="sortBy"
								variant="outlined"
								density="compact"
								class="flex-1 min-w-0"
								@update:model-value="$emit('updateSortBy', $event)"
							>
								<v-list-item value="relevance" title="相关性" />
								<v-list-item value="recent" title="最近访问" />
								<v-list-item value="frequency" title="访问频率" />
							</v-select>
						</div>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
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

<style scoped>
/* 响应式调整 - 使用媒体查询保持兼容性 */
@media (max-width: 768px) {
	.v-row {
		flex-direction: column;
		gap: 8px;
	}

	.px-2 {
		padding-left: 0 !important;
		padding-right: 0 !important;
		width: 100%;
	}

	.d-flex.align-center.ga-2 {
		flex-direction: column;
		align-items: flex-start !important;
		gap: 4px !important;
	}

	.min-w-15 {
		min-width: auto !important;
	}
}
</style>
