<template>
	<div class="h-full flex flex-col bg-white dark:bg-slate-800">
		<!-- 编辑器工具栏 -->
		<div
			class="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 flex-shrink-0 shadow-sm"
		>
			<div class="flex items-center gap-4">
				<div
					v-if="fileHandle"
					class="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 rounded-xl flex items-center justify-center shadow-lg"
				>
					<el-icon class="text-blue-600 dark:text-blue-300">
						<Document />
					</el-icon>
				</div>
				<div>
					<span class="font-bold text-slate-900 dark:text-slate-100 text-lg">
						{{ fileName || "未选择文件" }}
					</span>
					<div
						v-if="isModified"
						class="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-medium border border-orange-200 dark:border-orange-800 mt-1"
					>
						<span
							class="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"
						></span>
						已修改
					</div>
				</div>
			</div>
			<div class="flex gap-3">
				<el-button
					v-if="fileHandle"
					:icon="Refresh"
					size="small"
					@click="reloadFile"
					:loading="isLoading"
					title="重新加载"
					class="!bg-slate-100 dark:!bg-slate-700 !border-slate-300 dark:!border-slate-600 !text-slate-600 dark:!text-slate-300 hover:!bg-slate-200 dark:hover:!bg-slate-600 !rounded-xl !shadow-sm hover:!shadow-md transition-all duration-200"
				>
					<span class="ml-1">🔄</span>
				</el-button>
				<el-button
					v-if="fileHandle && isModified"
					:icon="DocumentCopy"
					size="small"
					@click="saveFile"
					:loading="isSaving"
					title="保存文件"
					class="!bg-gradient-to-r !from-green-600 !to-emerald-600 !border-none !text-white hover:!from-green-700 hover:!to-emerald-700 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all !duration-300 !font-medium !px-4"
				>
					✨ 保存
				</el-button>
			</div>
		</div>

		<!-- 编辑器主体 -->
		<div class="flex-1 flex flex-col">
			<!-- 文件未选择时的占位界面 -->
			<div
				v-if="!fileHandle"
				class="flex flex-col items-center justify-center h-full p-12 text-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"
			>
				<div class="relative mb-10">
					<div
						class="w-32 h-32 bg-gradient-to-br from-white to-slate-100 dark:from-slate-700 dark:to-slate-800 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse"
					>
						<el-icon size="64" class="text-slate-400 dark:text-slate-500">
							<Document />
						</el-icon>
					</div>
					<div
						class="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center animate-bounce shadow-xl"
					>
						<span class="text-white text-2xl">✏️</span>
					</div>
				</div>
				<h3 class="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
					选择一个文件开始编辑
				</h3>
				<p
					class="mb-8 text-slate-600 dark:text-slate-400 leading-relaxed max-w-md"
				>
					从左侧文件树中选择支持的文件类型，<br />开启您的创作之旅
				</p>
				<div class="flex flex-wrap gap-3 justify-center">
					<div
						v-for="format in supportedFormats"
						:key="format"
						class="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200"
					>
						{{ format }}
					</div>
				</div>
			</div>

			<!-- 编辑器内容区域 -->
			<div v-else class="flex-1 flex flex-col">
				<!-- Tiptap编辑器工具栏 -->
				<div
					class="flex items-center gap-3 px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex-wrap shadow-sm flex-shrink-0"
					v-if="editor"
				>
					<!-- 基础文本格式化工具 -->
					<div
						class="flex items-center gap-2 border-r border-slate-300 dark:border-slate-600 pr-3 mr-3"
					>
						<el-button
							size="small"
							@click="editor.chain().focus().toggleBold().run()"
							title="粗体"
							class="!rounded-lg !shadow-sm transition-all duration-200"
							:class="{
								'!bg-gradient-to-r !from-blue-600 !to-purple-600 !border-none !text-white !shadow-md':
									editor.isActive('bold'),
								'!bg-white dark:!bg-slate-800 !border-slate-300 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-50 dark:hover:!bg-slate-700':
									!editor.isActive('bold'),
							}"
						>
							<strong class="font-bold">B</strong>
						</el-button>
						<el-button
							size="small"
							@click="editor.chain().focus().toggleItalic().run()"
							title="斜体"
							class="!rounded-lg !shadow-sm transition-all duration-200"
							:class="{
								'!bg-gradient-to-r !from-blue-600 !to-purple-600 !border-none !text-white !shadow-md':
									editor.isActive('italic'),
								'!bg-white dark:!bg-slate-800 !border-slate-300 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-50 dark:hover:!bg-slate-700':
									!editor.isActive('italic'),
							}"
						>
							<em class="font-semibold">I</em>
						</el-button>
						<el-button
							size="small"
							:type="editor.isActive('strike') ? 'primary' : 'default'"
							@click="editor.chain().focus().toggleStrike().run()"
							title="删除线"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							<s>S</s>
						</el-button>
						<el-button
							size="small"
							:type="editor.isActive('code') ? 'primary' : 'default'"
							@click="editor.chain().focus().toggleCode().run()"
							title="行内代码"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							<code>&lt;/&gt;</code>
						</el-button>
					</div>

					<!-- 标题工具 -->
					<div
						class="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2"
					>
						<el-button
							size="small"
							:type="
								editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'
							"
							@click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
							title="标题1"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							H1
						</el-button>
						<el-button
							size="small"
							:type="
								editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'
							"
							@click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
							title="标题2"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							H2
						</el-button>
						<el-button
							size="small"
							:type="
								editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'
							"
							@click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
							title="标题3"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							H3
						</el-button>
					</div>

					<!-- 列表工具 -->
					<div
						class="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2"
					>
						<el-button
							size="small"
							:type="editor.isActive('bulletList') ? 'primary' : 'default'"
							@click="editor.chain().focus().toggleBulletList().run()"
							title="无序列表"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							•
						</el-button>
						<el-button
							size="small"
							:type="editor.isActive('orderedList') ? 'primary' : 'default'"
							@click="editor.chain().focus().toggleOrderedList().run()"
							title="有序列表"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							1.
						</el-button>
					</div>

					<!-- 引用和代码块工具 -->
					<div
						class="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2"
					>
						<el-button
							size="small"
							:type="editor.isActive('blockquote') ? 'primary' : 'default'"
							@click="editor.chain().focus().toggleBlockquote().run()"
							title="引用"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							❝
						</el-button>
						<el-button
							size="small"
							:type="editor.isActive('codeBlock') ? 'primary' : 'default'"
							@click="editor.chain().focus().toggleCodeBlock().run()"
							title="代码块"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							{}
						</el-button>
					</div>

					<!-- 表格编辑工具 -->
					<div
						class="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2"
					>
						<el-button
							size="small"
							@click="
								editor
									.chain()
									.focus()
									.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
									.run()
							"
							title="插入表格"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							📊
						</el-button>
						<el-button
							size="small"
							@click="editor.chain().focus().addRowAfter().run()"
							:disabled="!editor.can().addRowAfter()"
							title="添加行"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							+行
						</el-button>
						<el-button
							size="small"
							@click="editor.chain().focus().addColumnAfter().run()"
							:disabled="!editor.can().addColumnAfter()"
							title="添加列"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							+列
						</el-button>
						<el-button
							size="small"
							@click="editor.chain().focus().deleteRow().run()"
							:disabled="!editor.can().deleteRow()"
							title="删除行"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							-行
						</el-button>
						<el-button
							size="small"
							@click="editor.chain().focus().deleteColumn().run()"
							:disabled="!editor.can().deleteColumn()"
							title="删除列"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							-列
						</el-button>
						<el-button
							size="small"
							@click="editor.chain().focus().deleteTable().run()"
							:disabled="!editor.can().deleteTable()"
							title="删除表格"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							🗑️
						</el-button>
					</div>

					<!-- 图表功能工具 -->
					<div
						class="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-2"
					>
						<el-button
							size="small"
							@click="insertMermaidChart"
							title="插入Mermaid图表"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							📈
						</el-button>
					</div>

					<!-- 其他编辑工具 -->
					<div class="flex items-center gap-1">
						<el-button
							size="small"
							@click="editor.chain().focus().setHorizontalRule().run()"
							title="分割线"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							—
						</el-button>
						<el-button
							size="small"
							@click="editor.chain().focus().undo().run()"
							:disabled="!editor.can().undo()"
							title="撤销"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							↶
						</el-button>
						<el-button
							size="small"
							@click="editor.chain().focus().redo().run()"
							:disabled="!editor.can().redo()"
							title="重做"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							↷
						</el-button>
					</div>

					<!-- 编辑模式切换 -->
					<div
						class="ml-auto flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm"
					>
						<el-button
							size="small"
							@click="toggleEditorMode('wysiwyg')"
							title="可视化编辑"
							class="!rounded-lg !px-4 !py-2 transition-all duration-200"
							:class="{
								'!bg-gradient-to-r !from-blue-600 !to-purple-600 !border-none !text-white !shadow-md':
									editorMode === 'wysiwyg',
								'!bg-transparent !border-transparent !text-blue-600 dark:!text-blue-300 hover:!bg-blue-50 dark:hover:!bg-blue-700':
									editorMode !== 'wysiwyg',
							}"
						>
							🎨 富文本
						</el-button>
						<el-button
							size="small"
							@click="toggleEditorMode('markdown')"
							title="Markdown源码"
							class="!rounded-lg !px-4 !py-2 transition-all duration-200"
							:class="{
								'!bg-gradient-to-r !from-slate-600 !to-slate-700 !border-none !text-white !shadow-md':
									editorMode === 'markdown',
								'!bg-transparent !border-transparent !text-slate-600 dark:!text-slate-300 hover:!bg-slate-50 dark:hover:!bg-slate-700':
									editorMode !== 'markdown',
							}"
						>
							📝 原始文本
						</el-button>
					</div>
				</div>

				<!-- 编辑器内容区 -->
				<div class="flex-1 flex flex-col">
					<!-- 富文本编辑模式 -->
					<div
						v-if="editorMode === 'wysiwyg'"
						class="flex-1 flex flex-col p-6 bg-slate-50 dark:bg-slate-900"
					>
						<div
							class="flex-1 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl relative min-h-0"
						>
							<EditorContent
								:editor="editor"
								class="absolute inset-0 p-8 overflow-y-auto"
							/>
						</div>
					</div>

					<!-- Markdown源码编辑模式 -->
					<div
						v-else
						class="flex-1 flex flex-col p-6 bg-slate-50 dark:bg-slate-900"
					>
						<el-input
							v-model="markdownContent"
							type="textarea"
							:autosize="false"
							placeholder="🌱 在这里输入您的 Markdown 内容...您可以使用：# 标题**粗体** *斜体*- 列表[链接](url)\`\`\`代码块\`\`\`开始您的创作吧！✨"
							class="flex-1 font-mono text-sm"
							resize="none"
							@input="handleMarkdownInput"
							:input-style="{
								height: '100%',
								padding: '32px',
								background: 'white',
								border: '2px solid #e2e8f0',
								borderRadius: '16px',
								boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
								fontSize: '14px',
								fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
								lineHeight: '1.6',
							}"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
