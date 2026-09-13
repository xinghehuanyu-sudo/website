# WYX LAB

> Personal Digital Lab — 在物理、代码与生活之间做一些实验。

个人数字实验室站点：不只是博客，同时承载项目作品集（Projects）、实验日志（Lab Log）、成长里程碑（Timeline）与全站总览（About）。

- 线上地址：<https://wyxlab.top>
- 内容维护规则：见 [WYXLAB_CONTENT_GUIDE.md](./WYXLAB_CONTENT_GUIDE.md)

## 技术栈

| 项 | 说明 |
|---|---|
| 静态生成 | Hexo 8 |
| 主题 | Butterfly 5.7（未修改主题源码，仅改 `_config.yml` 配置） |
| 自定义渲染 | 构建期 Hexo tag 插件（`scripts/`），无运行时数据请求 |
| 数据源 | `source/_data/*.yml`（单一数据源，多处消费） |
| 视觉特效 | 深空 WebGL 封面 / 粒子背景 / 卡片聚光跟随（均可一键关闭，见"动态效果开关"） |

## 页面结构

```
/               首页：Hero + Explore the Lab 四入口 + Recent Lab Logs + 文章列表
/projects/      作品集（读 projects.yml）
/lablog/        实验日志时间轴（读 lablog.yml）
/timeline/      精选里程碑（读 timeline.yml）
/about/         全站总览：聚合以上三份数据，无独立内容
/archives/      归档    /categories/ 分类    /tags/ 标签
```

导航：`主页 | 实验室 ▼(项目/实验日志/时间线) | 文章 ▼ | 关于 | GitHub`；文章页与实验室页左上角悬停均可返回首页。顶栏菜单项间距在 `wyxlab.css` 覆盖为 26px（主题默认 14px）。

首页入口当前指向：科研 → `/tags/手性光/`、项目 → `/projects/`、笔记 → `/categories/教程/`、生活 → `/categories/随笔/`（分类体系迁移到英文 Research/Notes/Life 是长期目标，见内容指南）。

## 数据驱动内容

新增内容**只改数据文件，不改页面代码**：

| 文件 | 用途 | 消费方 |
|---|---|---|
| `source/_data/projects.yml` | 项目作品集 | `/projects/`、About（Currently / Featured） |
| `source/_data/lablog.yml` | 实验日志 | `/lablog/`、首页 Recent Lab Logs（最新 3 条） |
| `source/_data/timeline.yml` | 里程碑节点 | `/timeline/`、About（Latest Milestone） |

渲染由构建期插件完成（输出纯静态 HTML，SEO 友好）：

```
scripts/
├── wyxlab-projects.js   {% wyxlab_projects %}
├── wyxlab-lablog.js     {% wyxlab_lablog %} + 首页日志区 after_render 注入
├── wyxlab-timeline.js   {% wyxlab_timeline %}（支持 2026 / 2026-09 / 2026-09-06 三种日期精度）
├── wyxlab-about.js      {% wyxlab_about %}（聚合三份数据）
└── wyxlab-index.js      自定义首页分页（第 1 页 5 篇，后续每页 6 篇）
```

## 自定义样式与脚本

| 文件 | 职责 |
|---|---|
| `source/css/wyxlab.css` | 全部 WYX LAB 模块样式，统一 `.wyxlab-*` 命名空间；顶部定义设计 token；含卡片聚光跟随、顶栏间距、移动端优化、动效开关规则；About 页有独立的封面暖色系和谐层 |
| `source/css/intro-animation.css` | 开场动画、深空封面与全站基调（历史遗留，勿动） |
| `source/js/wyxlab.js` | 首页 Hero 文案注入、Explore 卡片、侧栏卡片点击跳 About、导航"返回首页"注入、卡片聚光坐标跟踪、右侧栏"动态效果"开关按钮（均带 PJAX 幂等保护） |
| `source/js/wyx-effects.js` | 开场动画、深空 WebGL 封面、交互粒子与飘落粒子；boot 与 pjax 回调带 `motionOff()` 守卫（为动效开关新增，其余逻辑勿动） |

联系方式（GitHub / Email / QQ）在 `themes/butterfly/_config.yml` 的 `social:` 配置，QQ 使用官方 WPA 临时会话链接，显示于头部社交区与侧栏作者卡。

通过 Butterfly 的 `inject` 注入（`themes/butterfly/_config.yml`）。**修改 `wyxlab.css` / `wyxlab.js` / `wyx-effects.js` 后必须同步 bump 对应 `?v=` 版本号**，否则访客浏览器命中旧缓存；纯数据文件与文章改动不需要。

## 动态效果开关

右侧工具栏（齿轮展开）内的魔杖按钮，可整体关闭站内动效：

- **偏好存储**：浏览器 `localStorage['wyx-motion']`（`off` / `on`），不入库、不影响他人
- **生效机制**：`inject.head` 的内联脚本在 CSS 之前读取偏好并给 `<html>` 打 `data-wyx-motion='off'` 标记；`wyx-effects.js` 启动时检查该标记，跳过所有 canvas 特效初始化；`wyxlab.css` 负责隐藏视觉层。切换时页面刷新一次，保证 canvas 生命周期一致
- **关闭后停掉**：开场动画、深空 WebGL 封面（回退为静态海报）、交互粒子、飘落粒子、Hero 波形线、卡片聚光跟随、入场渐显
- **不受影响**：主题自带 hover 过渡、深色模式切换、PJAX 等基础交互；系统级 `prefers-reduced-motion` 由 wyx-effects.js 单独尊重，与此开关互不干扰

## 站点图标

- `source/img/favicon.svg`：GPT 风格六瓣旋转花（六重旋转对称，呼应"手性"主题），蓝渐变圆角底，无文字；主题配置 `favicon` 指向它
- `source/favicon.ico`：16/24/32/48/64 多尺寸 PNG-in-ICO，与 SVG 同设计，供旧浏览器与默认 `/favicon.ico` 请求回退

## 本地开发

```bash
npm install
npm run server    # http://localhost:4000
npm run clean     # 清缓存（改 scripts/ 下插件后必须 clean，db 缓存会复用旧 HTML）
npm run build     # 生成到 public/
```

部署：`deploy.type` 当前为空，产物在 `public/`，按现有发布方式推送即可。`.github/` 仅有 dependabot 配置，无 CI 部署流。

## 注意事项

- 数据文件中的日期必须加引号（`"2026-09-06"`），避免 YAML 自动转 Date
- 项目状态枚举：`In Progress | Completed | Maintaining | Paused`；日志状态：`completed | progress | note`
- `project` 字段须与 `projects.yml` 中 `name` 完全一致才会渲染为可点击芯片
- 所有 YAML 文本输出前经 HTML 转义；`link` 仅接受 http(s)/站内路径，`javascript:` 等协议会被丢弃
- 卡片聚光与触屏优化遵循 `@media (hover: hover) and (pointer: fine)` / `(hover: none)`，勿在移动设备上测试聚光效果
- 深空封面原始素材在 `assets-original/`（Wallpaper Engine 场景），`source/deepspace/` 为提取后的贴图，勿混放
