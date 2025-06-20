<template>
	<v-app class="min-h-screen bg-gray-50">
		<v-container fluid class="pa-6">
			<!-- 页面头部 -->
			<div class="settings-header mb-6">
				<h1 class="text-h3 mb-2">🔧 插件设置</h1>
				<p class="text-body-1 text-medium-emphasis">
					配置浏览器收藏夹历史记录搜索器的各项设置
				</p>
			</div>

			<!-- 成功提示 -->
			<v-alert
				v-if="showSaveSuccess"
				type="success"
				variant="tonal"
				class="mb-6"
				closable
				@click:close="showSaveSuccess = false"
			>
				设置已保存成功！
			</v-alert>

			<div class="settings-content">
				<!-- 快捷键设置 -->
				<v-card class="mb-6" elevation="2">
					<v-card-title class="d-flex align-center ga-3">
						<v-icon color="primary">mdi-tools</v-icon>
						<span>快捷键设置</span>
					</v-card-title>

					<v-card-text>
						<p class="text-body-2 text-medium-emphasis mb-4">
							当前插件的快捷键配置，您可以在浏览器扩展管理页面中修改这些快捷键。
						</p>

						<v-table>
							<thead>
								<tr>
									<th class="text-left">功能</th>
									<th class="text-left">快捷键</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="shortcut in shortcuts" :key="shortcut.name">
									<td>{{ shortcut.description }}</td>
									<td>
										<div class="d-flex flex-wrap ga-1">
											<v-chip
												v-for="key in shortcut.shortcut.split('+')"
												:key="key"
												size="small"
												color="info"
												variant="outlined"
											>
												{{ formatKey(key) }}
											</v-chip>
										</div>
									</td>
								</tr>
							</tbody>
						</v-table>

						<v-card class="mt-4" variant="outlined">
							<v-card-text>
								<h3 class="text-h6 mb-3">📖 如何修改快捷键：</h3>
								<ol class="my-4 pl-5">
									<li class="mb-2">
										在Chrome中访问
										<code class="bg-gray-100 px-1.5 py-0.5 rounded font-mono"
											>chrome://extensions/shortcuts</code
										>
									</li>
									<li class="mb-2">找到"浏览器收藏夹历史记录搜索器"</li>
									<li class="mb-2">点击快捷键输入框，按下您想要的快捷键组合</li>
									<li class="mb-2">点击确定保存</li>
								</ol>
								<v-btn color="primary" @click="openShortcutsPage" class="mt-3">
									<v-icon start>mdi-cog</v-icon>
									打开快捷键设置页面
								</v-btn>
							</v-card-text>
						</v-card>
					</v-card-text>
				</v-card>

				<!-- 搜索设置 -->
				<v-card class="setting-section mb-6" elevation="2">
					<v-card-title class="d-flex align-center ga-3">
						<v-icon color="primary">mdi-magnify</v-icon>
						<span>搜索设置</span>
					</v-card-title>

					<v-card-text>
						<p class="text-body-2 text-medium-emphasis mb-4">
							自定义搜索行为和显示选项
						</p>

						<v-form>
							<v-select
								v-model="searchSettings.preferredSearchEngine"
								label="偏好搜索引擎"
								:items="availableEngines"
								item-title="name"
								item-value="id"
								variant="outlined"
								placeholder="默认使用浏览器设置"
								@update:model-value="saveSearchSettings"
								class="mb-4"
							>
								<template #item="{ props, item }">
									<v-list-item v-bind="props">
										<template #prepend>
											<img
												:src="getEngineIconUrl(item.raw)"
												alt="icon"
												style="width: 16px; height: 16px"
												class="mr-2"
											/>
										</template>
									</v-list-item>
								</template>
								<template #selection="{ item }">
									<div class="d-flex align-center">
										<img
											:src="getEngineIconUrl(item.raw)"
											alt="icon"
											style="width: 16px; height: 16px"
											class="mr-2"
										/>
										<span>{{ item.title }}</span>
									</div>
								</template>
							</v-select>
							<div class="text-caption text-medium-emphasis mb-4">
								选择您偏好的网络搜索引擎，用于 Ctrl+Enter 快捷搜索。
							</div>

							<v-select
								v-model="searchSettings.defaultMaxResults"
								label="默认搜索结果数量"
								:items="[
									{ title: '25条', value: 25 },
									{ title: '50条', value: 50 },
									{ title: '100条', value: 100 },
									{ title: '200条', value: 200 },
								]"
								variant="outlined"
								@update:model-value="saveSearchSettings"
								class="mb-4"
							/>

							<v-select
								v-model="searchSettings.defaultSortBy"
								label="默认排序方式"
								:items="[
									{ title: '相关性', value: 'relevance' },
									{ title: '最近访问', value: 'recent' },
									{ title: '访问频率', value: 'frequency' },
								]"
								variant="outlined"
								@update:model-value="saveSearchSettings"
							/>
						</v-form>
					</v-card-text>
				</v-card>

				<!-- 键盘导航设置 -->
				<v-card class="setting-section mb-6" elevation="2">
					<v-card-title class="d-flex align-center ga-3">
						<v-icon color="primary">mdi-keyboard</v-icon>
						<span>键盘导航设置</span>
					</v-card-title>

					<v-card-text>
						<p class="text-body-2 text-medium-emphasis mb-4">
							自定义搜索结果中的键盘导航快捷键
						</p>

						<v-row class="navigation-keys-grid">
							<v-col cols="12" md="6" lg="3">
								<v-card class="key-setting-item text-center" variant="outlined">
									<v-card-text>
										<div class="key-label mb-3">
											<v-icon size="32" color="primary">mdi-arrow-up</v-icon>
											<div class="text-body-2 mt-2">向上选择</div>
										</div>
										<v-select
											v-model="navigationSettings.up"
											:items="[
												{ title: '↑ (方向键上)', value: 'ArrowUp' },
												{ title: 'K', value: 'KeyK' },
												{ title: 'W', value: 'KeyW' },
											]"
											variant="outlined"
											density="compact"
											@update:model-value="saveNavigationSettings"
										/>
									</v-card-text>
								</v-card>
							</v-col>

							<v-col cols="12" md="6" lg="3">
								<v-card class="key-setting-item text-center" variant="outlined">
									<v-card-text>
										<div class="key-label mb-3">
											<v-icon size="32" color="primary">mdi-arrow-down</v-icon>
											<div class="text-body-2 mt-2">向下选择</div>
										</div>
										<v-select
											v-model="navigationSettings.down"
											:items="[
												{ title: '↓ (方向键下)', value: 'ArrowDown' },
												{ title: 'J', value: 'KeyJ' },
												{ title: 'S', value: 'KeyS' },
											]"
											variant="outlined"
											density="compact"
											@update:model-value="saveNavigationSettings"
										/>
									</v-card-text>
								</v-card>
							</v-col>

							<v-col cols="12" md="6" lg="3">
								<v-card class="key-setting-item text-center" variant="outlined">
									<v-card-text>
										<div class="key-label mb-3">
											<v-icon size="32" color="primary">mdi-check</v-icon>
											<div class="text-body-2 mt-2">打开选中项</div>
										</div>
										<v-select
											v-model="navigationSettings.open"
											:items="[
												{ title: 'Enter (回车键)', value: 'Enter' },
												{ title: 'Space (空格键)', value: 'Space' },
												{ title: 'O', value: 'KeyO' },
											]"
											variant="outlined"
											density="compact"
											@update:model-value="saveNavigationSettings"
										/>
									</v-card-text>
								</v-card>
							</v-col>

							<v-col cols="12" md="6" lg="3">
								<v-card class="key-setting-item text-center" variant="outlined">
									<v-card-text>
										<div class="key-label mb-3">
											<v-icon size="32" color="primary">mdi-close</v-icon>
											<div class="text-body-2 mt-2">关闭窗口</div>
										</div>
										<v-select
											v-model="navigationSettings.close"
											:items="[
												{ title: 'Esc (退出键)', value: 'Escape' },
												{ title: 'Q', value: 'KeyQ' },
											]"
											variant="outlined"
											density="compact"
											@update:model-value="saveNavigationSettings"
										/>
									</v-card-text>
								</v-card>
							</v-col>
						</v-row>

						<v-alert type="info" variant="tonal" class="navigation-help mt-4">
							<template #title>📝 提示：</template>
							<ul class="mt-2">
								<li>这些快捷键只在搜索结果页面中生效</li>
								<li>修改后即时生效，无需重启扩展</li>
								<li>建议选择不与浏览器默认快捷键冲突的按键</li>
							</ul>
						</v-alert>
					</v-card-text>
				</v-card>

				<!-- 关于 -->
				<v-card class="setting-section mb-6" elevation="2">
					<v-card-title class="d-flex align-center ga-3">
						<v-icon color="primary">mdi-information</v-icon>
						<span>关于插件</span>
					</v-card-title>

					<v-card-text>
						<v-table>
							<tbody>
								<tr>
									<td class="font-weight-medium">版本</td>
									<td>1.0.0</td>
								</tr>
								<tr>
									<td class="font-weight-medium">开发框架</td>
									<td>WXT + Vue 3 + TypeScript + Vuetify</td>
								</tr>
								<tr>
									<td class="font-weight-medium">功能特性</td>
									<td>
										<ul class="mt-2">
											<li>🔍 模糊搜索收藏夹和历史记录</li>
											<li>📁 按域名智能分组显示</li>
											<li>⚡ 实时搜索，响应迅速</li>
											<li>⭐ 历史记录一键收藏</li>
											<li>🆕 新标签页完整搜索界面</li>
											<li>🎨 Vuetify 现代化UI</li>
										</ul>
									</td>
								</tr>
							</tbody>
						</v-table>
					</v-card-text>
				</v-card>
			</div>

			<v-footer class="settings-footer mt-6">
				<div class="footer-content text-center w-100">
					<span class="text-body-2 text-medium-emphasis">
						作者: lizeyu 如有问题请联系:
						<a
							href="mailto:632795136@qq.com"
							class="text-primary text-decoration-none"
							>632795136@qq.com</a
						>
					</span>
				</div>
			</v-footer>
		</v-container>
	</v-app>