// Vue 核心功能导入
import {
	ref,
	computed,
	onMounted,
	onUnmounted,
	onBeforeUnmount,
	watch,
	nextTick,
} from "vue";

// Element Plus 组件和图标导入
import { Document, DocumentCopy, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElNotification, ElMessageBox } from "element-plus";

// Tiptap 相关导入
import { useEditor, EditorContent } from "@tiptap/vue-3";
import { StarterKit } from "@syfxlin/tiptap-starter-kit";

// 文件操作相关导入
import {
	readFile,
	writeFile,
	getFileInfo,
	getFileType,
} from "../utils/file-service";
import type { FileSystemFileHandle, FileTreeNode } from "../utils/types";

// 组件Props接口定义
interface Props {
	fileHandle?: FileSystemFileHandle | null;
	fileNode?: FileTreeNode | null;
}

// 组件事件接口定义
interface Emits {
	(e: "file-modified", isModified: boolean, modifiedContent?: string): void;
	(e: "file-saved", fileHandle: FileSystemFileHandle): void;
}

// 组件属性和事件定义
const props = withDefaults(defineProps<Props>(), {
	fileHandle: null,
	fileNode: null,
});

const emit = defineEmits<Emits>();

// 文件和编辑器状态
const isLoading = ref(false);
const isSaving = ref(false);
const isModified = ref(false);

