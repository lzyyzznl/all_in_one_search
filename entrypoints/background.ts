import { APP_CONSTANTS } from "../utils/constants";
import {
	searchBookmarksAndHistory,
	openUrl,
	openDownloadFile,
	showDownloadFile,
	SearchHistoryManager,
	getRecommendedContent,
} from "../utils/search";
import {
	SearchEngineManager,
	getDefaultSearchEngine,
	performWebSearch,
} from "../utils/searchEngines";

export default defineBackground({
	main() {
		/**
		 * 获取书签文件夹
		 */
		async function getBookmarkFolders(): Promise<
			{ id: string; title: string }[]
		> {
			try {
				const bookmarks = await chrome.bookmarks.getTree();
				const folders: { id: string; title: string }[] = [];

				const traverseBookmarks = (
					nodes: chrome.bookmarks.BookmarkTreeNode[],
					depth = 0
				) => {
					for (const node of nodes) {
						if (!node.url) {
							// 文件夹
							const prefix = "  ".repeat(depth);
							folders.push({
								id: node.id,
								title: `${prefix}${node.title || "未命名文件夹"}`,
							});

							if (node.children) {
								traverseBookmarks(node.children, depth + 1);
							}
						}
					}
				};

				const actualFolders = bookmarks[0]?.children || [];
				traverseBookmarks(actualFolders);
				return folders;
			} catch (error) {
				console.error("获取书签文件夹失败:", error);
				return [];
			}
		}

		/**
		 * 创建书签
		 */
		async function createBookmark(
			bookmarkData: chrome.bookmarks.CreateDetails
		): Promise<void> {
			try {
				await chrome.bookmarks.create(bookmarkData);
			} catch (error) {
				console.error("创建书签失败:", error);
				throw error;
			}
		}
		/**
		 * 处理快捷键命令
		 */
		function handleCommand(command: string): void {
			console.log("收到快捷键命令:", command);

			if (command === APP_CONSTANTS.SHORTCUTS.EXECUTE_ACTION) {
				console.log("处理默认动作快捷键");
				chrome.action.openPopup().catch((error) => {
					console.error("打开popup失败:", error);
				});
			} else {
				console.warn("未知的快捷键命令:", command);
			}
		}

		/**
		 * 处理设置变化
		 */
		function handleStorageChange(changes: {
			[key: string]: chrome.storage.StorageChange;
		}): void {
			if (changes[APP_CONSTANTS.STORAGE_KEYS.SHORTCUT_CONFIG]) {
				console.log(
					"快捷键设置已更新:",
					changes[APP_CONSTANTS.STORAGE_KEYS.SHORTCUT_CONFIG].newValue
				);
			}
		}

		/**
		 * 处理来自content script的消息
		 */
		async function handleMessage(
			message: any,
			sender: chrome.runtime.MessageSender,
			sendResponse: (response?: any) => void
		): Promise<void> {
			console.log("Background收到消息:", message);

			try {
				switch (message.action) {
					case "search-data": {
						console.log("处理搜索请求:", message.options);
						const { results, stats } = await searchBookmarksAndHistory(
							message.options
						);
						console.log("搜索结果:", { results: results.length, stats });
						sendResponse({ success: true, results, stats });
						break;
					}

					case "open-url": {
						console.log("打开URL:", message.url);
						await openUrl(message.url, message.inNewTab);
						sendResponse({ success: true });
						break;
					}

					case "open-download": {
						console.log("打开下载:", message.downloadId);
						await openDownloadFile(message.downloadId);
						sendResponse({ success: true });
						break;
					}

					case "show-download": {
						console.log("显示下载:", message.downloadId);
						await showDownloadFile(message.downloadId);
						sendResponse({ success: true });
						break;
					}

					case "save-search-history": {
						console.log("保存搜索历史:", message.query);
						await SearchHistoryManager.saveSearchHistory(message.query);
						sendResponse({ success: true });
						break;
					}

					case "get-search-history": {
						console.log("获取搜索历史");
						const history = await SearchHistoryManager.getSearchHistory();
						console.log("搜索历史结果:", history?.length || 0);
						sendResponse({ success: true, history });
						break;
					}

					case "get-recommended-content": {
						console.log("获取推荐内容");
						const recommendedContent = await getRecommendedContent();
						console.log("推荐内容结果:", {
							history: recommendedContent.recentHistory.length,
							bookmarks: recommendedContent.frequentBookmarks.length,
							downloads: recommendedContent.latestDownloads.length,
						});
						sendResponse({ success: true, recommendedContent });
						break;
					}

					case "get-bookmark-folders": {
						console.log("获取书签文件夹");
						const folders = await getBookmarkFolders();
						sendResponse({ success: true, folders });
						break;
					}

					case "getBookmarkTree": {
						console.log("获取书签树");
						try {
							const bookmarks = await chrome.bookmarks.getTree();
							sendResponse({ success: true, data: bookmarks });
						} catch (error: any) {
							console.error("获取书签树失败:", error);
							sendResponse({ success: false, error: error.message });
						}
						break;
					}

					case "createBookmark": {
						console.log("创建书签:", message.data);
						try {
							const bookmark = await chrome.bookmarks.create(message.data);
							sendResponse({ success: true, data: bookmark });
						} catch (error: any) {
							console.error("创建书签失败:", error);
							sendResponse({ success: false, error: error.message });
						}
						break;
					}

					case "create-bookmark": {
						console.log("创建书签:", message.bookmarkData);
						await createBookmark(message.bookmarkData);
						sendResponse({ success: true });
						break;
					}

					case "get-default-search-engine": {
						console.log("获取默认搜索引擎");
						const defaultEngine = await getDefaultSearchEngine();
						console.log("默认搜索引擎:", defaultEngine.name);
						sendResponse({ success: true, engine: defaultEngine });
						break;
					}

					case "get-all-search-engines": {
						console.log("获取所有搜索引擎");
						const engines = SearchEngineManager.getAllEngines();
						console.log("搜索引擎数量:", engines.length);
						sendResponse({ success: true, engines });
						break;
					}

					case "set-preferred-search-engine": {
						console.log("设置偏好搜索引擎:", message.engineId);
						await SearchEngineManager.setPreferredEngine(message.engineId);
						sendResponse({ success: true });
						break;
					}

					case "perform-web-search": {
						console.log("执行网络搜索:", message.engineId, message.query);
						await performWebSearch(
							message.engineId,
							message.query,
							message.inNewTab !== false
						);
						sendResponse({ success: true });
						break;
					}

					default:
						console.warn("未知的消息类型:", message.action);
						sendResponse({ success: false, error: "未知的消息类型" });
				}
			} catch (error: any) {
				console.error("处理消息失败:", error);
				sendResponse({ success: false, error: String(error) });
			}
		}

		// 监听快捷键命令
		chrome.commands.onCommand.addListener(handleCommand);

		// 监听设置变化
		chrome.storage.onChanged.addListener(handleStorageChange);

		// 监听来自content script的消息
		chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
			console.log("Background监听器收到消息:", message);
			handleMessage(message, sender, sendResponse);
			return true; // 保持消息通道开放以支持异步响应
		});

		console.log("Background script已初始化，监听器已设置");
	},
});
