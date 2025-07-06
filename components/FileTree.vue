<template>
	<div
		class="h-full flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700"
	>
		<!-- 文件树头部 -->
		<div
			class="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 flex-shrink-0 shadow-sm"
		>
			<el-button
				:icon="FolderOpened"
				@click="selectRootDirectory"
				class="w-full mb-3 !bg-gradient-to-r !from-blue-600 !to-purple-600 !border-none !text-white !font-medium !py-3 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 hover:!scale-105"
				type="primary"
				size="default"
			>
				<span class="font-medium">📁 选择目录</span>
			</el-button>

			<!-- 文件搜索框 -->
			<div v-if="rootHandle" class="mb-3">
				<el-input
					v-model="searchQuery"
					placeholder="🔍 搜索文件..."
					size="small"
					clearable
					@clear="clearSearch"
					@input="filterFiles"
					class="shadow-sm !rounded-xl"
				>
					<template #prefix>
						<el-icon class="text-blue-600 dark:text-blue-400"
							><Search
						/></el-icon>
					</template>
				</el-input>
			</div>

			<!-- 文件操作按钮 -->
			<div v-if="rootHandle" class="flex gap-1.5 mb-3">
				<el-button
					:icon="DocumentAdd"
					@click="showCreateFileDialog"
					size="small"
					title="新建文件"
					class="flex-1 !bg-green-50 dark:!bg-green-900/20 !border-green-200 dark:!border-green-800 !text-green-700 dark:!text-green-300 hover:!bg-green-100 dark:hover:!bg-green-900/30 !rounded-lg !font-medium shadow-sm !px-2 !py-1.5"
				>
					<span class="text-xs font-medium">📄</span>
				</el-button>
				<el-button
					:icon="FolderAdd"
					@click="showCreateFolderDialog"
					size="small"
					title="新建文件夹"
					class="flex-1 !bg-blue-50 dark:!bg-blue-900/20 !border-blue-200 dark:!border-blue-800 !text-blue-700 dark:!text-blue-300 hover:!bg-blue-100 dark:hover:!bg-blue-900/30 !rounded-lg !font-medium shadow-sm !px-2 !py-1.5"
				>
					<span class="text-xs font-medium">📁</span>
				</el-button>
				<el-button
					:icon="Refresh"
					@click="refreshCurrentDirectory"
					size="small"
					title="刷新文件列表"
					class="!bg-slate-50 dark:!bg-slate-700 !border-slate-200 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-600 !rounded-lg !font-medium shadow-sm !px-2 !py-1.5 !w-12"
					:loading="isRefreshing"
				>
					<span class="text-xs font-medium">🔄</span>
				</el-button>
			</div>

			<!-- 当前路径显示 -->
			<div
				v-if="rootHandle"
				class="flex items-center gap-3 p-4 bg-white dark:bg-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-sm"
			>
				<el-icon class="text-blue-600 dark:text-blue-400"
					><FolderOpened
				/></el-icon>
				<span class="truncate font-medium">{{ rootHandle.name }}</span>
			</div>
		</div>

		<!-- 文件树内容 -->
		<div class="flex-1 overflow-hidden">
			<!-- 空状态 -->
			<div
				v-if="!rootHandle"
				class="flex flex-col items-center justify-center h-full p-8 text-center text-slate-600 dark:text-slate-400"
			>
				<div class="relative mb-8">
					<div
						class="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-3xl flex items-center justify-center shadow-xl"
					>
						<el-icon size="48" class="text-slate-400 dark:text-slate-500">
							<FolderOpened />
						</el-icon>
					</div>
					<div
						class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center animate-bounce shadow-lg"
					>
						<span class="text-white text-lg">✨</span>
					</div>
				</div>
				<h3 class="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">
					📁 选择一个目录
				</h3>
				<p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
					点击上方按钮选择要浏览的目录，<br />开始您的文件管理
				</p>
			</div>

			<!-- 文件树 -->
			<div v-else class="p-2">
				<!-- 搜索模式下显示过滤后的树 -->
				<div v-if="searchQuery.trim()">
					<div
						v-if="filteredTreeData.length === 0"
						class="flex flex-col items-center justify-center py-8 text-center text-slate-500 dark:text-slate-400"
					>
						<div
							class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4"
						>
							<el-icon size="24" class="text-slate-400 dark:text-slate-500">
								<Search />
							</el-icon>
						</div>
						<h4
							class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
						>
							🔍 未找到匹配的文件
						</h4>
						<p class="text-xs text-slate-500 dark:text-slate-400">
							请尝试修改搜索关键词
						</p>
					</div>
					<el-tree
						v-else
						ref="searchTreeRef"
						:data="filteredTreeData"
						:props="treeProps"
						node-key="id"
						@node-click="handleNodeClick"
						@node-contextmenu="handleNodeContextMenu"
						class="file-tree"
						default-expand-all
					>
						<template #default="{ node, data }">
							<div
								class="flex items-center gap-2 px-2 py-1 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-300 w-full group border border-transparent"
								:class="{
									// 选中状态样式
									'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500 shadow-lg shadow-blue-500/25':
										selectedNodeId === data.id,

									// 非选中状态的hover效果
									'hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm':
										selectedNodeId !== data.id,

									// 文字颜色
									'text-blue-700 dark:text-blue-300 font-semibold':
										data.isDirectory && selectedNodeId !== data.id,
									'text-slate-700 dark:text-slate-300':
										data.isFile && selectedNodeId !== data.id,
								}"
							>
								<div
									class="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all duration-300 shadow-sm"
									:class="{
										// 选中状态下的图标样式
										'bg-white/20 text-white shadow-md':
											selectedNodeId === data.id,

										// 非选中状态下的图标样式
										'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 text-blue-600 dark:text-blue-300 group-hover:shadow-md':
											data.isDirectory && selectedNodeId !== data.id,
										'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 group-hover:shadow-md':
											data.isFile && selectedNodeId !== data.id,
									}"
								>
									<el-icon class="text-sm">
										<component :is="getNodeIcon(data)" />
									</el-icon>
								</div>
								<span
									class="flex-1 truncate text-sm"
									v-html="highlightSearchText(data.label, searchQuery)"
								>
								</span>
								<!-- 文件操作按钮 -->
								<div
									class="transition-all duration-200 flex gap-0.5"
									:class="{
										'opacity-100': selectedNodeId === data.id,
										'opacity-0 group-hover:opacity-100':
											selectedNodeId !== data.id,
									}"
								>
									<el-button
										:icon="Edit"
										size="small"
										@click.stop="showRenameDialog(data)"
										title="重命名"
										type="primary"
										:class="
											selectedNodeId === data.id
												? '!p-1.5 !w-7 !h-7 !rounded-lg !bg-white/20 !border-white/30 !text-white hover:!bg-white/30 hover:!border-white/50'
												: '!p-1.5 !w-7 !h-7 !rounded-lg !bg-blue-50 dark:!bg-blue-900/30 !border-blue-200 dark:!border-blue-800 !text-blue-600 dark:!text-blue-300 hover:!bg-blue-100 dark:hover:!bg-blue-900/50'
										"
									/>
									<el-button
										:icon="Delete"
										size="small"
										@click.stop="confirmDeleteItem(data)"
										title="删除"
										type="danger"
										:class="
											selectedNodeId === data.id
												? '!p-1.5 !w-7 !h-7 !rounded-lg !bg-red-500/20 !border-red-400/30 !text-red-200 hover:!bg-red-500/30 hover:!border-red-400/50'
												: '!p-1.5 !w-7 !h-7 !rounded-lg !bg-red-50 dark:!bg-red-900/30 !border-red-200 dark:!border-red-800 !text-red-600 dark:!text-red-300 hover:!bg-red-100 dark:hover:!bg-red-900/50'
										"
									/>
								</div>
							</div>
						</template>
					</el-tree>
				</div>

				<!-- 正常模式下显示树 -->
				<el-tree
					v-else
					ref="treeRef"
					:data="treeData"
					:load="isInitialized ? undefined : loadNode"
					:props="treeProps"
					node-key="id"
					:lazy="!isInitialized"
					@node-click="handleNodeClick"
					@node-contextmenu="handleNodeContextMenu"
					class="file-tree"
				>
					<template #default="{ node, data }">
						<div
							class="flex items-center gap-2 px-2 py-1 mx-2 my-1 rounded-lg cursor-pointer transition-all duration-300 w-full group border border-transparent"
							:class="{
								// 选中状态样式
								'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-500 shadow-lg shadow-blue-500/25':
									selectedNodeId === data.id,

								// 非选中状态的hover效果
								'hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm':
									selectedNodeId !== data.id,

								// 文字颜色
								'text-blue-700 dark:text-blue-300 font-semibold':
									data.isDirectory && selectedNodeId !== data.id,
								'text-slate-700 dark:text-slate-300':
									data.isFile && selectedNodeId !== data.id,
							}"
						>
							<div
								class="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all duration-300 shadow-sm"
								:class="{
									// 选中状态下的图标样式
									'bg-white/20 text-white shadow-md':
										selectedNodeId === data.id,

									// 非选中状态下的图标样式
									'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 text-blue-600 dark:text-blue-300 group-hover:shadow-md':
										data.isDirectory && selectedNodeId !== data.id,
									'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-300 group-hover:shadow-md':
										data.isFile && selectedNodeId !== data.id,
								}"
							>
								<el-icon class="text-sm">
									<component :is="getNodeIcon(data)" />
								</el-icon>
							</div>
							<span class="flex-1 truncate text-sm">
								{{ data.label }}
							</span>
							<!-- 文件操作按钮 -->
							<div
								class="transition-all duration-200 flex gap-0.5"
								:class="{
									'opacity-100': selectedNodeId === data.id,
									'opacity-0 group-hover:opacity-100':
										selectedNodeId !== data.id,
								}"
							>
								<el-button
									:icon="Edit"
									size="small"
									@click.stop="showRenameDialog(data)"
									title="重命名"
									type="primary"
									:class="
										selectedNodeId === data.id
											? '!p-1.5 !w-7 !h-7 !rounded-lg !bg-white/20 !border-white/30 !text-white hover:!bg-white/30 hover:!border-white/50'
											: '!p-1.5 !w-7 !h-7 !rounded-lg !bg-blue-50 dark:!bg-blue-900/30 !border-blue-200 dark:!border-blue-800 !text-blue-600 dark:!text-blue-300 hover:!bg-blue-100 dark:hover:!bg-blue-900/50'
									"
								/>
								<el-button
									:icon="Delete"
									size="small"
									@click.stop="confirmDeleteItem(data)"
									title="删除"
									type="danger"
									:class="
										selectedNodeId === data.id
											? '!p-1.5 !w-7 !h-7 !rounded-lg !bg-red-500/20 !border-red-400/30 !text-red-200 hover:!bg-red-500/30 hover:!border-red-400/50'
											: '!p-1.5 !w-7 !h-7 !rounded-lg !bg-red-50 dark:!bg-red-900/30 !border-red-200 dark:!border-red-800 !text-red-600 dark:!text-red-300 hover:!bg-red-100 dark:hover:!bg-red-900/50'
									"
								/>
							</div>
						</div>
					</template>
				</el-tree>
			</div>
		</div>

		<!-- 新建文件对话框 -->
		<el-dialog
			v-model="showCreateFile"
			title="📄 新建文件"
			width="420px"
			draggable
			@close="resetCreateFileDialog"
			class="modern-dialog"
		>
			<el-form :model="createFileForm" label-width="90px" class="p-2">
				<el-form-item label="📝 文件名" class="mb-6">
					<el-input
						v-model="createFileForm.fileName"
						placeholder="输入文件名..."
						autofocus
						@keyup.enter="createFile"
						size="large"
						class="!rounded-xl"
					/>
				</el-form-item>
				<el-form-item label="📁 类型" class="mb-4">
					<el-select
						v-model="createFileForm.fileType"
						placeholder="选择文件类型"
						class="w-full"
						size="large"
					>
						<el-option label="📝 Markdown文件 (.md)" value="md" />
						<el-option label="📄 文本文件 (.txt)" value="txt" />
						<el-option label="📦 JSON文件 (.json)" value="json" />
						<el-option label="🛠️ JavaScript文件 (.js)" value="js" />
						<el-option label="🔷 TypeScript文件 (.ts)" value="ts" />
						<el-option label="🟢 Vue文件 (.vue)" value="vue" />
						<el-option label="🌐 HTML文件 (.html)" value="html" />
						<el-option label="🎨 CSS文件 (.css)" value="css" />
					</el-select>
				</el-form-item>
			</el-form>
			<template #footer>
				<div class="flex justify-end gap-3 p-2">
					<el-button
						@click="resetCreateFileDialog"
						size="large"
						class="!rounded-xl"
					>
						取消
					</el-button>
					<el-button
						@click="createFile"
						type="primary"
						size="large"
						class="!rounded-xl !bg-gradient-to-r !from-green-600 !to-emerald-600 !border-none"
					>
						📄 创建
					</el-button>
				</div>
			</template>
		</el-dialog>

		<!-- 新建文件夹对话框 -->
		<el-dialog
			v-model="showCreateFolder"
			title="📁 新建文件夹"
			width="420px"
			draggable
			@close="resetCreateFolderDialog"
			class="modern-dialog"
		>
			<el-form :model="createFolderForm" label-width="100px" class="p-2">
				<el-form-item label="📁 文件夹名" class="mb-6">
					<el-input
						v-model="createFolderForm.folderName"
						placeholder="输入文件夹名..."
						autofocus
						@keyup.enter="createFolder"
						size="large"
						class="!rounded-xl"
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<div class="flex justify-end gap-3 p-2">
					<el-button
						@click="resetCreateFolderDialog"
						size="large"
						class="!rounded-xl"
					>
						取消
					</el-button>
					<el-button
						@click="createFolder"
						type="primary"
						size="large"
						class="!rounded-xl !bg-gradient-to-r !from-blue-600 !to-purple-600 !border-none"
					>
						📁 创建
					</el-button>
				</div>
			</template>
		</el-dialog>

		<!-- 重命名对话框 -->
		<el-dialog
			v-model="showRename"
			title="✏️ 重命名"
			width="420px"
			draggable
			@close="resetRenameDialog"
			class="modern-dialog"
		>
			<el-form :model="renameForm" label-width="80px" class="p-2">
				<el-form-item label="🏷️ 新名称" class="mb-6">
					<el-input
						v-model="renameForm.newName"
						placeholder="输入新名称..."
						autofocus
						@keyup.enter="renameItem"
						size="large"
						class="!rounded-xl"
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<div class="flex justify-end gap-3 p-2">
					<el-button
						@click="resetRenameDialog"
						size="large"
						class="!rounded-xl"
					>
						取消
					</el-button>
					<el-button
						@click="renameItem"
						type="primary"
						size="large"
						class="!rounded-xl !bg-gradient-to-r !from-orange-600 !to-red-600 !border-none"
					>
						✏️ 确定
					</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { ElTree, ElMessage, ElMessageBox } from "element-plus";
