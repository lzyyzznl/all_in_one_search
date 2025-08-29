<template>
	<div
		class="max-w-4xl mx-auto p-6 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
	>
		<!-- 页面头部 -->
		<div class="mb-6 text-center">
			<h1 class="text-2xl font-bold mb-2">🔧 插件设置</h1>
			<p class="text-slate-500 dark:text-slate-400">
				配置浏览器收藏夹历史记录搜索器的各项设置
			</p>
		</div>

		<!-- 成功提示 -->
		<el-alert
			v-if="showSaveSuccess"
			title="设置已保存成功！"
			type="success"
			effect="dark"
			:closable="false"
			class="mb-6"
		/>

		<!-- 主题设置 -->
		<div class="mb-6">
			<el-card class="shadow-sm">
				<template #header>
					<div class="flex items-center gap-2">
						<el-icon class="text-blue-600 dark:text-blue-400"
							><Tools
						/></el-icon>
						<h2 class="text-lg font-semibold">主题设置</h2>
					</div>
				</template>
				<div>
					<p class="text-slate-500 dark:text-slate-400 mb-4">
						选择应用程序的外观主题
					</p>
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<span class="text-slate-700 dark:text-slate-300 font-medium"
								>主题模式:</span
							>
							<el-radio-group
								v-model="currentTheme"
								@change="handleThemeChange"
								class="ml-4"
							>
								<el-radio value="light" class="mr-4">
									<div class="flex items-center gap-2">
										<span>☀️</span>
										<span>浅色主题</span>
									</div>
								</el-radio>
								<el-radio value="dark" class="mr-4">
									<div class="flex items-center gap-2">
										<span>🌙</span>
										<span>深色主题</span>
									</div>
								</el-radio>
								<el-radio value="auto">
									<div class="flex items-center gap-2">
										<span>🔄</span>
										<span>跟随系统</span>
									</div>
								</el-radio>
							</el-radio-group>
						</div>
						<div class="text-sm text-slate-500 dark:text-slate-400">
							选择"跟随系统"将根据您的操作系统设置自动切换主题
						</div>
					</div>
				</div>
			</el-card>
		</div>

		<div class="space-y-6">
			<!-- 快捷键设置 -->
			<el-card class="shadow-sm">
				<template #header>
					<div class="flex items-center gap-2">
						<el-icon class="text-blue-600 dark:text-blue-400"
							><Tools
						/></el-icon>
						<h2 class="text-lg font-semibold">快捷键设置</h2>
					</div>
				</template>

				<p class="text-slate-500 dark:text-slate-400 mb-4">
					当前插件的快捷键配置，您可以在浏览器扩展管理页面中修改这些快捷键。
				</p>

				<el-table :data="shortcuts" stripe class="mb-4 w-full">
					<el-table-column prop="description" label="功能" width="180" />
					<el-table-column label="快捷键">
						<template #default="{ row }">
							<el-space :size="4" wrap>
								<el-tag
									v-for="key in row.shortcut.split('+')"
									:key="key"
									type="info"
									effect="plain"
									size="small"
								>
									{{ formatKey(key) }}
								</el-tag>
							</el-space>
						</template>
					</el-table-column>
				</el-table>

				<div class="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
					<h3 class="text-base font-medium mb-3">📖 如何修改快捷键：</h3>
					<ol
						class="list-decimal list-inside space-y-1 text-sm text-slate-500 dark:text-slate-400 mb-4"
					>
						<li>
							在Chrome中访问
							<code class="bg-gray-100 dark:bg-gray-700 px-1 rounded"
								>chrome://extensions/shortcuts</code
							>
						</li>
						<li>找到"浏览器收藏夹历史记录搜索器"</li>
						<li>点击快捷键输入框，按下您想要的快捷键组合</li>
						<li>点击确定保存</li>
					</ol>
					<el-button type="primary" @click="openShortcutsPage">
						<el-icon><Setting /></el-icon>
						打开快捷键设置页面
					</el-button>
				</div>
			</el-card>

			<!-- 搜索设置 -->
			<el-card class="shadow-sm">
				<template #header>
					<div class="flex items-center gap-2">
						<el-icon class="text-blue-600 dark:text-blue-400"
							><Search
						/></el-icon>
						<h2 class="text-lg font-semibold">搜索设置</h2>
					</div>
				</template>

				<p class="text-slate-500 dark:text-slate-400 mb-4">
					自定义搜索行为和显示选项
				</p>

				<el-form
					:model="searchSettings"
					label-width="160px"
					label-position="top"
				>
					<el-form-item label="偏好搜索引擎" prop="preferredSearchEngine">
						<el-select
							v-model="searchSettings.preferredSearchEngine"
							@change="saveSearchSettings"
							class="w-full"
							placeholder="默认使用浏览器设置"
						>
							<el-option
								v-for="engine in availableEngines"
								:key="engine.id"
								:label="engine.name"
								:value="engine.id"
							>
								<template #default>
									<img
										:src="getEngineIconUrl(engine)"
										alt="icon"
										class="w-4 h-4 inline-block mr-1 align-middle"
									/>
									<span>{{ engine.name }}</span>
								</template>
							</el-option>
						</el-select>
						<div class="text-xs text-slate-400 mt-1">
							选择您偏好的网络搜索引擎，用于 Ctrl+Enter 快捷搜索。
						</div>
					</el-form-item>

					<el-form-item label="默认搜索结果数量" prop="defaultMaxResults">
						<el-select
							v-model="searchSettings.defaultMaxResults"
							@change="saveSearchSettings"
							class="w-full"
						>
							<el-option label="25条" :value="25" />
							<el-option label="50条" :value="50" />
							<el-option label="100条" :value="100" />
							<el-option label="200条" :value="200" />
						</el-select>
					</el-form-item>

					<el-form-item label="默认排序方式" prop="defaultSortBy">
						<el-select
							v-model="searchSettings.defaultSortBy"
							@change="saveSearchSettings"
							class="w-full"
						>
							<el-option label="相关性" value="relevance" />
							<el-option label="最近访问" value="recent" />
							<el-option label="访问频率" value="frequency" />
						</el-select>
					</el-form-item>

					<el-form-item label="历史气泡数量" prop="bubbleCount">
						<el-input-number
							v-model="searchSettings.bubbleCount"
							@change="saveSearchSettings"
							:min="1"
							:max="10"
							class="w-full"
						/>
						<div class="text-xs text-slate-400 mt-1">
							设置搜索框下方显示的历史记录气泡数量
						</div>
					</el-form-item>
				</el-form>
			</el-card>

			<!-- 关于 -->
			<el-card class="shadow-sm">
				<template #header>
					<div class="flex items-center gap-2">
						<el-icon class="text-blue-600 dark:text-blue-400"
							><InfoFilled
						/></el-icon>
						<h2 class="text-lg font-semibold">关于插件</h2>
					</div>
				</template>

				<div>
					<el-descriptions :column="1" border>
						<el-descriptions-item label="开发框架"
							>WXT + Vue 3 + TypeScript + Element Plus</el-descriptions-item
						>
						<el-descriptions-item label="功能特性">
							<ul class="list-disc list-inside space-y-1 text-sm">
								<li>🔍 模糊搜索收藏夹和历史记录</li>
								<li>📁 按域名智能分组显示</li>
								<li>⚡ 实时搜索，响应迅速</li>
								<li>⭐ 历史记录一键收藏</li>
								<li>🆕 新标签页完整搜索界面</li>
								<li>🎨 Element Plus 现代化UI</li>
							</ul>
						</el-descriptions-item>
					</el-descriptions>
				</div>
			</el-card>
		</div>

		<div class="mt-8 pt-6 border-t border-base text-center">
			<div class="text-slate-400 text-sm">
				作者: lizeyu 如有问题请联系:
				<a
					href="mailto:632795136@qq.com"
					class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
					>632795136@qq.com</a
				>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { InfoFilled, Search, Setting, Tools } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import type { SearchEngine } from "../utils/types";
