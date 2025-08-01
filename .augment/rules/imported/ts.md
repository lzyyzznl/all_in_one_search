---
description: 现代Web开发的TypeScript编码标准与最佳实践
globs: **/*.ts, **/*.tsx, **/*.d.ts
type: "agent_requested"
---

# TypeScript 最佳实践

## 类型系统

- 对象定义时优先使用接口（`interface`）而非类型别名（`type`）
- 联合类型、交叉类型及映射类型使用`type`声明
- 避免使用`any`，未知类型优先使用`unknown`
- 启用严格的TypeScript配置（`strict: true`）
- 善用TypeScript内置的工具类型（如`Partial`、`Readonly`、`Pick`等）
- 可复用的类型模式使用泛型（`generics`）实现

## 命名规范

- 类型名与接口名使用帕斯卡命名法（PascalCase，如`UserModel`）
- 变量与函数名使用小驼峰命名法（camelCase，如`userName`）
- 常量使用全大写下划线命名法（UPPER_CASE，如`MAX_RETRY_TIMES`）
- 使用描述性名称并搭配辅助动词（如`isLoading`表示加载状态，`hasError`表示错误状态）
- React组件props接口前缀统一为`Props`（如`ButtonProps`）

## 代码组织

- 类型定义尽量靠近其使用位置
- 共享类型通过独立类型文件导出（如`types/user.ts`）
- 使用索引导出（`index.ts`）统一管理文件导出
- 共享类型集中存放在`types`目录下
- 组件props与其组件文件放在一起（如`Button.tsx`中直接定义`ButtonProps`）

## 函数规范

- 公共函数显式声明返回类型（避免隐式`any`）
- 回调函数与方法使用箭头函数（保持`this`上下文一致性）
- 自定义错误类型实现精细化错误处理
- 复杂类型场景使用函数重载（`overloads`）
- 优先使用`async/await`而非Promise链

## 核心原则

- `tsconfig.json`中启用严格模式（`strict: true`）
- 不可变属性使用`readonly`修饰
- 使用可辨识联合类型（Discriminated Unions）保障类型安全
- 运行时类型检查使用类型守卫（`type guards`）
- 实现严谨的空值校验（避免`undefined`/`null`遗漏）
- 非必要不使用类型断言（`as`），优先通过类型守卫明确类型

## 错误处理

- 业务相关错误使用自定义错误类型（如`ApiError`、`ValidationError`）
- 可能失败的操使用`Result`类型封装（如`{ success: boolean; data?: T; error?: Error }`）
- 实现错误边界（Error Boundaries）捕获组件层异常
- `try-catch`块中使用类型化`catch`子句（明确捕获错误的类型）
- 正确处理Promise拒绝（`unhandledrejection`事件监听）

## 设计模式

- 复杂对象创建使用构建器模式（Builder Pattern）
- 数据访问层实现仓储模式（Repository Pattern）
- 对象创建使用工厂模式（Factory Pattern）
- 依赖管理采用依赖注入（Dependency Injection）
- 封装逻辑使用模块模式（Module Pattern）