import {
	FolderOpened,
	Document,
	DocumentCopy,
	EditPen,
	Tickets,
	Search,
	DocumentAdd,
	FolderAdd,
	Edit,
	Delete,
	Refresh,
} from "@element-plus/icons-vue";
import {
	chooseDirectory,
	buildTree,
	isSupportedFile,
	getFileType,
} from "../utils/file-service";
import type { FileTreeNode } from "../utils/types";

// Props & Emits
interface Props {
	modelValue?: FileSystemDirectoryHandle | null;
}

interface Emits {
	(e: "update:modelValue", value: FileSystemDirectoryHandle | null): void;
	(e: "select-file", handle: FileSystemFileHandle, node: FileTreeNode): void;
	(
		e: "select-directory",
		handle: FileSystemDirectoryHandle,
		node: FileTreeNode
	): void;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
});

const emit = defineEmits<Emits>();

// 响应式数据
const treeRef = ref<InstanceType<typeof ElTree>>();
const searchTreeRef = ref<InstanceType<typeof ElTree>>();
const rootHandle = ref<FileSystemDirectoryHandle | null>(null);
const treeData = ref<FileTreeNode[]>([]);
const selectedNode = ref<FileTreeNode | null>(null);
const selectedNodeId = ref<string | null>(null);

// 搜索相关
const searchQuery = ref("");
const filteredTreeData = ref<FileTreeNode[]>([]);
const isRefreshing = ref(false);
const isInitialized = ref(false);

