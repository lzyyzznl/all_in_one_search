/// <reference types="chrome" />

export default {
	main() {
		// 监听快捷键命令
		chrome.commands.onCommand.addListener((command: string) => {
			if (command === "_execute_action") {
				// 打开popup页面
				chrome.action.openPopup();
			}
		});

		// 监听设置变化
		chrome.storage.onChanged.addListener(
			(changes: { [key: string]: chrome.storage.StorageChange }) => {
				if (changes.shortcut) {
					console.log("快捷键设置已更新:", changes.shortcut.newValue);
				}
			}
		);
	},
};
