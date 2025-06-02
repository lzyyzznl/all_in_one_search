/// <reference types="chrome" />

/**
 * 获取Chrome扩展的快捷键配置
 */
export async function getShortcut(
	commandName = "_execute_action"
): Promise<string | null> {
	try {
		const commands = await chrome.commands.getAll();
		const command = commands.find((cmd) => cmd.name === commandName);
		return command?.shortcut || null;
	} catch (error) {
		console.error("获取快捷键配置失败:", error);
		return null;
	}
}

/**
 * 格式化快捷键显示文本
 * @param shortcut - 原始快捷键字符串，如 "Ctrl+Shift+S"
 * @returns 格式化后的显示文本
 */
export function formatShortcut(shortcut: string | null): string {
	if (!shortcut) return "";

	// 将快捷键转换为更友好的显示格式
	return shortcut
		.replace(/Ctrl/g, "Ctrl")
		.replace(/Shift/g, "Shift")
		.replace(/Alt/g, "Alt")
		.replace(/\+/g, "+");
}

/**
 * 获取所有快捷键命令的配置
 */
export async function getAllShortcuts(): Promise<Record<string, string>> {
	try {
		const commands = await chrome.commands.getAll();
		const shortcuts: Record<string, string> = {};

		commands.forEach((command) => {
			if (command.shortcut && command.name) {
				shortcuts[command.name] = command.shortcut;
			}
		});

		return shortcuts;
	} catch (error) {
		console.error("获取所有快捷键配置失败:", error);
		return {};
	}
}

/**
 * 获取键盘导航快捷键的显示文本
 */
export function getNavigationKeys() {
	return {
		up: "↑",
		down: "↓",
		open: "Enter",
		close: "Esc",
	};
}

/**
 * 键盘导航快捷键配置
 */
export const shortcutKeyMap = {
	up: "ArrowUp",
	down: "ArrowDown",
	open: "Enter",
	close: "Escape",
};
