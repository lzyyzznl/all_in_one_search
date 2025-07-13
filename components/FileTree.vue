<template>
	<div
		class="h-full flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700"
	>
		<!-- 文件树头部 -->
		<div
			class="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 flex-shrink-0 shadow-sm"
		>
			<el-button
				@click="selectRootDirectory"
				class="w-full mb-4 !bg-slate-100 dark:!bg-slate-700 !border-slate-200 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-200 dark:hover:!bg-slate-600 !font-medium !py-3 !rounded-xl !shadow-sm hover:!shadow-md !transition-all !duration-300"
				size="large"
			>
				<div class="flex items-center justify-center gap-2">
					<Icon icon="material-symbols:folder-open" class="text-lg" />
					<span class="font-medium">选择目录</span>
				</div>
			</el-button>

			<!-- 文件搜索框 -->
			<div v-if="rootHandle" class="mb-4">
				<el-input
					v-model="searchQuery"
					placeholder="搜索文件..."
					size="default"
					clearable
					@clear="clearSearch"
					@input="filterFiles"
					class="shadow-sm !rounded-xl [&_.el-input__wrapper]:rounded-xl [&_.el-input__wrapper]:shadow-sm [&_.el-input__wrapper]:transition-all [&_.el-input__wrapper]:duration-200 [&_.el-input__wrapper:hover]:shadow-md [&_.el-input__wrapper.is-focus]:shadow-blue-100 [&_.el-input__wrapper.is-focus]:ring-3 [&_.el-input__wrapper.is-focus]:ring-blue-100"
				>
					<template #prefix>
						<Icon
							icon="material-symbols:search"
							class="text-blue-600 dark:text-blue-400 text-base"
						/>
					</template>
				</el-input>
			</div>

			<!-- 文件操作按钮 -->
			<div v-if="rootHandle" class="flex gap-1.5 mb-4 justify-center">
				<el-button
					@click="showCreateFileDialog"
					size="small"
					title="新增文件"
					class="!w-[30%] !bg-slate-50 dark:!bg-slate-700 !border-slate-200 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-600 !rounded-lg !font-medium shadow-sm !py-2 !px-2 !text-xs"
				>
					<div class="flex items-center justify-center gap-1">
						<Icon icon="material-symbols:note-add" class="text-sm" />
						<span class="font-medium">文件</span>
					</div>
				</el-button>
				<el-button
					@click="showCreateFolderDialog"
					size="small"
					title="新增文件夹"
					class="!w-[30%] !bg-slate-50 dark:!bg-slate-700 !border-slate-200 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-600 !rounded-lg !font-medium shadow-sm !py-2 !px-2 !text-xs"
				>
					<div class="flex items-center justify-center gap-1">
						<Icon icon="material-symbols:create-new-folder" class="text-sm" />
						<span class="font-medium">文件夹</span>
					</div>
				</el-button>
				<el-button
					@click="refreshCurrentDirectory"
					size="small"
					title="刷新文件/文件夹列表"
					class="!w-[30%] !bg-slate-50 dark:!bg-slate-700 !border-slate-200 dark:!border-slate-600 !text-slate-700 dark:!text-slate-300 hover:!bg-slate-100 dark:hover:!bg-slate-600 !rounded-lg !font-medium shadow-sm !py-2 !px-2 !text-xs"
					:loading="isRefreshing"
				>
					<div class="flex items-center justify-center">
						<Icon
							icon="material-symbols:refresh"
							class="text-sm"
							v-if="!isRefreshing"
						/>
						<span class="font-medium ml-1" v-if="!isRefreshing">刷新</span>
					</div>
				</el-button>
			</div>

			<!-- 当前路径显示 -->
			<div
				v-if="rootHandle"
				class="flex items-center gap-2 p-2 bg-white dark:bg-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-sm"
			>
				<div
					class="flex items-center justify-center w-6 h-6 bg-slate-100 dark:bg-slate-600 rounded-md"
				>
					<Icon
						icon="material-symbols:folder-open"
						class="text-slate-600 dark:text-slate-400 text-sm"
					/>
				</div>
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
						<Icon
							icon="material-symbols:folder-open"
							class="text-slate-400 dark:text-slate-500 text-5xl"
						/>
					</div>
					<div
						class="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center animate-bounce shadow-lg"
					>
						<Icon icon="material-symbols:star" class="text-white text-lg" />
					</div>
				</div>
				<h3
					class="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2"
				>
					<Icon icon="material-symbols:folder-open" class="text-xl" />
					选择一个目录
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
							class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
						>
							<Icon
								icon="material-symbols:search"
								class="text-slate-400 dark:text-slate-500 text-2xl"
							/>
						</div>
						<h4
							class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-center gap-2"
						>
							<Icon icon="material-symbols:search" class="text-base" />
							未找到匹配的文件
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
								class="flex items-center gap-2 px-2 py-1.5 mx-1 my-0.5 rounded-lg cursor-pointer transition-all duration-200 w-full group border border-transparent"
								:class="{
									// 选中状态样式 - 黑白效果
									'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 border-slate-700 dark:border-slate-300 shadow-md':
										selectedNodeId === data.id,

									// 非选中状态的hover效果
									'hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600':
										selectedNodeId !== data.id,

									// 文字颜色
									'text-slate-700 dark:text-slate-300 font-medium':
										data.isDirectory && selectedNodeId !== data.id,
									'text-slate-600 dark:text-slate-400 font-normal':
										data.isFile && selectedNodeId !== data.id,
								}"
							>
								<div
									class="flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0 transition-all duration-200"
									:class="{
										// 选中状态下的图标样式 - 黑白效果
										'bg-white/20 dark:bg-slate-800/20 text-white dark:text-slate-800':
											selectedNodeId === data.id,

										// 非选中状态下的图标样式
										'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400':
											data.isDirectory && selectedNodeId !== data.id,
										'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-500':
											data.isFile && selectedNodeId !== data.id,
									}"
								>
									<Icon :icon="getNodeIcon(data)" class="text-base" />
								</div>
								<span
									class="flex-1 truncate text-sm font-medium"
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
									<!-- 新建文件/文件夹下拉菜单 -->
									<el-dropdown
										@command="handleCreateCommand($event, data)"
										trigger="click"
										placement="bottom-start"
										@click.stop
									>
										<el-button
											size="small"
											title="新建文件或文件夹"
											:class="
												selectedNodeId === data.id
													? '!p-1.5 !w-6 !h-6 !rounded-md !bg-white/20 dark:!bg-slate-800/20 !border-white/30 dark:!border-slate-700/30 !text-white dark:!text-slate-800 hover:!bg-white/30 dark:hover:!bg-slate-800/30'
													: '!p-1.5 !w-6 !h-6 !rounded-md !bg-slate-100 dark:!bg-slate-600 !border-slate-200 dark:!border-slate-500 !text-slate-600 dark:!text-slate-400 hover:!bg-slate-200 dark:hover:!bg-slate-500'
											"
										>
											<Icon icon="material-symbols:add" class="text-xs" />
										</el-button>
										<template #dropdown>
											<el-dropdown-menu>
												<el-dropdown-item command="file">
													<div class="flex items-center gap-2">
														<Icon
															icon="material-symbols:note-add"
															class="text-sm"
														/>
														<span>新建文件</span>
													</div>
												</el-dropdown-item>
												<el-dropdown-item command="folder">
													<div class="flex items-center gap-2">
														<Icon
															icon="material-symbols:create-new-folder"
															class="text-sm"
														/>
														<span>新建文件夹</span>
													</div>
												</el-dropdown-item>
											</el-dropdown-menu>
										</template>
									</el-dropdown>
									<el-button
										size="small"
										@click.stop="showRenameDialog(data)"
										title="重命名"
										:class="
											selectedNodeId === data.id
												? '!p-1.5 !w-6 !h-6 !rounded-md !bg-white/20 dark:!bg-slate-800/20 !border-white/30 dark:!border-slate-700/30 !text-white dark:!text-slate-800 hover:!bg-white/30 dark:hover:!bg-slate-800/30'
												: '!p-1.5 !w-6 !h-6 !rounded-md !bg-slate-100 dark:!bg-slate-600 !border-slate-200 dark:!border-slate-500 !text-slate-600 dark:!text-slate-400 hover:!bg-slate-200 dark:hover:!bg-slate-500'
										"
									>
										<Icon icon="material-symbols:edit" class="text-xs" />
									</el-button>
									<el-button
										size="small"
										@click.stop="confirmDeleteItem(data)"
										:title="deleteFunctionSupported ? '删除' : '删除功能不支持'"
										:disabled="!deleteFunctionSupported"
										:class="
											selectedNodeId === data.id
												? '!p-1.5 !w-6 !h-6 !rounded-md !bg-white/20 dark:!bg-slate-800/20 !border-white/30 dark:!border-slate-700/30 !text-white dark:!text-slate-800 hover:!bg-white/30 dark:hover:!bg-slate-800/30'
												: '!p-1.5 !w-6 !h-6 !rounded-md !bg-slate-100 dark:!bg-slate-600 !border-slate-200 dark:!border-slate-500 !text-slate-600 dark:!text-slate-400 hover:!bg-slate-200 dark:hover:!bg-slate-500'
										"
									>
										<Icon icon="material-symbols:delete" class="text-xs" />
									</el-button>
								</div>
							</div>
						</template>
					</el-tree>
				</div>

				<!-- 正常模式下显示树 -->
				<el-tree
					v-else
					ref="treeRef"
					:key="treeKey"
					:data="treeData"
					:load="isInitialized ? undefined : loadNode"
					:props="treeProps"
					node-key="id"
					:lazy="!isInitialized"
					:default-expanded-keys="defaultExpandedKeys"
					:accordion="false"
					v-loading="isLoading"
					@node-click="handleNodeClick"
					@node-contextmenu="handleNodeContextMenu"
					@node-expand="handleNodeExpand"
					@node-collapse="handleNodeCollapse"
					class="file-tree"
				>
					<template #default="{ node, data }">
						<div
							class="flex items-center gap-2 px-2 py-1.5 mx-1 my-0.5 rounded-lg cursor-pointer transition-all duration-200 w-full group border border-transparent"
							:class="{
								// 选中状态样式 - 黑白效果
								'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 border-slate-700 dark:border-slate-300 shadow-md':
									selectedNodeId === data.id,

								// 非选中状态的hover效果
								'hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600':
									selectedNodeId !== data.id,

								// 文字颜色
								'text-slate-700 dark:text-slate-300 font-medium':
									data.isDirectory && selectedNodeId !== data.id,
								'text-slate-600 dark:text-slate-400':
									data.isFile && selectedNodeId !== data.id,
							}"
						>
							<div
								class="flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0 transition-all duration-200"
								:class="{
									// 选中状态下的图标样式 - 黑白效果
									'bg-white/20 dark:bg-slate-800/20 text-white dark:text-slate-800':
										selectedNodeId === data.id,

									// 非选中状态下的图标样式
									'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400':
										data.isDirectory && selectedNodeId !== data.id,
									'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-500':
										data.isFile && selectedNodeId !== data.id,
								}"
							>
								<Icon :icon="getNodeIcon(data)" class="text-base" />
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
								<!-- 新建文件/文件夹下拉菜单 -->
								<el-dropdown
									@command="handleCreateCommand($event, data)"
									trigger="click"
									placement="bottom-start"
									@click.stop
								>
									<el-button
										size="small"
										title="新建文件或文件夹"
										:class="
											selectedNodeId === data.id
												? '!p-1.5 !w-6 !h-6 !rounded-md !bg-white/20 dark:!bg-slate-800/20 !border-white/30 dark:!border-slate-700/30 !text-white dark:!text-slate-800 hover:!bg-white/30 dark:hover:!bg-slate-800/30'
												: '!p-1.5 !w-6 !h-6 !rounded-md !bg-slate-100 dark:!bg-slate-600 !border-slate-200 dark:!border-slate-500 !text-slate-600 dark:!text-slate-400 hover:!bg-slate-200 dark:hover:!bg-slate-500'
										"
									>
										<Icon icon="material-symbols:add" class="text-xs" />
									</el-button>
									<template #dropdown>
										<el-dropdown-menu>
											<el-dropdown-item command="file">
												<div class="flex items-center gap-2">
													<Icon
														icon="material-symbols:note-add"
														class="text-sm"
													/>
													<span>新建文件</span>
												</div>
											</el-dropdown-item>
											<el-dropdown-item command="folder">
												<div class="flex items-center gap-2">
													<Icon
														icon="material-symbols:create-new-folder"
														class="text-sm"
													/>
													<span>新建文件夹</span>
												</div>
											</el-dropdown-item>
										</el-dropdown-menu>
									</template>
								</el-dropdown>
								<el-button
									size="small"
									@click.stop="showRenameDialog(data)"
									title="重命名"
									:class="
										selectedNodeId === data.id
											? '!p-1.5 !w-6 !h-6 !rounded-md !bg-white/20 dark:!bg-slate-800/20 !border-white/30 dark:!border-slate-700/30 !text-white dark:!text-slate-800 hover:!bg-white/30 dark:hover:!bg-slate-800/30'
											: '!p-1.5 !w-6 !h-6 !rounded-md !bg-slate-100 dark:!bg-slate-600 !border-slate-200 dark:!border-slate-500 !text-slate-600 dark:!text-slate-400 hover:!bg-slate-200 dark:hover:!bg-slate-500'
									"
								>
									<Icon icon="material-symbols:edit" class="text-xs" />
								</el-button>
								<el-button
									size="small"
									@click.stop="confirmDeleteItem(data)"
									:title="deleteFunctionSupported ? '删除' : '删除功能不支持'"
									:disabled="!deleteFunctionSupported"
									:class="
										selectedNodeId === data.id
											? '!p-1.5 !w-6 !h-6 !rounded-md !bg-white/20 dark:!bg-slate-800/20 !border-white/30 dark:!border-slate-700/30 !text-white dark:!text-slate-800 hover:!bg-white/30 dark:hover:!bg-slate-800/30'
											: '!p-1.5 !w-6 !h-6 !rounded-md !bg-slate-100 dark:!bg-slate-600 !border-slate-200 dark:!border-slate-500 !text-slate-600 dark:!text-slate-400 hover:!bg-slate-200 dark:hover:!bg-slate-500'
									"
								>
									<Icon icon="material-symbols:delete" class="text-xs" />
								</el-button>
							</div>
						</div>
					</template>
				</el-tree>
			</div>
		</div>

		<!-- 新建文件对话框 -->
		<el-dialog
			v-model="showCreateFile"
			width="420px"
			draggable
			@close="resetCreateFileDialog"
			class="[&_.el-dialog]:rounded-2xl [&_.el-dialog]:shadow-2xl [&_.el-dialog__header]:bg-gradient-to-135deg [&_.el-dialog__header]:from-slate-50 [&_.el-dialog__header]:to-slate-200 [&_.el-dialog__header]:rounded-t-2xl [&_.el-dialog__header]:p-6 [&_.el-dialog__header]:border-b [&_.el-dialog__header]:border-slate-200 [&_.el-dialog__title]:font-semibold [&_.el-dialog__title]:text-slate-800"
		>
			<template #header>
				<div class="flex items-center gap-2">
					<el-icon><DocumentAdd /></el-icon>
					新建文件
				</div>
			</template>
			<el-form :model="createFileForm" label-width="90px" class="p-2">
				<el-form-item class="mb-6">
					<template #label>
						<div class="flex items-center gap-2">
							<el-icon><EditPen /></el-icon>
							文件名
						</div>
					</template>
					<el-input
						v-model="createFileForm.fileName"
						placeholder="输入文件名..."
						autofocus
						@keyup.enter="createFile"
						size="large"
						class="!rounded-xl [&_.el-input__wrapper]:rounded-xl [&_.el-input__wrapper]:shadow-sm [&_.el-input__wrapper]:transition-all [&_.el-input__wrapper]:duration-200 [&_.el-input__wrapper:hover]:shadow-md [&_.el-input__wrapper.is-focus]:shadow-blue-100 [&_.el-input__wrapper.is-focus]:ring-3 [&_.el-input__wrapper.is-focus]:ring-blue-100"
					/>
				</el-form-item>
				<el-form-item class="mb-4">
					<template #label>
						<div class="flex items-center gap-2">
							<el-icon><FolderOpened /></el-icon>
							类型
						</div>
					</template>
					<el-select
						v-model="createFileForm.fileType"
						placeholder="选择文件类型"
						class="w-full"
						size="large"
					>
						<el-option value="md">
							<div class="flex items-center gap-2">
								<el-icon><EditPen /></el-icon>
								Markdown文件 (.md)
							</div>
						</el-option>
						<el-option value="txt">
							<div class="flex items-center gap-2">
								<el-icon><Document /></el-icon>
								文本文件 (.txt)
							</div>
						</el-option>
						<el-option value="json">
							<div class="flex items-center gap-2">
								<el-icon><Tickets /></el-icon>
								JSON文件 (.json)
							</div>
						</el-option>
						<el-option value="js">
							<div class="flex items-center gap-2">
								<el-icon><DocumentCopy /></el-icon>
								JavaScript文件 (.js)
							</div>
						</el-option>
						<el-option value="ts">
							<div class="flex items-center gap-2">
								<el-icon><DocumentCopy /></el-icon>
								TypeScript文件 (.ts)
							</div>
						</el-option>
						<el-option value="vue">
							<div class="flex items-center gap-2">
								<el-icon><DocumentCopy /></el-icon>
								Vue文件 (.vue)
							</div>
						</el-option>
						<el-option value="html">
							<div class="flex items-center gap-2">
								<el-icon><Document /></el-icon>
								HTML文件 (.html)
							</div>
						</el-option>
						<el-option value="css">
							<div class="flex items-center gap-2">
								<el-icon><Document /></el-icon>
								CSS文件 (.css)
							</div>
						</el-option>
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
						<div class="flex items-center gap-2">
							<el-icon><DocumentAdd /></el-icon>
							创建
						</div>
					</el-button>
				</div>
			</template>
		</el-dialog>

		<!-- 新建文件夹对话框 -->
		<el-dialog
			v-model="showCreateFolder"
			width="420px"
			draggable
			@close="resetCreateFolderDialog"
			class="[&_.el-dialog]:rounded-2xl [&_.el-dialog]:shadow-2xl [&_.el-dialog__header]:bg-gradient-to-135deg [&_.el-dialog__header]:from-slate-50 [&_.el-dialog__header]:to-slate-200 [&_.el-dialog__header]:rounded-t-2xl [&_.el-dialog__header]:p-6 [&_.el-dialog__header]:border-b [&_.el-dialog__header]:border-slate-200 [&_.el-dialog__title]:font-semibold [&_.el-dialog__title]:text-slate-800"
		>
			<template #header>
				<div class="flex items-center gap-2">
					<el-icon><FolderAdd /></el-icon>
					新建文件夹
				</div>
			</template>
			<el-form :model="createFolderForm" label-width="100px" class="p-2">
				<el-form-item class="mb-6">
					<template #label>
						<div class="flex items-center gap-2">
							<el-icon><FolderAdd /></el-icon>
							文件夹名
						</div>
					</template>
					<el-input
						v-model="createFolderForm.folderName"
						placeholder="输入文件夹名..."
						autofocus
						@keyup.enter="createFolder"
						size="large"
						class="!rounded-xl [&_.el-input__wrapper]:rounded-xl [&_.el-input__wrapper]:shadow-sm [&_.el-input__wrapper]:transition-all [&_.el-input__wrapper]:duration-200 [&_.el-input__wrapper:hover]:shadow-md [&_.el-input__wrapper.is-focus]:shadow-blue-100 [&_.el-input__wrapper.is-focus]:ring-3 [&_.el-input__wrapper.is-focus]:ring-blue-100"
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
						<div class="flex items-center gap-2">
							<el-icon><FolderAdd /></el-icon>
							创建
						</div>
					</el-button>
				</div>
			</template>
		</el-dialog>

		<!-- 重命名对话框 -->
		<el-dialog
			v-model="showRename"
			width="420px"
			draggable
			@close="resetRenameDialog"
			class="[&_.el-dialog]:rounded-2xl [&_.el-dialog]:shadow-2xl [&_.el-dialog__header]:bg-gradient-to-135deg [&_.el-dialog__header]:from-slate-50 [&_.el-dialog__header]:to-slate-200 [&_.el-dialog__header]:rounded-t-2xl [&_.el-dialog__header]:p-6 [&_.el-dialog__header]:border-b [&_.el-dialog__header]:border-slate-200 [&_.el-dialog__title]:font-semibold [&_.el-dialog__title]:text-slate-800"
		>
			<template #header>
				<div class="flex items-center gap-2">
					<el-icon><Edit /></el-icon>
					重命名
				</div>
			</template>
			<el-form :model="renameForm" label-width="80px" class="p-2">
				<el-form-item class="mb-6">
					<template #label>
						<div class="flex items-center gap-2">
							<el-icon><Edit /></el-icon>
							新名称
						</div>
					</template>
					<el-input
						v-model="renameForm.newName"
						placeholder="输入新名称..."
						autofocus
						@keyup.enter="renameItem"
						size="large"
						class="!rounded-xl [&_.el-input__wrapper]:rounded-xl [&_.el-input__wrapper]:shadow-sm [&_.el-input__wrapper]:transition-all [&_.el-input__wrapper]:duration-200 [&_.el-input__wrapper:hover]:shadow-md [&_.el-input__wrapper.is-focus]:shadow-blue-100 [&_.el-input__wrapper.is-focus]:ring-3 [&_.el-input__wrapper.is-focus]:ring-blue-100"
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
						<div class="flex items-center gap-2">
							<el-icon><Edit /></el-icon>
							确定
						</div>
					</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
