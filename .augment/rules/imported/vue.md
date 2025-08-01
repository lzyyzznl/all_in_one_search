---
description: 现代Web应用的Vue.js最佳实践与模式
globs: **/*.vue, **/*.ts, components/**/*
type: "agent_requested"
---

# Vue.js 最佳实践

## 组件结构

- 优先使用组合式API（Composition API）而非选项式API（Options API）
- 保持组件小巧且职责单一
- 合理集成TypeScript
- 实现严谨的props验证
- 规范声明emit事件
- 保持模板逻辑简洁

## 组合式API

- 合理使用ref与reactive
- 规范实现生命周期钩子
- 用组合式函数（Composables）封装可复用逻辑
- 保持setup函数简洁
- 规范使用计算属性（computed）
- 实现合理的监听器（watchers）

## 状态管理

- 使用Pinia进行状态管理
- 保持存储模块化
- 规范状态组合方式
- 实现合理的actions
- 规范使用getters
- 正确处理异步状态

## 性能优化

- 合理使用组件懒加载
- 实现有效缓存策略
- 规范使用计算属性
- 避免不必要的监听器
- 合理选择v-show与v-if
- 规范管理key值

## 路由管理

- 正确使用Vue Router
- 实现规范的导航守卫
- 规范使用路由元信息（meta字段）
- 正确处理路由参数
- 实现组件懒加载
- 规范使用导航方法

## 表单处理

- 合理使用v-model双向绑定
- 实现严谨的表单验证
- 规范处理表单提交
- 显示合理的加载状态
- 实现完善的错误处理
- 规范表单重置逻辑

## TypeScript集成

- 规范定义组件类型
- 实现严谨的props类型
- 规范声明emit事件类型
- 处理合理的类型推断
- 规范组合式函数类型
- 实现严谨的存储类型

## 测试规范

- 编写规范的单元测试
- 实现严谨的组件测试
- 正确使用Vue Test Utils
- 规范测试组合式函数
- 实现有效的模拟（Mocking）
- 测试异步操作

## 通用最佳实践

- 遵循Vue风格指南
- 使用规范的命名约定
- 保持组件组织有序
- 实现完善的错误处理
- 规范事件处理逻辑
- 文档化复杂逻辑

## 构建与工具链

- 使用Vite作为开发工具
- 配置合理的构建设置
- 规范环境变量管理
- 实现有效的代码分割
- 规范资源处理方式
- 配置合理的优化策略

## CSS样式要求

- 所有样式必须使用UnoCSS框架生成，禁止直接编写原生CSS代码
