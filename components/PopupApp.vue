<template>
	<v-app class="w-full h-full bg-grey-100">
		<v-container fluid class="pa-4 h-full d-flex flex-column justify-center">
			<!-- 品字型卡片布局 -->
			<v-row no-gutters class="mb-3">
				<!-- 左上：当前页签打开悬浮搜索 -->
				<v-col cols="6" class="pr-2">
					<v-card
						class="h-100 cursor-pointer transition-all duration-200"
						color="primary"
						variant="elevated"
						elevation="3"
						hover
						@click="openFloatingSearch"
					>
						<v-card-text
							class="pa-3 d-flex flex-column align-center justify-center h-100 text-center"
						>
							<v-icon size="28" color="white" class="mb-2">mdi-magnify</v-icon>
							<div class="text-body-1 font-weight-medium text-white mb-1">
								当前页面搜索
							</div>
							<div class="text-caption text-white opacity-90">悬浮搜索框</div>
						</v-card-text>
					</v-card>
				</v-col>

				<!-- 右上：新标签页打开完整搜索 -->
				<v-col cols="6" class="pl-2">
					<v-card
						class="h-100 cursor-pointer transition-all duration-200"
						color="success"
						variant="elevated"
						elevation="3"
						hover
						@click="openNewTabSearch"
					>
						<v-card-text
							class="pa-3 d-flex flex-column align-center justify-center h-100 text-center"
						>
							<v-icon size="28" color="white" class="mb-2"
								>mdi-open-in-new</v-icon
							>
							<div class="text-body-1 font-weight-medium text-white mb-1">
								新标签页搜索
							</div>
							<div class="text-caption text-white opacity-90">完整搜索页面</div>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>

			<!-- 下方：设置按钮 -->
			<v-row no-gutters>
				<v-col cols="12">
					<v-card
						class="cursor-pointer transition-all duration-200"
						color="info"
						variant="elevated"
						elevation="3"
						hover
						@click="openSettings"
					>
						<v-card-text
							class="pa-3 d-flex flex-column align-center justify-center text-center"
						>
							<v-icon size="28" color="white" class="mb-2">mdi-cog</v-icon>
							<div class="text-body-1 font-weight-medium text-white mb-1">
								插件设置
							</div>
							<div class="text-caption text-white opacity-90">配置选项</div>
						</v-card-text>
					</v-card>
				</v-col>
			</v-row>
		</v-container>
	</v-app>
</template>

<script setup lang="ts">
/// <reference types="chrome" />
// 简化的popup按钮布局组件

// 打开悬浮搜索框
const openFloatingSearch = async () => {
	try {
		// 获取当前活动标签页
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		console.log("当前标签页信息:", tab);

		if (tab?.id) {
			const url = tab.url || "";
			console.log("当前页面URL:", url);

			// 检查是否是受限页面
			const isRestricted =
				url.startsWith("chrome://") ||
				url.startsWith("edge://") ||
				url.startsWith("about:") ||
				url.includes("newtab") ||
				url.startsWith("chrome-extension://") ||
				url.startsWith("moz-extension://");

			if (isRestricted) {
				console.log("检测到受限页面，打开新标签页搜索");
				chrome.tabs.create({ url: chrome.runtime.getURL("single_tab.html") });
				window.close();
				return;
			}

			// 向content script发送消息显示悬浮搜索框
			chrome.tabs.sendMessage(
				tab.id,
				{
					action: "toggle-floating-search",
				},
				(response) => {
					if (chrome.runtime.lastError) {
						console.error("发送消息失败:", chrome.runtime.lastError.message);
						// 如果content script未注入，打开新标签页作为备选方案
						console.log("Content script可能未注入，打开新标签页搜索");
						chrome.tabs.create({
							url: chrome.runtime.getURL("single_tab.html"),
						});
					} else {
						console.log("消息发送成功:", response);
					}
					// 关闭popup
					window.close();
				}
			);
		}
	} catch (error) {
		console.error("打开悬浮搜索框失败:", error);
		// 出错时打开新标签页作为备选方案
		chrome.tabs.create({ url: chrome.runtime.getURL("single_tab.html") });
		window.close();
	}
};

// 打开新标签页搜索
const openNewTabSearch = () => {
	chrome.tabs.create({ url: chrome.runtime.getURL("single_tab.html") });
	window.close();
};

// 打开设置页面
const openSettings = () => {
	chrome.tabs.create({ url: chrome.runtime.getURL("settings.html") });
	window.close();
};
</script>

<style scoped>
/* 卡片悬停效果增强 */
.v-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.v-card:active {
	transform: translateY(0);
}

/* 确保卡片高度一致 */
.v-row .v-col .v-card {
	min-height: 120px;
}

.v-row:last-child .v-col .v-card {
	min-height: 80px;
}
</style>
