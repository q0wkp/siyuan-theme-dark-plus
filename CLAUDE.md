# CLAUDE.md — SiYuan Theme Dark+

## 项目概述

这是思源笔记 (SiYuan Note) 的 **Dark+** 多功能双模式主题 (v3.1.3)，作者 Zuoqiu Yingyi、q0wkp。
支持 dark/light 双模式，最低要求思源 v3.8.3。

## 项目结构

```
├── theme.json          # 主题元数据（版本、语言、模式）
├── theme.js            # JS 入口：初始化 window.theme，加载所有功能模块
├── theme.css           # 样式入口：通过 @import url() 导入所有 CSS 模块
├── style/
│   ├── config/
│   │   ├── config.css       # 全局 CSS 自定义属性（200+），Office 标准/主题色
│   │   ├── dark.css         # 暗色模式配色
│   │   └── light.css        # 亮色模式配色
│   ├── module/              # 87+ 样式模块（纯 CSS）
│   │   ├── block-*.css      # 块级元素样式（代码块、表格、列表等）
│   │   ├── span-*.css       # 行内元素样式（链接、标记、标签等）
│   │   ├── custom-*.css     # 自定义块属性样式（看板、字体、弹幕等）
│   │   ├── panel-*.css      # 面板样式（大纲、书签、反链等）
│   │   ├── hover-*.css      # 悬浮预览/菜单样式
│   │   ├── icon-*.css       # 图标样式
│   │   └── ...              # 其他 UI 组件（dialog, tab-bar, bar, card 等）
│   └── dynamic-module/      # 动态样式（列表缩进线、竖向标签栏等）
├── script/
│   ├── module/              # 功能模块
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
│   │   └── wheel.js         # 鼠标滚轮处理
│   └── utils/               # 工具库
│       ├── api.js           # 思源 API 封装（/api/* 请求）
│       ├── dom.js           # DOM 操作
│       ├── drag.js          # 拖拽
│       ├── event.js         # 事件管理
│       ├── hotkey.js        # 快捷键处理
│       ├── listener.js      # 监听器管理
│       ├── misc.js          # 合并、比较等杂项
│       ├── string.js        # 字符串工具（版本号比较等）
│       ├── system.js        # 系统检测
│       └── ui.js            # UI 辅助函数
├── icon/                    # 域名 SVG 图标
├── fonts/                   # 自定义字体（Segoe UI Emoji）
├── image/                   # 背景图（dark/light 各一套）
├── app/                     # 独立应用（comment 评论组件）
└── static/                  # 静态资源
```

## 技术栈

- **样式**: 纯 CSS，无预处理器，直接编辑 `.css` 文件即可
- **脚本**: 原生 ES Module（无打包工具、无 npm）
- **无构建系统**: 修改后即生效，无需编译
- **版本缓存**: theme.css 中通过 URL 参数 `?v=版本号` 实现缓存控制

## 关键约定

### 样式修改

1. **直接编辑 CSS**: 所有样式文件都是纯 `.css`，直接修改即可
2. **新增样式模块**: 在 `style/module/` 下创建 `.css` 文件，然后在 `theme.css` 中添加 `@import url("style/module/xxx.css?v=版本号");`
3. **CSS 自定义属性**: 全局变量定义在 `style/config/config.css`，色彩变量分别在 `dark.css` 和 `light.css`
4. **自定义块属性样式**: 文件名格式 `custom-{属性名}.css`，通过 `[custom-{name}="value"]` 属性选择器匹配
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
- `theme.css` 中所有 `@import url()` 的 `?v=` 参数

## 用户自定义入口

- Following upstream v3.1.x, `/widgets/custom.css`, `custom-light.css` and `custom-dark.css` are no longer loaded;
  user overrides go into SiYuan code snippets. Personal styling lives in the theme itself
  (`style/config/*.css` and the fork's own commits).

## Syncing with upstream

- Remotes: `origin` is the fork (q0wkp), `upstream` is Zuoqiu-Yingyi. Merge with `git merge upstream/main`.
- Upstream rewrote its history in 2026 (the commits up to v2.0.4 were re-created without GPG signatures), so the
  fork's old history had no merge base with it. On 2026-10-24 the fork's own commits were rebased onto upstream's
  v2.0.4 commit 7ef0b4b (same tree as the old 9ad6363); the pre-fix state is kept in branch
  `bak/main-old`.
- User's rule for this merge: "我的修改你要保留的, 别让上游的把我的commit给改掉了" — on every conflict the fork's
  change wins; upstream changes are taken only where they do not touch the fork's edits. A check that works:
  `git diff -U0 <base> <fork-head>` must reverse-apply (`git apply -R --check --unidiff-zero`) to the merge result.
- Upstream still ships `.less` sources next to the compiled `.css`; the fork is CSS-only, so delete every `.less`
  the merge brings in (the `.css` counterparts already carry the change).
- User's decision (2026-10-24): the version number follows upstream ("对齐上游 3.1.3").
- `theme.json` i18n keys are `zh-CN` / `zh-TW` since upstream v3.x (formerly `zh_CN` / `zh_CHT`).
- The package is named `Dark+Modified` (user's decision, 2026-10-24: a name of its own, installed with git), so the
  marketplace never offers the official Dark+ as an update over it. SiYuan v3.8.8 marks a theme invalid
  (`name-mismatch`) unless `theme.json` `name` equals its folder name; keep `name` free of spaces and parentheses,
  since CSS uses it in unquoted `url()`. Upstream hard-codes `/appearance/themes/Dark+/`: after every merge run
  `grep -rl --include='*.css' --include='*.js' --include='*.html' '/appearance/themes/Dark+/' . | xargs sed -i
  's#/appearance/themes/Dark+/#/appearance/themes/Dark+Modified/#g'`.

## 多语言

- 支持 zh_CN、zh_CHT、en_US
- 注释中使用中文 + 英文双语（`中文说明 | English description`）
