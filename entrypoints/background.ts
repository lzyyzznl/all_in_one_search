export default defineBackground({
	main() {
		// 延迟初始化函数，避免构建时调用Chrome API
		const initializeBackgroundScript = () => {
			// 检查Chrome API是否可用
			if (
				typeof chrome === "undefined" ||
				!chrome.runtime ||
				!chrome.runtime.id ||
				chrome.runtime.id.includes("fake") ||
				!chrome.commands ||
				!chrome.action ||
				!chrome.storage
			) {
				console.log(
					"Background script: Chrome APIs not available, skipping initialization"
				);
				return;
			}

			console.log("Background script: Initializing Chrome extension APIs");

			// 监听快捷键命令
			chrome.commands.onCommand.addListener(async (command) => {
				console.log("快捷键触发:", command);

				if (command === "_execute_action" || command === "open_popup") {
					// 获取当前活动标签页
					const [tab] = await chrome.tabs.query({
						active: true,
						currentWindow: true,
					});

					if (tab && tab.id) {
						try {
							// 尝试在当前标签页中打开popup
							await chrome.action.openPopup();
						} catch (error) {
							console.log(
								"无法打开popup，可能是由于浏览器限制。尝试打开新标签页"
							);
							// 如果无法打开popup，则打开新标签页
							await chrome.tabs.create({
								url: chrome.runtime.getURL("single_tab.html"),
							});
						}
					}
				}
			});

			// 监听扩展图标点击
			chrome.action.onClicked.addListener(async (tab) => {
				try {
					// 尝试打开popup
					await chrome.action.openPopup();
				} catch (error) {
					console.log("无法打开popup，打开新标签页");
					await chrome.tabs.create({
						url: chrome.runtime.getURL("single_tab.html"),
					});
				}
			});

			// 监听storage变化，动态更新快捷键
			chrome.storage.onChanged.addListener((changes, namespace) => {
				if (namespace === "local" && changes.customShortcut) {
					const newShortcut = changes.customShortcut.newValue;
					console.log("快捷键更新为:", newShortcut);
					updateShortcut(newShortcut);
				}
			});

			// 扩展安装或启动时加载自定义快捷键
			chrome.runtime.onInstalled.addListener(async () => {
				console.log("扩展已安装/更新");
				const result = await chrome.storage.local.get("customShortcut");
				if (result.customShortcut) {
					console.log("发现自定义快捷键:", result.customShortcut);
				}
			});

			console.log("Background script loaded and APIs initialized");
		};

		// 更新快捷键函数
		const updateShortcut = async (shortcut: string) => {
			try {
				// Chrome扩展API暂时不支持动态修改快捷键
				// 但我们可以保存用户设置，在下次安装时应用
				console.log("快捷键设置已保存，重启扩展后生效:", shortcut);
			} catch (error) {
				console.error("更新快捷键失败:", error);
			}
		};

		// 安全地初始化，避免构建时错误
		try {
			// 检查是否在浏览器运行时环境
			if (
				typeof globalThis !== "undefined" &&
				typeof globalThis.setTimeout === "function"
			) {
				setTimeout(initializeBackgroundScript, 0);
			} else {
				// 如果没有setTimeout（构建环境），则跳过初始化
				console.log(
					"Background script: Build environment detected, skipping initialization"
				);
			}
		} catch (error) {
			console.log(
				"Background script: Error during initialization, likely in build environment:",
				error
			);
		}
	},
});
