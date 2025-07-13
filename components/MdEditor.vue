<template>
	<div class="h-full flex flex-col bg-white dark:bg-slate-800">
		<!-- 双行工具栏，仅在有标签时显示 -->
		<div
			v-if="tabCount > 0"
			class="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 shadow-sm"
		>
			<!-- 第一行工具栏：基础编辑功能 -->
			<div class="border-b border-slate-100 dark:border-slate-600">
				<!-- 左侧：Tiptap编辑按钮组（响应式换行布局） -->
				<div class="w-full">
					<div class="flex flex-wrap items-center gap-3 px-4 py-3">
						<!-- 基础文本格式化工具组 -->
						<div class="flex items-center gap-1">
							<el-button
								size="default"
								@click="editor?.chain().focus().toggleBold().run()"
								title="粗体"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
								:class="{
									'!bg-gradient-to-r !from-blue-600 !to-purple-600 !border-none !text-white !shadow-md':
										editor?.isActive('bold'),
									'!bg-white dark:!bg-slate-800 !border-slate-300 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-50 dark:hover:!bg-slate-700':
										!editor?.isActive('bold'),
								}"
							>
								<Icon icon="material-symbols:format-bold" class="text-lg" />
							</el-button>
							<el-button
								size="default"
								@click="editor?.chain().focus().toggleItalic().run()"
								title="斜体"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
								:class="{
									'!bg-gradient-to-r !from-blue-600 !to-purple-600 !border-none !text-white !shadow-md':
										editor?.isActive('italic'),
									'!bg-white dark:!bg-slate-800 !border-slate-300 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-50 dark:hover:!bg-slate-700':
										!editor?.isActive('italic'),
								}"
							>
								<Icon icon="material-symbols:format-italic" class="text-lg" />
							</el-button>
							<el-button
								size="default"
								:type="editor?.isActive('strike') ? 'primary' : 'default'"
								@click="editor?.chain().focus().toggleStrike().run()"
								title="删除线"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon
									icon="material-symbols:format-strikethrough"
									class="text-lg"
								/>
							</el-button>
							<el-button
								size="default"
								@click="editor?.chain().focus().toggleUnderline().run()"
								title="下划线"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
								:class="{
									'!bg-gradient-to-r !from-blue-600 !to-purple-600 !border-none !text-white !shadow-md':
										editor?.isActive('underline'),
									'!bg-white dark:!bg-slate-800 !border-slate-300 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-50 dark:hover:!bg-slate-700':
										!editor?.isActive('underline'),
								}"
							>
								<Icon
									icon="material-symbols:format-underlined"
									class="text-lg"
								/>
							</el-button>
							<el-button
								size="default"
								:type="editor?.isActive('code') ? 'primary' : 'default'"
								@click="editor?.chain().focus().toggleCode().run()"
								title="行内代码"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:code" class="text-lg" />
							</el-button>
						</div>

						<!-- 分隔线 -->
						<div class="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>

						<!-- 标题下拉菜单 -->
						<el-dropdown trigger="click">
							<el-button
								size="default"
								class="!rounded-md !shadow-sm transition-all duration-200 !min-w-16 !h-9 !px-2"
								title="标题样式"
							>
								<div class="flex items-center gap-1">
									<span class="text-sm font-medium">{{
										currentHeadingType
									}}</span>
									<Icon
										icon="material-symbols:keyboard-arrow-down"
										class="text-sm"
									/>
								</div>
							</el-button>
							<template #dropdown>
								<el-dropdown-menu class="min-w-40 p-2">
									<el-dropdown-item
										@click.native="editor?.chain().focus().setParagraph().run()"
										:class="{
											'font-bold text-base': editor?.isActive('paragraph'),
										}"
										>正文
										<span class="ml-4 text-xs text-slate-400"
											>Alt Ctrl 0</span
										></el-dropdown-item
									>
									<el-dropdown-item
										v-for="level in [1, 2, 3, 4, 5, 6]"
										:key="level"
										@click.native="
											editor
												?.chain()
												.focus()
												.toggleHeading({
													level: level as 1 | 2 | 3 | 4 | 5 | 6,
												})
												.run()
										"
										:class="{
											'font-bold': editor?.isActive('heading', { level }),
										}"
									>
										<span :class="'text-lg font-bold'">标题{{ level }}</span>
										<span class="ml-4 text-xs text-slate-400"
											>Alt Ctrl {{ level }}</span
										>
									</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>

						<!-- 分隔线 -->
						<div class="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>

						<!-- 列表工具组 -->
						<div class="flex items-center gap-1">
							<el-button
								size="default"
								:type="editor?.isActive('bulletList') ? 'primary' : 'default'"
								@click="editor?.chain().focus().toggleBulletList().run()"
								title="无序列表"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon
									icon="material-symbols:format-list-bulleted"
									class="text-lg"
								/>
							</el-button>
							<el-button
								size="default"
								:type="editor?.isActive('orderedList') ? 'primary' : 'default'"
								@click="editor?.chain().focus().toggleOrderedList().run()"
								title="有序列表"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon
									icon="material-symbols:format-list-numbered"
									class="text-lg"
								/>
							</el-button>
							<el-button
								size="default"
								:type="editor?.isActive('taskList') ? 'primary' : 'default'"
								@click="editor?.chain().focus().toggleTaskList().run()"
								title="任务列表"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:checklist" class="text-lg" />
							</el-button>
						</div>

						<!-- 分隔线 -->
						<div class="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>

						<!-- 引用和代码块工具组 -->
						<div class="flex items-center gap-1">
							<el-button
								size="default"
								:type="editor?.isActive('blockquote') ? 'primary' : 'default'"
								@click="editor?.chain().focus().toggleBlockquote().run()"
								title="引用"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:format-quote" class="text-lg" />
							</el-button>
							<el-button
								size="default"
								:type="editor?.isActive('codeBlock') ? 'primary' : 'default'"
								@click="editor?.chain().focus().toggleCodeBlock().run()"
								title="代码块"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:code-blocks" class="text-lg" />
							</el-button>
							<el-button
								size="default"
								@click="insertDetails"
								title="插入折叠区域"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:expand-more" class="text-lg" />
							</el-button>
						</div>

						<!-- 分隔线 -->
						<div class="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>

						<!-- 插入工具组 -->
						<div class="flex items-center gap-1">
							<el-button
								size="default"
								@click="
									editor
										?.chain()
										.focus()
										.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
										.run()
								"
								title="插入表格"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:table" class="text-lg" />
							</el-button>
							<el-button
								size="default"
								@click="insertMermaidChart"
								title="插入Mermaid"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:insert-chart" class="text-lg" />
							</el-button>
							<el-button
								size="default"
								@click="editor?.chain().focus().setHorizontalRule().run()"
								title="分割线"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:horizontal-rule" class="text-lg" />
							</el-button>
							<el-button
								size="default"
								@click="convertCodeBlocks"
								title="转换代码块语法 (``` ↔ :::)"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:transform" class="text-lg" />
							</el-button>
						</div>

						<!-- 分隔线 -->
						<div class="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
						<!-- 撤销重做工具组 -->
						<div class="flex items-center gap-1">
							<el-button
								size="default"
								@click="editor?.chain().focus().undo().run()"
								:disabled="!editor?.can().undo()"
								title="撤销"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:undo" class="text-lg" />
							</el-button>
							<el-button
								size="default"
								@click="editor?.chain().focus().redo().run()"
								:disabled="!editor?.can().redo()"
								title="重做"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:redo" class="text-lg" />
							</el-button>
						</div>

						<!-- 分隔线 -->
						<div class="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>

						<!-- 导出工具组 -->
						<div class="flex items-center gap-1">
							<el-button
								size="default"
								@click="exportMarkdown"
								title="导出Markdown"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:description" class="text-lg" />
							</el-button>
							<el-button
								size="default"
								@click="exportImage"
								title="导出为图片"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:image" class="text-lg" />
							</el-button>
						</div>

						<!-- 分隔线 -->
						<div class="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>

						<!-- 文件操作组 -->
						<div class="flex items-center gap-1">
							<el-button
								v-if="fileHandle && !isVirtual"
								@click="reloadFile"
								:disabled="isLoading"
								title="重新加载"
								size="default"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon
									icon="material-symbols:refresh"
									class="text-lg"
									:class="{ 'animate-spin': isLoading }"
								/>
							</el-button>
							<el-button
								v-if="fileHandle && !isVirtual"
								@click="saveFile"
								:disabled="isSaving"
								title="保存文件"
								size="default"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0 !bg-green-600 hover:!bg-green-700 !text-white !border-green-600"
							>
								<Icon icon="material-symbols:save" class="text-lg" />
							</el-button>
							<el-button
								v-if="isVirtual"
								@click="saveAsFile"
								:disabled="isSaving"
								title="另存为文件"
								size="default"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0 !bg-blue-600 hover:!bg-blue-700 !text-white !border-blue-600"
							>
								<Icon icon="material-symbols:save-as" class="text-lg" />
							</el-button>
						</div>

						<!-- 分隔线 -->
						<div class="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>

						<!-- 模式切换组 -->
						<div class="flex items-center gap-1">
							<el-button
								@click="toggleEditorMode('wysiwyg')"
								:class="
									editorMode === 'wysiwyg'
										? '!bg-blue-600 !text-white !border-blue-600'
										: ''
								"
								size="default"
								title="富文本"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:edit" class="text-lg" />
							</el-button>
							<el-button
								@click="toggleEditorMode('markdown')"
								:class="
									editorMode === 'markdown'
										? '!bg-blue-600 !text-white !border-blue-600'
										: ''
								"
								size="default"
								title="源码"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:code" class="text-lg" />
							</el-button>
						</div>

						<!-- 分隔线 -->
						<div class="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>

						<!-- 功能切换组 -->
						<div class="flex items-center gap-1">
							<el-button
								@click="showSearchDialog = true"
								size="default"
								title="查找/替换 (Ctrl+F)"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:search" class="text-lg" />
							</el-button>
							<el-button
								@click="showToc = !showToc"
								size="default"
								:class="
									showToc ? '!bg-blue-600 !text-white !border-blue-600' : ''
								"
								title="显示/隐藏大纲目录"
								class="!rounded-md !shadow-sm transition-all duration-200 !w-9 !h-9 !p-0"
							>
								<Icon icon="material-symbols:toc" class="text-lg" />
							</el-button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 编辑器主体 -->
		<div class="flex-1 flex flex-col">
			<!-- 欢迎界面 - 当没有页签时显示 -->
			<div
				v-if="tabCount === 0"
				class="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
			>
				<div class="text-center max-w-md mx-auto px-8">
					<!-- 欢迎图标 -->
					<div class="mb-8">
						<Icon
							icon="material-symbols:edit-document-outline"
							class="text-8xl text-slate-400 dark:text-slate-500 mx-auto"
						/>
					</div>

					<!-- 欢迎标题 -->
					<h1
						class="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4"
					>
						欢迎使用文档编辑器
					</h1>

					<!-- 欢迎描述 -->
					<p
						class="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed"
					>
						开始您的创作之旅，选择打开现有文件或创建新的文档
					</p>

					<!-- 操作按钮 -->
					<div class="flex flex-col gap-4">
						<el-button
							type="primary"
							size="large"
							@click="$emit('open-file-requested')"
							class="!h-12 !text-base !font-medium !rounded-xl !shadow-lg hover:!shadow-xl transition-all duration-300"
						>
							<Icon icon="material-symbols:folder-open" class="mr-2 text-lg" />
							打开文件
						</el-button>

						<el-button
							size="large"
							@click="$emit('new-tab-requested')"
							class="!h-12 !text-base !font-medium !rounded-xl !border-2 !border-slate-300 dark:!border-slate-600 hover:!border-blue-500 dark:hover:!border-blue-400 !bg-white dark:!bg-slate-800 !text-slate-700 dark:!text-slate-300 hover:!text-blue-600 dark:hover:!text-blue-400 !shadow-md hover:!shadow-lg transition-all duration-300"
						>
							<Icon icon="material-symbols:add" class="mr-2 text-lg" />
							新建标签页
						</el-button>
					</div>
				</div>
			</div>

			<!-- 编辑器内容区域 -->
			<div v-else class="flex-1 flex flex-col relative">
				<!-- 右侧目录面板已被移动到编辑器内容区域内 -->
				<!-- 编辑器主内容区 -->
				<div class="flex-1 flex flex-col">
					<!-- 编辑器内容区 -->
					<div class="flex-1 flex flex-col">
						<!-- 富文本编辑模式 -->
						<div
							v-if="editorMode === 'wysiwyg'"
							class="flex-1 flex flex-col px-3 py-2 bg-slate-50 dark:bg-slate-900"
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
										@click="editor?.chain().focus().toggleBold().run()"
										:class="{
											'bg-blue-500 text-white': editor?.isActive('bold'),
										}"
										class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
										title="粗体"
									>
										<Icon icon="material-symbols:format-bold" class="text-sm" />
									</button>
									<button
										@click="editor?.chain().focus().toggleItalic().run()"
										:class="{
											'bg-blue-500 text-white': editor?.isActive('italic'),
										}"
										class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
										title="斜体"
									>
										<Icon
											icon="material-symbols:format-italic"
											class="text-sm"
										/>
									</button>
									<button
										@click="editor?.chain().focus().toggleStrike().run()"
										:class="{
											'bg-blue-500 text-white': editor?.isActive('strike'),
										}"
										class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
										title="删除线"
									>
										<Icon
											icon="material-symbols:format-strikethrough"
											class="text-sm"
										/>
									</button>
									<button
										@click="editor?.chain().focus().toggleUnderline().run()"
										:class="{
											'bg-blue-500 text-white': editor?.isActive('underline'),
										}"
										class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
										title="下划线"
									>
										<Icon
											icon="material-symbols:format-underlined"
											class="text-sm"
										/>
									</button>
								</bubble-menu>

								<EditorContent
									:editor="editor"
									class="absolute inset-0 p-8 overflow-y-auto"
								/>

								<!-- 目录弹窗，与EditorContent同级，确保高度一致 -->
								<transition name="fade">
									<div
										v-if="showToc"
										ref="tocPanel"
										class="absolute right-0 inset-y-0 w-72 bg-white/95 dark:bg-slate-900/95 border-l border-slate-200 dark:border-slate-700 shadow-2xl z-50 p-6 overflow-y-auto flex flex-col"
									>
										<h3
											class="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2"
										>
											📑 文档大纲
										</h3>
										<div v-if="tocItems.length > 0" class="space-y-1">
											<div
												v-for="item in tocItems"
												:key="item.id"
												class="pl-2 border-l-2 border-slate-200 dark:border-slate-700 ml-1"
											>
												<a
													class="block py-1 px-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer text-slate-700 dark:text-slate-200 text-sm"
													:style="{
														marginLeft: `${(item.level - 1) * 12}px`,
													}"
													@click="jumpToHeading(item.id)"
												>
													{{ item.text }}
												</a>
											</div>
										</div>
										<div
											v-else
											class="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-sm py-8"
										>
											<Icon
												icon="material-symbols:article-outline"
												class="text-4xl mb-2 opacity-50"
											/>
											<p class="text-center">暂无标题</p>
											<p class="text-center text-xs mt-1">
												在文档中添加标题后，大纲将在此显示
											</p>
										</div>
									</div>
								</transition>
								<!-- 查找弹窗，与大纲弹窗同级，右侧显示 -->
								<transition name="fade">
									<div
										v-if="showSearchDialog"
										ref="searchPanel"
										class="absolute right-0 top-8 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 backdrop-blur-sm"
										style="animation: fadeInSlide 0.3s ease-out"
									>
										<!-- 关闭按钮 - 右上角绝对定位 -->
										<el-button
											@click="showSearchDialog = false"
											size="small"
											title="关闭"
											class="!absolute !top-3 !right-3 !p-1.5 !w-6 !h-6 !rounded-md !bg-slate-100 dark:!bg-slate-600 !border-slate-200 dark:!border-slate-500 !text-slate-600 dark:!text-slate-400 hover:!bg-slate-200 dark:hover:!bg-slate-500 !shadow-sm transition-all duration-200 !z-10"
										>
											<Icon icon="material-symbols:close" class="text-xs" />
										</el-button>

										<!-- 标题和内容区域 -->
										<div class="p-6">
											<h3
												class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 pr-8"
											>
												查找与替换
											</h3>

											<div class="space-y-4">
												<div>
													<label
														class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
														>查找</label
													>
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
														>替换</label
													>
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
													<el-checkbox
														v-model="regexEnabled"
														label="正则表达式"
													/>
													<el-checkbox
														v-model="caseSensitive"
														label="大小写敏感"
													/>
													<el-checkbox
														v-model="wholeWordMatch"
														label="完全匹配"
													/>
												</div>
												<div class="flex gap-2 pt-2">
													<el-button
														size="small"
														@click="findPrev"
														class="flex-1"
														:disabled="searchResults.total === 0"
														>上一个</el-button
													>
													<el-button
														size="small"
														@click="findNext"
														class="flex-1"
														:disabled="searchResults.total === 0"
														>下一个</el-button
													>
												</div>
												<div class="flex gap-2">
													<el-button
														size="small"
														@click="replaceOne"
														class="flex-1"
														>替换</el-button
													>
													<el-button
														size="small"
														type="primary"
														@click="replaceAll"
														class="flex-1"
														>全部替换</el-button
													>
												</div>
												<div
													v-if="searchResults.current && searchResults.total"
													class="text-xs text-slate-500 dark:text-slate-400 text-center"
												>
													{{ searchResults.current }} /
													{{ searchResults.total }}
												</div>
											</div>
										</div>
									</div>
								</transition>
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
								placeholder="🌱 在这里输入您的 Markdown 内容...您可以使用：# 标题**粗体** *斜体*- 列表[链接](url)```代码块```开始您的创作吧！✨"
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

