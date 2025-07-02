<template>
	<el-dialog
		:model-value="show"
		@update:model-value="handleDialogUpdate"
		title="添加到书签"
		width="500px"
		:before-close="handleClose"
		:z-index="10000"
		class="bookmark-dialog"
	>
		<el-form
			:model="localDialog"
			label-width="80px"
			:rules="bookmarkRules"
			ref="bookmarkForm"
		>
			<el-form-item label="标题" prop="title">
				<el-input v-model="localDialog.title" placeholder="请输入书签标题" />
			</el-form-item>

			<el-form-item label="URL" prop="url">
				<el-input v-model="localDialog.url" placeholder="请输入网址" />
			</el-form-item>

			<el-form-item label="文件夹">
				<el-tree-select
					v-model="localDialog.parentId"
					:data="bookmarkFoldersTree"
					:props="{ label: 'title', value: 'id', children: 'children' }"
					filterable
					placeholder="请选择文件夹"
					style="width: 100%"
					check-strictly
					clearable
					:loading="foldersLoading"
					popper-class="bookmark-dialog-tree-select"
					:popper-options="{
						modifiers: [
							{
								name: 'computeStyles',
								options: {
									gpuAcceleration: false,
								},
							},
						],
					}"
				/>
			</el-form-item>
		</el-form>

		<template #footer>
			<div class="flex gap-3 justify-end pt-2">
				<el-button @click="handleClose"> 取消 </el-button>
				<el-button
					type="primary"
					@click="handleSave"
					:loading="saving"
					:disabled="!localDialog.title?.trim() || !localDialog.url?.trim()"
				>
					{{ saving ? "保存中..." : "保存" }}
				</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, reactive } from "vue";
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

// 本地对话框状态，避免直接修改props
const localDialog = ref({
	title: "",
	url: "",
	parentId: "",
});

// 书签文件夹树形结构
const bookmarkFoldersTree = ref<any[]>([]);

// 表单验证规则
const bookmarkRules = reactive({
	title: [{ required: true, message: "请输入书签标题", trigger: "blur" }],
	url: [{ required: true, message: "请输入网址", trigger: "blur" }],
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
 * 加载书签文件夹
 */
async function loadBookmarkFolders(): Promise<void> {
	foldersLoading.value = true;
	try {
		const bookmarks = await getBookmarkTree();
		console.log("🚀 ~ file: BookmarkDialog.vue:142 ~ bookmarks:", bookmarks);
		const actualFolders = bookmarks[0]?.children || [];
		bookmarkFoldersTree.value = buildFolderTree(actualFolders);
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
		await bookmarkForm.value.validate();

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
