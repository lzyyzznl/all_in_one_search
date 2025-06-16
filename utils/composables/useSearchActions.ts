import { ref, reactive } from "vue";
import type { SearchResultItem } from "../types";
import { openUrl, openDownloadFile, showDownloadFile } from "../search";

interface BookmarkDialog {
	show: boolean;
	title: string;
	url: string;
	parentId: string;
	item: SearchResultItem | null;
}

interface BookmarkFolder {
	id: string;
	title: string;
	children?: BookmarkFolder[];
}

/**
 * 搜索结果操作的composable
 */
export function useSearchActions() {
	// 书签对话框状态
	const bookmarkDialog = reactive<BookmarkDialog>({
		show: false,
		title: "",
		url: "",
		parentId: "",
		item: null,
	});

	// 书签文件夹树
	const bookmarkFolders = ref<BookmarkFolder[]>([]);

	// 通知函数 - 可以被外部设置（用于不同环境的通知方式）
	const showNotification = ref<
		(message: string, type?: "success" | "error" | "info") => void
	>(() => {});

	// 设置通知函数
	function setNotificationHandler(
		handler: (message: string, type?: "success" | "error" | "info") => void
	) {
		showNotification.value = handler;
	}

	/**
	 * 获取书签栏ID
	 */
	async function getBookmarkBarId(): Promise<string | null> {
		try {
			const bookmarks = await chrome.bookmarks.getTree();
			for (const node of bookmarks) {
				if (node.children) {
					for (const child of node.children) {
						if (
							child.title === "书签栏" ||
							child.title === "Bookmarks bar" ||
							child.title === "Bookmarks"
						) {
							return child.id;
						}
					}
					// 如果没找到特定名称，返回第一个文件夹
					if (
						node.children.length > 0 &&
						node.children[0] &&
						!node.children[0].url
					) {
						return node.children[0].id;
					}
				}
			}
			return null;
		} catch (error) {
			console.error("获取书签栏ID失败:", error);
			return null;
		}
	}

	/**
	 * 递归构建书签文件夹树
	 */
	function buildFolderTree(
		nodes: chrome.bookmarks.BookmarkTreeNode[]
	): BookmarkFolder[] {
		return nodes
			.filter((node) => !node.url) // 只要文件夹
			.map((node) => ({
				id: node.id,
				title: node.title || "未命名文件夹",
				children: node.children ? buildFolderTree(node.children) : [],
			}));
	}

	/**
	 * 加载书签文件夹
	 */
	async function loadBookmarkFolders(): Promise<void> {
		try {
			const bookmarks = await chrome.bookmarks.getTree();
			const actualFolders = bookmarks[0]?.children || [];
			bookmarkFolders.value = buildFolderTree(actualFolders);
		} catch (error) {
			console.error("获取书签文件夹失败:", error);
			bookmarkFolders.value = [];
		}
	}

	/**
	 * 递归查找文件夹
	 */
	function findFolderById(
		folders: BookmarkFolder[],
		targetId: string
	): boolean {
		return folders.some(
			(folder) =>
				folder.id === targetId ||
				(folder.children && findFolderById(folder.children, targetId))
		);
	}

	/**
	 * 显示书签对话框
	 */
	async function showBookmarkDialog(item: SearchResultItem): Promise<void> {
		bookmarkDialog.item = item;
		bookmarkDialog.title = item.title;
		bookmarkDialog.url = item.url;

		// 加载书签文件夹
		await loadBookmarkFolders();

		// 恢复上次选择的文件夹
		try {
			const result = await chrome.storage.local.get(["lastSelectedFolder"]);
			const lastFolder = result.lastSelectedFolder;

			if (lastFolder && findFolderById(bookmarkFolders.value, lastFolder)) {
				bookmarkDialog.parentId = lastFolder;
			} else {
				// 默认选择书签栏
				const bookmarkBarId = await getBookmarkBarId();
				bookmarkDialog.parentId = bookmarkBarId || "";
			}
		} catch (error) {
			console.error("获取上次选择的文件夹失败:", error);
			const bookmarkBarId = await getBookmarkBarId();
			bookmarkDialog.parentId = bookmarkBarId || "";
		}

		bookmarkDialog.show = true;
	}

	/**
	 * 关闭书签对话框
	 */
	function closeBookmarkDialog(): void {
		bookmarkDialog.show = false;
		bookmarkDialog.title = "";
		bookmarkDialog.url = "";
		bookmarkDialog.parentId = "";
		bookmarkDialog.item = null;
	}

	/**
	 * 保存书签
	 */
	async function saveBookmark(): Promise<boolean> {
		if (!bookmarkDialog.title || !bookmarkDialog.url) {
			showNotification.value("请填写标题和URL", "error");
			return false;
		}

		try {
			const bookmarkData: chrome.bookmarks.CreateDetails = {
				title: bookmarkDialog.title,
				url: bookmarkDialog.url,
			};

			if (bookmarkDialog.parentId) {
				bookmarkData.parentId = bookmarkDialog.parentId;
				// 保存用户选择的文件夹
				await chrome.storage.local.set({
					lastSelectedFolder: bookmarkDialog.parentId,
				});
			}

			await chrome.bookmarks.create(bookmarkData);
			showNotification.value("书签添加成功！", "success");
			closeBookmarkDialog();
			return true;
		} catch (error) {
			console.error("添加书签失败:", error);
			showNotification.value("添加书签失败，请重试", "error");
			return false;
		}
	}

	/**
	 * 处理历史记录收藏操作
	 */
	async function handleBookmarkAction(item: SearchResultItem): Promise<void> {
		if (item.type !== "history") {
			console.warn("只能收藏历史记录项目");
			return;
		}
		await showBookmarkDialog(item);
	}

	/**
	 * 处理下载文件显示操作
	 */
	async function handleShowFileAction(item: SearchResultItem): Promise<void> {
		if (item.type !== "download") {
			console.warn("只能显示下载文件");
			return;
		}

		try {
			await showDownloadFile(item.id);
		} catch (error) {
			console.error("显示文件失败:", error);
			showNotification.value("显示文件失败", "error");
		}
	}

	/**
	 * 处理复制URL操作
	 */
	async function handleCopyAction(url: string): Promise<void> {
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(url);
				showNotification.value("已复制到剪贴板", "success");
			} else {
				// 降级方案：使用传统方法
				const textArea = document.createElement("textarea");
				textArea.value = url;
				textArea.style.position = "absolute";
				textArea.style.left = "-9999px";
				document.body.appendChild(textArea);
				textArea.select();
				document.execCommand("copy");
				document.body.removeChild(textArea);
				showNotification.value("已复制到剪贴板", "success");
			}
		} catch (error) {
			console.error("复制失败:", error);
			showNotification.value("复制失败", "error");
		}
	}

	/**
	 * 处理搜索结果项选择操作
	 */
	async function handleSelectAction(
		item: SearchResultItem,
		inNewTab = true
	): Promise<void> {
		try {
			if (item.type === "download") {
				await openDownloadFile(item.id);
			} else {
				await openUrl(item.url, inNewTab);
			}
		} catch (error) {
			console.error("打开项目失败:", error);
			showNotification.value("打开失败", "error");
		}
	}

	return {
		// 状态
		bookmarkDialog,
		bookmarkFolders,

		// 方法
		setNotificationHandler,
		handleBookmarkAction,
		handleShowFileAction,
		handleCopyAction,
		handleSelectAction,
		saveBookmark,
		closeBookmarkDialog,
		loadBookmarkFolders,
	};
}
