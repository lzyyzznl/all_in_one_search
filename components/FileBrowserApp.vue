65
<template>
	<!-- 加载状态 -->
	<div
		v-if="isInitializing"
		class="h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center"
	>
		<div class="text-center">
			<div class="relative mb-8">
				<div
					class="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl animate-pulse"
				>
					<span class="text-white text-3xl">📁</span>
				</div>
				<div
					class="absolute inset-0 w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-2xl animate-spin mx-auto"
					style="border-top-color: transparent"
				></div>
			</div>
			<p class="text-slate-900 dark:text-slate-100 font-bold text-2xl mb-3">
				📁 正在初始化文件浏览器...
			</p>
			<p class="text-slate-600 dark:text-slate-400 text-base">
				请稍候，即将展现精彩内容
			</p>
		</div>
	</div>

	<!-- 主应用 -->
	<div v-else class="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
		<!-- 主要内容区 -->
		<div class="flex-1 flex overflow-hidden">
			<!-- 左侧文件树 -->
			<div
				class="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0 overflow-hidden shadow-lg transition-all duration-300 ease-in-out relative"
				:style="{ width: (isCollapsed ? 50 : sidebarWidth) + 'px' }"
			>
				<!-- 折叠按钮 -->
				<div
					class="absolute top-1/2 transform -translate-y-1/2 translate-x-1/2 z-10 transition-all duration-300"
					style="right: 0"
				>
					<el-button
						:icon="isCollapsed ? Expand : Fold"
						@click="toggleCollapse"
						size="small"
						:title="isCollapsed ? '展开侧边栏' : '折叠侧边栏'"
						class="!p-1 !w-6 !h-6 !rounded-md !bg-slate-100 dark:!bg-slate-700 !border-slate-200 dark:!border-slate-600 !text-slate-600 dark:!text-slate-400 hover:!bg-slate-200 dark:hover:!bg-slate-600 hover:!text-slate-700 dark:hover:!text-slate-300 !shadow-sm transition-all duration-200"
					/>
				</div>

				<!-- 文件树容器 -->
				<div
					class="h-full transition-all duration-300 ease-in-out"
					:class="{ 'opacity-0 pointer-events-none': isCollapsed }"
				>
					<FileTree
						ref="fileTreeRef"
						v-model="rootDirectoryHandle"
						@select-file="handleSelectFile"
						@select-directory="handleSelectDirectory"
					/>
				</div>

				<!-- 折叠状态下的图标 -->
				<div
					v-if="isCollapsed"
					class="h-full flex flex-col items-center justify-start pt-16 gap-4"
				>
					<div
						class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
					>
						<el-icon class="text-white text-lg"><FolderOpened /></el-icon>
					</div>
					<div
						class="text-xs text-slate-500 dark:text-slate-400 transform rotate-90"
						style="writing-mode: vertical-rl"
					>
						文件
					</div>
				</div>
			</div>

			<!-- 拖拽分割线 -->
			<div
				class="w-1 bg-slate-200 dark:bg-slate-700 cursor-col-resize hover:bg-gradient-to-b hover:from-blue-400 hover:to-purple-400 transition-all duration-300 hover:w-2 relative group"
				@mousedown="startResize"
				:class="{
					'bg-gradient-to-b from-blue-400 to-purple-400 w-2': isResizing,
				}"
			>
				<div
					class="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-white dark:bg-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
				></div>
			</div>

			<!-- 右侧编辑器区域 -->
			<div
				class="flex-1 overflow-hidden flex flex-col bg-white dark:bg-slate-800"
			>
				<!-- 页签栏 -->
				<div
					v-if="openTabs.length > 0"
					class="flex items-end justify-between bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-600 min-h-14 flex-shrink-0 shadow-sm"
				>
					<div
						class="flex items-end overflow-x-auto scrollbar-hide px-2 flex-1"
					>
						<div
							v-for="(tab, index) in openTabs"
							:key="tab.id"
							class="relative flex items-center gap-3 px-4 py-2 cursor-pointer transition-all duration-200 min-w-0 group h-9 max-w-60 min-w-[120px] -mr-3 rounded-t-xl overflow-visible border-t border-l border-r"
							:class="{
								'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 shadow-lg z-10':
									activeTabId === tab.id,
								'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 shadow-sm z-[1] hover:bg-gray-50 dark:hover:bg-gray-600':
									activeTabId !== tab.id,
							}"
							@click="switchToTab(tab.id)"
						>
							<div
								class="w-4 h-4 flex items-center justify-center flex-shrink-0 mr-2"
							>
								<el-icon class="text-sm">
									<Document />
								</el-icon>
							</div>

							<div class="flex-1 min-w-0 flex items-center gap-2">
								<span
									class="text-sm font-medium truncate flex-1"
									:title="tab.title"
								>
									{{ tab.title }}
								</span>
								<div
									v-if="tab.isModified"
									class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"
									title="已修改"
								></div>
							</div>

							<div
								class="w-4 h-4 flex items-center justify-center flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/10 dark:hover:bg-white/10 rounded cursor-pointer"
								@click.stop="closeTab(tab.id)"
								title="关闭"
							>
								<el-icon class="text-xs">
									<Close />
								</el-icon>
							</div>
						</div>
					</div>

					<!-- 页签栏右侧设置按钮 -->
					<div class="flex items-center gap-2 px-4 flex-shrink-0">
						<el-button
							:icon="Setting"
							size="small"
							@click="showSettings = true"
							title="应用设置"
							class="!bg-gray-100 dark:!bg-gray-700 !border-gray-300 dark:!border-gray-600 !text-gray-600 dark:!text-gray-300 hover:!bg-gray-200 dark:hover:!bg-gray-600 !rounded-lg !shadow-sm hover:!shadow-md !transition-all !duration-200"
						>
							<span class="ml-1">⚙️</span>
						</el-button>
					</div>
				</div>

				<!-- 编辑器内容 -->
				<div class="flex-1 overflow-hidden">
					<MdEditor
						ref="mdEditorRef"
						:file-handle="currentFileHandle"
						:file-node="currentFileNode"
						:tab-count="openTabs.length"
						@file-modified="handleFileModified"
						@file-saved="handleFileSaved"
					/>
				</div>
			</div>
		</div>

		<!-- 状态栏 -->
		<div
			class="h-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 text-sm flex-shrink-0 shadow-sm backdrop-blur-sm"
		>
			<div class="flex items-center gap-4">
				<span v-if="currentFileHandle" class="flex items-center gap-4">
					<div
						v-if="fileModified"
						class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-medium border border-orange-200 dark:border-orange-800"
					>
						<span
							class="w-2 h-2 bg-orange-400 rounded-full animate-pulse"
						></span>
						未保存
					</div>
					<div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
						<el-icon><Document /></el-icon>
						<span class="font-medium">{{ currentFileHandle.name }}</span>
					</div>
				</span>
				<span
					v-else
					class="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-medium"
				>
					<el-icon><FolderOpened /></el-icon>
					📁 未选择文件
				</span>
			</div>
			<div class="flex items-center gap-3">
				<div
					v-if="!apiSupported"
					class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-700 dark:text-red-300 rounded-lg text-xs font-medium border border-red-200 dark:border-red-800"
				>
					<span>⚠️</span>
					浏览器不支持文件系统API
				</div>
			</div>
		</div>

		<!-- 设置对话框 -->
		<el-dialog
			v-model="showSettings"
			title="文件浏览器设置"
			width="500px"
			draggable
			@close="handleCloseSettings"
			class="modern-dialog"
		>
			<div class="space-y-8 p-2">
				<div class="space-y-4">
					<div class="flex items-center gap-3 mb-4">
						<div
							class="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center"
						>
							<el-icon class="text-blue-600 dark:text-blue-300"
								><Setting
							/></el-icon>
						</div>
						<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
							界面设置
						</h3>
					</div>

					<div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-4">
						<div class="space-y-3">
							<h4
								class="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2"
							>
								<span>📏</span>
								侧边栏宽度
							</h4>
							<el-slider
								v-model="sidebarWidth"
								:min="200"
								:max="600"
								:step="10"
								show-stops
								@change="applySidebarWidth"
								class="px-2"
							/>
							<div
								class="flex justify-between text-xs text-gray-500 dark:text-gray-400"
							>
								<span>200px</span>
								<span class="font-medium">当前: {{ sidebarWidth }}px</span>
								<span>600px</span>
							</div>
						</div>
					</div>

					<div class="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-4">
						<h4
							class="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2"
						>
							<span>🎨</span>
							主题设置
						</h4>
						<el-select v-model="theme" @change="applyTheme" class="w-full">
							<el-option label="🌞 浅色模式" value="light" />
							<el-option label="🌙 深色模式" value="dark" />
							<el-option label="🔄 跟随系统" value="auto" />
						</el-select>
					</div>

					<div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-4">
						<h4
							class="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2"
						>
							<span>⚙️</span>
							编辑器设置
						</h4>
						<div class="space-y-3">
							<div
								class="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg"
							>
								<div class="flex items-center gap-3">
									<span>💾</span>
									<span class="text-sm text-slate-700 dark:text-slate-300"
										>自动保存</span
									>
								</div>
								<el-switch v-model="autoSave" />
							</div>
							<div
								class="flex items-center justify-between p-3 bg-white dark:bg-slate-700 rounded-lg"
							>
								<div class="flex items-center gap-3">
									<span>🔢</span>
									<span class="text-sm text-slate-700 dark:text-slate-300"
										>显示行号</span
									>
								</div>
								<el-switch v-model="showLineNumbers" />
							</div>
						</div>
					</div>

					<div class="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-4">
						<h4
							class="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2"
						>
							<span>⌨️</span>
							快捷键
						</h4>
						<div class="space-y-3">
							<div
								class="flex justify-between items-center p-3 bg-white dark:bg-slate-700 rounded-lg"
							>
								<span class="text-sm text-slate-700 dark:text-slate-300"
									>选择目录</span
								>
								<kbd
									class="px-3 py-1.5 bg-slate-100 dark:bg-slate-600 rounded-lg text-xs font-mono border border-slate-200 dark:border-slate-500"
								>
									Ctrl + O
								</kbd>
							</div>
							<div
								class="flex justify-between items-center p-3 bg-white dark:bg-slate-700 rounded-lg"
							>
								<span class="text-sm text-slate-700 dark:text-slate-300"
									>保存文件</span
								>
								<kbd
									class="px-3 py-1.5 bg-slate-100 dark:bg-slate-600 rounded-lg text-xs font-mono border border-slate-200 dark:border-slate-500"
								>
									Ctrl + S
								</kbd>
							</div>
							<div
								class="flex justify-between items-center p-3 bg-white dark:bg-slate-700 rounded-lg"
							>
								<span class="text-sm text-slate-700 dark:text-slate-300"
									>设置</span
								>
								<kbd
									class="px-3 py-1.5 bg-slate-100 dark:bg-slate-600 rounded-lg text-xs font-mono border border-slate-200 dark:border-slate-500"
								>
									Ctrl + ,
								</kbd>
							</div>
						</div>
					</div>
				</div>
			</div>

			<template #footer>
				<div
					class="flex justify-end gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-b-lg"
				>
					<el-button @click="resetSettings" class="!rounded-lg">
						🔄 重置
					</el-button>
					<el-button
						type="primary"
						@click="saveSettings"
						class="!rounded-lg !bg-gradient-to-r !from-blue-600 !to-purple-600 !border-none"
					>
						💾 保存设置
					</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import {
	FolderOpened,
	Document,
	Close,
	Expand,
	Fold,
	Setting,
} from "@element-plus/icons-vue";
import { ElMessage, ElNotification, ElMessageBox } from "element-plus";
import FileTree from "./FileTree.vue";
import MdEditor from "./MdEditor.vue";
import { isFileSystemAccessSupported } from "../utils/file-service";
import type { FileSystemFileHandle, FileTreeNode } from "../utils/types";