import { ThemeManager } from "../utils/theme";

// 显示保存成功消息
const showSaveSuccess = ref(false);
const availableEngines = ref<SearchEngine[]>([]);

// 主题设置
const currentTheme = ref<string>("auto");

// 快捷键列表
const shortcuts = ref([
	{
		name: "_execute_action",
		description: "默认打开收藏夹历史记录搜索器",
		shortcut: "未设置",
	},
]);

// 搜索设置
const searchSettings = reactive({
	defaultMaxResults: 100,
	defaultSortBy: "relevance",
	preferredSearchEngine: "google",
	bubbleCount: 5,
});

// 格式化快捷键显示
const formatKey = (key: string) => {
	const keyMap: { [key: string]: string } = {
		Ctrl: "Ctrl",
		Alt: "Alt",
		Shift: "Shift",
		Meta: "⌘",
		Command: "⌘",
		Space: "空格",
	};
	return keyMap[key] || key;
};

// 加载快捷键设置
const loadShortcuts = async () => {
	try {
		const commands = await chrome.commands.getAll();
		shortcuts.value = shortcuts.value.map((shortcut) => {
			const command = commands.find((cmd) => cmd.name === shortcut.name);
			return {
				...shortcut,
				shortcut: command?.shortcut || "未设置",
			};
		});
		console.log("快捷键配置已加载:", shortcuts.value);
	} catch (error) {
		console.error("加载快捷键失败:", error);
	}
};

