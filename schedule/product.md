# Tiptap 富文本编辑器 综合问答与解决方案

## 一、基础介绍

**Tiptap** 是基于 ProseMirror 的“无头”（headless）、模块化、可扩展富文本编辑器框架，支持 Vue、React、Svelte、原生 JS 等。通过 Extensions 机制按需加载功能，保持包体积小、架构清晰，能快速打造与产品设计高度契合的编辑体验。

## 二、主要功能与扩展一览

| 类别       | 扩展名称                                                                                                                                                      | 说明                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 文本标记   | Bold, Italic, Underline, Strike                                                                                                                               | 粗体、斜体、下划线、删除线，支持快捷键与 Markdown 语法。                                                                         |
| 文本样式   | Color, Highlight, TextStyle, FontFamily                                                                                                                       | 字体颜色、高亮、自定义字号/字体族等，依赖 TextStyle 容器。                                                                       |
| 结构布局   | Heading, Paragraph, BulletList, OrderedList, TaskList, Blockquote, HorizontalRule, Table, Details                                                             | 标题（H1–H6）、段落、各类列表、引用、水平线、表格、折叠块等。                                                                    |
| 媒体嵌入   | Image, Video, Audio, Iframe, Emoji                                                                                                                            | 插入图片、音视频、任意 iframe、表情，支持粘贴/拖拽/上传。                                                                        |
| 代码块     | Code, CodeBlock, CodeBlockLowlight                                                                                                                            | 行内代码、多行代码（```），结合 lowlight 实现语法高亮。                                                                          |
| 公式与图表 | Mathematics (KaTeX/MathJax), Mermaid, PlantUML                                                                                                                | LaTeX 公式块；通过社区扩展（如 `@syfxlin/tiptap-starter-kit`）支持 Mermaid、PlantUML 代码块及 `:::…:::` 语法。                   |
| UI 体验    | Placeholder, BubbleMenu, FloatingMenu                                                                                                                         | 占位符、气泡/浮动菜单，提升编辑器交互体验。                                                                                      |
| 功能增强   | CharacterCount, Dropcursor, Gapcursor, Focus, DragHandle, ListKeymap, UniqueID, Undo/Redo, Export, Import, TableOfContents, TextAlign, LineHeight, Typography | 字符计数、拖拽光标、高亮焦点、拖拽手柄、列表快捷键、节点唯一 ID、撤销/重做、文档导入导出、目录生成、文本对齐、行高、智能排版等。 |
| 协作评论   | Collaboration (Yjs), CollaborationCursor, Comments, VersionHistory                                                                                            | 实时协作、协作光标、评论、版本历史（Pro/Cloud）。                                                                                |
| AI 助手    | AI Agent, AI Suggestion, AI Changes, AI Generation                                                                                                            | 自动润色、语法校对、摘要、翻译、编辑差异、高级生成（Pro/Cloud）。                                                                |
| 搜索替换   | tiptap-search-and-replace                                                                                                                                     | 全文查找、高亮、替换（支持正则、大小写、UI 自定义）。                                                                            |
| 格式刷     | tiptap-extension-format-painter                                                                                                                               | Office 风格“格式刷”，复制/应用文本格式。                                                                                         |
| 语法检查   | tiptap-languagetool                                                                                                                                           | 集成 LanguageTool 语法校对，多语言支持。                                                                                         |
| 图片上传   | tiptap-extension-image-upload                                                                                                                                 | 文件/粘贴/拖拽上传，支持自定义上传接口与预览。                                                                                   |

---

## 三、最佳实践与方案要点

1. **JSON 存储与处理**

   - 编辑器内容可 `editor.getJSON()`/`setContent()` 与后端通信。
   - 直接读取 JSON 文件或字符串，递归遍历、查找、替换节点（如提取链接、图片、mention）。
   - JSON ↔ HTML 互转通过 `@tiptap/html` 的 `generateHTML`/`generateJSON` 完成。

2. **扩展管理**

   - 按需引入官方或社区扩展，避免冗余包体积。
   - 结合 `configure` 自定义 `HTMLAttributes` 添加 UnoCSS 原子类，或 Tailwind 类。
   - 自定义 Node/Mark/Extension 时，实现 `addKeyboardShortcuts()`、`addInputRules()`、`addNodeView()` 等钩子。

3. **代码块格式化与高亮**

   - 使用 CodeBlockLowlight 或 CodeBlockShiki 实现多语言高亮。
   - 若需自动格式化（如 JSON/JS），可在插入前用 Prettier/js-beautify 等库处理内容。

4. **Mermaid/PlantUML 支持**

   - 社区扩展（`@syfxlin/tiptap-starter-kit`）原生支持 ``````plantuml 和 :::mermaid / :::plantuml 语法。
   - 自动识别代码块语言，渲染实时预览。

5. **搜索与替换**

   - 借助 `@sereneinserenade/tiptap-search-and-replace` 实现全文搜索、高亮、替换，支持正则和大小写选项。

6. **快捷键管理**

   - StarterKit 默认提供常用快捷键（粗体、斜体、列表、撤销/重做、标题、引用等）。
   - 自定义或覆盖按 `addKeyboardShortcuts()` 完成，支持 `Mod`、`Shift`、`Alt`、`Control`、`Cmd`。

7. **导出方案**
   - 文档可导出为 DOCX/ODT/Markdown（保留图片 URL/base64）。
   - 若需“导出为图片”，可在前端使用 `html2canvas`、`dom-to-image`、`puppeteer` 等截图库实现。

---

## 四、总结

Tiptap 拥有完整且灵活的扩展生态，官方与社区合计 100+ 免费扩展，覆盖文本格式化、结构布局、媒体嵌入、代码高亮、公式图表、协作评论、AI 助手、搜索替换等需求。无头架构与高度可配置性，允许开发者基于 JSON 数据结构与扩展钩子，自定义快捷键、UI 样式（含 UnoCSS 原子类）、导入导出方案，并与 Prettier、LanguageTool、Yjs、html2canvas 等生态工具无缝集成，满足从轻量文档编辑到企业级多人实时协作、AI 智能辅助的全场景需求。