// 文件操作对话框
const showCreateFile = ref(false);
const showCreateFolder = ref(false);
const showRename = ref(false);

// 表单数据
const createFileForm = ref({
	fileName: "",
	fileType: "md",
});

const createFolderForm = ref({
	folderName: "",
});

const renameForm = ref({
	newName: "",
	targetNode: null as FileTreeNode | null,
});

// 树形控件配置
const treeProps = {
	children: "children",
	label: "label",
	isLeaf: (data: any) => data.isFile,
};

// 选择根目录
const selectRootDirectory = async () => {
	try {
		const handle = await chooseDirectory();
		rootHandle.value = handle;
		emit("update:modelValue", handle);
		await loadFullDirectoryTree();
		await saveDirectoryHistory(handle);
	} catch (error) {
		console.error("选择目录失败:", error);
		if (error instanceof Error && error.name !== "AbortError") {
			ElMessage.error("选择目录失败: " + error.message);
		}
	}
};

// 加载完整的目录树
const loadFullDirectoryTree = async () => {
	if (!rootHandle.value) return;
	try {
		console.log("开始加载完整目录树...");
		const rootTree = await buildTree(rootHandle.value);
		treeData.value = rootTree;
		filteredTreeData.value = rootTree;
		isInitialized.value = true;

		// 清除选中状态
		selectedNode.value = null;
		selectedNodeId.value = null;

		console.log("完整目录树已加载:", rootTree);
		const fileNodes = rootTree.filter((node) => node.isFile);
		console.log(
			"文件节点检查:",
			fileNodes.map((node) => ({
				label: node.label,
				hasHandle: !!node.handle,
				handleKind: node.handle?.kind,
			}))
		);
	} catch (error) {
		console.error("加载目录树失败:", error);
		ElMessage.error("加载目录树失败");
	}
};

