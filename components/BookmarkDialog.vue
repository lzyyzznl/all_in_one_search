<template>
	<v-dialog
		:model-value="show"
		@update:model-value="handleDialogUpdate"
		max-width="500px"
		persistent
		class="backdrop-blur-4 fixed! top-0! left-0! w-screen! h-screen! z-9999!"
	>
		<v-card class="rounded-3 shadow-2xl relative!">
			<v-card-title class="text-h5 pa-4 bg-slate-50 border-b border-slate-200">
				<v-icon class="mr-2">mdi-bookmark-plus</v-icon>
				添加到书签
			</v-card-title>

			<v-card-text class="pa-4">
				<v-form ref="bookmarkForm" v-model="formValid">
					<v-text-field
						v-model="localDialog.title"
						label="标题"
						placeholder="请输入书签标题"
						variant="outlined"
						:rules="titleRules"
						required
						class="mb-3"
					/>

					<v-text-field
						v-model="localDialog.url"
						label="URL"
						placeholder="请输入网址"
						variant="outlined"
						:rules="urlRules"
						required
						class="mb-3"
					/>

					<v-select
						v-model="localDialog.parentId"
						:items="flattenedFolders"
						item-title="title"
						item-value="id"
						label="文件夹"
						placeholder="请选择文件夹"
						variant="outlined"
						clearable
						:loading="foldersLoading"
					>
						<template #item="{ props, item }">
							<v-list-item v-bind="props">
								<template #prepend>
									<v-icon>{{
										item.raw.level > 0 ? "mdi-folder-outline" : "mdi-folder"
									}}</v-icon>
								</template>
								<v-list-item-title>
									{{ "　".repeat(item.raw.level) }}{{ item.raw.title }}
								</v-list-item-title>
							</v-list-item>
						</template>
					</v-select>
				</v-form>
			</v-card-text>

			<v-card-actions class="pa-4 bg-slate-50 border-t border-slate-200">
				<v-spacer />
				<v-btn @click="handleClose" variant="text"> 取消 </v-btn>
				<v-btn
					color="primary"
					@click="handleSave"
					:loading="saving"
					:disabled="
						!formValid || !localDialog.title?.trim() || !localDialog.url?.trim()
					"
				>
					{{ saving ? "保存中..." : "保存" }}
				</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import type { BookmarkDialogState } from "../utils/composables/useBookmarks";
import { getBookmarkTree } from "../utils/bookmarksApiWrapper";

interface Props {
	show: boolean;
	dialog: BookmarkDialogState;
}

interface Emits {
	(e: "close"): void;
	(
		e: "save",
		data: { title: string; url: string; parentId: string }
	): Promise<void>;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const saving = ref(false);
const foldersLoading = ref(true);
const bookmarkForm = ref();
const formValid = ref(false);

// 本地对话框状态，避免直接修改props
const localDialog = ref({
	title: "",
	url: "",
	parentId: "",
});

// 书签文件夹树形结构
const bookmarkFoldersTree = ref<any[]>([]);
// 扁平化的文件夹列表，用于v-select
const flattenedFolders = ref<any[]>([]);

// 表单验证规则
const titleRules = [
	(v: string) => !!v || "请输入书签标题",
	(v: string) => (v && v.trim().length > 0) || "标题不能为空",
];

const urlRules = [
	(v: string) => !!v || "请输入网址",
	(v: string) => (v && v.trim().length > 0) || "网址不能为空",
];

// 监听props变化，同步到本地状态
watch(
	() => props.dialog,
	(newDialog) => {
		localDialog.value = {
			title: newDialog.title,
			url: newDialog.url,
			parentId: newDialog.parentId,
		};
	},
	{ immediate: true, deep: true }
);

// 监听显示状态，加载文件夹
watch(
	() => props.show,
	(newShow) => {
		if (newShow) {
			loadBookmarkFolders();
		}
	}
);

/**
 * 构建书签文件夹树
 */
function buildFolderTree(nodes: chrome.bookmarks.BookmarkTreeNode[]): any[] {
	return nodes
		.filter((node) => !node.url) // 只要文件夹
		.map((node) => ({
			id: node.id,
			title: node.title || "未命名文件夹",
			children: node.children ? buildFolderTree(node.children) : [],
		}));
}

/**
 * 扁平化文件夹树，用于v-select显示
 */
function flattenFolders(folders: any[], level = 0): any[] {
	const result: any[] = [];
	for (const folder of folders) {
		result.push({
			id: folder.id,
			title: folder.title,
			level: level,
		});
		if (folder.children && folder.children.length > 0) {
			result.push(...flattenFolders(folder.children, level + 1));
		}
	}
	return result;
}

/**
 * 加载书签文件夹
 */
async function loadBookmarkFolders(): Promise<void> {
	foldersLoading.value = true;
	try {
		const bookmarks = await getBookmarkTree();
		const actualFolders = bookmarks[0]?.children || [];
		bookmarkFoldersTree.value = buildFolderTree(actualFolders);
		flattenedFolders.value = flattenFolders(bookmarkFoldersTree.value);
	} catch (error) {
		console.error("获取书签文件夹失败:", error);
		bookmarkFoldersTree.value = [];
		flattenedFolders.value = [];
	} finally {
		foldersLoading.value = false;
	}
}

const handleClose = () => {
	emit("close");
};

const handleDialogUpdate = (visible: boolean) => {
	if (!visible) {
		handleClose();
	}
};

const handleSave = async () => {
	if (!bookmarkForm.value) return;

	try {
		const { valid } = await bookmarkForm.value.validate();
		if (!valid) return;

		if (!localDialog.value.title?.trim() || !localDialog.value.url?.trim()) {
			return;
		}

		saving.value = true;
		await emit("save", {
			title: localDialog.value.title.trim(),
			url: localDialog.value.url.trim(),
			parentId: localDialog.value.parentId,
		});
	} catch (error) {
		console.error("保存书签失败:", error);
	} finally {
		saving.value = false;
	}
};

// 组件挂载时预加载文件夹
onMounted(() => {
	loadBookmarkFolders();
});
</script>

<style scoped>
/* 确保对话框不影响父容器布局 */
:deep(.v-overlay__content) {
	position: fixed !important;
	z-index: 9999 !important;
}

:deep(.v-overlay) {
	position: fixed !important;
	top: 0 !important;
	left: 0 !important;
	width: 100vw !important;
	height: 100vh !important;
	z-index: 9999 !important;
}
</style>