// Iconify Vue 图标导入
import { Icon } from "@iconify/vue";
import { ElMessage, ElMessageBox, ElTree } from "element-plus";
import { nextTick, onMounted, ref, watch } from "vue";
import {
	buildTree,
	chooseDirectory,
	deleteFileOrFolder,
	getFileType,
	isDeleteSupported,
	isSupportedFile,
	renameFileOrFolder,
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

// 默认展开的节点
const defaultExpandedKeys = ref<string[]>([]);

// 添加树组件的key，用于强制重新渲染
const treeKey = ref(0);

// 加载状态
const isLoading = ref(false);

// 功能支持状态
const deleteFunctionSupported = ref(true);

// 当前创建操作的目录和节点
const currentCreateDirectory = ref<FileSystemDirectoryHandle | null>(null);
const currentCreateNode = ref<FileTreeNode | null>(null);

// 选择根目录
const selectRootDirectory = async () => {
	try {
		isLoading.value = true;
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
	} finally {
		isLoading.value = false;
	}
};

// 加载完整的目录树
const loadFullDirectoryTree = async () => {
	if (!rootHandle.value) return;

	try {
		isLoading.value = true;
		console.log("开始加载完整目录树...");

		// 先重置状态
		treeData.value = [];
		filteredTreeData.value = [];
		isInitialized.value = false;
		defaultExpandedKeys.value = []; // 保持所有节点折叠

		// 强制重新渲染
		treeKey.value++;

		// 等待一个tick确保DOM更新
		await nextTick();

		const rootTree = await buildTree(rootHandle.value);
		treeData.value = rootTree;
		filteredTreeData.value = rootTree;
		isInitialized.value = true;

		// 清除选中状态
		selectedNode.value = null;
		selectedNodeId.value = null;

		// 不自动展开任何节点，让用户手动点击展开
		// defaultExpandedKeys.value = []; // 已经在上面重置了

		// 再次强制重新渲染以确保切换到静态数据模式
		treeKey.value++;

		// 等待一个tick确保树完全重新渲染
		await nextTick();

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
	} finally {
		isLoading.value = false;
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

// 处理节点展开
const handleNodeExpand = (data: FileTreeNode, node: any) => {
	console.log("节点展开:", data.label);
	if (data.isDirectory && data.handle) {
		// 只有当节点不在展开列表中时才添加
		if (!defaultExpandedKeys.value.includes(data.id)) {
			defaultExpandedKeys.value.push(data.id);
		}
	}
};

// 处理节点折叠
const handleNodeCollapse = (data: FileTreeNode, node: any) => {
	console.log("节点折叠:", data.label);
	if (data.isDirectory && data.handle) {
		// 从展开列表中移除
		defaultExpandedKeys.value = defaultExpandedKeys.value.filter(
			(key) => key !== data.id
		);
	}
};

// 获取节点图标
const getNodeIcon = (data: FileTreeNode): string => {
	if (data.isDirectory) {
		return "material-symbols:folder";
	}
	if (data.isFile) {
		const fileType = getFileType(data.label);
		switch (fileType) {
			case "markdown":
				return "material-symbols:edit-note";
			case "json":
				return "material-symbols:data-object";
			case "javascript":
			case "typescript":
			case "vue":
				return "material-symbols:code";
			default:
				return "material-symbols:description";
		}
	}
	return "material-symbols:description";
};

// 刷新当前目录
const refreshCurrentDirectory = async () => {
	if (!rootHandle.value) return;

	try {
		isRefreshing.value = true;
		await loadFullDirectoryTree();
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
	currentCreateDirectory.value = rootHandle.value;
	currentCreateNode.value = null;
	showCreateFile.value = true;
};

// 显示新建文件夹对话框
const showCreateFolderDialog = () => {
	currentCreateDirectory.value = rootHandle.value;
	currentCreateNode.value = null;
	showCreateFolder.value = true;
};

// 显示在指定目录创建文件的对话框
const showCreateFileInDirectoryDialog = () => {
	showCreateFile.value = true;
};

// 显示在指定目录创建文件夹的对话框
const showCreateFolderInDirectoryDialog = () => {
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
	currentCreateDirectory.value = null;
	currentCreateNode.value = null;
};

// 重置新建文件夹对话框
const resetCreateFolderDialog = () => {
	showCreateFolder.value = false;
	createFolderForm.value.folderName = "";
	currentCreateDirectory.value = null;
	currentCreateNode.value = null;
};

// 重置重命名对话框
const resetRenameDialog = () => {
	showRename.value = false;
	renameForm.value.newName = "";
	renameForm.value.targetNode = null;
};

// 创建文件
const createFile = async () => {
	if (!createFileForm.value.fileName.trim()) {
		ElMessage.warning("请输入文件名");
		return;
	}

	// 使用当前创建目录或根目录
	const targetDirectory = currentCreateDirectory.value || rootHandle.value;
	if (!targetDirectory) {
		ElMessage.error("没有选择目标目录");
		return;
	}

	try {
		const fileName = createFileForm.value.fileName.trim();
		const fileExtension = createFileForm.value.fileType;
		const fullFileName = fileName.endsWith(`.${fileExtension}`)
			? fileName
			: `${fileName}.${fileExtension}`;

		const fileHandle = await targetDirectory.getFileHandle(fullFileName, {
			create: true,
		});
		const writable = await fileHandle.createWritable();
		await writable.write("");
		await writable.close();

		// 显示创建位置信息
		const locationInfo = currentCreateNode.value
			? `在 "${currentCreateNode.value.label}" ${currentCreateNode.value.isDirectory ? "文件夹内" : "所在目录"}`
			: "在根目录";

		ElMessage.success(`文件 ${fullFileName} ${locationInfo}创建成功`);
		resetCreateFileDialog();
		await loadFullDirectoryTree();
	} catch (error) {
		console.error("创建文件失败:", error);
		ElMessage.error("创建文件失败: " + (error as Error).message);
	}
};

// 创建文件夹
const createFolder = async () => {
	if (!createFolderForm.value.folderName.trim()) {
		ElMessage.warning("请输入文件夹名");
		return;
	}

	// 使用当前创建目录或根目录
	const targetDirectory = currentCreateDirectory.value || rootHandle.value;
	if (!targetDirectory) {
		ElMessage.error("没有选择目标目录");
		return;
	}

	try {
		const folderName = createFolderForm.value.folderName.trim();
		await targetDirectory.getDirectoryHandle(folderName, { create: true });

		// 显示创建位置信息
		const locationInfo = currentCreateNode.value
			? `在 "${currentCreateNode.value.label}" ${currentCreateNode.value.isDirectory ? "文件夹内" : "所在目录"}`
			: "在根目录";

		ElMessage.success(`文件夹 ${folderName} ${locationInfo}创建成功`);
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

	if (!rootHandle.value) {
		ElMessage.error("没有选择根目录");
		return;
	}

	const targetNode = renameForm.value.targetNode;
	const newName = renameForm.value.newName.trim();
	const oldName = targetNode.label;

	// 检查新名称是否与旧名称相同
	if (newName === oldName) {
		ElMessage.warning("新名称与原名称相同");
		resetRenameDialog();
		return;
	}

	try {
		if (targetNode.isDirectory) {
			ElMessage.warning("文件夹重命名功能暂未实现，需要递归复制所有子项");
		} else {
			// 检查删除功能是否支持
			if (!isDeleteSupported()) {
				ElMessage.error("当前浏览器不支持文件操作功能");
				return;
			}

			await renameFileOrFolder(rootHandle.value, oldName, newName, false);
			ElMessage.success(`文件重命名成功: ${oldName} → ${newName}`);
			resetRenameDialog();
			await loadFullDirectoryTree();
		}
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

		// 检查删除功能是否支持
		if (!isDeleteSupported()) {
			ElMessage.error("当前浏览器不支持删除功能");
			return;
		}

		const itemName = node.label;
		const isDirectory = node.isDirectory;

		// 使用标准的removeEntry方法删除
		await deleteFileOrFolder(rootHandle.value, itemName, isDirectory);

		ElMessage.success(
			`${isDirectory ? "文件夹" : "文件"} "${itemName}" 删除成功`
		);

		// 清除选中状态（如果删除的是当前选中项）
		if (selectedNodeId.value === node.id) {
			selectedNode.value = null;
			selectedNodeId.value = null;
		}

		// 刷新文件树
		await loadFullDirectoryTree();
	} catch (error) {
		console.error("删除失败:", error);
		const errorMessage = (error as Error).message;

		// 根据错误类型提供更友好的提示
		if (errorMessage.includes("NotAllowedError")) {
			ElMessage.error("删除失败：没有权限访问该文件");
		} else if (errorMessage.includes("NotFoundError")) {
			ElMessage.error("删除失败：文件或文件夹不存在");
		} else if (errorMessage.includes("InvalidModificationError")) {
			ElMessage.error("删除失败：文件夹不为空，请先删除其中的内容");
		} else {
			ElMessage.error("删除失败: " + errorMessage);
		}
	}
};

// 处理右键菜单
const handleNodeContextMenu = (event: MouseEvent, data: FileTreeNode) => {
	event.preventDefault();
	console.log("右键点击:", data.label);
};

// 获取目标目录handle
const getTargetDirectoryHandle = async (
	node: FileTreeNode
): Promise<FileSystemDirectoryHandle | null> => {
	if (!rootHandle.value) return null;

	if (node.isDirectory) {
		// 如果是文件夹，直接返回该文件夹的handle
		return node.handle as FileSystemDirectoryHandle;
	} else {
		// 如果是文件，需要获取其父目录的handle
		const pathParts = node.id.split("/");
		if (pathParts.length <= 1) {
			// 文件在根目录
			return rootHandle.value;
		}

		// 遍历路径获取父目录handle
		let currentHandle = rootHandle.value;
		for (const part of pathParts.slice(0, -1)) {
			if (part) {
				currentHandle = await currentHandle.getDirectoryHandle(part);
			}
		}
		return currentHandle;
	}
};

// 处理创建命令
const handleCreateCommand = async (command: string, node: FileTreeNode) => {
	try {
		const targetDirectory = await getTargetDirectoryHandle(node);
		if (!targetDirectory) {
			ElMessage.error("无法获取目标目录");
			return;
		}

		// 设置当前操作的目录
		currentCreateDirectory.value = targetDirectory;
		currentCreateNode.value = node;

		if (command === "file") {
			showCreateFileInDirectoryDialog();
		} else if (command === "folder") {
			showCreateFolderInDirectoryDialog();
		}
	} catch (error) {
		console.error("获取目标目录失败:", error);
		ElMessage.error("获取目标目录失败: " + (error as Error).message);
	}
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

	// 检查删除功能支持情况
	const deleteSupported = isDeleteSupported();
	deleteFunctionSupported.value = deleteSupported;
	console.log("删除功能支持情况:", deleteSupported);

	if (!deleteSupported) {
		ElMessage({
			message: "当前浏览器不支持文件删除功能，建议使用Chrome 86+或Firefox 111+",
			type: "warning",
			duration: 5000,
			showClose: true,
		});
	}

	try {
		isLoading.value = true;
		const loaded = await loadDirectoryHistory();
		if (!loaded) {
			console.log("未能自动加载历史目录，等待用户手动选择");
			// 可以考虑在这里显示一个提示消息
		}
	} catch (error) {
		console.error("加载历史目录时出错:", error);
		ElMessage({
			message: "加载历史目录失败，请手动选择目录",
			type: "warning",
			duration: 3000,
		});
	} finally {
		isLoading.value = false;
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
