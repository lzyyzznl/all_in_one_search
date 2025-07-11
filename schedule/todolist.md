# Tiptap 功能实现 Todolist

## 一、基础文本功能

### 文本标记

- [x] **Bold, Italic, Underline, Strike**: 实现粗体、斜体、下划线、删除线，支持快捷键与 Markdown 语法。

### 文本样式

- [x] **Color**: 实现字体颜色设置。
- [x] **Highlight**: 实现文本高亮功能。
- [x] **TextStyle**: 实现文本样式功能。
- [x] **FontFamily**: 实现字体族选择功能，支持多种字体
- [ ] **FontSize**: (可选) 实现字号调整功能。

### 结构布局

- [x] **Heading**: 实现标题（H1–H6）。
- [x] **Paragraph**: 支持基本段落。
- [x] **Lists**: 实现无序列表 (`BulletList`)、有序列表 (`OrderedList`)、任务列表 (`TaskList`)。
- [x] **Blockquote**: 实现引用块。
- [x] **HorizontalRule**: 实现水平分割线。
- [x] **Table**: 实现表格功能（创建、编辑）。
- [x] **Details**: 实现可折叠内容块。

## 二、媒体与代码

### 媒体嵌入

- [x] **Emoji**: 支持表情输入。

### 代码块

- [x] **Code**: 实现行内代码。
- [x] **CodeBlock**: 实现多行代码块。
- [x] **Code Highlighting**: 使用 lowlight (highlight.js) 实现代码语法高亮
- [ ] **Code Formatting**: 代码格式化功能，支持多种编程语言的自动格式化

### 公式与图表

- [x] **Mathematics**: 支持 LaTeX 公式块 (KaTeX/MathJax)。
- [x] **Mermaid / PlantUML**: 支持 Mermaid 和 PlantUML 图表渲染。

## 三、用户体验 (UI/UX)

### 编辑器交互

- [x] **Placeholder**: 实现编辑器占位符文本，提升用户体验
- [x] **BubbleMenu**: 为选中内容创建气泡菜单（例如，用于文本格式化）。
- [ ] **FloatingMenu**: 在新行创建浮动菜单（例如，用于快速插入节点）。
- [ ] **Dropcursor & Gapcursor**: 优化拖拽和节点间光标导航体验。
- [ ] **Focus**: 实现节点焦点高亮。
- [x] **DragHandle**: 为节点添加拖拽手柄。

### 辅助功能

- [x] **CharacterCount**: 实现字符计数功能。
- [x] **Undo/Redo**: 实现撤销/重做功能。
- [x] **ListKeymap**: 配置列表相关的快捷键。
- [x] **TextAlign**: 实现文本对齐（左、中、右、两端）。
- [x] **LineHeight**: 实现行高调整。
- [x] **Typography**: 启用智能排版（如智能引号、箭头转换等）。

## 四、高级功能

### 数据与文档处理

- [x] **JSON I/O**: 实现编辑器内容与 JSON 格式的相互转换和读写 (`editor.getJSON()`/`setContent()`)。
- [x] **HTML I/O**: 实现 HTML 与 Tiptap JSON 格式的相互转换 (`generateHTML`/`generateJSON`)。
- [ ] **Import/Export**: 实现文档的导入导出功能。
  - [x] 导出为 Markdown。
  - [x] 导出为 DOCX/ODT。（需Tiptap Pro或第三方服务，已占位按钮）
  - [x] (可选) 导出为图片 (使用 `html2canvas` 等库)。
- [x] **UniqueID**: 为节点生成并附加唯一 ID，用于持久化引用。
- [x] **Table of Contents**: 实现文档目录生成。

### 搜索与替换

- [x] **Search and Replace**: 实现全文查找、高亮、替换功能，包括 UI (可参考 `tiptap-search-and-replace`)。

### 效率工具

- [x] **Format Painter**: 实现 Office 风格的"格式刷" (`tiptap-extension-format-painter`)。
- [x] **Grammar Check**: (可选) 集成 LanguageTool 进行语法校对 (`tiptap-languagetool`)。
- [x] **Image Upload**: 封装图片上传逻辑，支持自定义上传接口与预览 (`tiptap-extension-image-upload`)。

## 六、开发与集成

- [x] **快捷键管理**: 全面梳理并根据需要自定义 `addKeyboardShortcuts`。

## 当前实施状态总结

### 阶段一：✅ 已完成 (100%)

所有基础编辑功能已经完全实现，包括：

- ✅ 基础文本格式：Bold, Italic, Underline, Strike, Code
- ✅ 颜色功能：Color, Highlight
- ✅ 标题功能：H1-H6
- ✅ 列表功能：Lists, TaskList
- ✅ 结构布局：Blockquote, HorizontalRule, Table, Details
- ✅ 代码功能：Code, CodeBlock
- ✅ 媒体功能：Emoji, Mathematics, Mermaid
- ✅ 编辑功能：Undo/Redo

### 阶段二：🚧 进行中 (80% 完成)

代码高亮和用户体验功能：

- ✅ **Code Highlighting**: 使用 lowlight 实现代码语法高亮
- ✅ **FontFamily**: 实现字体族选择功能
- ✅ **Placeholder**: 实现编辑器占位符文本
- ✅ **BubbleMenu**: 实现气泡菜单，选中文本时显示工具栏
- ✅ **FloatingMenu**: 实现浮动菜单，空行时显示工具栏
- [ ] **Code Formatting**: 代码格式化功能

### 开发原则遵循情况 ✅

严格按照以下优先级进行开发：

1. ✅ 优先使用 @syfxlin/tiptap-starter-kit 内置功能
2. ✅ 其次使用 tiptap 官方扩展
3. ✅ 第三方库（未使用）
4. ✅ 自己实现（未需要）
