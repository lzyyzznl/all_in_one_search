import { ref, nextTick } from "vue";
import type { SearchResultItem } from "../types";
import { APP_CONSTANTS } from "../constants";
import { formatFileSize, getFaviconUrl } from "../search";

export function useUI() {
	const isNewTabMode = ref(false);

	// 获取项目图标
	function getItemIcon(type: SearchResultItem["type"]): string {
		switch (type) {
			case "bookmark":
				return APP_CONSTANTS.ICONS.BOOKMARK;
			case "history":
				return APP_CONSTANTS.ICONS.HISTORY;
			case "download":
				return APP_CONSTANTS.ICONS.DOWNLOAD;
			default:
				return "";
		}
	}

	// 格式化日期
	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now.getTime() - date.getTime();

		if (diff < APP_CONSTANTS.TIME.DAY_IN_MS) {
			return date.toLocaleTimeString("zh-CN", {
				hour: "2-digit",
				minute: "2-digit",
			});
		} else if (diff < APP_CONSTANTS.TIME.WEEK_IN_MS) {
			const days = Math.floor(diff / APP_CONSTANTS.TIME.DAY_IN_MS);
			return `${days}天前`;
		} else {
			return date.toLocaleDateString("zh-CN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			});
		}
	}

	// 焦点管理
	async function focusSearchInput(inputRef: any): Promise<void> {
		await nextTick();
		if (inputRef && inputRef.focus) {
			inputRef.focus();
		}
	}

	// 检测是否在新标签页模式
	function detectNewTabMode(): void {
		try {
			isNewTabMode.value = window.location.href.includes("single_tab.html");
		} catch (error) {
			console.error("检测新标签页模式失败:", error);
			isNewTabMode.value = false;
		}
	}

	// 获取网站图标URL
	function getSiteFaviconUrl(domain: string): string {
		return getFaviconUrl(domain);
	}

	// 格式化文件大小
	function formatFileSizeDisplay(bytes: number): string {
		return formatFileSize(bytes);
	}

	// 滚动到顶部
	function scrollToTop(): void {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	return {
		// 状态
		isNewTabMode,

		// 方法
		getItemIcon,
		formatDate,
		focusSearchInput,
		detectNewTabMode,
		getSiteFaviconUrl,
		formatFileSizeDisplay,
		scrollToTop,
	};
}
