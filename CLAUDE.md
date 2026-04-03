# CLAUDE.md — SiYuan Theme Dark+

## 项目概述

这是思源笔记 (SiYuan Note) 的 **Dark+** 多功能双模式主题 (v2.0.4)，作者 Zuoqiu Yingyi。
支持 dark/light 双模式，最低要求思源 v3.1.17。

## 项目结构

```
├── theme.json          # 主题元数据（版本、语言、模式）
├── theme.js            # JS 入口：初始化 window.theme，加载所有功能模块
├── theme.less          # 样式入口：通过 .import-module() 导入所有 CSS 模块
├── theme.css           # 编译后的 CSS（由 theme.less 生成）
├── style/
│   ├── config/
│   │   ├── config.less/css  # 全局 CSS 自定义属性（200+），Office 标准/主题色
│   │   ├── dark.less/css    # 暗色模式配色
│   │   └── light.less/css   # 亮色模式配色
│   ├── module/              # 87+ 样式模块（每个 .less 对应一个 .css）
│   │   ├── block-*.css      # 块级元素样式（代码块、表格、列表等）
│   │   ├── span-*.css       # 行内元素样式（链接、标记、标签等）
│   │   ├── custom-*.css     # 自定义块属性样式（看板、字体、弹幕等）
│   │   ├── panel-*.css      # 面板样式（大纲、书签、反链等）
│   │   ├── hover-*.css      # 悬浮预览/菜单样式
│   │   ├── icon-*.css       # 图标样式
│   │   └── ...              # 其他 UI 组件（dialog, tab-bar, bar, card 等）
│   └── dynamic-module/      # 动态样式（列表缩进线、竖向标签栏等）
├── script/
│   ├── module/              # 19 个功能模块
│   │   ├── background.js    # 背景图加载
│   │   ├── blockattrs.js    # 块属性处理
│   │   ├── config.js        # 主题配置管理
│   │   ├── defaultattrs.js  # 默认块属性注入（MutationObserver）
│   │   ├── doc.js           # 文档操作
│   │   ├── dock.js          # 停靠栏
│   │   ├── fullscreen.js    # 全屏模式
│   │   ├── goto.js          # 导航
│   │   ├── html.js          # HTML 块处理
│   │   ├── invert.js        # 反色模式
│   │   ├── location.js      # 浏览位置记录
│   │   ├── menu.js          # 右键菜单增强
│   │   ├── readonly.js      # 只读模式
│   │   ├── reload.js        # 重载
│   │   ├── style.js         # 动态样式注入
│   │   ├── timestamp.js     # 时间戳功能
│   │   ├── typewriter.js    # 打字机模式
│   │   ├── wheel.js         # 鼠标滚轮处理
│   │   └── window.js        # 窗口管理（已标记 @deprecated）
│   └── utils/               # 11 个工具库
│       ├── api.js           # 思源 API 封装（/api/* 请求）
│       ├── dom.js           # DOM 操作
│       ├── drag.js          # 拖拽
│       ├── event.js         # 事件管理
│       ├── hotkey.js        # 快捷键处理
│       ├── listener.js      # 监听器管理
│       ├── markdown.js      # Markdown 处理
│       ├── misc.js          # 合并、比较等杂项
│       ├── string.js        # 字符串工具（版本号比较等）
│       ├── system.js        # 系统检测
│       └── ui.js            # UI 辅助函数
├── icon/                    # 3790+ 域名 SVG 图标
├── fonts/                   # 自定义字体（Segoe UI Emoji）
├── image/                   # 背景图（dark/light 各一套）
├── app/                     # 独立应用（comment 评论组件等）
└── static/                  # 静态资源
```

## 技术栈与构建

- **样式**: LESS → CSS，源文件和编译产物并存于仓库
- **脚本**: 原生 ES Module（无打包工具、无 npm）
- **无构建系统**: 直接编辑 .less/.js 文件即可；LESS 文件需手动编译为同名 .css
- **版本缓存**: URL 参数 `?v=版本号` 实现缓存控制

## 关键约定

### 样式修改

1. **同时修改 .less 和 .css**: 每个样式模块都有 `.less`（源）和 `.css`（产物）两个文件，修改时两者都要更新
2. **新增样式模块**: 在 `style/module/` 下创建 `.less` + `.css`，然后在 `theme.less` 中添加 `.import-module()` 调用
3. **CSS 自定义属性**: 全局变量定义在 `style/config/config.less`，色彩变量分别在 `dark.less` 和 `light.less`
4. **自定义块属性样式**: 文件名格式 `custom-{属性名}.less/css`，通过 `[custom-{name}="value"]` 属性选择器匹配
5. **主题模式**: 通过 `html[data-theme-mode="dark"]` / `html[data-theme-mode="light"]` 区分

### 脚本修改

1. **入口**: `theme.js` 初始化 `window.theme` 全局对象，然后 `import()` 加载各模块
2. **模块加载**: 使用动态 `import()` + `window.theme.addURLParam()` 加载，支持缓存控制
3. **生命周期**: `window.destroyTheme()` 负责清理（移除 DOM 元素、解绑事件监听器）
4. **事件清理**: 通过 `window.theme.addEventListener()` 注册的监听器会在主题销毁时自动移除
5. **思源 API**: `script/utils/api.js` 封装了 `/api/*` 请求，模块间通过 `window.theme` 共享状态
6. **客户端模式**: `window.theme.clientMode` 区分 app / desktop / mobile / window

### 命名规范

- 样式模块按功能域命名：`block-*`（块）、`span-*`（行内）、`custom-*`（自定义属性）、`panel-*`（面板）、`hover-*`（悬浮）、`icon-*`（图标）
- JS 模块按功能命名，工具函数放 `script/utils/`

### 版本更新

修改版本号时需同步更新：
- `theme.json` 中的 `version` 字段
- `theme.less` 中的 `@theme-version` 变量

## 用户自定义入口

- 样式覆盖: `<工作空间>/data/widgets/custom.css`（被 theme.less 最后导入）
- 模式样式: `custom-light.css` / `custom-dark.css`（在 theme.js 中按模式加载）

## 多语言

- 支持 zh_CN、zh_CHT、en_US
- 注释中使用中文 + 英文双语（`中文说明 | English description`）
