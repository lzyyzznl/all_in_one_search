# 🔍 浏览器搜索大师 | Browser Search Master

<div align="center">

![图标展示](public/icon/128.png)

**一个极致优雅的浏览器收藏夹与历史记录搜索扩展**

[![WXT Framework](https://img.shields.io/badge/Built%20with-WXT-blue?style=for-the-badge)](https://wxt.dev/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5.16-4FC08D?style=for-the-badge&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Less](https://img.shields.io/badge/Less-4.3.0-1D365D?style=for-the-badge&logo=less)](https://lesscss.org/)

</div>

## ✨ 亮点特性

🎯 **智能搜索** - 毫秒级响应的模糊搜索，支持中英文混合匹配  
🎨 **域名分组** - 优雅的卡片式分组展示，信息层次清晰  
⚡ **实时预览** - 输入即搜索，无需按回车  
🔧 **高度定制** - 可配置的快捷键、排序规则、搜索选项  
🌙 **深色美学** - 精心设计的深色系界面，护眼舒适  
📱 **响应式** - 完美适配各种屏幕尺寸  
🚀 **性能优化** - 基于现代前端技术栈，极速流畅  

## 🎨 图标设计

### 设计哲学
我们的深色系图标融合了现代简约美学与功能性表达：

- **🔍 搜索放大镜** - 蓝紫渐变，象征强大搜索能力
- **⭐ 收藏星标** - 粉紫渐变，代表书签收藏功能  
- **🕒 历史时钟** - 青蓝渐变，表示历史记录追溯
- **📋 结果列表** - 简洁线条，展现搜索结果
- **⌨️ 快捷键提示** - S/H标识，体现键盘操作

### 配色方案
```css
/* 深色渐变背景 */
background: radial-gradient(#2D3748, #1A202C);

/* 功能色彩 */
--search-color: linear-gradient(135deg, #667EEA, #764BA2);
--bookmark-color: linear-gradient(135deg, #F093FB, #F5576C);  
--history-color: linear-gradient(135deg, #4FACFE, #00F2FE);
```

## 🚀 核心功能

### 🔍 智能搜索引擎
- **多维度匹配**: 标题、URL、域名全文检索
- **模糊算法**: 支持拼音首字母、部分匹配
- **搜索统计**: 实时显示结果数量、搜索耗时、域名统计
- **去重优化**: 智能合并重复页面

### 📊 灵活排序系统  
- **相关性排序**: 基于匹配度和权重的智能排序
- **时间排序**: 按最近访问时间排列
- **频率排序**: 根据访问次数优先显示

### ⌨️ 可配置快捷键
- **全局快捷键**: `Ctrl+Shift+S` (可在Chrome扩展设置中修改)
- **导航快捷键**: 完全可自定义的键盘操作
  - 🔼 向上选择: `↑` / `K` / `W`
  - 🔽 向下选择: `↓` / `J` / `S`  
  - ✅ 确认打开: `Enter` / `Space` / `O`
  - ❌ 关闭窗口: `Esc` / `Q`

### ⭐ 智能收藏系统
- **一键收藏**: 历史记录可直接添加到书签
- **文件夹选择**: 支持层级文件夹结构
- **自定义标题**: 可编辑书签标题
- **批量操作**: 计划支持批量收藏功能

### 🆕 双界面体验
- **弹窗模式**: 轻量级快速搜索
- **新标签页**: 全屏搜索，网格布局，更多信息展示

## 🛠️ 技术架构

### 🏗️ 现代化技术栈
```
┌─ 🎨 前端框架 ────────────────────────┐
│  Vue 3.5.16 (Composition API)       │
│  TypeScript 5.8.3 (类型安全)        │  
│  Less 4.3.0 (样式工程化)             │
└──────────────────────────────────────┘

┌─ 🔧 构建工具 ────────────────────────┐
│  WXT 0.20.6 (扩展框架)              │
│  Vite 6.3.5 (极速构建)              │
│  pnpm (包管理)                      │
└──────────────────────────────────────┘

┌─ 🔌 浏览器集成 ──────────────────────┐
│  Chrome Extension APIs              │
│  Bookmarks & History APIs           │  
│  Storage & Commands APIs            │
└──────────────────────────────────────┘
```

### 📁 项目结构
```
my_browser_explorer/
├── 🎨 components/              # Vue组件层
│   ├── PopupApp.vue           #   弹窗主组件
│   └── SettingsPage.vue       #   设置页面组件
├── 🚪 entrypoints/            # WXT入口点
│   ├── popup.html             #   弹窗入口
│   ├── newtab.html           #   新标签页入口
│   ├── settings.html         #   设置页入口
│   ├── background.ts         #   后台脚本
│   └── styles/               #   样式系统
│       ├── popup.less        #     主样式
│       ├── variables.less    #     变量定义
│       └── mixins.less       #     混合函数
├── 🔧 utils/                  # 工具函数层
│   ├── search.ts             #   搜索引擎实现
│   ├── shortcuts.ts          #   快捷键管理
│   └── types.ts              #   TypeScript类型
├── 🎯 public/                 # 静态资源
│   └── icon/                 #   应用图标
│       ├── icon.svg          #     SVG源文件
│       ├── 16.png            #     工具栏图标
│       ├── 32.png            #     扩展列表图标
│       ├── 48.png            #     详情页图标
│       └── 128.png           #     商店图标
└── 📋 scripts/                # 构建脚本
    └── generate-icons.py     #   图标生成脚本
```

## 📦 快速开始

### 🔨 开发环境

```bash
# 🚀 克隆项目
git clone https://github.com/your-username/browser-search-master.git
cd browser-search-master

# 📦 安装依赖  
pnpm install

# 🔧 开发模式 (Chrome)
pnpm dev

# 🦊 开发模式 (Firefox)  
pnpm dev:firefox
```

### 🏗️ 构建发布

```bash
# 🎯 生产构建
pnpm build

# 📦 打包发布
pnpm zip

# 🔍 类型检查
pnpm type-check
```

### 🔧 安装扩展

1. **开发者模式**: 在Chrome中启用开发者模式
2. **加载扩展**: 选择 `.output/chrome-mv3` 目录
3. **设置快捷键**: 访问 `chrome://extensions/shortcuts` 配置快捷键
4. **开始使用**: 点击工具栏图标或按快捷键

## ⚙️ 高级配置

### 🎛️ 搜索设置
- **结果数量**: 25/50/100/200条可选
- **默认排序**: 相关性/时间/频率
- **搜索范围**: 书签/历史/全部

### ⌨️ 快捷键配置
- **全局快捷键**: Chrome扩展设置页面配置
- **导航快捷键**: 插件设置页面自定义
- **实时生效**: 无需重启扩展

### 🎨 界面定制
- **深色主题**: 内置护眼深色界面
- **响应式布局**: 自适应各种屏幕尺寸
- **动画效果**: 流畅的交互动画

## 🔒 权限说明

为了提供完整功能，扩展需要以下权限：

| 权限 | 用途 | 必要性 |
|-----|------|-------|
| `bookmarks` | 读取和创建书签 | ⭐ 核心功能 |
| `history` | 读取浏览历史 | ⭐ 核心功能 |
| `storage` | 保存用户设置 | ⭐ 设置同步 |
| `tabs` | 打开新标签页 | 🔧 增强体验 |
| `commands` | 全局快捷键 | 🔧 快速访问 |
| `activeTab` | 当前页面操作 | 🔧 链接打开 |

## 🤝 参与贡献

我们欢迎所有形式的贡献！

### 🐛 报告问题
- 在 [Issues](https://github.com/your-username/browser-search-master/issues) 页面报告bug
- 提供详细的复现步骤和环境信息

### 💡 功能建议  
- 在 [Discussions](https://github.com/your-username/browser-search-master/discussions) 提出想法
- 参与社区讨论，分享使用心得

### 🔧 代码贡献
1. Fork 本仓库
2. 创建特性分支: `git checkout -b feature/AmazingFeature`
3. 提交改动: `git commit -m 'Add some AmazingFeature'`
4. 推送分支: `git push origin feature/AmazingFeature`
5. 提交 Pull Request

### 📋 开发规范
- 使用 TypeScript 编写类型安全的代码
- 遵循 Vue 3 Composition API 最佳实践
- 保持代码风格一致，使用 ESLint + Prettier
- 编写清晰的注释和文档

## 📄 版本历史

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
- **GitHub**: [your-github-profile](https://github.com/your-username)

## 📜 开源协议

本项目基于 [MIT License](LICENSE) 开源协议。

---

<div align="center">

**🌟 如果这个项目对你有帮助，请给一个 Star 支持！**

Made with ❤️ by [lizeyu](https://github.com/your-username)

</div>
