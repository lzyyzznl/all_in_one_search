---
description: 现代Web应用的Tailwind CSS与UI组件最佳实践
globs: **/*.css, **/*.tsx, **/*.jsx, tailwind.config.js, tailwind.config.ts
type: "agent_requested"
---

# Tailwind CSS 最佳实践

## 项目配置

- 采用合理的Tailwind配置方案
- 正确配置主题扩展（Theme Extension）
- 设置完善的清除（Purge）规则
- 合理集成插件（Plugin）
- 配置自定义间距（Spacing）与断点（Breakpoints）
- 规范定义颜色板（Color Palette）

## 组件样式

- 优先使用工具类（Utility Classes）而非自定义CSS
- 需要时通过`@apply`组合相关工具类
- 合理使用响应式设计工具类
- 完善暗黑模式（Dark Mode）实现
- 规范状态变体（State Variants）样式
- 保持组件样式一致性

## 布局设计

- 高效使用Flexbox与Grid工具类
- 实现统一的间距系统（Spacing System）
- 按需应用容器查询（Container Queries）
- 规范响应式断点（Responsive Breakpoints）
- 合理使用内边距（Padding）与外边距（Margin）工具类
- 完善对齐（Alignment）工具类应用

## 排版规范

- 采用合理的字体大小（Font Size）工具类
- 规范行高（Line Height）设置
- 合理使用字重（Font Weight）工具类
- 正确配置自定义字体（Custom Fonts）
- 规范文本对齐（Text Alignment）方式
- 完善文本装饰（Text Decoration）样式

## 颜色管理

- 采用语义化颜色命名（Semantic Color Naming）
- 确保颜色对比度（Color Contrast）符合可访问性标准
- 高效使用透明度（Opacity）工具类
- 规范自定义颜色配置
- 合理应用渐变（Gradient）工具类
- 完善悬停（Hover）状态样式

## 组件开发

- 可用时优先使用shadcn/ui组件库
- 合理扩展基础组件（Component Extension）
- 保持组件变体（Variants）风格一致
- 实现流畅的动画（Animation）效果
- 规范过渡（Transition）工具类使用
- 全程关注无障碍（Accessibility）设计

## 响应式设计

- 采用移动优先（Mobile-First）策略
- 完善多端断点（Breakpoints）适配
- 高效应用容器查询（Container Queries）
- 合理处理不同屏幕尺寸（Screen Sizes）的样式适配
- 实现响应式排版（Responsive Typography）
- 规范响应式间距（Responsive Spacing）

## 性能优化

- 完善清除（Purge）配置以减少冗余代码
- 最小化自定义CSS代码量
- 采用合理的缓存策略（Caching Strategies）
- 实现有效的代码分割（Code Splitting）
- 优化生产环境构建（Production Build）
- 监控包体积（Bundle Size）

## 通用最佳实践

- 遵循统一的命名规范（Naming Conventions）
- 保持样式文件组织有序
- 编写完善的文档说明（Documentation）
- 实施规范的测试流程（Testing）
- 严格遵守无障碍设计指南（Accessibility Guidelines）

- 规范版本控制（Version Control）管理