// 使用IndexedDB保存和加载目录句柄
const DB_NAME = "file-browser-db";
const DB_VERSION = 1;
const STORE_NAME = "directory-handles";

// 初始化IndexedDB
const initDB = (): Promise<IDBDatabase> => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: "id" });
			}
		};
	});
};

// 获取目录的显示路径
const getDirectoryDisplayPath = async (
	handle: FileSystemDirectoryHandle
): Promise<string> => {
	try {
		return handle.name;
	} catch (error) {
		console.warn("无法获取目录路径信息:", error);
		return handle.name;
	}
};

// 保存目录历史到IndexedDB
const saveDirectoryHistory = async (handle: FileSystemDirectoryHandle) => {
	try {
		const db = await initDB();
		const displayPath = await getDirectoryDisplayPath(handle);
		const directoryInfo = {
			id: "last-directory",
			name: handle.name,
			path: displayPath,
			timestamp: Date.now(),
			handle: handle,
		};
		const transaction = db.transaction([STORE_NAME], "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		await new Promise<void>((resolve, reject) => {
			const request = store.put(directoryInfo);
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
		console.log("目录历史已保存到IndexedDB:", {
			name: directoryInfo.name,
			path: directoryInfo.path,
			timestamp: directoryInfo.timestamp,
		});
		const backupInfo = {
			name: handle.name,
			path: displayPath,
			timestamp: Date.now(),
		};
		localStorage.setItem(
			"file-browser-last-directory",
			JSON.stringify(backupInfo)
		);
	} catch (error) {
		console.error("保存目录历史失败:", error);
		try {
			const displayPath = await getDirectoryDisplayPath(handle);
			const backupInfo = {
				name: handle.name,
				path: displayPath,
				timestamp: Date.now(),
			};
			localStorage.setItem(
				"file-browser-last-directory",
				JSON.stringify(backupInfo)
			);
			console.log("已降级保存到localStorage:", backupInfo);
		} catch (backupError) {
			console.error("降级保存也失败:", backupError);
		}
	}
};

// 从IndexedDB加载历史目录
const loadDirectoryHistory = async () => {
	try {
		let directoryInfo = null;
		try {
			const db = await initDB();
			const transaction = db.transaction([STORE_NAME], "readonly");
			const store = transaction.objectStore(STORE_NAME);
			directoryInfo = await new Promise<any>((resolve, reject) => {
				const request = store.get("last-directory");
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			});
			console.log(
				"从IndexedDB加载目录信息:",
				directoryInfo
					? {
							name: directoryInfo.name,
							path: directoryInfo.path,
							hasHandle: !!directoryInfo.handle,
					  }
					: null
			);
		} catch (dbError) {
			console.log("IndexedDB加载失败，尝试从localStorage加载:", dbError);
			const saved = localStorage.getItem("file-browser-last-directory");
			if (saved) {
				directoryInfo = JSON.parse(saved);
				console.log("从localStorage加载目录信息:", directoryInfo);
			}
		}

		if (!directoryInfo) return false;

		const timeDiff = Date.now() - directoryInfo.timestamp;
		const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
		let timeText = "";
		if (daysDiff === 0) {
			timeText = "今天";
		} else if (daysDiff === 1) {
			timeText = "昨天";
		} else {
			timeText = `${daysDiff}天前`;
		}

		if (directoryInfo.handle && daysDiff <= 7) {
			try {
				const handle = directoryInfo.handle;
				const permission = await handle.queryPermission({ mode: "readwrite" });
				if (permission === "granted") {
					console.log("使用已保存的目录句柄:", {
						name: handle.name,
						path: directoryInfo.path,
					});
					rootHandle.value = handle;
					emit("update:modelValue", handle);
					await loadFullDirectoryTree();
					ElMessage({
						message: `📁 已自动加载${timeText}使用的目录：${
							directoryInfo.path || directoryInfo.name
						}`,
						type: "success",
						duration: 3000,
					});
					return true;
				} else if (permission === "prompt") {
					const newPermission = await handle.requestPermission({
						mode: "readwrite",
					});
					if (newPermission === "granted") {
						console.log("用户授权后使用目录句柄:", {
							name: handle.name,
							path: directoryInfo.path,
						});
						rootHandle.value = handle;
						emit("update:modelValue", handle);
						await loadFullDirectoryTree();
						ElMessage({
							message: `📁 已自动加载${timeText}使用的目录：${
								directoryInfo.path || directoryInfo.name
							}`,
							type: "success",
							duration: 3000,
						});
						return true;
					}
				}
			} catch (error: any) {
				console.log("保存的目录句柄无效或无权限:", error.message);
				try {
					const db = await initDB();
					const transaction = db.transaction([STORE_NAME], "readwrite");
					const store = transaction.objectStore(STORE_NAME);
					store.delete("last-directory");
				} catch (cleanupError) {
					console.log("清理IndexedDB失败:", cleanupError);
				}
				localStorage.removeItem("file-browser-last-directory");
			}
		}

		if (daysDiff <= 7) {
			const displayPath = directoryInfo.path || directoryInfo.name;
			ElMessage({
				message: `📁 您${timeText}使用了目录：${displayPath}，请重新选择目录`,
				type: "info",
				duration: 4000,
				showClose: true,
			});
		}

		return false;
	} catch (error) {
		console.error("加载目录历史失败:", error);
		return false;
	}
};

// 懒加载节点
const loadNode = async (node: any, resolve: (data: FileTreeNode[]) => void) => {
	if (isInitialized.value) {
		resolve([]);
		return;
	}

	if (node.level === 0) {
		if (rootHandle.value && !isInitialized.value) {
			try {
				const rootTree = await buildTree(rootHandle.value);
				treeData.value = rootTree;
				isInitialized.value = true;
				resolve(rootTree);
			} catch (error) {
				console.error("加载根目录失败:", error);
				resolve([]);
			}
		} else {
			resolve([]);
		}
		return;
	}

	const nodeData = node.data as FileTreeNode;
	if (nodeData.isDirectory && nodeData.handle) {
		try {
			const children = await buildTree(
				nodeData.handle as FileSystemDirectoryHandle
			);
			resolve(children);
		} catch (error) {
			console.error("加载子目录失败:", error);
			resolve([]);
		}
	} else {
		resolve([]);
	}
};

// 处理节点点击
const handleNodeClick = (data: FileTreeNode, node: any) => {
	console.log("节点点击:", {
		label: data.label,
		isFile: data.isFile,
		isDirectory: data.isDirectory,
		hasHandle: !!data.handle,
		handleType: data.handle?.kind,
	});

	selectedNode.value = data;
	selectedNodeId.value = data.id;

	if (data.isFile && data.handle) {
		if (isSupportedFile(data.label)) {
			console.log("发射select-file事件:", {
				fileName: data.label,
				fileHandle: data.handle,
				handleKind: data.handle.kind,
				handleName: data.handle.name,
			});
			emit("select-file", data.handle as FileSystemFileHandle, data);
		} else {
			ElMessage.warning(`不支持的文件类型: ${data.label}`);
		}
	} else if (data.isDirectory && data.handle) {
		console.log("发射select-directory事件:", data.label);
		emit("select-directory", data.handle as FileSystemDirectoryHandle, data);
	} else {
		console.error("节点没有handle或类型不正确:", {
			label: data.label,
			isFile: data.isFile,
			isDirectory: data.isDirectory,
			hasHandle: !!data.handle,
		});
	}
};

// 获取节点图标
const getNodeIcon = (data: FileTreeNode) => {
	if (data.isDirectory) {
		return FolderOpened;
	}
	if (data.isFile) {
		const fileType = getFileType(data.label);
		switch (fileType) {
			case "markdown":
				return EditPen;
			case "json":
				return Tickets;
			case "javascript":
			case "typescript":
			case "vue":
				return DocumentCopy;
			default:
				return Document;
		}
	}
	return Document;
};

// 刷新当前目录
const refreshCurrentDirectory = async () => {
	if (!rootHandle.value) return;

	try {
		isRefreshing.value = true;
		const rootTree = await buildTree(rootHandle.value);
		treeData.value = rootTree;
		filteredTreeData.value = rootTree;
		filterFiles();

		// 清除选中状态
		selectedNode.value = null;
		selectedNodeId.value = null;

		if (treeRef.value) {
			treeRef.value.setCurrentKey(undefined);
		}
		ElMessage.success("目录已刷新");
	} catch (error) {
		console.error("刷新目录失败:", error);
		ElMessage.error("刷新目录失败");
	} finally {
		isRefreshing.value = false;
	}
};

// 文件搜索过滤
const filterFiles = () => {
	if (!searchQuery.value.trim()) {
		filteredTreeData.value = treeData.value;
		return;
	}

	const filterTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
		return nodes
			.filter((node) => {
				const matchesSearch = node.label
					.toLowerCase()
					.includes(searchQuery.value.toLowerCase());
				if (node.isDirectory && node.children) {
					const filteredChildren = filterTree(node.children);
					return matchesSearch || filteredChildren.length > 0;
				}
				return matchesSearch;
			})
			.map((node) => {
				if (node.isDirectory && node.children) {
					return {
						...node,
						children: filterTree(node.children),
					};
				}
				return node;
			});
	};

	filteredTreeData.value = filterTree(treeData.value);
};