// 页面标题
document.title = "文件浏览器";

// 组件引用
const fileTreeRef = ref<InstanceType<typeof FileTree> | null>(null);
const mdEditorRef = ref<InstanceType<typeof MdEditor> | null>(null);

// 响应式数据
const rootDirectoryHandle = ref<FileSystemDirectoryHandle | null>(null);
const currentFileHandle = ref<FileSystemFileHandle | null>(null);
const currentFileNode = ref<FileTreeNode | null>(null);
const fileModified = ref(false);
const showSettings = ref(false);
const isInitializing = ref(true);

// 文件统计相关
const wordCount = ref(0);
const fileSize = ref(0);
const modifiedContent = ref("");

// 页签相关数据
interface TabItem {
	id: string;
	fileHandle: FileSystemFileHandle;
	fileNode: FileTreeNode;
	isModified: boolean;
	title: string;
	filePath?: string;
	modifiedContent?: string;
	lastSaveTime?: number;
}

const openTabs = ref<TabItem[]>([]);
const activeTabId = ref<string | null>(null);

// 布局相关
const sidebarWidth = ref(300);
const editorWidth = computed(() => window.innerWidth - sidebarWidth.value - 20);
const isResizing = ref(false);
const isCollapsed = ref(false);

// 设置相关
const theme = ref<"light" | "dark" | "auto">("auto");
const autoSave = ref(false);
const showLineNumbers = ref(true);

