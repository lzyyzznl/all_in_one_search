# 🔍 浏览器收藏夹历史记录搜索器

<div align="center">

**快速模糊搜索浏览器收藏夹、历史记录和下载文件的现代化浏览器扩展**

[![WXT Framework](https://img.shields.io/badge/Built%20with-WXT-blue?style=for-the-badge)](https://wxt.dev/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5.17-4FC08D?style=for-the-badge&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![UnoCSS](https://img.shields.io/badge/UnoCSS-66.3.2-0A7B4C?style=for-the-badge&logo=unocss)](https://unocss.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.9.11-409EFF?style=for-the-badge&logo=element)](https://element-plus.org/)

</div>

## ✨ 核心功能

### 🔍 智能搜索引擎

🎯 **毫秒级响应** - 模糊搜索收藏夹、历史记录、下载文件
🔍 **Tab 补全** - 智能搜索建议，按 Tab 键一键补全
🌐 **域名过滤** - 固定显示域名筛选，支持多维度过滤
📝 **搜索历史** - 智能记录 100 条搜索历史，下拉菜单查看更多
⌨️ **键盘导航** - 完整的键盘快捷键系统，高效操作
⭐ **智能收藏** - 一键将历史记录添加到书签
📥 **下载管理** - 搜索和管理浏览器下载文件
🌐 **网络搜索** - 集成主流搜索引擎，快速跳转

### 🎨 现代化界面

🌙 **主题系统** - 浅色/深色主题，支持跟随系统设置
🎯 **Element Plus** - 基于 Element Plus 的现代化 UI 组件
📱 **响应式设计** - 完美适配各种屏幕尺寸和设备
🚀 **性能优化** - 基于现代前端技术栈，极速流畅

## 🚀 功能详细介绍

### 🔍 智能搜索引擎详解

#### 核心搜索功能

- **多维度匹配**: 标题、URL、域名、文件名全文检索
- **模糊算法**: 支持拼音首字母、部分匹配
- **Tab 补全**: 智能匹配搜索历史，Tab 键一键补全
- **搜索统计**: 实时显示结果数量、搜索耗时、域名统计
- **去重优化**: 智能合并重复页面
- **三重来源**: 支持书签、历史记录、下载文件综合搜索

#### 域名过滤系统

- **固定显示**: 域名过滤始终可见，无需等待搜索结果
- **智能切换**: 无查询时显示推荐内容，有查询时显示搜索结果
- **多选过滤**: 支持同时选择多个域名进行过滤
- **图标展示**: 每个域名选项显示对应的网站图标

#### 搜索历史增强

- **智能存储**: 后台保存最近 100 条搜索历史
- **简洁显示**: 前端默认显示最近 5 条，保持界面清爽
- **下拉扩展**: 点击"更多"按钮查看所有历史记录
- **Tab 补全**: 输入时自动匹配历史记录，支持 Tab 键补全

## 🎨 界面设计

### 设计理念

采用现代化的卡片式设计，融合渐变背景和毛玻璃效果：

- **🔍 智能搜索框** - 支持实时搜索建议和 Tab 键补全
- **🏷️ 域名过滤** - 固定显示，动态加载可用域名选项
- **📜 搜索历史** - 气泡式显示最近搜索，支持下拉查看更多
- **📋 结果展示** - 平铺显示，左侧域名图标和类型标识
- **⌨️ 快捷提示** - 底部实时显示可用快捷键

### 配色方案

```css
/* 主题渐变背景 */
background: linear-gradient(to-br, from-slate-50 to-white);
dark-background: linear-gradient(to-br, from-slate-900 to-slate-800);

/* 功能色彩 */
--primary-color: #3b82f6; /* 蓝色 - 主要操作 */
--success-color: #22c55e; /* 绿色 - 成功状态 */
--warning-color: #f59e0b; /* 橙色 - 警告信息 */
--danger-color: #ef4444; /* 红色 - 危险操作 */
```

## 🛠️ 技术架构

### 🏗️ 现代化技术栈

```
┌─ 🎨 前端框架 ────────────────────────┐
│  Vue 3.5.17 (Composition API)       │
│  TypeScript 5.8.3 (类型安全)        │
│  Element Plus 2.9.11 (UI组件库)     │
│  UnoCSS 66.3.2 (原子化CSS)          │
│  Iconify Vue 5.0.0 (图标系统)       │
└──────────────────────────────────────┘

┌─ 🔧 构建工具 ────────────────────────┐
│  WXT 0.20.7 (扩展框架)              │
│  Vite 7.0.0 (极速构建)              │
│  pnpm 10.12.3 (包管理)              │
└──────────────────────────────────────┘

┌─ 🔌 浏览器集成 ──────────────────────┐
│  Chrome Extension APIs              │
│  Bookmarks & History APIs           │
│  Downloads API                      │
│  Storage & Commands APIs            │
└──────────────────────────────────────┘
```

### 📁 项目结构

```
all_in_one_search/
├── 🎨 components/              # Vue组件层
│   ├── PopupApp.vue           #   弹窗搜索主组件
│   ├── SettingsPage.vue       #   设置页面组件
│   ├── BookmarkDialog.vue     #   书签对话框组件
│   ├── SearchControls.vue     #   搜索控制组件
│   ├── SearchResultItem.vue   #   搜索结果项组件
│   └── index.ts               #   组件导出
├── 🚪 entrypoints/            # WXT入口点
│   ├── popup.html             #   弹窗搜索入口
│   ├── single_tab.html        #   新标签页搜索入口
│   ├── settings.html          #   设置页入口
│   └── background.ts          #   后台脚本
├── 🔧 utils/                  # 工具函数层
│   ├── search.ts             #   搜索引擎实现
│   ├── shortcuts.ts          #   快捷键管理
│   ├── searchEngines.ts      #   搜索引擎配置
│   ├── bookmarksApiWrapper.ts #   书签API封装
│   ├── contentSearch.ts      #   内容搜索服务
│   ├── theme.ts              #   主题管理
│   ├── element-plus.ts       #   Element Plus配置
│   ├── constants.ts          #   常量定义
│   ├── environment.ts        #   环境检测
│   ├── types.ts              #   TypeScript类型
│   └── composables/          #   组合式函数
│       ├── useContentSearch.ts #   内容搜索
│       ├── useSearch.ts      #     搜索相关
│       ├── useSearchActions.ts #   搜索操作
│       ├── useUI.ts          #     界面相关
│       └── index.ts          #     导出
├── 🎯 public/                 # 静态资源
│   ├── icon/                 #   应用图标
│   │   ├── 16.png            #     工具栏图标
│   │   ├── 32.png            #     扩展列表图标
│   │   ├── 48.png            #     详情页图标
│   │   └── 128.png           #     商店图标
│   └── searchEngineIcon/     #   搜索引擎图标
│       ├── baidu.png         #     百度图标
│       ├── bing.png          #     必应图标
│       └── google.png        #     谷歌图标
├── 📋 schedule/               # 项目规划
│   ├── product.md            #   产品功能说明
│   ├── implementation-plan.md #   实施计划
│   └── todolist.md           #   待办事项
├── 📄 配置文件               # 项目配置
│   ├── wxt.config.ts         #   WXT构建配置
│   ├── uno.config.ts         #   UnoCSS配置
│   ├── tsconfig.json         #   TypeScript配置
│   ├── package.json          #   依赖管理
│   └── pnpm-lock.yaml        #   锁定版本
└── 📋 文档                   # 项目文档
    ├── README.md             #   项目说明
    └── LICENSE               #   开源协议
```

## 📦 快速开始

### 🔨 开发环境

```bash
# 🚀 克隆项目
git clone https://github.com/your-username/all_in_one_search.git
cd all_in_one_search

# 📦 安装依赖
pnpm install

# 🔧 开发模式 (Chrome)
pnpm dev

# 🏗️ 生产构建
pnpm build

# 📦 打包发布
pnpm zip
```

### 🔧 安装扩展

1. **开发者模式**: 在 Chrome 中启用开发者模式
2. **加载扩展**: 选择 `.output/chrome-mv3` 目录
3. **设置快捷键**: 访问 `chrome://extensions/shortcuts` 配置快捷键
4. **开始使用**: 点击工具栏图标或按快捷键

### 🎯 使用模式

#### 🔍 智能搜索模式

- **弹窗模式**: 点击工具栏图标或按 `Ctrl+Shift+S` 快捷键
- **新标签页**: 在弹窗右上角点击"新标签页打开"按钮
- **功能**: 搜索收藏夹、历史记录、下载文件

#### ⚙️ 设置页面

- **访问方式**: 在扩展管理页面点击"选项"或在弹窗中点击设置按钮
- **功能**: 自定义快捷键、主题设置、搜索配置等

## ⚙️ 高级配置

### 🎛️ 搜索设置

- **结果数量**: 25/50/100/200 条可选
- **默认排序**: 相关性/时间/频率
- **搜索范围**: 书签/历史/下载文件/全部
- **时间筛选**: 全部时间/今天/本周/本月

### ⌨️ 快捷键配置

- **全局快捷键**: Chrome 扩展设置页面配置
- **导航快捷键**: 插件设置页面完全自定义
- **实时生效**: 无需重启扩展

### 🎨 界面定制

- **主题选择**: 浅色/深色/跟随系统
- **历史显示**: 可设置显示 1-10 条搜索历史
- **响应式布局**: 自适应各种屏幕尺寸
- **动画效果**: 流畅的交互动画

### 🌐 搜索引擎配置

- **默认引擎**: 可在设置页面选择偏好的搜索引擎
- **支持引擎**: Google、百度、Bing、DuckDuckGo 等
- **智能检测**: 自动检测浏览器默认搜索引擎

## 🔒 权限说明

为了提供完整功能，扩展需要以下权限：

| 权限             | 用途                   | 必要性      | 功能模块 |
| ---------------- | ---------------------- | ----------- | -------- |
| `bookmarks`      | 读取和创建书签         | ⭐ 核心功能 | 智能搜索 |
| `history`        | 读取浏览历史           | ⭐ 核心功能 | 智能搜索 |
| `downloads`      | 读取下载记录           | ⭐ 核心功能 | 智能搜索 |
| `downloads.open` | 打开下载文件           | 🔧 增强体验 | 智能搜索 |
| `storage`        | 保存用户设置和搜索历史 | ⭐ 设置同步 | 全局功能 |
| `tabs`           | 打开新标签页           | 🔧 增强体验 | 全局功能 |
| `commands`       | 全局快捷键             | 🔧 快速访问 | 全局功能 |
| `activeTab`      | 当前页面操作           | 🔧 链接打开 | 智能搜索 |
| `search`         | 网络搜索集成           | 🔧 搜索增强 | 智能搜索 |

## 🤝 参与贡献

我们欢迎所有形式的贡献！

### 🐛 报告问题

- 在 [Issues](https://github.com/your-username/all_in_one_search/issues) 页面报告 bug
- 提供详细的复现步骤和环境信息

### 💡 功能建议

- 在 [Discussions](https://github.com/your-username/all_in_one_search/discussions) 提出想法
- 参与社区讨论，分享使用心得

### 🔧 代码贡献

1. Fork 本仓库
2. 创建特性分支: `git checkout -b feature/AmazingFeature`
3. 提交改动: `git commit -m 'Add some AmazingFeature'`
4. 推送分支: `git push origin feature/AmazingFeature`
5. 提交 Pull Request

### 📋 开发规范

- **TypeScript**: 使用严格的类型检查，编写类型安全的代码
- **Vue 3**: 遵循 Composition API 最佳实践，使用组合式函数
- **UnoCSS**: 使用原子化 CSS，禁止自定义 CSS 样式
- **Element Plus**: 使用组件库保持界面一致性
- **Iconify**: 统一使用 Iconify 图标系统，避免混用图标库
- **Tiptap**: 编辑器扩展开发遵循 Tiptap 架构模式
- **文件系统**: 使用 File System Access API 进行文件操作
- **代码质量**: 编写清晰的注释和文档，遵循项目代码风格

## 📄 版本历史

### v2.1.0 (2024-12) - 当前版本

- 🎨 **Element Plus 重构**: 完全重构 UI 组件，使用 Element Plus 2.9.11
- ✨ **现代化界面**: 全新的界面设计，支持浅色/深色主题
- 🔧 **性能优化**: 使用 Element Plus 原生组件，提升性能
- � **\*图标系统**: 标准化图标系统，使用 Iconify Vue
- 🎯 **交互优化**: 改进表单交互体验，增强用户操作反馈
- 🎪 **设计统一**: 统一设计语言，提升界面一致性
- 📱 **响应式增强**: 更好的响应式支持和无障碍访问

### v1.3.0 (2024-12) - 交互优化版本

- 🎯 **Tab 补全功能**: 智能搜索建议，Tab 键一键补全
- 🌐 **域名过滤增强**: 固定显示，支持推荐内容和查询结果过滤
- 📝 **搜索历史升级**: 100 条后台存储，下拉菜单查看更多
- ⌨️ **键盘导航完善**: 所有快捷键可自定义，丰富的操作支持
- 🎨 **主题系统**: 浅色/深色/跟随系统三种模式
- ⚙️ **设置中心**: 完整的配置页面，支持所有功能自定义
- 🔧 **界面优化**: 固定头部，优化滚动体验
- 🎪 **UnoCSS 重构**: 全面使用原子化 CSS，禁用自定义样式

### v1.2.0 (2024-12) - Element Plus 重构版本

- 🎨 完全重构 UI 组件，使用 Element Plus 2.9.11
- ✨ 全新的现代化界面设计，保持深色主题
- 🔧 优化组件性能，使用 Element Plus 原生组件
- 📦 标准化图标系统，使用@element-plus/icons-vue
- 🎯 改进表单交互体验，增强用户操作反馈
- 🎪 统一设计语言，提升界面一致性
- 📱 更好的响应式支持和无障碍访问

### v1.1.0 (2024-12)

- 🆕 新增下载文件搜索功能
- 🆕 智能搜索历史记录（最近 5 条）
- 🆕 时间筛选功能（今天/本周/全部）
- 🔧 改进搜索算法和相关性评分
- 🎨 优化 UI 交互体验
- 📱 增强响应式设计

### v1.0.0 (2024-12)

- ✨ 初始版本发布
- 🔍 智能搜索引擎
- 🎨 深色系界面设计
- ⌨️ 可配置快捷键系统
- ⭐ 智能收藏功能
- 🚀 现代化技术栈

## 📞 联系方式

- **开发者**: lizeyu
- **邮箱**: [632795136@qq.com](mailto:632795136@qq.com)
- **项目地址**: [GitHub Repository](https://github.com/your-username/all_in_one_search)
- **问题反馈**: [Issues](https://github.com/your-username/all_in_one_search/issues)
- **功能建议**: [Discussions](https://github.com/your-username/all_in_one_search/discussions)

## 📜 开源协议

本项目基于 [MIT License](LICENSE) 开源协议。

---

<div align="center">

**🌟 如果这个项目对你有帮助，请给一个 Star 支持！**

Made with ❤️ by [lizeyu](https://github.com/your-username)

</div>