// Element Plus 组件导入
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";

// Iconify Vue 图标导入
import { Icon } from "@iconify/vue";

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

// 引入html2canvas
import html2canvas from "html2canvas";

// 组件Props接口定义
interface Props {
	fileHandle?: FileSystemFileHandle | null;
	fileNode?: FileTreeNode | null;
	tabCount?: number;
	isVirtual?: boolean;
}

// 组件事件接口定义
interface Emits {
	(e: "file-modified", isModified: boolean, modifiedContent?: string): void;
	(e: "file-saved", fileHandle: FileSystemFileHandle): void;
	(e: "save-as-requested", content: string): void;
	(
		e: "update:stats",
		stats: { characterCount: number; fileSize: number; lineCount: number }
	): void;
	(e: "open-file-requested"): void;
	(e: "new-tab-requested"): void;
}

// 组件属性和事件定义
const props = withDefaults(defineProps<Props>(), {
	fileHandle: null,
	fileNode: null,
	tabCount: 0,
	isVirtual: false,
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
		SearchAndReplace.configure({
			searchResultClass: "search-result",
			disableRegex: false,
		}),
		TableOfContents.configure({
			onUpdate: (updatedAnchors: any[]) => {
				anchors.value = updatedAnchors;
			},
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
	onSelectionUpdate: () => {
		// 当光标位置改变时，计算属性会自动重新计算
		// 这里不需要额外的逻辑，Vue的响应式系统会处理
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

// 另存为文件（用于虚拟标签页）
const saveAsFile = async () => {
	if (!editor.value) return;

	try {
		isSaving.value = true;
		let content = "";
		if (editor.value.storage.markdown && editor.value.storage.markdown.get) {
			content = editor.value.storage.markdown.get();
		} else {
			content = editor.value.getHTML();
		}

		// 发射事件让父组件处理另存为逻辑
		emit("save-as-requested", content);
	} catch (error) {
		ElMessage.error("获取内容失败: " + (error as Error).message);
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
const wholeWordMatch = ref(false);
// 搜索结果相关状态
const searchResults = ref({ current: 0, total: 0 });
const searchPositions = ref<number[]>([]);
const currentSearchIndex = ref(-1);

// 字符统计
const characterCount = ref(0);
const fileSize = ref(0);
const lineCount = ref(0);

// 格式化文件大小（保留以备将来使用）
// const formatFileSize = (bytes: number): string => {
// 	if (bytes === 0) return "0 B";
// 	const k = 1024;
// 	const sizes = ["B", "KB", "MB", "GB"];
// 	const i = Math.floor(Math.log(bytes) / Math.log(k));
// 	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
// };

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

		// 计算文件大小（字节数）
		fileSize.value = new Blob([text]).size;

		// 计算行数
		const lines = text.split("\n");
		lineCount.value = lines.length;

		// 发送统计数据到父组件
		emit("update:stats", {
			characterCount: characterCount.value,
			fileSize: fileSize.value,
			lineCount: lineCount.value,
		});

		console.log("字符统计更新:", {
			characters: characterCount.value,
			fileSize: fileSize.value,
			lines: lineCount.value,
			text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
		});
	} catch (error) {
		console.warn("字符统计更新失败:", error);
		characterCount.value = 0;
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
	if (editor.value.commands.setMermaid) {
		// @ts-ignore
		editor.value.commands.setMermaid(defaultMermaidCode);
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

// 转换代码块语法（``` ↔ :::）
const convertCodeBlocks = () => {
	if (!editor.value) return;

	try {
		// 获取当前编辑器内容
		let content = "";
		if (editor.value.storage.markdown && editor.value.storage.markdown.get) {
			content = editor.value.storage.markdown.get();
		} else {
			content = editor.value.getHTML();
		}

		if (!content) {
			ElMessage.warning("编辑器内容为空");
			return;
		}

		let hasChanges = false;
		let newContent = content;

		// 检测并转换 ```mermaid``` 到 :::mermaid:::
		const mermaidBacktickRegex = /```mermaid\s*\r?\n([\s\S]*?)\r?\n```/g;
		const mermaidMatches = [...content.matchAll(mermaidBacktickRegex)];

		if (mermaidMatches.length > 0) {
			for (const match of mermaidMatches) {
				const mermaidContent = match[1].trim();
				if (mermaidContent) {
					const replacement = `:::mermaid\n${mermaidContent}\n:::`;
					newContent = newContent.replace(match[0], replacement);
					hasChanges = true;
				}
			}
		}

		// 检测并转换 :::mermaid::: 到 ```mermaid```
		const mermaidColonRegex = /:::mermaid\s*\r?\n([\s\S]*?)\r?\n:::/g;
		const mermaidColonMatches = [...content.matchAll(mermaidColonRegex)];

		if (mermaidColonMatches.length > 0) {
			for (const match of mermaidColonMatches) {
				const mermaidContent = match[1].trim();
				if (mermaidContent) {
					const replacement = `\`\`\`mermaid\n${mermaidContent}\n\`\`\``;
					newContent = newContent.replace(match[0], replacement);
					hasChanges = true;
				}
			}
		}

		// 检测并转换 ```plantuml``` 到 :::plantuml:::
		const plantumlBacktickRegex = /```plantuml\s*\r?\n([\s\S]*?)\r?\n```/g;
		const plantumlMatches = [...content.matchAll(plantumlBacktickRegex)];

		if (plantumlMatches.length > 0) {
			for (const match of plantumlMatches) {
				const plantumlContent = match[1].trim();
				if (plantumlContent) {
					const replacement = `:::plantuml\n${plantumlContent}\n:::`;
					newContent = newContent.replace(match[0], replacement);
					hasChanges = true;
				}
			}
		}

		// 检测并转换 :::plantuml::: 到 ```plantuml```
		const plantumlColonRegex = /:::plantuml\s*\r?\n([\s\S]*?)\r?\n:::/g;
		const plantumlColonMatches = [...content.matchAll(plantumlColonRegex)];

		if (plantumlColonMatches.length > 0) {
			for (const match of plantumlColonMatches) {
				const plantumlContent = match[1].trim();
				if (plantumlContent) {
					const replacement = `\`\`\`plantuml\n${plantumlContent}\n\`\`\``;
					newContent = newContent.replace(match[0], replacement);
					hasChanges = true;
				}
			}
		}

		if (hasChanges) {
			// 更新编辑器内容
			if (editor.value.storage.markdown && editor.value.storage.markdown.set) {
				editor.value.storage.markdown.set(newContent);
			} else {
				editor.value.commands.setContent(newContent);
			}

			const totalConversions =
				mermaidMatches.length +
				mermaidColonMatches.length +
				plantumlMatches.length +
				plantumlColonMatches.length;

			// 如果转换了内容且文档之前是保存状态，标记为已修改
			if (totalConversions > 0 && !isModified.value) {
				isModified.value = true;
				emit("file-modified", true, newContent);
				console.log("MdEditor: 代码块转换后标记文档为已修改状态");
			}

			ElMessage.success(`成功转换 ${totalConversions} 个代码块`);
			console.log("MdEditor: 代码块转换完成", {
				mermaidToColon: mermaidMatches.length,
				mermaidToBacktick: mermaidColonMatches.length,
				plantumlToColon: plantumlMatches.length,
				plantumlToBacktick: plantumlColonMatches.length,
				totalConversions,
				wasModified: isModified.value,
			});
		} else {
			ElMessage.info("未发现需要转换的代码块");
		}
	} catch (error) {
		console.error("转换代码块失败:", error);
		ElMessage.error("转换代码块失败: " + (error as Error).message);
	}
};

// 工具栏方法实现

const exportMarkdown = () => {
	if (!editor.value) {
		ElMessage.error("编辑器未初始化");
		return;
	}

	let content = "";

	// 尝试多种方式获取内容
	if (editorMode.value === "markdown") {
		// 如果当前是markdown模式，直接使用markdownContent
		content = markdownContent.value;
	} else if (
		editor.value.storage.markdown &&
		editor.value.storage.markdown.get
	) {
		// 尝试从markdown storage获取
		content = editor.value.storage.markdown.get();
	} else {
		// 备用方案：使用当前的markdownContent或从编辑器获取HTML
		content = markdownContent.value || editor.value.getHTML();
	}

	if (!content || content.trim() === "") {
		ElMessage.warning("没有内容可以导出");
		return;
	}

	console.log("导出Markdown内容:", {
		mode: editorMode.value,
		contentLength: content.length,
		hasMarkdownStorage: !!(
			editor.value.storage.markdown && editor.value.storage.markdown.get
		),
	});

	const blob = new Blob([content], { type: "text/markdown" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${fileName.value || "document"}.md`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);

	ElMessage.success("Markdown文件导出成功");
};

// 导出为图片（支持长图导出）
const exportImage = async () => {
	const editorContent = document.querySelector(".ProseMirror");
	if (!editorContent) {
		ElMessage.error("未找到编辑器内容区域");
		return;
	}

	// 获取滚动容器（EditorContent的容器）
	const scrollContainer = editorContent.parentElement;
	if (!scrollContainer) {
		ElMessage.error("未找到滚动容器");
		return;
	}

	// 显示加载提示
	const loadingMessage = ElMessage({
		message: "正在生成图片，请稍候...",
		type: "info",
		duration: 0, // 不自动关闭
	});

	// 保存原始样式
	const originalContainerStyles = {
		overflow: scrollContainer.style.overflow,
		height: scrollContainer.style.height,
		maxHeight: scrollContainer.style.maxHeight,
		position: scrollContainer.style.position,
		width: scrollContainer.style.width,
		padding: scrollContainer.style.padding,
		boxSizing: scrollContainer.style.boxSizing,
	};

	try {
		// 获取完整内容尺寸
		const fullHeight = editorContent.scrollHeight;
		const fullWidth = editorContent.scrollWidth;

		// 计算合适的宽度，确保有足够的左右边距
		const horizontalPadding = 64; // 左右各32px边距
		const minContentWidth = 600; // 最小内容宽度
		const maxContentWidth = 1200; // 最大内容宽度

		// 基于内容宽度计算容器宽度，确保左右边距一致
		const contentWidth = Math.min(
			Math.max(fullWidth, minContentWidth),
			maxContentWidth
		);
		const containerWidth = contentWidth + horizontalPadding;
		const containerHeight = fullHeight + 64; // 上下padding

		console.log("导出图片 - 内容尺寸:", {
			fullHeight,
			fullWidth,
			contentWidth,
			containerWidth,
			containerHeight,
		});

		// 临时修改容器样式，让所有内容可见并居中
		scrollContainer.style.overflow = "visible";
		scrollContainer.style.height = `${containerHeight}px`;
		scrollContainer.style.width = `${containerWidth}px`;
		scrollContainer.style.maxHeight = "none";
		scrollContainer.style.position = "static";
		scrollContainer.style.padding = "32px"; // 确保四周都有32px边距
		scrollContainer.style.boxSizing = "border-box";

		// 等待样式应用和重新渲染 - 增加等待时间确保高质量渲染
		await new Promise((resolve) => setTimeout(resolve, 500));

		// 截图配置 - 截取整个容器而不是只截取编辑器内容
		const canvas = await html2canvas(scrollContainer as HTMLElement, {
			backgroundColor: "#ffffff", // 设置白色背景
			height: containerHeight,
			width: containerWidth,
			useCORS: true,
			allowTaint: true,
			scale: 2, // 高质量缩放
			scrollX: 0,
			scrollY: 0,
			windowWidth: containerWidth,
			windowHeight: containerHeight,
		});

		console.log("导出图片 - 画布尺寸:", {
			width: canvas.width,
			height: canvas.height,
		});

		// 下载高质量图片
		canvas.toBlob(
			(blob) => {
				if (!blob) {
					ElMessage.error("生成图片失败");
					return;
				}

				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `${fileName.value || "document"}.png`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);

				ElMessage.success("高质量图片导出成功");
			},
			"image/png",
			1.0
		); // 最高图片质量 - 无损压缩
	} catch (error) {
		console.error("导出图片失败:", error);
		ElMessage.error("导出图片失败: " + (error as Error).message);
	} finally {
		// 恢复容器原始样式
		scrollContainer.style.overflow = originalContainerStyles.overflow;
		scrollContainer.style.height = originalContainerStyles.height;
		scrollContainer.style.maxHeight = originalContainerStyles.maxHeight;
		scrollContainer.style.position = originalContainerStyles.position;
		scrollContainer.style.width = originalContainerStyles.width;
		scrollContainer.style.padding = originalContainerStyles.padding;
		scrollContainer.style.boxSizing = originalContainerStyles.boxSizing;

		// 关闭加载提示
		loadingMessage.close();
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
				updateCharacterCount(editor.value);
			}
			markdownContent.value = "";
			originalContent.value = "";
			isModified.value = false;
			characterCount.value = 0;
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
		// 只有在搜索对话框显示且有搜索内容时才进行搜索
		if (showSearchDialog.value && searchTerm.value.trim()) {
			// 更新搜索词
			editor.value.commands.setSearchTerm(searchTerm.value);
			// 收集搜索结果位置
			collectSearchPositions();
		} else {
			// 清除搜索
			editor.value.commands.setSearchTerm("");
			searchPositions.value = [];
			searchResults.value = { current: 0, total: 0 };
			currentSearchIndex.value = -1;
		}
	}
};

// 收集搜索结果位置
const collectSearchPositions = () => {
	if (!editor.value || !searchTerm.value) {
		searchPositions.value = [];
		searchResults.value = { current: 0, total: 0 };
		currentSearchIndex.value = -1;
		return;
	}

	const positions: number[] = [];
	const doc = editor.value.state.doc;

	// 遍历文档找到所有匹配位置
	doc.descendants((node, pos) => {
		if (node.isText && node.text) {
			const originalText = node.text;
			let searchText = searchTerm.value;
			let textToSearch = originalText;

			// 处理大小写敏感
			if (!caseSensitive.value) {
				searchText = searchText.toLowerCase();
				textToSearch = originalText.toLowerCase();
			}

			if (regexEnabled.value) {
				try {
					const flags = caseSensitive.value ? "g" : "gi";
					const regex = new RegExp(searchText, flags);
					let match;
					while ((match = regex.exec(originalText)) !== null) {
						positions.push(pos + match.index);
						if (match[0].length === 0) break; // 防止无限循环
					}
				} catch (e) {
					// 正则表达式无效时使用普通搜索
					let index = 0;
					while ((index = textToSearch.indexOf(searchText, index)) !== -1) {
						positions.push(pos + index);
						index += searchText.length;
					}
				}
			} else if (wholeWordMatch.value) {
				// 完全匹配模式
				const escapedSearchText = searchText.replace(
					/[.*+?^${}()|[\]\\]/g,
					"\\$&"
				);
				const regex = new RegExp(
					`\\b${escapedSearchText}\\b`,
					caseSensitive.value ? "g" : "gi"
				);
				let match;
				while ((match = regex.exec(originalText)) !== null) {
					positions.push(pos + match.index);
				}
			} else {
				// 普通搜索
				let index = 0;
				while ((index = textToSearch.indexOf(searchText, index)) !== -1) {
					positions.push(pos + index);
					index += searchText.length;
				}
			}
		}
	});

	searchPositions.value = positions;
	searchResults.value = {
		current: positions.length > 0 ? 1 : 0,
		total: positions.length,
	};
	currentSearchIndex.value = positions.length > 0 ? 0 : -1;
};
const onReplaceInput = () => {
	if (editor.value) {
		editor.value.commands.setReplaceTerm(replaceTerm.value);
	}
};
// 查找下一个/上一个功能
const findNext = () => {
	if (!editor.value || searchPositions.value.length === 0) return;

	// 计算下一个索引
	const nextIndex =
		(currentSearchIndex.value + 1) % searchPositions.value.length;
	currentSearchIndex.value = nextIndex;

	// 跳转到位置
	const pos = searchPositions.value[nextIndex];
	editor.value
		.chain()
		.focus()
		.setTextSelection({ from: pos, to: pos + searchTerm.value.length })
		.scrollIntoView()
		.run();

	// 更新统计
	searchResults.value.current = nextIndex + 1;
};

const findPrev = () => {
	if (!editor.value || searchPositions.value.length === 0) return;

	// 计算上一个索引
	const prevIndex =
		currentSearchIndex.value === 0
			? searchPositions.value.length - 1
			: currentSearchIndex.value - 1;
	currentSearchIndex.value = prevIndex;

	// 跳转到位置
	const pos = searchPositions.value[prevIndex];
	editor.value
		.chain()
		.focus()
		.setTextSelection({ from: pos, to: pos + searchTerm.value.length })
		.scrollIntoView()
		.run();

	// 更新统计
	searchResults.value.current = prevIndex + 1;
};
const replaceOne = () => {
	if (editor.value && searchTerm.value && replaceTerm.value) {
		// @ts-ignore - 使用可能的API命令
		editor.value.commands.replace?.() || editor.value.commands.replaceNext?.();
	}
};
const replaceAll = () => {
	if (editor.value && searchTerm.value && replaceTerm.value) {
		// @ts-ignore - 使用可能的API命令
		editor.value.commands.replaceAll?.();
	}
};

// 移除搜索结果统计功能

// 监听搜索选项变化
watch([regexEnabled, caseSensitive, wholeWordMatch], () => {
	if (searchTerm.value) {
		onSearchInput();
	}
});

// 监听搜索对话框状态，隐藏时清除搜索
watch(showSearchDialog, (isVisible) => {
	if (!isVisible && editor.value) {
		// 清除搜索高亮
		editor.value.commands.setSearchTerm("");
		searchPositions.value = [];
		searchResults.value = { current: 0, total: 0 };
		currentSearchIndex.value = -1;
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
// 大纲锚点数据
const anchors = ref<any[]>([]);

// 当前标题类型计算属性 - 用于标题按钮联动显示
const currentHeadingType = computed(() => {
	if (!editor.value) return "标题";

	// 检查各级标题
	for (let level = 1; level <= 6; level++) {
		if (editor.value.isActive("heading", { level })) {
			return `标题${level}`;
		}
	}

	// 检查是否为正文段落
	if (editor.value.isActive("paragraph")) {
		return "正文";
	}

	// 检查其他块级元素
	if (
		editor.value.isActive("bulletList") ||
		editor.value.isActive("orderedList") ||
		editor.value.isActive("taskList")
	) {
		return "列表";
	}

	if (editor.value.isActive("blockquote")) {
		return "引用";
	}

	if (editor.value.isActive("codeBlock")) {
		return "代码";
	}

	// 默认返回
	return "标题";
});

// 目录数据
const tocItems = computed(() =>
	anchors.value.map((anchor) => ({
		id: anchor.id,
		text: anchor.textContent,
		level: anchor.level,
		pos: anchor.pos,
	}))
);
// 目录跳转方法
const jumpToHeading = (id: string) => {
	if (!editor.value || !id) return;

	// 找到对应的anchor
	const anchor = anchors.value.find((a) => a.id === id);
	if (anchor) {
		// 使用链式调用聚焦、定位和滚动
		editor.value
			.chain()
			.focus()
			.setTextSelection(anchor.pos)
			.scrollIntoView()
			.run();
	}
};

const tocPanel = ref<HTMLElement | null>(null);
const searchPanel = ref<HTMLElement | null>(null);

// 目录弹窗外部点击和Esc关闭逻辑
watch(showToc, (visible) => {
	if (visible) {
		nextTick(() => {
			const onClick = (e: MouseEvent) => {
				const panel = tocPanel.value;
				if (panel && !panel.contains(e.target as Node)) {
					showToc.value = false;
				}
			};
			const onKeydown = (e: KeyboardEvent) => {
				if (e.key === "Escape") {
					showToc.value = false;
				}
			};
			document.addEventListener("mousedown", onClick);
			document.addEventListener("keydown", onKeydown);
			// 关闭时移除监听
			const stop = watch(showToc, (v) => {
				if (!v) {
					document.removeEventListener("mousedown", onClick);
					document.removeEventListener("keydown", onKeydown);
					stop();
				}
			});
		});
	}
});

// 查找弹窗外部点击和Esc关闭逻辑
watch(showSearchDialog, (visible) => {
	if (visible) {
		nextTick(() => {
			const onClick = (e: MouseEvent) => {
				const panel = searchPanel.value;
				if (panel && !panel.contains(e.target as Node)) {
					showSearchDialog.value = false;
				}
			};
			const onKeydown = (e: KeyboardEvent) => {
				if (e.key === "Escape") {
					showSearchDialog.value = false;
				}
			};
			document.addEventListener("mousedown", onClick);
			document.addEventListener("keydown", onKeydown);
			// 关闭时移除监听
			const stop = watch(showSearchDialog, (v) => {
				if (!v) {
					document.removeEventListener("mousedown", onClick);
					document.removeEventListener("keydown", onKeydown);
					stop();
				}
			});
		});
	}
});
</script>

<style scoped>
/* 使用UnoCSS风格的组件样式 */
:deep(.modern-drawer .el-drawer) {
	border-radius: 16px 0 0 16px;
	box-shadow:
		0 10px 15px -3px rgba(0, 0, 0, 0.1),
		0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

:deep(.modern-drawer .el-drawer__header) {
	background: linear-gradient(to bottom right, #f8fafc, #e2e8f0);
	border-bottom: 1px solid #e2e8f0;
	padding: 1.25rem;
}

:deep(.modern-drawer .el-drawer__title) {
	font-weight: 600;
	color: #1e293b;
}

:deep(.el-input__wrapper) {
	border-radius: 0.75rem;
	box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
	transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
}

:deep(.el-input__wrapper:hover) {
	box-shadow:
		0 4px 6px -1px rgba(0, 0, 0, 0.1),
		0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

:deep(.el-input__wrapper.is-focus) {
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* ProseMirror编辑器样式 - UnoCSS设计系统 */
:deep(.ProseMirror) {
	outline: none;
	padding: 2rem;
	font-family:
		-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu",
		"Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
	line-height: 1.5;
	color: #374151; /* text-gray-700 */
}

/* 标题样式 - 使用UnoCSS的字体大小和颜色系统 */
:deep(.ProseMirror h1) {
	font-size: 2.25rem; /* text-4xl */
	font-weight: 700; /* font-bold */
	margin: 1.5rem 0 0.75rem 0; /* my-6 mb-3 */
	color: #111827; /* text-gray-900 */
}

:deep(.ProseMirror h2) {
	font-size: 1.875rem; /* text-3xl */
	font-weight: 600; /* font-semibold */
	margin: 1.25rem 0 0.5rem 0; /* my-5 mb-2 */
	color: #111827; /* text-gray-900 */
}

:deep(.ProseMirror h3) {
	font-size: 1.5rem; /* text-2xl */
	font-weight: 600; /* font-semibold */
	margin: 1rem 0 0.5rem 0; /* my-4 mb-2 */
	color: #111827; /* text-gray-900 */
}

/* 段落样式 - UnoCSS设计系统 */
:deep(.ProseMirror p) {
	margin: 0.25rem 0; /* my-1 */
}

/* 列表使用默认样式，不做特殊修改 */

:deep(.ProseMirror blockquote) {
	border-left: 4px solid #e5e7eb; /* border-l-4 border-gray-200 */
	padding-left: 0; /* pl-0 - 统一左边距为0 */
	margin: 0.75rem 0; /* my-3 */
	font-style: italic; /* italic */
	color: #6b7280; /* text-gray-500 */
}

/* 代码样式 - UnoCSS设计系统 */
:deep(.ProseMirror code) {
	background: #f3f4f6; /* bg-gray-100 */
	padding: 0.25rem 0.5rem; /* px-2 py-1 */
	border-radius: 0.375rem; /* rounded-md */
	font-family:
		ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo,
		monospace; /* font-mono */
	font-size: 0.875rem; /* text-sm */
}

:deep(.ProseMirror pre) {
	background: #1f2937; /* bg-gray-800 */
	color: #f9fafb; /* text-gray-50 */
	padding: 1.5rem; /* p-6 */
	border-radius: 0.75rem; /* rounded-xl */
	overflow-x: auto; /* overflow-x-auto */
	margin: 1.5rem 0; /* my-6 */
}

:deep(.ProseMirror pre code) {
	background: transparent; /* bg-transparent */
	padding: 0; /* p-0 */
	color: inherit;
}

/* 表格样式 - UnoCSS设计系统 */
:deep(.ProseMirror table) {
	border-collapse: collapse;
	margin: 1.5rem 0; /* my-6 */
	width: 100%; /* w-full */
}

:deep(.ProseMirror th, .ProseMirror td) {
	border: 1px solid #e5e7eb; /* border border-gray-200 */
	padding: 0.75rem; /* p-3 */
	text-align: left; /* text-left */
}

:deep(.ProseMirror th) {
	background: #f9fafb; /* bg-gray-50 */
	font-weight: 600; /* font-semibold */
}

:deep(.ProseMirror hr) {
	border: none;
	border-top: 2px solid #e5e7eb; /* border-t-2 border-gray-200 */
	margin: 2rem 0; /* my-8 */
}

/* 暗色主题样式 - UnoCSS设计系统 */
:deep(.dark .ProseMirror) {
	color: #d1d5db; /* dark:text-gray-300 */
}

:deep(.dark .ProseMirror h1, .dark .ProseMirror h2, .dark .ProseMirror h3) {
	color: #f9fafb; /* dark:text-gray-50 */
}

:deep(.dark .ProseMirror blockquote) {
	border-left-color: #4b5563; /* dark:border-gray-600 */
	color: #9ca3af; /* dark:text-gray-400 */
}

:deep(.dark .ProseMirror code) {
	background: #374151; /* dark:bg-gray-700 */
	color: #f3f4f6; /* dark:text-gray-100 */
}

:deep(.dark .ProseMirror th, .dark .ProseMirror td) {
	border-color: #4b5563; /* dark:border-gray-600 */
}

:deep(.dark .ProseMirror th) {
	background: #374151; /* dark:bg-gray-700 */
}

:deep(.dark .ProseMirror hr) {
	border-top-color: #4b5563; /* dark:border-gray-600 */
}

/* 任务列表使用默认样式，不做特殊修改 */

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

/* 淡入淡出过渡动画 */
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