// 计算属性
const apiSupported = computed(() => isFileSystemAccessSupported());

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 计算字数
const calculateWordCount = (content: string): number => {
	if (!content) return 0;
	const plainText = content
		.replace(/<[^>]*>/g, "")
		.replace(/[#*_~`\[\]()]/g, "")
		.replace(/\s+/g, " ")
		.trim();
	const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length;
	const englishWords = plainText
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
	return chineseChars + englishWords;
};

// 页签持久化相关
const TAB_DB_NAME = "file-browser-tabs-db";
const TAB_DB_VERSION = 1;
const TAB_STORE_NAME = "open-tabs";

// 初始化页签数据库
const initTabDB = (): Promise<IDBDatabase> => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(TAB_DB_NAME, TAB_DB_VERSION);
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			if (!db.objectStoreNames.contains(TAB_STORE_NAME)) {
				db.createObjectStore(TAB_STORE_NAME, { keyPath: "id" });
			}
		};
	});
};

// 获取文件的相对路径
const getFileRelativePath = async (
	fileHandle: FileSystemFileHandle,
	rootHandle: FileSystemDirectoryHandle
): Promise<string> => {
	try {
		return fileHandle.name;
	} catch (error) {
		console.warn("无法获取文件相对路径:", error);
		return fileHandle.name;
	}
};

