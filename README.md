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

## 页面结构

```
/               首页：Hero + Explore the Lab 四入口 + Recent Lab Logs + 文章列表
/projects/      作品集（读 projects.yml）
/lablog/        实验日志时间轴（读 lablog.yml）
/timeline/      精选里程碑（读 timeline.yml）
/about/         全站总览：聚合以上三份数据，无独立内容
/archives/      归档    /categories/ 分类    /tags/ 标签
```

导航：`主页 | 实验室 ▼(项目/实验日志/时间线) | 文章 ▼ | 关于 | GitHub`；文章页与实验室页左上角悬停均可返回首页。

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
| `source/css/wyxlab.css` | 全部 WYX LAB 模块样式，统一 `.wyxlab-*` 命名空间；顶部定义设计 token（圆角 / 间距 / 阴影 / 过渡）；About 页有独立的封面暖色系和谐层 |
| `source/css/intro-animation.css` | 开场动画、深空封面与全站基调（历史遗留，勿动） |
| `source/js/wyxlab.js` | 首页 Hero 文案注入、Explore 卡片、侧栏卡片点击跳 About、导航"返回首页"注入（均带 PJAX 幂等保护） |
| `source/js/wyx-effects.js` | 开场动画与粒子背景（历史遗留） |

通过 Butterfly 的 `inject` 注入（`themes/butterfly/_config.yml`）。**修改 wyxlab.css / wyxlab.js 后必须同步 bump 对应 `?v=` 版本号**，否则访客浏览器命中旧缓存。

## 本地开发

```bash
npm install
npm run server    # http://localhost:4000
npm run clean     # 清缓存（改 scripts/ 下插件后必须 clean，db 缓存会复用旧 HTML）
npm run build     # 生成到 public/
```

部署：`deploy.type` 当前为空，产物在 `public/`，按现有发布方式推送即可。

## 注意事项

- 数据文件中的日期必须加引号（`"2026-09-06"`），避免 YAML 自动转 Date
- 项目状态枚举：`In Progress | Completed | Maintaining | Paused`；日志状态：`completed | progress | note`
- `project` 字段须与 `projects.yml` 中 `name` 完全一致才会渲染为可点击芯片
- 所有 YAML 文本输出前经 HTML 转义；`link` 仅接受 http(s)/站内路径，`javascript:` 等协议会被丢弃
