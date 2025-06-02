import type { LessOptions } from "less";

interface LessGlobalVars {
	[key: string]: string;
}

interface LessModifyVars {
	[key: string]: string;
}

interface LessConfig {
	lessOptions: {
		javascriptEnabled?: boolean;
		math?: "always" | "strict" | "parens-division" | "parens" | "strict-legacy";
		globalVars?: LessGlobalVars;
		modifyVars?: LessModifyVars;
		compress?: boolean;
		sourceMap?: boolean;
	};
}

const config: LessConfig = {
	// Less 编译选项
	lessOptions: {
		// 启用JavaScript计算
		javascriptEnabled: true,

		// 数学计算模式
		math: "parens-division",

		// 全局变量定义
		globalVars: {
			// 主题相关变量
			"theme-primary": "#667eea",
			"theme-secondary": "#764ba2",

			// 断点变量
			"screen-sm": "576px",
			"screen-md": "768px",
			"screen-lg": "992px",
			"screen-xl": "1200px",
		},

		// 修改变量（可以覆盖Less文件中的变量）
		modifyVars: {
			// 可以在这里动态修改Less变量
		},

		// 压缩输出
		compress: process.env.NODE_ENV === "production",

		// 生成源映射
		sourceMap: process.env.NODE_ENV !== "production",
	},
};

export default config;