// 保存页签状态
const saveTabsState = async () => {
	console.log("页签状态保存已禁用（避免 DataCloneError）");
	return;
};

// 加载页签状态
const loadTabsState = async (): Promise<boolean> => {
	console.log("页签状态加载已禁用（避免 DataCloneError）");
	return false;
};

// 处理文件选择
const handleSelectFile = async (
	fileHandle: FileSystemFileHandle,
	node: FileTreeNode
) => {
	console.log("处理文件选择:", {
		fileName: fileHandle.name,
		nodeLabel: node.label,
		fileHandleKind: fileHandle.kind,
		hasFileHandle: !!fileHandle,
	});

	const existingTab = openTabs.value.find(
		(tab) => tab.fileHandle.name === fileHandle.name
	);
	if (existingTab) {
		switchToTab(existingTab.id);
	} else {
		const filePath = rootDirectoryHandle.value
			? await getFileRelativePath(fileHandle, rootDirectoryHandle.value)
			: fileHandle.name;

		const newTab: TabItem = {
			id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			fileHandle: fileHandle,
			fileNode: node,
			isModified: false,
			title: node.label,
			filePath: filePath,
			lastSaveTime: Date.now(),
		};

		openTabs.value.push(newTab);
		switchToTab(newTab.id);
		await saveTabsState();
	}

	console.log("currentFileHandle已设置:", currentFileHandle.value?.name);
	console.log("currentFileNode已设置:", currentFileNode.value?.label);
};

