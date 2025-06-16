import { ref } from "vue";

export interface NotificationOptions {
	message: string;
	type?: "success" | "error" | "info" | "warning";
	duration?: number;
	position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

const NOTIFICATION_STYLES = {
	base: `
    position: fixed;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    z-index: 10001;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(8px);
    max-width: 300px;
    word-wrap: break-word;
  `,
	success: "background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);",
	error: "background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);",
	info: "background: linear-gradient(135deg, #2196F3 0%, #1976d2 100%);",
	warning: "background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);",
} as const;

const POSITION_STYLES = {
	"top-right": "top: 20px; right: 20px;",
	"top-left": "top: 20px; left: 20px;",
	"bottom-right": "bottom: 20px; right: 20px;",
	"bottom-left": "bottom: 20px; left: 20px;",
} as const;

/**
 * 通知系统 Composable
 * 提供统一的通知显示功能
 */
export function useNotification() {
	const notifications = ref<HTMLElement[]>([]);

	/**
	 * 显示通知
	 */
	function showNotification({
		message,
		type = "info",
		duration = 3000,
		position = "top-right",
	}: NotificationOptions): void {
		const notification = document.createElement("div");
		notification.textContent = message;

		const typeStyle = NOTIFICATION_STYLES[type];
		const positionStyle = POSITION_STYLES[position];

		notification.style.cssText = `
      ${NOTIFICATION_STYLES.base}
      ${typeStyle}
      ${positionStyle}
    `;

		// 添加CSS动画
		const style = document.createElement("style");
		style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(${
						position.includes("right") ? "100%" : "-100%"
					});
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(${
						position.includes("right") ? "100%" : "-100%"
					});
        }
      }
    `;

		if (!document.head.querySelector("[data-notification-styles]")) {
			style.setAttribute("data-notification-styles", "true");
			document.head.appendChild(style);
		}

		document.body.appendChild(notification);
		notifications.value.push(notification);

		// 自动移除
		if (duration > 0) {
			setTimeout(() => {
				removeNotification(notification);
			}, duration);
		}

		// 点击移除
		notification.addEventListener("click", () => {
			removeNotification(notification);
		});
	}

	/**
	 * 移除通知
	 */
	function removeNotification(notification: HTMLElement): void {
		if (notification.parentNode) {
			notification.style.animation = "slideOut 0.3s ease-out";
			setTimeout(() => {
				if (notification.parentNode) {
					document.body.removeChild(notification);
				}
				const index = notifications.value.indexOf(notification);
				if (index > -1) {
					notifications.value.splice(index, 1);
				}
			}, 300);
		}
	}

	/**
	 * 清除所有通知
	 */
	function clearNotifications(): void {
		notifications.value.forEach(removeNotification);
	}

	/**
	 * 便捷方法
	 */
	const success = (message: string, options?: Partial<NotificationOptions>) =>
		showNotification({ message, type: "success", ...options });

	const error = (message: string, options?: Partial<NotificationOptions>) =>
		showNotification({ message, type: "error", ...options });

	const info = (message: string, options?: Partial<NotificationOptions>) =>
		showNotification({ message, type: "info", ...options });

	const warning = (message: string, options?: Partial<NotificationOptions>) =>
		showNotification({ message, type: "warning", ...options });

	return {
		showNotification,
		removeNotification,
		clearNotifications,
		success,
		error,
		info,
		warning,
		notifications,
	};
}