// 加载所有搜索引擎
const loadAvailableEngines = async () => {
	try {
		const response = await chrome.runtime.sendMessage({
			action: "get-all-search-engines",
		});
		if (response?.success) {
			availableEngines.value = response.engines;
		}
	} catch (error) {
		console.error("加载可用搜索引擎失败:", error);
	}
};

// 打开浏览器快捷键设置页面
const openShortcutsPage = () => {
	chrome.tabs.create({
		url: "chrome://extensions/shortcuts",
	});
};

// 加载搜索设置
const loadSearchSettings = async () => {
	try {
		const result = await chrome.storage.local.get(["searchSettings"]);
		if (result.searchSettings) {
			Object.assign(searchSettings, result.searchSettings);
		}
	} catch (error) {
		console.error("加载搜索设置失败:", error);
	}
};

// 显示保存成功消息
const showSaveSuccessMessage = () => {
	showSaveSuccess.value = true;
	setTimeout(() => {
		showSaveSuccess.value = false;
	}, 3000); // 3秒后隐藏
};

// 保存搜索设置
const saveSearchSettings = async () => {
	try {
		await chrome.storage.local.set({ searchSettings: searchSettings });
		console.log("搜索设置已保存:", searchSettings);

		// 显示保存成功提示
		showSaveSuccessMessage();
	} catch (error) {
		console.error("保存搜索设置失败:", error);
	}
};

// 获取搜索引擎图标URL
const getEngineIconUrl = (engine: SearchEngine | null) => {
	if (!engine || !chrome?.runtime?.getURL) return "";
	switch (engine.id) {
		case "baidu":
			return chrome.runtime.getURL("searchEngineIcon/baidu.png");
		case "google":
			return chrome.runtime.getURL("searchEngineIcon/google.png");
		case "bing":
			return chrome.runtime.getURL("searchEngineIcon/bing.png");
		default:
			return "";
	}
};

// 加载主题设置
const loadThemeSettings = async () => {
	try {
		currentTheme.value = ThemeManager.getCurrentTheme();
	} catch (error) {
		console.error("加载主题设置失败:", error);
	}
};

// 处理主题变化
const handleThemeChange = async (theme: string) => {
	try {
		ThemeManager.setTheme(theme as "light" | "dark" | "auto");
		console.log("主题已切换到:", theme);
		showSaveSuccessMessage();
	} catch (error) {
		console.error("切换主题失败:", error);
	}
};

// 组件挂载时加载设置
onMounted(async () => {
	// 初始化主题
	ThemeManager.init();
	await loadShortcuts();
	await loadSearchSettings();
	await loadAvailableEngines();
	await loadThemeSettings();
});
</script>