// 切换到指定页签
const switchToTab = (tabId: string) => {
	const tab = openTabs.value.find((t) => t.id === tabId);
	if (tab) {
		activeTabId.value = tabId;
		currentFileHandle.value = tab.fileHandle;
		currentFileNode.value = tab.fileNode;
		fileModified.value = tab.isModified;
		console.log("切换到页签:", {
			tabId,
			fileHandleName: tab.fileHandle?.name,
			fileHandleKind: tab.fileHandle?.kind,
			nodeLabel: tab.fileNode?.label,
			currentFileHandleSet: !!currentFileHandle.value,
			hasModifiedContent: !!tab.modifiedContent,
			isModified: tab.isModified,
		});

		if (tab.isModified && tab.modifiedContent && mdEditorRef.value) {
			nextTick(() => {
				if (mdEditorRef.value && tab.modifiedContent) {
					mdEditorRef.value.restoreModifiedContent(tab.modifiedContent, true);
				}
			});
		}
	} else {
		console.error("找不到页签:", tabId);
	}
};

// 关闭页签
const closeTab = async (tabId: string) => {
	const tabIndex = openTabs.value.findIndex((t) => t.id === tabId);
	if (tabIndex === -1) return;

	const tab = openTabs.value[tabIndex];

	if (tab.isModified) {
		try {
			const action = await ElMessageBox.confirm(
				`文件 "${tab.title}" 有未保存的修改，是否保存后关闭？`,
				"确认关闭页签",
				{
					type: "warning",
					confirmButtonText: "保存并关闭",
					cancelButtonText: "不保存关闭",
					distinguishCancelAndClose: true,
					showClose: true,
				}
			);

			if (activeTabId.value === tabId && mdEditorRef.value) {
				await mdEditorRef.value.saveFile();
			}
		} catch (action) {
			if (action === "cancel") {
				// 继续执行关闭逻辑
			} else {
				return;
			}
		}
	}

	openTabs.value.splice(tabIndex, 1);

	if (activeTabId.value === tabId) {
		if (openTabs.value.length > 0) {
			const newIndex = Math.max(
				0,
				Math.min(tabIndex - 1, openTabs.value.length - 1)
			);
			switchToTab(openTabs.value[newIndex].id);
		} else {
			activeTabId.value = null;
			currentFileHandle.value = null;
			currentFileNode.value = null;
			fileModified.value = false;
		}
	}

	await saveTabsState();
};

// 关闭所有页签
const closeAllTabs = async () => {
	const modifiedTabs = openTabs.value.filter((tab) => tab.isModified);
	if (modifiedTabs.length > 0) {
		const confirmed = await ElMessageBox.confirm(
			`有 ${modifiedTabs.length} 个文件已修改，是否保存后关闭所有页签？`,
			"确认关闭所有页签",
			{
				type: "warning",
				confirmButtonText: "保存并关闭",
				cancelButtonText: "不保存关闭",
				distinguishCancelAndClose: true,
			}
		).catch((action) => {
			if (action === "cancel") {
				return "cancel";
			}
			return "close";
		});

		if (confirmed === "close") {
			return;
		} else if (confirmed !== "cancel") {
			for (const tab of modifiedTabs) {
				if (activeTabId.value === tab.id && mdEditorRef.value) {
					await mdEditorRef.value.saveFile();
				}
			}
		}
	}

	openTabs.value = [];
	activeTabId.value = null;
	currentFileHandle.value = null;
	currentFileNode.value = null;
	fileModified.value = false;
};

