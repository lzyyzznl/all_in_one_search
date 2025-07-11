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
			<div v-else class="flex-1 flex flex-col relative">
				<!-- 右侧目录按钮 -->
				<button
					@click="showToc = !showToc"
					class="fixed right-4 top-1/3 z-40 bg-gradient-to-br from-blue-100 to-purple-200 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-200 rounded-full shadow-lg w-10 h-10 flex items-center justify-center hover:scale-110 transition-all"
					title="显示/隐藏大纲目录"
				>
					<span v-if="!showToc">📑</span>
					<span v-else>❌</span>
				</button>
				<!-- 右侧目录面板 -->
				<transition name="fade">
					<div
						v-if="showToc && tocItems.length > 0"
						class="fixed right-0 top-0 h-full w-72 bg-white/95 dark:bg-slate-900/95 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-6 overflow-y-auto flex flex-col"
					>
						<h3
							class="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2"
						>
							📑 文档大纲
						</h3>
						<div class="space-y-1">
							<div
								v-for="item in tocItems"
								:key="item.id"
								class="pl-2 border-l-2 border-slate-200 dark:border-slate-700 ml-1"
							>
								<a
									class="block py-1 px-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-slate-700 dark:text-slate-200 text-sm"
									:style="{ marginLeft: `${(item.level - 1) * 12}px` }"
									@click="jumpToHeading(item.id)"
								>
									{{ item.text }}
								</a>
							</div>
						</div>
					</div>
				</transition>
				<!-- 编辑器主内容区 -->
				<div class="flex-1 flex flex-col">
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
								@click="editor.chain().focus().toggleUnderline().run()"
								title="下划线"
								class="!rounded-lg !shadow-sm transition-all duration-200"
								:class="{
									'!bg-gradient-to-r !from-blue-600 !to-purple-600 !border-none !text-white !shadow-md':
										editor.isActive('underline'),
									'!bg-white dark:!bg-slate-800 !border-slate-300 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-50 dark:hover:!bg-slate-700':
										!editor.isActive('underline'),
								}"
							>
								<u class="font-semibold">U</u>
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
									editor.isActive('heading', { level: 1 })
										? 'primary'
										: 'default'
								"
								@click="
									editor.chain().focus().toggleHeading({ level: 1 }).run()
								"
								title="标题1"
								class="!rounded-lg !shadow-sm transition-all duration-200"
							>
								H1
							</el-button>
							<el-button
								size="small"
								:type="
									editor.isActive('heading', { level: 2 })
										? 'primary'
										: 'default'
								"
								@click="
									editor.chain().focus().toggleHeading({ level: 2 }).run()
								"
								title="标题2"
								class="!rounded-lg !shadow-sm transition-all duration-200"
							>
								H2
							</el-button>
							<el-button
								size="small"
								:type="
									editor.isActive('heading', { level: 3 })
										? 'primary'
										: 'default'
								"
								@click="
									editor.chain().focus().toggleHeading({ level: 3 }).run()
								"
								title="标题3"
								class="!rounded-lg !shadow-sm transition-all duration-200"
							>
								H3
							</el-button>
							<el-button
								size="small"
								:type="
									editor.isActive('heading', { level: 4 })
										? 'primary'
										: 'default'
								"
								@click="
									editor.chain().focus().toggleHeading({ level: 4 }).run()
								"
								title="标题4"
								class="!rounded-lg !shadow-sm transition-all duration-200"
							>
								H4
							</el-button>
							<el-button
								size="small"
								:type="
									editor.isActive('heading', { level: 5 })
										? 'primary'
										: 'default'
								"
								@click="
									editor.chain().focus().toggleHeading({ level: 5 }).run()
								"
								title="标题5"
								class="!rounded-lg !shadow-sm transition-all duration-200"
							>
								H5
							</el-button>
							<el-button
								size="small"
								:type="
									editor.isActive('heading', { level: 6 })
										? 'primary'
										: 'default'
								"
								@click="
									editor.chain().focus().toggleHeading({ level: 6 }).run()
								"
								title="标题6"
								class="!rounded-lg !shadow-sm transition-all duration-200"
							>
								H6
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
							<el-button
								size="small"
								:type="editor.isActive('taskList') ? 'primary' : 'default'"
								@click="editor.chain().focus().toggleTaskList().run()"
								title="任务列表"
								class="!rounded-lg !shadow-sm transition-all duration-200"
							>
								☑
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
							<el-button
								size="small"
								@click="insertDetails"
								title="可折叠内容"
								class="!rounded-lg !shadow-sm transition-all duration-200"
							>
								📋
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
								@click="exportJSON"
								title="导出JSON"
								class="!rounded-lg !shadow-sm transition-all duration-200"
								>🗂️JSON</el-button
							>
							<el-button
								size="small"
								@click="importJSON"
								title="导入JSON"
								class="!rounded-lg !shadow-sm transition-all duration-200"
								>📥JSON</el-button
							>
							<el-button
								size="small"
								@click="exportHTML"
								title="导出HTML"
								class="!rounded-lg !shadow-sm transition-all duration-200"
								>🗂️HTML</el-button
							>
							<el-button
								size="small"
								@click="importHTML"
								title="导入HTML"
								class="!rounded-lg !shadow-sm transition-all duration-200"
								>📥HTML</el-button
							>
							<el-button
								size="small"
								@click="exportMarkdown"
								title="导出Markdown"
								class="!rounded-lg !shadow-sm transition-all duration-200"
								>🗂️MD</el-button
							>
							<el-button
								size="small"
								@click="exportImage"
								title="导出为图片"
								class="!rounded-lg !shadow-sm transition-all duration-200"
							>
								🖼️图片
							</el-button>
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

						<el-button
							size="small"
							@click="showSearchDialog = true"
							title="查找/替换"
							class="!rounded-lg !shadow-sm transition-all duration-200"
						>
							🔍查找
						</el-button>
						<el-button
							size="small"
							@click="toggleLineNumbers"
							title="显示/隐藏行号"
							class="!rounded-lg !shadow-sm transition-all duration-200"
							:class="{
								'!bg-gradient-to-r !from-indigo-600 !to-purple-600 !border-none !text-white !shadow-md':
									showLineNumbers,
								'!bg-white dark:!bg-slate-800 !border-slate-300 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-50 dark:hover:!bg-slate-700':
									!showLineNumbers,
							}"
						>
							{{ showLineNumbers ? "🔢隐藏行号" : "🔢显示行号" }}
						</el-button>
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
								<!-- 气泡菜单 -->
								<bubble-menu
									v-if="editor"
									:editor="editor"
									:tippy-options="{ duration: 100 }"
									class="bubble-menu bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 flex space-x-1"
								>
									<button
										@click="editor.chain().focus().toggleBold().run()"
										:class="{
											'bg-blue-500 text-white': editor.isActive('bold'),
										}"
										class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
										title="粗体"
									>
										<strong>B</strong>
									</button>
									<button
										@click="editor.chain().focus().toggleItalic().run()"
										:class="{
											'bg-blue-500 text-white': editor.isActive('italic'),
										}"
										class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
										title="斜体"
									>
										<em>I</em>
									</button>
									<button
										@click="editor.chain().focus().toggleStrike().run()"
										:class="{
											'bg-blue-500 text-white': editor.isActive('strike'),
										}"
										class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
										title="删除线"
									>
										<s>S</s>
									</button>
									<button
										@click="editor.chain().focus().toggleUnderline().run()"
										:class="{
											'bg-blue-500 text-white': editor.isActive('underline'),
										}"
										class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
										title="下划线"
									>
										<u>U</u>
									</button>
								</bubble-menu>

								<EditorContent
									:editor="editor"
									:class="[
										'absolute inset-0 p-8 overflow-y-auto',
										{ 'line-numbers': showLineNumbers },
									]"
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
									fontFamily:
										'ui-monospace, SFMono-Regular, Consolas, monospace',
									lineHeight: '1.6',
								}"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- 统计卡片 -->
		<div
			v-if="editor"
			class="px-6 py-3 flex justify-end items-center gap-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700"
		>
			<div
				class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-medium border border-orange-200 dark:border-orange-800"
			>
				<span>📝</span>
				{{ characterCount }} 字符
			</div>
			<div
				class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-medium border border-green-200 dark:border-green-800"
			>
				<span>📊</span>
				{{ wordCount }} 字数
			</div>
			<div
				class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium border border-purple-200 dark:border-purple-800"
			>
				<span>📄</span>
				{{ formatFileSize(fileSize) }}
			</div>
			<div
				class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-800"
			>
				<span>📄</span>
				{{ lineCount }} 行
			</div>
			<div
				v-if="tabCount > 0"
				class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-medium border border-indigo-200 dark:border-indigo-800"
			>
				<span>📁</span>
				{{ tabCount }} 页签
			</div>
		</div>

		<!-- 查找替换弹窗 - 位于编辑器右上角 -->
		<div
			v-if="showSearchDialog"
			class="fixed top-20 right-6 z-50 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 backdrop-blur-sm"
			style="animation: fadeInSlide 0.3s ease-out"
		>
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
					查找与替换
				</h3>
				<button
					@click="showSearchDialog = false"
					class="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
				>
					✕
				</button>
			</div>

			<div class="space-y-4">
				<div>
					<label
						class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
					>
						查找
					</label>
					<el-input
						ref="searchInput"
						v-model="searchTerm"
						placeholder="输入查找内容..."
						@input="onSearchInput"
						@keydown.enter="findNext"
						@keydown.shift.enter="findPrev"
						class="w-full search-input"
					/>
				</div>

				<div>
					<label
						class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
					>
						替换
					</label>
					<el-input
						v-model="replaceTerm"
						placeholder="输入替换内容..."
						@input="onReplaceInput"
						@keydown.enter="replaceOne"
						@keydown.shift.enter="replaceAll"
						class="w-full"
					/>
				</div>

				<div class="flex items-center gap-3">
					<el-checkbox v-model="regexEnabled" label="正则表达式" />
					<el-checkbox v-model="caseSensitive" label="大小写敏感" />
				</div>

				<div class="flex gap-2 pt-2">
					<el-button size="small" @click="findPrev" class="flex-1">
						上一个
					</el-button>
					<el-button size="small" @click="findNext" class="flex-1">
						下一个
					</el-button>
				</div>

				<div class="flex gap-2">
					<el-button size="small" @click="replaceOne" class="flex-1">
						替换
					</el-button>
					<el-button
						size="small"
						type="primary"
						@click="replaceAll"
						class="flex-1"
					>
						全部替换
					</el-button>
				</div>

				<div
					v-if="searchResults.current && searchResults.total"
					class="text-xs text-slate-500 dark:text-slate-400 text-center"
				>
					{{ searchResults.current }} / {{ searchResults.total }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
// Vue 核心功能导入
import {
	computed,
	nextTick,
	onBeforeUnmount,
	onMounted,
	onUnmounted,
	ref,
	watch,
} from "vue";

// Element Plus 组件和图标导入
import { Document, DocumentCopy, Refresh } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";

// Tiptap 相关导入
import { StarterKit } from "@syfxlin/tiptap-starter-kit";
import { BubbleMenu } from "@tiptap/extension-bubble-menu";
import CharacterCount from "@tiptap/extension-character-count";
import Focus from "@tiptap/extension-focus";
import { EditorContent, useEditor } from "@tiptap/vue-3";
// @ts-ignore
// @ts-ignore
import TextAlign from "@tiptap/extension-text-align";
// @ts-ignore
import LineHeight from "tiptap-extension-line-height";
// @ts-ignore
import TableOfContents from "@tiptap/extension-table-of-contents";
import Typography from "@tiptap/extension-typography";
// @ts-ignore
import SearchAndReplace from "@sereneinserenade/tiptap-search-and-replace";

// 文件操作相关导入
import { getFileType, readFile, writeFile } from "../utils/file-service";
import type { FileSystemFileHandle, FileTreeNode } from "../utils/types";

// 引入prettier
import parserBabel from "prettier/parser-babel";
import parserHtml from "prettier/parser-html";
import parserMarkdown from "prettier/parser-markdown";
import parserPostcss from "prettier/parser-postcss";
import parserTypescript from "prettier/parser-typescript";
import prettier from "prettier/standalone";

// 引入html2canvas
import html2canvas from "html2canvas";

// 组件Props接口定义
interface Props {
	fileHandle?: FileSystemFileHandle | null;
	fileNode?: FileTreeNode | null;
	tabCount?: number;
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
	tabCount: 0,
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
const defaultEditorMode = ref<"wysiwyg" | "markdown">("wysiwyg");
const autoSave = ref(false);

// 自动保存定时器
let autoSaveTimer: NodeJS.Timeout | null = null;

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
			codeBlock: true,
		}),
		Focus.configure({
			className: "has-focus",
			mode: "all",
		}),
		CharacterCount.configure({
			limit: 0, // 不限制字符数，仅统计
		}),
		TextAlign,
		LineHeight,
		Typography,
		// @ts-ignore
		SearchAndReplace.configure({
			searchResultClass: "search-result",
			disableRegex: false,
		}),
		TableOfContents,
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
	onCreate: ({ editor }) => {
		// 编辑器创建时初始化字符统计
		updateCharacterCount(editor);
	},
});

