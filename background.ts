/// <reference types="chrome" />
import { APP_CONSTANTS } from "./utils/constants";

/**
 * 处理快捷键命令
 */
function handleCommand(command: string): void {
	if (command === APP_CONSTANTS.SHORTCUTS.EXECUTE_ACTION) {
		chrome.action.openPopup().catch((error) => {
			console.error("打开popup失败:", error);
		});
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

export default {
	main(): void {
		// 监听快捷键命令
		chrome.commands.onCommand.addListener(handleCommand);

		// 监听设置变化
		chrome.storage.onChanged.addListener(handleStorageChange);
	},
};
