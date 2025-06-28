/**
 * 书签API包装器
 * 在content script环境中通过消息传递访问书签API
 */

import { isPrivilegedContext } from "./environment";

/**
 * 通过消息传递获取书签树
 */
async function getBookmarkTreeViaMessage(): Promise<
	chrome.bookmarks.BookmarkTreeNode[]
> {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ action: "getBookmarkTree" }, (response) => {
			if (chrome.runtime.lastError) {
				reject(chrome.runtime.lastError);
			} else if (response.error) {
				reject(new Error(response.error));
			} else {
				resolve(response.data);
			}
		});
	});
}

/**
 * 通过消息传递创建书签
 */
async function createBookmarkViaMessage(
	bookmarkData: chrome.bookmarks.CreateDetails
): Promise<chrome.bookmarks.BookmarkTreeNode> {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(
			{ action: "createBookmark", data: bookmarkData },
			(response) => {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
				} else if (response.error) {
					reject(new Error(response.error));
				} else {
					resolve(response.data);
				}
			}
		);
	});
}

/**
 * 统一的书签树获取API
 */
export async function getBookmarkTree(): Promise<
	chrome.bookmarks.BookmarkTreeNode[]
> {
	if (isPrivilegedContext()) {
		// 在特权环境中直接调用API
		return await chrome.bookmarks.getTree();
	} else {
		// 在content script中通过消息传递
		return await getBookmarkTreeViaMessage();
	}
}

/**
 * 统一的书签创建API
 */
export async function createBookmark(
	bookmarkData: chrome.bookmarks.CreateDetails
): Promise<chrome.bookmarks.BookmarkTreeNode> {
	if (isPrivilegedContext()) {
		// 在特权环境中直接调用API
		return await chrome.bookmarks.create(bookmarkData);
	} else {
		// 在content script中通过消息传递
		return await createBookmarkViaMessage(bookmarkData);
	}
}

/**
 * 检查URL是否已被收藏
 */
export async function isUrlBookmarked(url: string): Promise<boolean> {
	try {
		const bookmarkTree = await getBookmarkTree();

		function searchBookmarks(
			nodes: chrome.bookmarks.BookmarkTreeNode[]
		): boolean {
			for (const node of nodes) {
				if (node.url && node.url === url) {
					return true;
				}
				if (node.children && searchBookmarks(node.children)) {
					return true;
				}
			}
			return false;
		}

		return searchBookmarks(bookmarkTree);
	} catch (error) {
		console.error("检查书签失败:", error);
		return false;
	}
}

/**
 * 根据URL查找书签节点
 */
export async function findBookmarkByUrl(
	url: string
): Promise<chrome.bookmarks.BookmarkTreeNode | null> {
	try {
		const bookmarkTree = await getBookmarkTree();

		function searchBookmarks(
			nodes: chrome.bookmarks.BookmarkTreeNode[]
		): chrome.bookmarks.BookmarkTreeNode | null {
			for (const node of nodes) {
				if (node.url && node.url === url) {
					return node;
				}
				if (node.children) {
					const found = searchBookmarks(node.children);
					if (found) return found;
				}
			}
			return null;
		}

		return searchBookmarks(bookmarkTree);
	} catch (error) {
		console.error("查找书签失败:", error);
		return null;
	}
}

/**
 * 根据URL删除书签
 */
export async function removeBookmarkByUrl(url: string): Promise<boolean> {
	try {
		const bookmark = await findBookmarkByUrl(url);
		if (bookmark && bookmark.id) {
			await chrome.bookmarks.remove(bookmark.id);
			return true;
		}
		return false;
	} catch (error) {
		console.error("删除书签失败:", error);
		return false;
	}
}