const originalContent = ref("");
const markdownContent = ref("");
const editorMode = ref<"wysiwyg" | "markdown">("wysiwyg");

// 编辑器配置状态
const editorTheme = ref<"light" | "dark">("light");
const defaultEditorMode = ref<"wysiwyg" | "markdown">("wysiwyg");
const autoSave = ref(false);

// 自动保存定时器
let autoSaveTimer: NodeJS.Timeout | null = null;

// Mermaid语法转换函数
const convertMermaidSyntax = (content: string): string => {
	return content.replace(
		/\`\`\`mermaid\n([\s\S]*?)\n\`\`\`/g,
		":::mermaid\n$1\n:::"
	);
};

// 当前编辑的文件名
const fileName = computed(() => {
	return props.fileNode?.label || props.fileHandle?.name || "";
});

// 支持的文件格式列表
const supportedFormats = computed(() => [
	".md",
	".txt",
	".log",
	".json",
	".js",
	".ts",
	".html",
	".css",
	".vue",
]);

// 初始化Tiptap编辑器实例
const editor = useEditor({
	extensions: [
		StarterKit.configure({
			heading: {
				levels: [1, 2, 3, 4, 5, 6],
			},
			mermaid: true,
			table: true,
			markdown: true,
			clipboard: true,
			emoji: true,
			blockMenu: true,
			floatMenu: true,
			clickMenu: true,
		}),
	],
	content: "",
	editorProps: {
		attributes: {
			class:
				"h-full overflow-y-auto outline-none prose prose-slate dark:prose-invert max-w-none",
		},
	},
	onUpdate: ({ editor }) => {
		if (editorMode.value === "wysiwyg") {
			if (editor.storage.markdown && editor.storage.markdown.get) {
				markdownContent.value = editor.storage.markdown.get();
			} else {
				markdownContent.value = editor.getHTML();
			}
		}
		checkModified();
	},
});

// 处理Markdown源码模式下的输入事件
const handleMarkdownInput = () => {
	if (editorMode.value === "markdown" && editor.value) {
		const convertedContent = convertMermaidSyntax(markdownContent.value);
		if (convertedContent !== markdownContent.value) {
			markdownContent.value = convertedContent;
		}

		if (editor.value.storage.markdown && editor.value.storage.markdown.set) {
			editor.value.storage.markdown.set(markdownContent.value);
		} else {
			editor.value.commands.setContent(markdownContent.value);
		}
		checkModified();
	}
};

// 切换编辑器模式
const toggleEditorMode = (mode: "wysiwyg" | "markdown") => {
	if (!editor.value) return;

	if (mode === "markdown" && editorMode.value === "wysiwyg") {
		if (editor.value.storage.markdown && editor.value.storage.markdown.get) {
			markdownContent.value = editor.value.storage.markdown.get();
		} else {
			markdownContent.value = editor.value.getHTML();
		}
	} else if (mode === "wysiwyg" && editorMode.value === "markdown") {
		if (editor.value.storage.markdown && editor.value.storage.markdown.set) {
			editor.value.storage.markdown.set(markdownContent.value);
		} else {
			editor.value.commands.setContent(markdownContent.value);
		}
	}

	editorMode.value = mode;
};

// 加载文件内容到编辑器
const loadFileContent = async () => {
	if (!props.fileHandle) {
		console.log("MdEditor: 没有fileHandle，跳过加载");
		return;
	}

	try {
		isLoading.value = true;
		console.log("MdEditor: 开始加载文件内容", {
			fileName: props.fileHandle.name,
			fileHandleKind: props.fileHandle.kind,
			hasFileNode: !!props.fileNode,
		});

		const content = await readFile(props.fileHandle);
		console.log("MdEditor: 文件内容读取完成", {
			contentLength: content.length,
			contentPreview:
				content.substring(0, 200) + (content.length > 200 ? "..." : ""),
			contentType: typeof content,
		});

		const convertedContent = convertMermaidSyntax(content);
		console.log("MdEditor: Mermaid语法转换完成", {
			originalLength: content.length,
			convertedLength: convertedContent.length,
			hasMermaidSyntax: content.includes("\`\`\`mermaid"),
		});

		originalContent.value = convertedContent;
		markdownContent.value = convertedContent;
		isModified.value = false;

		if (editor.value) {
			console.log("MdEditor: 设置编辑器内容", {
				editorExists: !!editor.value,
				hasMarkdownStorage: !!(
					editor.value.storage.markdown && editor.value.storage.markdown.set
				),
				contentLength: convertedContent.length,
			});

			if (editor.value.storage.markdown && editor.value.storage.markdown.set) {
				editor.value.storage.markdown.set(convertedContent);
				console.log("MdEditor: 使用markdown storage设置内容");
			} else {
				editor.value.commands.setContent(convertedContent);
				console.log("MdEditor: 使用setContent命令设置内容");
			}

			setTimeout(() => {
				if (editor.value) {
					const editorContent = editor.value.getHTML();
					console.log("MdEditor: 编辑器内容验证", {
						editorContentLength: editorContent.length,
						editorContentPreview:
							editorContent.substring(0, 200) +
							(editorContent.length > 200 ? "..." : ""),
						contentMatches: editorContent.length > 0,
					});
				}
			}, 100);
		} else {
			console.error("MdEditor: 编辑器实例不存在！");
		}

		const fileType = getFileType(fileName.value);
		if (fileType === "markdown") {
			editorMode.value = defaultEditorMode.value;
		} else {
			editorMode.value = "wysiwyg";
		}

		console.log("MdEditor: 文件加载完成", {
			fileType,
			editorMode: editorMode.value,
			isModified: isModified.value,
		});
	} catch (error) {
		console.error("MdEditor: 加载文件失败", error);
		ElMessage.error("加载文件失败: " + (error as Error).message);
	} finally {
		isLoading.value = false;
	}
};

// 检查文件是否已被修改
const checkModified = () => {
	if (!editor.value) return;

	let currentContent = "";
	if (editor.value.storage.markdown && editor.value.storage.markdown.get) {
		currentContent = editor.value.storage.markdown.get();
	} else {
		currentContent = editor.value.getHTML();
	}

	const modified = currentContent !== originalContent.value;
	if (modified !== isModified.value) {
		isModified.value = modified;
		emit("file-modified", modified, modified ? currentContent : undefined);

		if (modified && autoSave.value) {
			scheduleAutoSave();
		}
	}
};

// 安排自动保存任务
const scheduleAutoSave = () => {
	if (autoSaveTimer) {
		clearTimeout(autoSaveTimer);
	}
	autoSaveTimer = setTimeout(() => {
		if (isModified.value) {
			saveFile();
		}
	}, 2000);
};

// 保存文件
const saveFile = async () => {
	if (!props.fileHandle || !editor.value) return;

	try {
		isSaving.value = true;
		let content = "";
		if (editor.value.storage.markdown && editor.value.storage.markdown.get) {
			content = editor.value.storage.markdown.get();
		} else {
			content = editor.value.getHTML();
		}

		await writeFile(props.fileHandle, content);
		originalContent.value = content;
		markdownContent.value = content;
		isModified.value = false;
		emit("file-modified", false);
		emit("file-saved", props.fileHandle);

		ElNotification({
			title: "保存成功",
			message: `文件 ${fileName.value} 已保存`,
			type: "success",
			duration: 2000,
		});
	} catch (error) {
		ElMessage.error("保存文件失败: " + (error as Error).message);
	} finally {
		isSaving.value = false;
	}
};

// 重新加载文件
const reloadFile = async () => {
	if (isModified.value) {
		const confirmed = await ElMessageBox.confirm(
			"文件已修改，重新加载将丢失未保存的更改。是否继续？",
			"确认重新加载",
			{ type: "warning" }
		).catch(() => false);

		if (!confirmed) return;
	}

	await loadFileContent();
};

// 恢复修改的内容
const restoreModifiedContent = (content: string, modified: boolean = true) => {
	if (!editor.value) return;

	console.log("MdEditor: 恢复修改的内容", {
		contentLength: content.length,
		isModified: modified,
	});

	if (editor.value.storage.markdown && editor.value.storage.markdown.set) {
		editor.value.storage.markdown.set(content);
	} else {
		editor.value.commands.setContent(content);
	}

	markdownContent.value = content;
	isModified.value = modified;
};

// 更新编辑器主题
const updateEditorTheme = (theme: "light" | "dark") => {
	// TODO: 实现主题切换逻辑
};

// 更新默认编辑模式
const updateDefaultEditorMode = (mode: "wysiwyg" | "markdown") => {
	// TODO: 实现默认模式更新逻辑
};

// 更新自动保存设置
const updateAutoSave = (enabled: boolean) => {
	if (!enabled && autoSaveTimer) {
		clearTimeout(autoSaveTimer);
		autoSaveTimer = null;
	}
};

// 插入Mermaid图表
const insertMermaidChart = () => {
	if (!editor.value) return;

	const defaultMermaidCode =
		"graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]";

	try {
		if (editor.value.commands.setMermaid) {
			editor.value.commands.setMermaid(defaultMermaidCode);
		} else {
			const fullMermaidCode = `:::mermaid\n${defaultMermaidCode}\n:::\n\n`;
			editor.value.commands.insertContent(fullMermaidCode);
		}
	} catch (error) {
		const fullMermaidCode = `:::mermaid\n${defaultMermaidCode}\n:::\n\n`;
		editor.value.commands.insertContent(fullMermaidCode);
	}
};

// 监听文件句柄变化
watch(
	() => props.fileHandle,
	(newHandle, oldHandle) => {
		console.log("MdEditor: fileHandle变化监听触发", {
			newHandle: newHandle
				? {
						name: newHandle.name,
						kind: newHandle.kind,
				  }
				: null,
			oldHandle: oldHandle
				? {
						name: oldHandle.name,
						kind: oldHandle.kind,
				  }
				: null,
			hasEditor: !!editor.value,
		});

		if (newHandle) {
			console.log("MdEditor: 检测到新文件句柄，开始加载内容");
			loadFileContent();
		} else {
			console.log("MdEditor: 文件句柄为空，清空编辑器内容");
			if (editor.value) {
				editor.value.commands.setContent("");
			}
			markdownContent.value = "";
			originalContent.value = "";
			isModified.value = false;
		}
	},
	{ immediate: true }
);

// 组件挂载时的初始化
onMounted(() => {
	document.addEventListener("keydown", (e) => {
		if (e.ctrlKey && e.key === "s") {
			e.preventDefault();
			if (isModified.value) {
				saveFile();
			}
		}
	});

	document.addEventListener("paste", (e) => {
		if (!editor.value) return;

		const clipboardData = e.clipboardData;
		if (clipboardData) {
			const pastedText = clipboardData.getData("text/plain");
			if (pastedText.includes("\`\`\`mermaid")) {
				const mermaidRegex = /\`\`\`mermaid\n([\s\S]*?)\n\`\`\`/g;
				const matches = [...pastedText.matchAll(mermaidRegex)];
				e.preventDefault();

				if (editorMode.value === "markdown") {
					const convertedText = convertMermaidSyntax(pastedText);
					const textarea = e.target as HTMLTextAreaElement;
					if (textarea && textarea.tagName === "TEXTAREA") {
						const start = textarea.selectionStart;
						const end = textarea.selectionEnd;
						const currentValue = markdownContent.value;
						markdownContent.value =
							currentValue.substring(0, start) +
							convertedText +
							currentValue.substring(end);

						nextTick(() => {
							handleMarkdownInput();
						});
					}
				} else {
					if (matches.length > 0 && editor.value) {
						matches.forEach((match) => {
							const mermaidCode = match[1].trim();
							if (editor.value && editor.value.commands.setMermaid) {
								editor.value.commands.setMermaid(mermaidCode);
							} else if (editor.value) {
								const convertedText = `:::mermaid\n${mermaidCode}\n:::\n\n`;
								editor.value.commands.insertContent(convertedText);
							}
						});
					} else if (editor.value) {
						editor.value.commands.insertContent(pastedText);
					}
				}
			}
		}
	});
});

// 组件卸载时的清理
onUnmounted(() => {
	if (autoSaveTimer) {
		clearTimeout(autoSaveTimer);
	}
});

// 组件卸载前的清理
onBeforeUnmount(() => {
	if (editor.value) {
		editor.value.destroy();
	}
});

// 暴露给父组件的方法
defineExpose({
	reloadFile,
	saveFile,
	restoreModifiedContent,
});
</script>

<style scoped>
:deep(.modern-drawer .el-drawer) {
	border-radius: 16px 0 0 16px;
	box-shadow: -10px 0 25px -5px rgba(0, 0, 0, 0.1);
}

:deep(.modern-drawer .el-drawer__header) {
	background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
	border-bottom: 1px solid #e2e8f0;
	padding: 20px 24px;
}

:deep(.modern-drawer .el-drawer__title) {
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

:deep(.ProseMirror) {
	outline: none;
	padding: 2rem;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
		"Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
		sans-serif;
	line-height: 1.7;
	color: #374151;
}

:deep(.ProseMirror h1) {
	font-size: 2.25rem;
	font-weight: 700;
	margin: 2rem 0 1rem 0;
	color: #111827;
}

:deep(.ProseMirror h2) {
	font-size: 1.875rem;
	font-weight: 600;
	margin: 1.75rem 0 0.875rem 0;
	color: #111827;
}

:deep(.ProseMirror h3) {
	font-size: 1.5rem;
	font-weight: 600;
	margin: 1.5rem 0 0.75rem 0;
	color: #111827;
}

:deep(.ProseMirror p) {
	margin: 1rem 0;
}

:deep(.ProseMirror ul, .ProseMirror ol) {
	margin: 1rem 0;
	padding-left: 2rem;
}

:deep(.ProseMirror blockquote) {
	border-left: 4px solid #e5e7eb;
	padding-left: 1rem;
	margin: 1.5rem 0;
	font-style: italic;
	color: #6b7280;
}

:deep(.ProseMirror code) {
	background: #f3f4f6;
	padding: 0.25rem 0.5rem;
	border-radius: 0.375rem;
	font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas,
		"Liberation Mono", Menlo, monospace;
	font-size: 0.875rem;
}

:deep(.ProseMirror pre) {
	background: #1f2937;
	color: #f9fafb;
	padding: 1.5rem;
	border-radius: 0.75rem;
	overflow-x: auto;
	margin: 1.5rem 0;
}

:deep(.ProseMirror pre code) {
	background: transparent;
	padding: 0;
	color: inherit;
}

:deep(.ProseMirror table) {
	border-collapse: collapse;
	margin: 1.5rem 0;
	width: 100%;
}

:deep(.ProseMirror th, .ProseMirror td) {
	border: 1px solid #e5e7eb;
	padding: 0.75rem;
	text-align: left;
}

:deep(.ProseMirror th) {
	background: #f9fafb;
	font-weight: 600;
}

:deep(.ProseMirror hr) {
	border: none;
	border-top: 2px solid #e5e7eb;
	margin: 2rem 0;
}

:deep(.dark .ProseMirror) {
	color: #d1d5db;
}

:deep(.dark .ProseMirror h1, .dark .ProseMirror h2, .dark .ProseMirror h3) {
	color: #f9fafb;
}

:deep(.dark .ProseMirror blockquote) {
	border-left-color: #4b5563;
	color: #9ca3af;
}

:deep(.dark .ProseMirror code) {
	background: #374151;
	color: #f3f4f6;
}

:deep(.dark .ProseMirror th, .dark .ProseMirror td) {
	border-color: #4b5563;
}

:deep(.dark .ProseMirror th) {
	background: #374151;
}

:deep(.dark .ProseMirror hr) {
	border-top-color: #4b5563;
}
</style>