// 清空搜索
const clearSearch = () => {
	searchQuery.value = "";
	filteredTreeData.value = treeData.value;
	// 清除选中状态
	selectedNode.value = null;
	selectedNodeId.value = null;
};

// 显示新建文件对话框
const showCreateFileDialog = () => {
	showCreateFile.value = true;
};

// 显示新建文件夹对话框
const showCreateFolderDialog = () => {
	showCreateFolder.value = true;
};

// 显示重命名对话框
const showRenameDialog = (node: FileTreeNode) => {
	renameForm.value.newName = node.label;
	renameForm.value.targetNode = node;
	showRename.value = true;
};

// 重置新建文件对话框
const resetCreateFileDialog = () => {
	showCreateFile.value = false;
	createFileForm.value.fileName = "";
	createFileForm.value.fileType = "md";
};

// 重置新建文件夹对话框
const resetCreateFolderDialog = () => {
	showCreateFolder.value = false;
	createFolderForm.value.folderName = "";
};

// 重置重命名对话框
const resetRenameDialog = () => {
	showRename.value = false;
	renameForm.value.newName = "";
	renameForm.value.targetNode = null;
};

// 创建文件
const createFile = async () => {
	if (!rootHandle.value || !createFileForm.value.fileName.trim()) {
		ElMessage.warning("请输入文件名");
		return;
	}

	try {
		const fileName = createFileForm.value.fileName.trim();
		const fileExtension = createFileForm.value.fileType;
		const fullFileName = fileName.endsWith(`.${fileExtension}`)
			? fileName
			: `${fileName}.${fileExtension}`;

		const fileHandle = await rootHandle.value.getFileHandle(fullFileName, {
			create: true,
		});
		const writable = await fileHandle.createWritable();
		await writable.write("");
		await writable.close();

		ElMessage.success(`文件 ${fullFileName} 创建成功`);
		resetCreateFileDialog();
		await loadFullDirectoryTree();
	} catch (error) {
		console.error("创建文件失败:", error);
		ElMessage.error("创建文件失败: " + (error as Error).message);
	}
};