// 处理Markdown源码模式下的输入事件
const handleMarkdownInput = () => {
	if (editorMode.value === "markdown" && editor.value) {
		if (editor.value.storage.markdown && editor.value.storage.markdown.set) {
			editor.value.storage.markdown.set(markdownContent.value);
		} else {
			editor.value.commands.setContent(markdownContent.value);
		}

		checkModified();

		// 延迟更新字符统计
		setTimeout(() => {
			if (editor.value) {
				updateCharacterCount(editor.value);
			}
		}, 100);
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

	// 切换模式后更新字符统计
	if (editor.value) {
		updateCharacterCount(editor.value);
	}
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

		originalContent.value = content;
		markdownContent.value = content;
		isModified.value = false;

		if (editor.value) {
			console.log("MdEditor: 设置编辑器内容", {
				editorExists: !!editor.value,
				hasMarkdownStorage: !!(
					editor.value.storage.markdown && editor.value.storage.markdown.set
				),
				contentLength: content.length,
			});

			if (editor.value.storage.markdown && editor.value.storage.markdown.set) {
				editor.value.storage.markdown.set(content);
				console.log("MdEditor: 使用markdown storage设置内容");
			} else {
				editor.value.commands.setContent(content);
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

		// 初始化字符统计
		if (editor.value) {
			updateCharacterCount(editor.value);
		}
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

// 搜索和字符统计相关的状态变量
const showSearchDialog = ref(false);
const searchTerm = ref("");
const replaceTerm = ref("");
const regexEnabled = ref(false);
const caseSensitive = ref(false);
const searchResults = ref({ current: 0, total: 0 });

// 字符统计
const characterCount = ref(0);
const wordCount = ref(0);
const fileSize = ref(0);
const lineCount = ref(0);

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// 更新字符统计
const updateCharacterCount = (editorInstance: any) => {
	try {
		if (!editorInstance) {
			console.warn("编辑器实例不存在");
			return;
		}

		const text = editorInstance.getText() || "";

		// 更新字符数
		characterCount.value = text.length;

		// 计算字数
		if (text.trim() === "") {
			wordCount.value = 0;
		} else {
			// 简单的字数统计：中文字符每个算一个词，英文按空格分隔
			const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
			const englishWords = text
				.replace(/[\u4e00-\u9fff]/g, " ")
				.trim()
				.split(/\s+/)
				.filter((word: string) => word.length > 0).length;
			wordCount.value = chineseChars + englishWords;
		}

		// 计算文件大小（字节数）
		fileSize.value = new Blob([text]).size;

		// 计算行数
		const lines = text.split("\n");
		lineCount.value = lines.length;

		console.log("字符统计更新:", {
			characters: characterCount.value,
			words: wordCount.value,
			fileSize: fileSize.value,
			lines: lineCount.value,
			text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
		});
	} catch (error) {
		console.warn("字符统计更新失败:", error);
		characterCount.value = 0;
		wordCount.value = 0;
		fileSize.value = 0;
		lineCount.value = 0;
	}
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

// 插入Mermaid图表
const insertMermaidChart = () => {
	if (!editor.value) return;

	const defaultMermaidCode =
		"graph TD\n    A[开始] --> B[处理]\n    B --> C[结束]";

	// 优先调用 insertMermaid 指令方法
	// @ts-ignore
	if (typeof editor.value.commands.insertMermaid === "function") {
		// @ts-ignore
		editor.value.commands.insertMermaid(defaultMermaidCode);
	} else {
		const fullMermaidCode = `\`\`\`mermaid\n${defaultMermaidCode}\n\`\`\`\n\n`;
		editor.value.commands.insertContent(fullMermaidCode);
	}
};

// 插入可折叠内容
const insertDetails = () => {
	if (!editor.value) return;
	try {
		editor.value
			.chain()
			.focus()
			.insertContent(
				`
<details>
<summary>点击展开</summary>

</details>
`
			)
			.run();
	} catch (error) {
		console.error("插入可折叠内容失败:", error);
	}
};

// 代码格式化方法
const formatCode = async () => {
	if (!editor.value) return;
	const { state, view } = editor.value;
	const { selection } = state;
	const { $from } = selection;
	const parent = $from.parent;
	if (parent.type.name !== "codeBlock") {
		ElMessage.warning("请先选中一个代码块");
		return;
	}
	const code = parent.textContent;
	// 获取语言
	const attrs = editor.value.getAttributes("codeBlock");
	const lang = attrs.language || "javascript";

	let parser = "babel";
	let plugins: any[] = [parserBabel];
	if (["typescript", "ts"].includes(lang)) {
		parser = "typescript";
		plugins = [parserTypescript] as any[];
	} else if (["html", "vue"].includes(lang)) {
		parser = "html";
		plugins = [parserHtml] as any[];
	} else if (["css", "scss", "less"].includes(lang)) {
		parser = "css";
		plugins = [parserPostcss] as any[];
	} else if (["json"].includes(lang)) {
		parser = "json";
		plugins = [parserBabel] as any[];
	} else if (["markdown", "md"].includes(lang)) {
		parser = "markdown";
		plugins = [parserMarkdown] as any[];
	}

	try {
		const formatted = await prettier.format(code, {
			parser,
			plugins,
			tabWidth: 2,
			semi: true,
			singleQuote: true,
		});
		// 替换当前代码块内容
		const { tr } = state;
		const pos = $from.before();
		tr.replaceWith(
			pos,
			pos + parent.nodeSize,
			parent.type.create(attrs, state.schema.text(formatted))
		);
		view.dispatch(tr);
		ElMessage.success("代码格式化完成");
	} catch (err) {
		ElMessage.error("格式化失败: " + (err as Error).message);
	}
};

// 工具栏方法实现
const exportJSON = () => {
	if (!editor.value) return;
	const json = editor.value.getJSON();
	const blob = new Blob([JSON.stringify(json, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "document.json";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};
const importJSON = async () => {
	if (!editor.value) return;
	const input = document.createElement("input");
	input.type = "file";
	input.accept = ".json,application/json";
	input.onchange = async (e: any) => {
		const file = e.target.files[0];
		if (!file) return;
		const text = await file.text();
		try {
			const json = JSON.parse(text);
			if (editor.value) {
				editor.value.commands.setContent(json);
				ElMessage.success("JSON导入成功");
			}
		} catch (err) {
			ElMessage.error("JSON格式错误");
		}
	};
	input.click();
};
const exportHTML = () => {
	if (!editor.value) return;
	const html = editor.value.getHTML();
	const blob = new Blob([html], { type: "text/html" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "document.html";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};
const importHTML = async () => {
	if (!editor.value) return;
	const input = document.createElement("input");
	input.type = "file";
	input.accept = ".html,text/html";
	input.onchange = async (e: any) => {
		const file = e.target.files[0];
		if (!file) return;
		const text = await file.text();
		if (editor.value) {
			editor.value.commands.setContent(text);
			ElMessage.success("HTML导入成功");
		}
	};
	input.click();
};
const exportMarkdown = () => {
	if (!editor.value) return;
	if (editor.value.storage.markdown && editor.value.storage.markdown.get) {
		const md = editor.value.storage.markdown.get();
		const blob = new Blob([md], { type: "text/markdown" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "document.md";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	} else {
		ElMessage.warning("当前内容不支持Markdown导出");
	}
};

// 插入为图片
const exportImage = async () => {
	const editorContent = document.querySelector(".ProseMirror");
	if (!editorContent) {
		ElMessage.error("未找到编辑器内容区域");
		return;
	}
	const canvas = await html2canvas(editorContent as HTMLElement, {
		backgroundColor: null,
	});
	canvas.toBlob((blob) => {
		if (!blob) return;
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "document.png";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	});
};

// 行号显示状态
const showLineNumbers = ref(false);

// 切换行号显示
const toggleLineNumbers = () => {
	showLineNumbers.value = !showLineNumbers.value;
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
				updateCharacterCount(editor.value);
			}
			markdownContent.value = "";
			originalContent.value = "";
			isModified.value = false;
			characterCount.value = 0;
			wordCount.value = 0;
			fileSize.value = 0;
			lineCount.value = 0;
		}
	}
);

// 监听编辑器初始化
watch(editor, (newEditor) => {
	if (newEditor) {
		// 编辑器初始化完成后立即更新字符统计
		updateCharacterCount(newEditor);
	}
});

// 组件挂载时的初始化
onMounted(() => {
	document.addEventListener("keydown", (e) => {
		if (e.ctrlKey && e.key === "s") {
			e.preventDefault();
			if (isModified.value) {
				saveFile();
			}
		}
		// 添加 Ctrl/Cmd + F 快捷键打开搜索
		if ((e.ctrlKey || e.metaKey) && e.key === "f") {
			e.preventDefault();
			showSearchDialog.value = true;
		}
		// ESC 键关闭搜索对话框
		if (e.key === "Escape" && showSearchDialog.value) {
			e.preventDefault();
			showSearchDialog.value = false;
		}
	});

	// 初始化字符统计
	if (editor.value) {
		updateCharacterCount(editor.value);
	}

	// 手动触发fileHandle的初始化逻辑
	if (props.fileHandle) {
		loadFileContent();
	} else {
		// 没有文件时重置状态
		if (editor.value) {
			editor.value.commands.setContent("");
			updateCharacterCount(editor.value);
		}
		markdownContent.value = "";
		originalContent.value = "";
		isModified.value = false;
		characterCount.value = 0;
		wordCount.value = 0;
		fileSize.value = 0;
		lineCount.value = 0;
	}

	// 定期更新字符统计
	setInterval(() => {
		if (editor.value) {
			updateCharacterCount(editor.value);
		}
	}, 2000);
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

const onSearchInput = () => {
	if (editor.value) {
		// 更新搜索配置以支持正则表达式
		// @ts-ignore
		editor.value.commands.setSearchTerm(searchTerm.value, {
			regex: regexEnabled.value,
			caseSensitive: caseSensitive.value,
		});
		// 更新搜索结果统计
		updateSearchResults();
	}
};
const onReplaceInput = () => {
	if (editor.value) {
		// @ts-ignore
		editor.value.commands.setReplaceTerm(replaceTerm.value);
	}
};
const findNext = () => {
	if (editor.value) {
		// @ts-ignore
		editor.value.commands.goToNext?.();
		updateSearchResults();
	}
};
const findPrev = () => {
	if (editor.value) {
		// @ts-ignore
		editor.value.commands.goToPrevious?.();
		updateSearchResults();
	}
};
const replaceOne = () => {
	if (editor.value) {
		// @ts-ignore
		editor.value.commands.replace?.();
		updateSearchResults();
	}
};
const replaceAll = () => {
	if (editor.value) {
		// @ts-ignore
		editor.value.commands.replaceAll?.();
		updateSearchResults();
	}
};

// 更新搜索结果统计
const updateSearchResults = () => {
	if (editor.value && searchTerm.value) {
		// 这里需要根据具体的SearchAndReplace扩展API来获取搜索结果
		// 目前先设置一个模拟值
		const results = { current: 1, total: 1 };
		searchResults.value = results;
	} else {
		searchResults.value = { current: 0, total: 0 };
	}
};

// 监听搜索选项变化
watch([regexEnabled, caseSensitive], () => {
	if (searchTerm.value) {
		onSearchInput();
	}
});

// 监听搜索对话框显示状态，自动聚焦到输入框
watch(showSearchDialog, (show) => {
	if (show) {
		nextTick(() => {
			const searchInput = document.querySelector(".search-input input");
			if (searchInput) {
				(searchInput as HTMLInputElement).focus();
			}
		});
	}
});

// 目录面板显示状态
const showToc = ref(false);
// 目录数据
const tocItems = computed(
	() => editor.value?.storage?.tableOfContents?.items || []
);
// 目录跳转方法
const jumpToHeading = (id: string) => {
	if (editor.value && id) {
		// @ts-ignore
		editor.value.commands.scrollToHeading?.(id);
	}
};
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
	font-family:
		-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu",
		"Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
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
	font-family:
		ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo,
		monospace;
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

/* 任务列表样式 */
:deep(.ProseMirror ul[data-type="taskList"]) {
	list-style: none;
	padding: 0;
}

:deep(.ProseMirror ul[data-type="taskList"] li) {
	display: flex;
	align-items: flex-start;
	margin: 0.5rem 0;
}

:deep(.ProseMirror ul[data-type="taskList"] li > label) {
	flex: 0 0 auto;
	margin-right: 0.5rem;
	margin-top: 0.1rem;
	user-select: none;
}

:deep(.ProseMirror ul[data-type="taskList"] li > div) {
	flex: 1 1 auto;
}

:deep(.ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div) {
	text-decoration: line-through;
	color: #9ca3af;
}

:deep(
	.dark .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div
) {
	color: #6b7280;
}

/* 搜索弹窗动画 */
@keyframes fadeInSlide {
	0% {
		opacity: 0;
		transform: translateX(20px) translateY(-10px);
	}
	100% {
		opacity: 1;
		transform: translateX(0) translateY(0);
	}
}

/* 搜索结果高亮样式 */
:deep(.search-result) {
	background: rgba(255, 255, 0, 0.3);
	border-radius: 3px;
	padding: 1px 2px;
}

:deep(.search-result.current) {
	background: rgba(255, 165, 0, 0.5);
	outline: 2px solid #ff6b00;
}

/* 行号样式 */
:deep(.line-numbers .ProseMirror) {
	counter-reset: line;
	padding-left: 5rem; /* 为行号预留更多空间，避免与悬浮菜单冲突 */
	position: relative; /* 为行号定位提供参考点 */
}

/* 确保行号不影响正常的行间距和段落间距 */
:deep(.line-numbers .ProseMirror p),
:deep(.line-numbers .ProseMirror h1),
:deep(.line-numbers .ProseMirror h2),
:deep(.line-numbers .ProseMirror h3),
:deep(.line-numbers .ProseMirror h4),
:deep(.line-numbers .ProseMirror h5),
:deep(.line-numbers .ProseMirror h6) {
	margin-top: 1rem; /* 恢复正常的段落间距 */
	margin-bottom: 1rem;
}

:deep(.line-numbers .ProseMirror h1) {
	margin-top: 2rem;
	margin-bottom: 1rem;
}

:deep(.line-numbers .ProseMirror h2) {
	margin-top: 1.75rem;
	margin-bottom: 0.875rem;
}

:deep(.line-numbers .ProseMirror h3) {
	margin-top: 1.5rem;
	margin-bottom: 0.75rem;
}

/* 为引用和列表添加正常间距 */
:deep(.line-numbers .ProseMirror blockquote) {
	margin: 1.5rem 0;
}

:deep(.line-numbers .ProseMirror ul),
:deep(.line-numbers .ProseMirror ol) {
	margin: 1rem 0;
	padding-left: 2rem;
}

:deep(.line-numbers .ProseMirror p),
:deep(.line-numbers .ProseMirror h1),
:deep(.line-numbers .ProseMirror h2),
:deep(.line-numbers .ProseMirror h3),
:deep(.line-numbers .ProseMirror h4),
:deep(.line-numbers .ProseMirror h5),
:deep(.line-numbers .ProseMirror h6),
:deep(.line-numbers .ProseMirror blockquote),
:deep(.line-numbers .ProseMirror pre),
:deep(.line-numbers .ProseMirror ul li),
:deep(.line-numbers .ProseMirror ol li) {
	counter-increment: line;
	position: relative; /* 为行号定位提供参考点 */
}

:deep(.line-numbers .ProseMirror p::before),
:deep(.line-numbers .ProseMirror h1::before),
:deep(.line-numbers .ProseMirror h2::before),
:deep(.line-numbers .ProseMirror h3::before),
:deep(.line-numbers .ProseMirror h4::before),
:deep(.line-numbers .ProseMirror h5::before),
:deep(.line-numbers .ProseMirror h6::before),
:deep(.line-numbers .ProseMirror blockquote::before),
:deep(.line-numbers .ProseMirror pre::before),
:deep(.line-numbers .ProseMirror ul li::before),
:deep(.line-numbers .ProseMirror ol li::before) {
	content: counter(line);
	position: absolute;
	left: -4.5rem; /* 更靠左，避免与悬浮菜单冲突 */
	top: 0;
	width: 3rem;
	height: 0; /* 确保不占用垂直空间 */
	color: #9ca3af;
	font-size: 0.75rem;
	font-family:
		ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo,
		monospace;
	text-align: right;
	line-height: inherit;
	user-select: none;
	pointer-events: none;
	overflow: visible; /* 确保内容可见 */
}

/* 深色模式下的行号颜色 */
:deep(.dark .line-numbers .ProseMirror p::before),
:deep(.dark .line-numbers .ProseMirror h1::before),
:deep(.dark .line-numbers .ProseMirror h2::before),
:deep(.dark .line-numbers .ProseMirror h3::before),
:deep(.dark .line-numbers .ProseMirror h4::before),
:deep(.dark .line-numbers .ProseMirror h5::before),
:deep(.dark .line-numbers .ProseMirror h6::before),
:deep(.dark .line-numbers .ProseMirror blockquote::before),
:deep(.dark .line-numbers .ProseMirror pre::before),
:deep(.dark .line-numbers .ProseMirror ul li::before),
:deep(.dark .line-numbers .ProseMirror ol li::before) {
	color: #6b7280;
}

/* 优化列表项行号显示 */
:deep(.line-numbers .ProseMirror ul li::before),
:deep(.line-numbers .ProseMirror ol li::before) {
	left: -6.5rem; /* 列表项需要更多的左边距，避免与悬浮菜单冲突 */
}

/* 代码块的行号样式 */
:deep(.line-numbers .ProseMirror pre) {
	padding-left: 1rem;
	margin: 1.5rem 0; /* 确保正常的代码块间距 */
}

:deep(.line-numbers .ProseMirror pre::before) {
	left: -4.5rem; /* 与其他行号保持一致的位置 */
	background: #f3f4f6;
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
	margin-top: 0.25rem;
	height: 0; /* 确保不占用垂直空间 */
	overflow: visible; /* 确保内容可见 */
}

/* 深色模式下的代码块行号背景 */
:deep(.dark .line-numbers .ProseMirror pre::before) {
	background: #374151;
}

/* 表格和其他元素的特殊处理 */
:deep(.line-numbers .ProseMirror table),
:deep(.line-numbers .ProseMirror hr) {
	counter-increment: line;
	position: relative;
	margin: 1.5rem 0; /* 确保正常的表格和分割线间距 */
}

:deep(.line-numbers .ProseMirror table::before),
:deep(.line-numbers .ProseMirror hr::before) {
	content: counter(line);
	position: absolute;
	left: -4.5rem; /* 与其他行号保持一致的位置 */
	top: 0;
	width: 3rem;
	height: 0; /* 确保不占用垂直空间 */
	color: #9ca3af;
	font-size: 0.75rem;
	font-family:
		ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo,
		monospace;
	text-align: right;
	line-height: 1.5;
	user-select: none;
	pointer-events: none;
	overflow: visible; /* 确保内容可见 */
}
</style>