</template>

<script setup lang="ts">
// Vuetify icons are used directly in template with mdi- prefix
import { onMounted, reactive, ref } from "vue";
import type { SearchEngine } from "../utils/types";

// 显示保存成功消息
const showSaveSuccess = ref(false);
const availableEngines = ref<SearchEngine[]>([]);

// 快捷键列表
const shortcuts = ref([
	{
		name: "_execute_action",
		description: "默认打开收藏夹历史记录搜索器",
		shortcut: "未设置",
	},
	{
		name: "floating_search",
		description: "在页面中央显示浮动搜索框",
		shortcut: "未设置",
	},
]);

// 搜索设置
const searchSettings = reactive({
	defaultMaxResults: 100,
	defaultSortBy: "relevance",
	preferredSearchEngine: "",
});

// 键盘导航设置
const navigationSettings = reactive({
	up: "ArrowUp",
	down: "ArrowDown",
	open: "Enter",
	close: "Escape",
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

// 加载键盘导航设置
const loadNavigationSettings = async () => {
	try {
		const result = await chrome.storage.local.get(["navigationSettings"]);
		if (result.navigationSettings) {
			Object.assign(navigationSettings, result.navigationSettings);
		}
	} catch (error) {
		console.error("加载键盘导航设置失败:", error);
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

// 保存键盘导航设置
const saveNavigationSettings = async () => {
	try {
		await chrome.storage.local.set({ navigationSettings: navigationSettings });
		console.log("键盘导航设置已保存:", navigationSettings);

		// 显示保存成功提示
		showSaveSuccessMessage();
	} catch (error) {
		console.error("保存键盘导航设置失败:", error);
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

// 组件挂载时加载设置
onMounted(async () => {
	await loadShortcuts();
	await loadSearchSettings();
	await loadNavigationSettings();
	await loadAvailableEngines();
});
</script>

<style scoped>
.key-setting-item {
	height: 100%;
}

.navigation-keys-grid .v-col {
	display: flex;
}
</style>