// 处理目录选择
const handleSelectDirectory = (
	dirHandle: FileSystemDirectoryHandle,
	node: FileTreeNode
) => {
	console.log("选择目录:", node.label);
};

// 处理文件修改状态
const handleFileModified = async (
	modified: boolean,
	modifiedContentParam?: string
) => {
	fileModified.value = modified;

	if (modifiedContentParam !== undefined) {
		modifiedContent.value = modifiedContentParam;
		wordCount.value = calculateWordCount(modifiedContentParam);
	}

	if (activeTabId.value) {
		const tab = openTabs.value.find((t) => t.id === activeTabId.value);
		if (tab) {
			tab.isModified = modified;
			if (modified && modifiedContentParam !== undefined) {
				tab.modifiedContent = modifiedContentParam;
			} else if (!modified) {
				tab.modifiedContent = undefined;
				tab.lastSaveTime = Date.now();
			}
			await saveTabsState();
		}
	}
};

// 处理文件保存
const handleFileSaved = async (fileHandle: FileSystemFileHandle) => {
	if (activeTabId.value) {
		const tab = openTabs.value.find((t) => t.id === activeTabId.value);
		if (tab) {
			tab.isModified = false;
			tab.modifiedContent = undefined;
			tab.lastSaveTime = Date.now();
			await saveTabsState();
		}
	}
};

// 检查是否有未保存的修改
const hasUnsavedChanges = computed(() => {
	return openTabs.value.some((tab) => tab.isModified);
});

// 获取未保存的文件列表
const getUnsavedFiles = () => {
	return openTabs.value.filter((tab) => tab.isModified).map((tab) => tab.title);
};

// 确认关闭前的检查
const confirmBeforeClose = async (): Promise<boolean> => {
	if (!hasUnsavedChanges.value) {
		return true;
	}

	const unsavedFiles = getUnsavedFiles();
	const fileList =
		unsavedFiles.length > 3
			? unsavedFiles.slice(0, 3).join("、") +
				` 等 ${unsavedFiles.length} 个文件`
			: unsavedFiles.join("、");

	try {
		await ElMessageBox.confirm(
			`您有未保存的修改：${fileList}。关闭会丢失这些修改。`,
			"确认关闭",
			{
				type: "warning",
				confirmButtonText: "强制关闭",
				cancelButtonText: "取消",
				confirmButtonClass: "el-button--danger",
				distinguishCancelAndClose: true,
				showCancelButton: true,
				showClose: true,
				closeOnClickModal: false,
				closeOnPressEscape: false,
			}
		);
		return true;
	} catch (action) {
		return false;
	}
};

// 页面卸载前的确认
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
	if (hasUnsavedChanges.value) {
		event.preventDefault();
		event.returnValue = "您有未保存的修改，确定要离开吗？";
		return event.returnValue;
	}
};

// 开始调整大小
const startResize = (e: MouseEvent) => {
	isResizing.value = true;
	const startX = e.clientX;
	const startWidth = sidebarWidth.value;

	const onMouseMove = (e: MouseEvent) => {
		if (!isResizing.value) return;
		const deltaX = e.clientX - startX;
		const newWidth = startWidth + deltaX;
		if (newWidth >= 200 && newWidth <= 600) {
			sidebarWidth.value = newWidth;
		}
	};

	const onMouseUp = () => {
		isResizing.value = false;
		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);
	};

	document.addEventListener("mousemove", onMouseMove);
	document.addEventListener("mouseup", onMouseUp);
};