// 创建文件夹
const createFolder = async () => {
	if (!rootHandle.value || !createFolderForm.value.folderName.trim()) {
		ElMessage.warning("请输入文件夹名");
		return;
	}

	try {
		const folderName = createFolderForm.value.folderName.trim();
		await rootHandle.value.getDirectoryHandle(folderName, { create: true });
		ElMessage.success(`文件夹 ${folderName} 创建成功`);
		resetCreateFolderDialog();
		await loadFullDirectoryTree();
	} catch (error) {
		console.error("创建文件夹失败:", error);
		ElMessage.error("创建文件夹失败: " + (error as Error).message);
	}
};

// 重命名文件或文件夹
const renameItem = async () => {
	if (!renameForm.value.targetNode || !renameForm.value.newName.trim()) {
		ElMessage.warning("请输入新名称");
		return;
	}

	try {
		ElMessage.warning("重命名功能暂未实现，浏览器API限制");
		resetRenameDialog();
	} catch (error) {
		console.error("重命名失败:", error);
		ElMessage.error("重命名失败: " + (error as Error).message);
	}
};

// 确认删除文件或文件夹
const confirmDeleteItem = async (node: FileTreeNode) => {
	try {
		await ElMessageBox.confirm(
			`确定要删除 ${node.isDirectory ? "文件夹" : "文件"} "${node.label}" 吗？`,
			"确认删除",
			{
				type: "warning",
				confirmButtonText: "删除",
				cancelButtonText: "取消",
				confirmButtonClass: "el-button--danger",
			}
		);
		await deleteItem(node);
	} catch (error) {
		if (error !== "cancel") {
			console.error("删除确认失败:", error);
		}
	}
};

