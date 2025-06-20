import { createApp } from "vue";
import "virtual:uno.css";
import FloatingSearch from "../components/FloatingSearch.vue";
import { setupVuetify } from "../utils/vuetify";

export default defineContentScript({
	matches: ["<all_urls>"],
	runAt: "document_end",
	main() {
		// 检查是否是受限页面，如果是则不初始化
		const currentUrl = window.location.href;
		const isRestrictedPage =
			currentUrl.startsWith("chrome://") ||
			currentUrl.startsWith("chrome-extension://") ||
			currentUrl.startsWith("moz-extension://") ||
			currentUrl.startsWith("edge://") ||
			currentUrl.startsWith("about:");

		if (isRestrictedPage) {
			return;
		}

		let floatingSearchApp: any = null;

		// 创建浮动搜索应用
		function createFloatingSearchApp(): void {
			// 检查是否已经存在浮动搜索容器
			const existingContainer = document.getElementById(
				"browser-extension-floating-search"
			);
			if (existingContainer) {
				return; // 避免重复创建
			}

			// 创建容器元素
			const container = document.createElement("div");
			container.id = "browser-extension-floating-search";

			// 设置容器样式，确保不影响页面布局
			container.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 0 !important;
        height: 0 !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
      `;

			// 添加到body
			document.body.appendChild(container);

			// 创建Vue应用
			floatingSearchApp = createApp(FloatingSearch);

			// 设置Vuetify
			setupVuetify(floatingSearchApp);

			// 挂载应用
			floatingSearchApp.mount(container);
		}

		// 处理来自 background script 的消息
		function handleMessage(
			message: any,
			sender: chrome.runtime.MessageSender,
			sendResponse: (response?: any) => void
		) {
			if (message.action === "toggle-floating-search") {
				// 使用全局事件来触发组件的显示/隐藏
				const event = new CustomEvent("toggle-floating-search");
				window.dispatchEvent(event);
				sendResponse({ success: true });
			}

			// 返回 true 表示将异步发送响应
			return true;
		}

		// 注册消息监听器（立即注册，不等待组件挂载）
		chrome.runtime.onMessage.addListener(handleMessage);

		// 等待DOM加载完成
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () => {
				createFloatingSearchApp();
			});
		} else {
			createFloatingSearchApp();
		}
	},
});
