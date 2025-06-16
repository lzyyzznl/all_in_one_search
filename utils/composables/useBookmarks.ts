import { ref, reactive } from "vue";
import type { SearchResultItem } from "../types";
import { getBookmarkTree, createBookmark } from "../bookmarksApiWrapper";

export interface BookmarkFolder {
	id: string;
	title: string;
	children?: BookmarkFolder[];
}

export interface BookmarkDialogState {
	show: boolean;
	title: string;
	url: string;
	parentId: string;
	item: SearchResultItem | null;
}

/**
 * 书签管理 Composable
 * 提供统一的书签操作功能
 */
export function useBookmarks() {
	const bookmarkFolders = ref<BookmarkFolder[]>([]);
	const flatBookmarkFolders = ref<{ id: string; title: string }[]>([]);

	const bookmarkDialog = reactive<BookmarkDialogState>({
		show: false,
		title: "",
		url: "",
		parentId: "",
		item: null,
	});

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
	 * 递归构建扁平化文件夹列表（用于select组件）
	 */
	function buildFlatFolders(
		nodes: chrome.bookmarks.BookmarkTreeNode[],
		depth = 0
	): { id: string; title: string }[] {
		const folders: { id: string; title: string }[] = [];

		for (const node of nodes) {
			if (!node.url) {
				// 文件夹
				const prefix = "  ".repeat(depth);
				folders.push({
					id: node.id,
					title: `${prefix}${node.title || "未命名文件夹"}`,
				});

				if (node.children) {
					folders.push(...buildFlatFolders(node.children, depth + 1));
				}
			}
		}

		return folders;
	}

	/**
	 * 加载书签文件夹
	 */
	async function loadBookmarkFolders(): Promise<void> {
		try {
			const bookmarks = await getBookmarkTree();
			const actualFolders = bookmarks[0]?.children || [];

			// 构建树形结构
			bookmarkFolders.value = buildFolderTree(actualFolders);

			// 构建扁平化结构
			flatBookmarkFolders.value = buildFlatFolders(actualFolders);
		} catch (error) {
			console.error("获取书签文件夹失败:", error);
			bookmarkFolders.value = [];
			flatBookmarkFolders.value = [];
		}
	}

	/**
	 * 获取书签栏ID
	 */
	async function getBookmarkBarId(): Promise<string | null> {
		try {
			const bookmarks = await getBookmarkTree();
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

		// 确保文件夹已加载
		if (bookmarkFolders.value.length === 0) {
			await loadBookmarkFolders();
		}

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
			throw new Error("请填写标题和URL");
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

			await createBookmark(bookmarkData);
			closeBookmarkDialog();
			return true;
		} catch (error) {
			console.error("添加书签失败:", error);
			throw new Error("添加书签失败，请重试");
		}
	}

	/**
	 * 处理历史记录收藏操作
	 */
	async function handleBookmarkAction(item: SearchResultItem): Promise<void> {
		if (item.type !== "history") {
			throw new Error("只能收藏历史记录项目");
		}
		await showBookmarkDialog(item);
	}

	return {
		// 状态
		bookmarkFolders,
		flatBookmarkFolders,
		bookmarkDialog,

		// 方法
		loadBookmarkFolders,
		getBookmarkBarId,
		findFolderById,
		showBookmarkDialog,
		closeBookmarkDialog,
		saveBookmark,
		handleBookmarkAction,
	};
}
