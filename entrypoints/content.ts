import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import FloatingSearch from "../components/FloatingSearch.vue";

export default defineContentScript({
	matches: ["<all_urls>"],
	main() {
		let floatingSearchApp: any = null;

		// 创建浮动搜索应用
		function createFloatingSearchApp(): void {
			console.log("开始创建浮动搜索应用...");

			// 检查是否已经存在浮动搜索容器
			const existingContainer = document.getElementById(
				"browser-extension-floating-search"
			);
			if (existingContainer) {
				console.log("浮动搜索容器已存在，跳过创建");
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
			console.log("容器已添加到body");

			// 创建Vue应用
			floatingSearchApp = createApp(FloatingSearch);

			// 注册Element Plus
			floatingSearchApp.use(ElementPlus);

			// 挂载应用
			floatingSearchApp.mount(container);
			console.log("Vue应用已挂载");

			console.log("浮动搜索功能已初始化");
		}

		// 处理来自 background script 的消息
		function handleMessage(
			message: any,
			sender: chrome.runtime.MessageSender,
			sendResponse: (response?: any) => void
		) {
			console.log("Content script 收到消息:", message);

			if (message.action === "toggle-floating-search") {
				console.log("准备触发浮动搜索框显示/隐藏");

				// 使用全局事件来触发组件的显示/隐藏
				const event = new CustomEvent("toggle-floating-search");
				window.dispatchEvent(event);
				console.log("全局事件已派发");

				sendResponse({ success: true });
			}

			// 返回 true 表示将异步发送响应
			return true;
		}

		// 注册消息监听器（立即注册，不等待组件挂载）
		chrome.runtime.onMessage.addListener(handleMessage);
		console.log("消息监听器已注册");

		// 测试键盘事件监听（额外的调试方法）
		document.addEventListener("keydown", (event) => {
			if (event.ctrlKey && event.shiftKey && event.key === "F") {
				console.log("检测到Ctrl+Shift+F键盘事件，手动触发浮动搜索");
				const customEvent = new CustomEvent("toggle-floating-search");
				window.dispatchEvent(customEvent);
				event.preventDefault();
			}
		});

		// 等待DOM加载完成
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () => {
				console.log("DOM已加载完成，创建浮动搜索应用");
				createFloatingSearchApp();
			});
		} else {
			console.log("DOM已经加载完成，立即创建浮动搜索应用");
			createFloatingSearchApp();
		}

		console.log("Content script 已初始化，消息监听器已注册");
	},
});
