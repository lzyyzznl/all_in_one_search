# 浏览器收藏夹历史记录搜索器

一个基于 WXT 框架开发的浏览器插件，支持快速模糊搜索浏览器收藏夹和历史记录，并按域名分组显示结果。

## 功能特性

- 🔍 **模糊搜索** - 支持关键词模糊匹配标题、URL和域名
- 📁 **域名分组** - 搜索结果按域名智能分组显示
- 🔖 **双重搜索** - 同时搜索收藏夹和历史记录
- ⚡ **实时搜索** - 输入即搜索，无需等待
- 🎯 **智能排序** - 支持按相关性、时间、访问频率排序
- ⌨️ **快捷键** - 支持键盘导航，提升操作效率
- 📊 **统计信息** - 显示搜索结果统计和耗时
- 🖱️ **单击打开** - 单击即可直接打开页面
- ⭐ **收藏功能** - 历史记录项可一键添加到书签
- 🆕 **新标签页** - 支持在新标签页中打开完整搜索界面

## 技术选型

- **插件框架**: WXT (Next-gen Web Extension Framework)
- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **包管理器**: pnpm
- **样式预处理器**: Less (支持变量、嵌套、混合等特性)

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# Chrome 开发
pnpm dev

# Firefox 开发
pnpm dev:firefox
```

### 构建生产版本

```bash
# Chrome 构建
pnpm build

# Firefox 构建
pnpm build:firefox
```

### 打包发布

```bash
# Chrome 打包
pnpm zip

# Firefox 打包
pnpm zip:firefox
```

## 项目结构

```
my_browser_explorer/
├── components/           # Vue 组件
│   ├── PopupApp.vue     # 主弹窗组件
│   └── NewTabApp.vue    # 新标签页组件
├── entrypoints/         # WXT 入口点
│   ├── popup.html       # 弹窗入口点
│   ├── newtab.html      # 新标签页入口点
│   └── styles/          # Less 样式文件
│       ├── popup.less   # 主样式文件
│       ├── variables.less # 变量定义
│       └── mixins.less  # 混合函数
├── utils/               # 工具函数
│   ├── types.ts         # TypeScript 类型定义
│   └── search.ts        # 搜索逻辑实现
├── public/              # 静态资源
│   └── icon/            # 图标文件
├── wxt.config.ts        # WXT 配置文件
├── tsconfig.json        # TypeScript 配置
├── less.config.js       # Less 配置
├── package.json         # 项目配置
└── README.md           # 项目文档
```

## 使用说明

### 基本操作

1. **打开插件**: 点击浏览器工具栏的插件图标
2. **输入搜索**: 在搜索框中输入关键词进行模糊搜索
3. **调整选项**: 可选择搜索书签、历史记录或同时搜索
4. **排序结果**: 支持按相关性、最近访问、访问频率排序
5. **打开链接**: 单击搜索结果即可直接打开页面

### 高级功能

#### 新标签页搜索
- 点击弹窗中的"新标签页"按钮，在新标签页中打开完整搜索界面
- 新标签页提供更大的显示空间和网格布局
- 搜索参数会自动传递到新标签页

#### 收藏功能
- 历史记录项旁边会显示"⭐"收藏按钮
- 点击收藏按钮弹出书签设置对话框
- 可自定义书签标题和选择存储文件夹
- 支持层级文件夹结构显示

#### 键盘导航
- `↑/↓` 箭头键: 选择搜索结果
- `Enter`: 打开选中的结果
- `Esc`: 关闭弹窗

### 样式系统

项目使用 Less 预处理器，支持：

- **变量系统**: 统一的颜色、尺寸、字体变量
- **混合函数**: 可复用的样式模式
- **嵌套规则**: 清晰的样式层级结构
- **响应式设计**: 适配不同屏幕尺寸

### 权限说明

插件需要以下权限：
- `bookmarks`: 读取和创建书签
- `history`: 读取浏览历史
- `activeTab`: 在当前标签页打开链接
- `storage`: 存储用户设置
- `tabs`: 创建新标签页

## 开发指南

### 添加新功能

1. 在 `utils/types.ts` 中定义相关类型
2. 在 `utils/search.ts` 中实现搜索逻辑
3. 在组件中添加用户界面
4. 更新样式文件

### 样式开发

1. 在 `entrypoints/styles/variables.less` 中定义新变量
2. 在 `entrypoints/styles/mixins.less` 中添加混合函数
3. 在组件中使用 Less 特性编写样式

### 构建和测试

```bash
# 开发模式（热重载）
pnpm dev

# 构建测试
pnpm build

# 类型检查
pnpm type-check
```

## 技术特点

- **现代化架构**: 基于 WXT 框架，支持最新的 Web Extension API
- **类型安全**: 全面的 TypeScript 支持
- **组件化**: Vue 3 组合式 API，代码复用性强
- **样式工程化**: Less 预处理器，支持主题定制
- **性能优化**: Vite 构建，支持代码分割和懒加载

## 许可证

MIT License

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request