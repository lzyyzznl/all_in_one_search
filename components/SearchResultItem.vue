<template>
	<v-list-item
		class="cursor-pointer transition-all duration-200 rounded-lg my-1"
		:class="{
			'bg-primary/12 border-l-3 border-primary': isSelected,
			'bg-white/95 backdrop-blur-10 border border-black/10': isFloating,
			'hover:bg-primary/8 hover:translate-x-1': !isFloating,
			'hover:bg-white/98 hover:shadow-lg': isFloating,
		}"
		:data-id="item.id"
		@click="handleSelect"
		@keydown.enter="handleSelect"
		:ripple="false"
	>
		<template #prepend>
			<div class="item-icon text-h6 mr-3">
				{{ itemIcon }}
			</div>
		</template>

		<v-list-item-title
			class="item-title text-body-1 font-weight-medium"
			:title="item.title"
		>
			{{ item.title }}
		</v-list-item-title>

		<v-list-item-subtitle
			class="item-url text-body-2 text-medium-emphasis"
			:title="item.url"
		>
			{{ item.url }}
		</v-list-item-subtitle>

		<div class="item-meta d-flex flex-wrap ga-1 mt-1">
			<v-chip
				v-if="item.folderName"
				size="x-small"
				color="warning"
				variant="outlined"
			>
				📁 {{ item.folderName }}
			</v-chip>
			<v-chip
				v-if="item.visitCount && item.type !== 'download'"
				size="x-small"
				color="info"
				variant="outlined"
			>
				{{ item.visitCount }} 次访问
			</v-chip>
			<v-chip
				v-if="item.fileSize && item.type === 'download'"
				size="x-small"
				color="success"
				variant="outlined"
			>
				{{ formattedFileSize }}
			</v-chip>
			<span
				v-if="item.lastVisited"
				class="last-visited text-caption text-medium-emphasis"
			>
				{{ formattedDate }}
			</span>
			<v-chip
				v-if="item.type === 'download' && !item.exists"
				size="x-small"
				color="error"
				variant="flat"
			>
				⚠️ 文件不存在
			</v-chip>
		</div>

		<template #append v-if="showActions">
			<div
				class="d-flex ga-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
				:class="{ 'opacity-100': isFloating }"
			>
				<v-btn
					v-if="item.type === 'history'"
					size="small"
					variant="text"
					icon="mdi-star"
					@click.stop="handleBookmark"
					:title="isFloating ? '收藏' : '添加到书签'"
					class="text-warning"
				/>
				<v-btn
					v-if="item.type === 'download'"
					size="small"
					variant="text"
					icon="mdi-folder-open"
					@click.stop="handleShowFile"
					:title="isFloating ? '显示文件目录' : '在文件管理器中显示'"
					class="text-success"
				/>
				<v-btn
					size="small"
					variant="text"
					icon="mdi-content-copy"
					@click.stop="handleCopy"
					:title="isFloating ? '复制链接' : '复制URL'"
					class="text-info"
				/>
			</div>
		</template>
	</v-list-item>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SearchResultItem } from "../utils/types";
import { useUI } from "../utils/composables/useUI";

interface Props {
	item: SearchResultItem;
	isSelected?: boolean;
	isFloating?: boolean; // 是否在浮动搜索中使用
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
	isFloating: false,
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

<style scoped>
/* 使用CSS变量保持与Vuetify主题的兼容性 */
.v-list-item:hover .opacity-0 {
	opacity: 1;
}

/* 浮动搜索模式下选中状态的特殊处理 */
.bg-white\/95.bg-primary\/12 {
	background: rgba(var(--v-theme-primary), 0.1) !important;
	border-color: rgb(var(--v-theme-primary)) !important;
}
</style>
