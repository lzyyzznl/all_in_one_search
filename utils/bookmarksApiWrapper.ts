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
			} else if (!response || !response.success) {
				reject(new Error(response?.error || "获取书签树失败"));
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
