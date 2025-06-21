<template>
	<v-dialog
		:model-value="show"
		@update:model-value="handleDialogUpdate"
		max-width="500px"
		min-height="600px"
		persistent
		scrollable
		class="dialog-backdrop"
	>
		<v-card class="dialog-card">
			<v-card-title class="text-h5 pa-4 flex-center justify-start">
				<v-icon class="mr-2 text-blue-500">mdi-bookmark-plus</v-icon>
				<span class="text-title">添加到书签</span>
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

					<div class="min-h-14">
						<!-- 文件夹选择器 -->
						<div class="folder-selector">
							<label class="folder-label">选择文件夹</label>
							<div class="treeselect-container">
								<Treeselect
									v-model="selectedFolderId"
									:options="treeselectOptions"
									:searchable="true"
									:clearable="false"
									:single="true"
									:loading="foldersLoading"
									placeholder="请选择或搜索文件夹..."
									no-results-text="未找到匹配的文件夹"
									class="folder-treeselect w-full"
								/>
							</div>
						</div>
					</div>
				</v-form>
			</v-card-text>

			<v-card-actions class="pa-4 flex-between">
				<div></div>
				<div class="flex gap-2">
					<v-btn
						@click="handleClose"
						variant="text"
						class="btn-secondary text-gray-600 hover:text-gray-800"
					>
						取消
					</v-btn>
					<v-btn
						color="primary"
						@click="handleSave"
						:loading="saving"
						:disabled="
							!formValid ||
							!localDialog.title?.trim() ||
							!localDialog.url?.trim()
						"
						class="btn-primary"
					>
						{{ saving ? "保存中..." : "保存" }}
					</v-btn>
				</div>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
// @ts-ignore - vue3-treeselect没有官方类型定义
import Treeselect from "@zanmato/vue3-treeselect";
import "@zanmato/vue3-treeselect/dist/vue3-treeselect.min.css";
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

interface BookmarkFolder {
	id: string;
	title: string;
	children?: BookmarkFolder[];
}

interface TreeselectOption {
	id: string;
	label: string;
	children?: TreeselectOption[];
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

// 选中的文件夹
const selectedFolderId = ref<string | null>(null);

// 书签文件夹树形结构
const bookmarkFoldersTree = ref<BookmarkFolder[]>([]);

// 表单验证规则
const titleRules = [
	(v: string) => !!v || "请输入书签标题",
	(v: string) => (v && v.trim().length > 0) || "标题不能为空",
];

const urlRules = [
	(v: string) => !!v || "请输入网址",
	(v: string) => (v && v.trim().length > 0) || "网址不能为空",
];

// 转换为vue3-treeselect需要的格式
const treeselectOptions = computed((): TreeselectOption[] => {
	const convertToTreeselectFormat = (
		folders: BookmarkFolder[]
	): TreeselectOption[] => {
		return folders.map((folder) => {
			const option: TreeselectOption = {
				id: folder.id,
				label: folder.title,
			};
			if (folder.children && folder.children.length > 0) {
				option.children = convertToTreeselectFormat(folder.children);
			}
			return option;
		});
	};

	return convertToTreeselectFormat(bookmarkFoldersTree.value);
});

// 监听props变化，同步到本地状态
watch(
	() => props.dialog,
	(newDialog) => {
		localDialog.value = {
			title: newDialog.title,
			url: newDialog.url,
			parentId: newDialog.parentId,
		};
		// 同步选中的文件夹
		selectedFolderId.value = newDialog.parentId || null;
	},
	{ immediate: true, deep: true }
);

// 监听选中文件夹ID变化，同步到本地状态
watch(selectedFolderId, (newSelectedId) => {
	localDialog.value.parentId = newSelectedId || "";
});

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
 * 构建书签文件夹树，递归处理所有文件夹
 */
function buildFolderTree(
	nodes: chrome.bookmarks.BookmarkTreeNode[]
): BookmarkFolder[] {
	const folders: BookmarkFolder[] = [];

	for (const node of nodes) {
		// 只处理文件夹（没有URL的节点）
		if (!node.url) {
			const folder: BookmarkFolder = {
				id: node.id,
				title: node.title || "未命名文件夹",
			};

			// 递归处理子文件夹
			if (node.children && node.children.length > 0) {
				const childFolders = buildFolderTree(node.children);
				if (childFolders.length > 0) {
					folder.children = childFolders;
				}
			}

			folders.push(folder);
		}
	}

	return folders;
}

/**
 * 获取书签栏ID
 */
function getBookmarksBarId(
	bookmarks: chrome.bookmarks.BookmarkTreeNode[]
): string | null {
	for (const node of bookmarks) {
		if (node.children) {
			for (const child of node.children) {
				if (
					child.title === "书签栏" ||
					child.title === "Bookmarks bar" ||
					child.title === "Bookmarks" ||
					child.id === "1" // Chrome书签栏通常是ID为1
				) {
					return child.id;
				}
			}
			// 如果没找到特定名称，返回第一个文件夹
			if (
				node.children.length > 0 &&
				node.children[0] &&
				!node.children[0].url
			) {
				return node.children[0].id;
			}
		}
	}
	return null;
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

		// 如果当前没有选中文件夹，默认选择书签栏
		if (!localDialog.value.parentId && bookmarkFoldersTree.value.length > 0) {
			const bookmarksBarId = getBookmarksBarId(bookmarks);

			if (bookmarksBarId) {
				selectedFolderId.value = bookmarksBarId;
				localDialog.value.parentId = bookmarksBarId;
			}
		}
	} catch (error) {
		console.error("获取书签文件夹失败:", error);
		bookmarkFoldersTree.value = [];
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