// 删除文件或文件夹
const deleteItem = async (node: FileTreeNode) => {
	try {
		if (!rootHandle.value || !node.handle) {
			ElMessage.error("无法删除：缺少文件句柄");
			return;
		}
		ElMessage.warning("删除功能暂未实现，浏览器API限制");
	} catch (error) {
		console.error("删除失败:", error);
		ElMessage.error("删除失败: " + (error as Error).message);
	}
};

// 处理右键菜单
const handleNodeContextMenu = (event: MouseEvent, data: FileTreeNode) => {
	event.preventDefault();
	console.log("右键点击:", data.label);
};

// 展开到指定节点
const expandToNode = (targetPath: string) => {
	console.log("展开到节点:", targetPath);
};

// 高亮搜索文本
const highlightSearchText = (text: string, query: string) => {
	if (!query.trim()) return text;
	const regex = new RegExp(
		`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
		"gi"
	);
	return text.replace(
		regex,
		'<mark class="bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-1 rounded">$1</mark>'
	);
};

// 监听根目录变化
watch(
	() => props.modelValue,
	(newValue) => {
		if (newValue !== rootHandle.value) {
			rootHandle.value = newValue;
			treeData.value = [];
			filteredTreeData.value = [];
			searchQuery.value = "";
			isInitialized.value = false;

			// 清除选中状态
			selectedNode.value = null;
			selectedNodeId.value = null;

			if (newValue) {
				loadFullDirectoryTree();
			}
		}
	}
);

// 监听树数据变化
watch(
	treeData,
	(newData) => {
		if (!searchQuery.value.trim()) {
			filteredTreeData.value = newData;
		} else {
			filterFiles();
		}
	},
	{ deep: true }
);

// 组件挂载时尝试加载历史目录
onMounted(async () => {
	console.log("FileTree组件挂载，尝试加载历史目录");
	try {
		const loaded = await loadDirectoryHistory();
		if (!loaded) {
			console.log("未能自动加载历史目录，等待用户手动选择");
		}
	} catch (error) {
		console.error("加载历史目录时出错:", error);
	}
});

// 暴露方法
defineExpose({
	refreshCurrentDirectory,
	expandToNode,
	selectRootDirectory,
	filterFiles,
	clearSearch,
	loadFullDirectoryTree,
	loadDirectoryHistory,
});
</script>

<style scoped>
:deep(.modern-dialog .el-dialog) {
	border-radius: 16px;
	box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

:deep(.modern-dialog .el-dialog__header) {
	background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
	border-radius: 16px 16px 0 0;
	padding: 20px 24px;
	border-bottom: 1px solid #e2e8f0;
}

:deep(.modern-dialog .el-dialog__title) {
	font-weight: 600;
	color: #1e293b;
}

:deep(.el-input__wrapper) {
	border-radius: 12px;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	transition: all 0.2s;
}

:deep(.el-input__wrapper:hover) {
	box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

:deep(.el-input__wrapper.is-focus) {
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