// 应用侧边栏宽度
const applySidebarWidth = (width: number) => {
	sidebarWidth.value = width;
};

// 切换折叠状态
const toggleCollapse = () => {
	isCollapsed.value = !isCollapsed.value;
};

// 应用主题
const applyTheme = (newTheme: "light" | "dark" | "auto") => {
	theme.value = newTheme;
	const root = document.documentElement;
	if (newTheme === "dark") {
		root.setAttribute("data-theme", "dark");
	} else if (newTheme === "light") {
		root.setAttribute("data-theme", "light");
	} else {
		root.removeAttribute("data-theme");
	}
};

// 关闭设置对话框
const handleCloseSettings = () => {
	showSettings.value = false;
};

// 保存设置
const saveSettings = () => {
	try {
		const settings = {
			sidebarWidth: sidebarWidth.value,
			theme: theme.value,
			autoSave: autoSave.value,
			showLineNumbers: showLineNumbers.value,
		};
		localStorage.setItem("file-browser-settings", JSON.stringify(settings));
		ElMessage.success("设置已保存");
		showSettings.value = false;
	} catch (error) {
		console.error("保存设置失败:", error);
		ElMessage.error("保存设置失败");
	}
};

// 重置设置
const resetSettings = () => {
	sidebarWidth.value = 300;
	theme.value = "auto";
	autoSave.value = false;
	showLineNumbers.value = true;
	localStorage.removeItem("file-browser-settings");
	ElMessage.success("设置已重置");
};

// 加载设置
const loadSettings = () => {
	try {
		const saved = localStorage.getItem("file-browser-settings");
		if (saved) {
			const settings = JSON.parse(saved);
			sidebarWidth.value = settings.sidebarWidth || 300;
			theme.value = settings.theme || "auto";
			autoSave.value = settings.autoSave || false;
			showLineNumbers.value = settings.showLineNumbers !== false;
			applyTheme(theme.value);
		}
	} catch (error) {
		console.error("加载设置失败:", error);
	}
};

// 键盘快捷键
const handleKeyboard = (e: KeyboardEvent) => {
	if (e.ctrlKey) {
		switch (e.key) {
			case "o":
				e.preventDefault();
				if (fileTreeRef.value) {
					fileTreeRef.value.selectRootDirectory();
				}
				break;
			case ",":
				e.preventDefault();
				showSettings.value = true;
				break;
		}
	}
};

// 组件挂载
onMounted(async () => {
	loadSettings();
	document.addEventListener("keydown", handleKeyboard);
	window.addEventListener("beforeunload", handleBeforeUnload);

	setTimeout(async () => {
		isInitializing.value = false;
		if (rootDirectoryHandle.value) {
			await loadTabsState();
		}
	}, 500);
});

// 监听根目录变化
watch(
	() => rootDirectoryHandle.value,
	async (newHandle) => {
		if (newHandle && !isInitializing.value) {
			await loadTabsState();
		}
	}
);

// 监听当前文件变化
watch(
	() => currentFileHandle.value,
	async (newHandle) => {
		if (newHandle) {
			try {
				const file = await newHandle.getFile();
				fileSize.value = file.size;
				const content = await file.text();
				wordCount.value = calculateWordCount(content);
				modifiedContent.value = content;
			} catch (error) {
				console.error("获取文件信息失败:", error);
				fileSize.value = 0;
				wordCount.value = 0;
				modifiedContent.value = "";
			}
		} else {
			fileSize.value = 0;
			wordCount.value = 0;
			modifiedContent.value = "";
		}
	}
);

// 组件卸载
onUnmounted(async () => {
	document.removeEventListener("keydown", handleKeyboard);
	window.removeEventListener("beforeunload", handleBeforeUnload);
	if (openTabs.value.length > 0) {
		await saveTabsState();
	}
});
</script>

<style scoped>
.scrollbar-hide {
	-ms-overflow-style: none;
	scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
	display: none;
}

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
</style>
