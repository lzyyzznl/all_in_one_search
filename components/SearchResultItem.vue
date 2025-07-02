<template>
	<div
		class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-base outline-none relative hover:bg-primary-50 dark:hover:bg-gray-700/50 focus:bg-primary-50 dark:focus:bg-gray-700/50"
		:class="{
			'bg-primary-100 dark:bg-gray-600/60 shadow-sm transform translate-x-1':
				isSelected,
		}"
		:data-id="item.id"
		@click="handleSelect"
		@keydown.enter="handleSelect"
		tabindex="0"
	>
		<div class="text-base flex-shrink-0">
			{{ itemIcon }}
		</div>
		<div class="flex-1 min-w-0">
			<div
				class="font-medium text-primary text-ellipsis mb-0.5"
				:title="item.title"
			>
				{{ item.title }}
			</div>
			<div
				class="text-xs text-secondary text-ellipsis mb-0.5"
				:title="item.url"
			>
				{{ item.url }}
			</div>
			<div class="flex gap-2 text-xs text-muted flex-wrap">
				<span
					v-if="item.folderName"
					class="text-warning-600 dark:text-warning-400 font-medium"
				>
					📁 {{ item.folderName }}
				</span>
				<span
					v-if="item.visitCount && item.type !== 'download'"
					class="text-primary-600 dark:text-primary-400"
				>
					{{ item.visitCount }} 次访问
				</span>
				<span
					v-if="item.fileSize && item.type === 'download'"
					class="text-success-600 dark:text-success-400 font-medium"
				>
					{{ formattedFileSize }}
				</span>
				<span v-if="item.lastVisited" class="text-gray-500 dark:text-gray-400">
					{{ formattedDate }}
				</span>
				<span
					v-if="item.type === 'download' && !item.exists"
					class="text-danger-600 dark:text-danger-400 font-medium"
				>
					⚠️ 文件不存在
				</span>
			</div>
		</div>
		<div
			class="flex gap-1.5 opacity-0 hover:opacity-100 transition-opacity duration-200"
			v-if="showActions"
		>
			<button
				v-if="item.type === 'history'"
				class="flex items-center gap-1 px-2 py-1 border-none rounded bg-transparent text-gray-500 dark:text-gray-400 cursor-pointer transition-colors duration-200 text-xs hover:bg-success-100 dark:hover:bg-success-900/20 hover:text-success-600 dark:hover:text-success-400"
				@click.stop="handleBookmark"
				title="添加到书签"
			>
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polygon
						points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
					></polygon>
				</svg>
				<span>收藏</span>
			</button>
			<button
				v-if="item.type === 'download'"
				class="flex items-center gap-1 px-2 py-1 border-none rounded bg-transparent text-gray-500 dark:text-gray-400 cursor-pointer transition-colors duration-200 text-xs hover:bg-success-100 dark:hover:bg-success-900/20 hover:text-success-600 dark:hover:text-success-400"
				@click.stop="handleShowFile"
				title="在文件管理器中显示"
			>
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
					></path>
				</svg>
				<span>显示</span>
			</button>
			<button
				class="flex items-center gap-1 px-2 py-1 border-none rounded bg-transparent text-gray-500 dark:text-gray-400 cursor-pointer transition-colors duration-200 text-xs hover:bg-primary-100 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400"
				@click.stop="handleCopy"
				title="复制URL"
			>
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
					<path
						d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
					></path>
				</svg>
				<span>复制</span>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SearchResultItem } from "../utils/types";
import { useUI } from "../utils/composables/useUI";

interface Props {
	item: SearchResultItem;
	isSelected?: boolean;
	showActions?: boolean; // 是否显示操作按钮
}

interface Emits {
	(e: "select", item: SearchResultItem): void;
	(e: "bookmark", item: SearchResultItem): void;
	(e: "showFile", item: SearchResultItem): void;
	(e: "copy", url: string): void;
}

const props = withDefaults(defineProps<Props>(), {
	isSelected: false,
	showActions: true,
});

const emit = defineEmits<Emits>();

const { getItemIcon, formatDate, formatFileSizeDisplay } = useUI();

const itemIcon = computed(() => getItemIcon(props.item.type));

const formattedDate = computed(() =>
	props.item.lastVisited ? formatDate(props.item.lastVisited) : ""
);

const formattedFileSize = computed(() =>
	props.item.fileSize ? formatFileSizeDisplay(props.item.fileSize) : ""
);

function handleSelect(): void {
	emit("select", props.item);
}

function handleBookmark(): void {
	emit("bookmark", props.item);
}

function handleShowFile(): void {
	emit("showFile", props.item);
}

function handleCopy(): void {
	emit("copy", props.item.url);
}
</script>
