/**
 * 环境检测工具
 */

/**
 * 检测是否在可以访问完整Chrome API的环境中
 * 如popup、options页面、background script等
 */
export function isPrivilegedContext(): boolean {
	try {
		// 检查是否存在chrome对象且可访问bookmarks API
		return !!(
			typeof chrome !== "undefined" &&
			chrome.bookmarks &&
			typeof chrome.bookmarks.getTree === "function"
		);
	} catch (error) {
		return false;
	}
}

/**
 * 检测是否在content script环境中
 */
export function isContentScript(): boolean {
	try {
		// Content script中chrome对象存在但API受限
		return !!(
			typeof chrome !== "undefined" &&
			chrome.runtime &&
			typeof chrome.runtime.sendMessage === "function" &&
			(!chrome.bookmarks || typeof chrome.bookmarks.getTree !== "function")
		);
	} catch (error) {
		return false;
	}
}

/**
 * 检测当前运行环境类型
 */
export function getEnvironmentType(): "privileged" | "content" | "web" {
	if (isPrivilegedContext()) {
		return "privileged";
	}
	if (isContentScript()) {
		return "content";
	}
	return "web";
}
