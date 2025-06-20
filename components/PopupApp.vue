<template>
	<v-app
		class="w-250 h-250 min-w-250 min-h-250 max-w-250 max-h-250 m-0 p-0 border-none bg-gradient-to-br from-blue-400 to-purple-600 overflow-hidden flex items-center justify-center relative"
	>
		<div
			class="flex flex-col items-center gap-7.5 w-full max-w-175 px-7.5 py-15"
		>
			<!-- 品字型按钮布局 -->
			<div class="flex justify-center w-full gap-7.5">
				<!-- 左上：当前页签打开悬浮搜索 -->
				<v-btn
					class="w-70 h-50 rounded-5 shadow-lg transition-all duration-300 backdrop-blur-10 border border-white/20 hover:translate-y--2 hover:scale-105 hover:shadow-xl active:translate-y--1 active:scale-102"
					size="x-large"
					color="primary"
					variant="elevated"
					@click="openFloatingSearch"
				>
					<div
						class="flex flex-col items-center justify-center h-full text-center text-white"
					>
						<v-icon size="32" class="mb-2">mdi-magnify</v-icon>
						<div class="text-4.5 font-semibold mb-2 leading-tight">
							当前页面搜索
						</div>
						<div class="text-3.5 opacity-90 font-normal leading-tight">
							悬浮搜索框
						</div>
					</div>
				</v-btn>

				<!-- 右上：新标签页打开完整搜索 -->
				<v-btn
					class="w-70 h-50 rounded-5 shadow-lg transition-all duration-300 backdrop-blur-10 border border-white/20 hover:translate-y--2 hover:scale-105 hover:shadow-xl active:translate-y--1 active:scale-102"
					size="x-large"
					color="success"
					variant="elevated"
					@click="openNewTabSearch"
				>
					<div
						class="flex flex-col items-center justify-center h-full text-center text-white"
					>
						<v-icon size="32" class="mb-2">mdi-open-in-new</v-icon>
						<div class="text-4.5 font-semibold mb-2 leading-tight">
							新标签页搜索
						</div>
						<div class="text-3.5 opacity-90 font-normal leading-tight">
							完整搜索页面
						</div>
					</div>
				</v-btn>
			</div>

			<!-- 下方：设置按钮 -->
			<div class="flex justify-center w-full">
				<v-btn
					class="w-147.5 h-50 rounded-5 shadow-lg transition-all duration-300 backdrop-blur-10 border border-white/20 hover:translate-y--2 hover:scale-105 hover:shadow-xl active:translate-y--1 active:scale-102"
					size="x-large"
					color="info"
					variant="elevated"
					@click="openSettings"
				>
					<div
						class="flex flex-col items-center justify-center h-full text-center text-white"
					>
						<v-icon size="32" class="mb-2">mdi-cog</v-icon>
						<div class="text-4.5 font-semibold mb-2 leading-tight">
							插件设置
						</div>
						<div class="text-3.5 opacity-90 font-normal leading-tight">
							配置选项
						</div>
					</div>
				</v-btn>
			</div>
		</div>
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
/* 按钮特定渐变背景 - 使用CSS变量保持兼容性 */
.v-btn[color="primary"] {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.v-btn[color="success"] {
	background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
}

.v-btn[color="info"] {
	background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
}

/* 响应式调整 */
@media (max-width: 900px) {
	.gap-7\.5 {
		gap: 1.25rem;
	}

	.w-70 {
		width: 15rem !important;
	}

	.h-50 {
		height: 11.25rem !important;
	}

	.w-147\.5 {
		width: 31.25rem !important; /* 15rem * 2 + 1.25rem gap */
	}
}

@media (max-width: 600px) {
	.py-15 {
		padding-top: 1.875rem !important;
		padding-bottom: 1.875rem !important;
	}

	.px-7\.5 {
		padding-left: 1.25rem !important;
		padding-right: 1.25rem !important;
	}

	.gap-7\.5 {
		gap: 1.25rem !important;
	}

	.flex.justify-center.w-full.gap-7\.5 {
		flex-direction: column;
		align-items: center;
	}

	.w-70 {
		width: 16.25rem !important;
	}

	.h-50 {
		height: 10rem !important;
	}

	.w-147\.5 {
		width: 16.25rem !important; /* 与其他按钮保持一致 */
	}
}
</style>
