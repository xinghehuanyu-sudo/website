# WYX LAB 内容维护指南

给维护者（未来的我）看的规则文档。只回答一个问题：**新内容应该放在哪里。**

数据文件位置：`source/_data/projects.yml` / `lablog.yml` / `timeline.yml`。About 页自动聚合这三份数据，**永远不要手动往 About 里搬内容**。

---

## 一、模块定位

| 模块 | 定位 | 特点 |
|---|---|---|
| **Posts 正式文章** | 完整科研总结、论文解读、技术教程、长篇思考 | 有独立 permalink，可被搜索/归档/分类/引用 |
| **Projects** | 长期存在的东西：科研课题、实验装置、软件工具、网站 | 只记"作品"，一次小更新不算项目 |
| **Lab Log** | 今天发生了什么：实验进展、参数调整、模型迭代、短阅读记录、网站改动 | 短、频繁、过程型，单条 1~3 句 |
| **Timeline** | 一年后回头看仍值得保留的节点：项目启动、关键版本、投稿、接收、获奖 | 人工精选，milestone-only |
| **About** | 全站总览入口 | 纯聚合，无独立内容 |

Research / Notes / Life 不是独立模块，而是**文章的内容域**（分类维度）。

## 二、内容域划分

- **Research**：手性、光学、光谱、COMSOL、科研记录、论文阅读、学术方法。核心在回答科研问题 → Research。
- **Notes**：AI 工具（Codex/OpenCode）、软件教程、编程、环境配置、学习方法。核心在"教怎么做" → Notes。
- **Life**：摄影、旅行、校园、随笔、观察、非科研思考。

> ⚠️ 现状与目标：站点目前实际分类是中文的（教程 / 学习 / 随笔 / 日常），首页入口暂时指向 `/tags/手性光/`、`/categories/教程/`、`/categories/随笔/`。长期目标是建立 Research / Notes / Life 三个分类并让入口直达分类页。**在迁移完成前，新文章请沿用现有中文分类中最接近的一个**，不要为对齐文档而擅自改分类体系。

## 三、决策树

```
发生了什么事？
├─ 是"长期存在的东西"？ ────────────→ Projects 建档
├─ 只是这几天的进展？ ──────────────→ Lab Log
├─ 是真正的里程碑？ ───────────────→ Timeline
└─ 值得写成完整可独立阅读的文章？ ──→ Post
     └─ 按内容域选分类：科研→Research；教程→Notes；生活→Life
```

## 四、一件事出现在多个模块时

**同一件事可以分层出现，但每层职责不同，禁止复制粘贴同一段文字。**

以 "COMSOL V3 完成" 为例：

- Lab Log：2~3 句当天进展；
- Timeline：仅当 V3 是关键版本，一句话节点记录；
- Post：内容攒够了再写《COMSOL V3 建模与验证总结》长文；
- Projects：只更新该项目 `status` / 补 `article` 链接，不写正文。

## 五、具体案例归档

| # | 事件 | 主位置 | 同时出现 | 理由 |
|---|---|---|---|---|
| 1 | 看完一篇手性光论文 | Lab Log | — | 短记录，未成文 |
| 2 | 完整论文解读 | Post/Research | 项目补 article 链接 | 独立阅读价值 |
| 3 | COMSOL 改一个参数 | Lab Log | — | 琐碎过程 |
| 4 | COMSOL V3 全部验证通过 | Lab Log | Timeline（关键版本）| 过程+节点分层记 |
| 5 | 首次搭建成功实验装置 | Timeline | Projects 更新状态 | 里程碑级 |
| 6 | 写一个独立网页小工具 | Projects | 值得讲则写 Post/Notes | 长期作品 |
| 7 | 修 WYX LAB 小 bug | Lab Log | — | 过程型 |
| 8 | 网站重大新版本 | Timeline | Projects 状态、Lab Log | 里程碑+作品 |
| 9 | Codex 使用教程 | Post/Notes | — | 教怎么做 |
| 10 | 一组摄影作品 | Post/Life | — | 有独立观赏价值 |
| 11 | 生活随笔 | Post/Life | — | 非科研思考 |
| 12 | 项目投稿 SCI | Timeline | Projects 状态 | 重要节点 |
| 13 | 论文被接收 | Timeline | 之后可写 Post/Research | 成果节点 |
| 14 | 比赛获奖 | Timeline | — | Achievement |
| 15 | 买新设备并测试 | Lab Log | 装好可用后 Timeline | 先过程后节点 |

## 六、文章 Front Matter 建议

迁移到英文分类后：

```yaml
# Research      categories: [Research]  tags: [Chirality, Optics, COMSOL]
# Notes         categories: [Notes]     tags: [AI, Codex, Tutorial]
# Life          categories: [Life]      tags: [Photography]
```

现阶段对应关系：Research≈教程/学习里的科研文，Notes≈教程，Life≈随笔/日常。

## 七、Projects 规则

- **新建**：持续数月的课题 / 可交付的工具或网站 / 独立装置。
- **只更新**：已有项目的状态（`In Progress → Completed`）、补 tags、`image`、`article`、`github`、`demo` 链接。
- **不建**：单次实验、参数扫描、一篇教程（那是 Post，可在项目里挂链接）。

## 八、Lab Log 规则

一条 = 1 个短标题 + 1~3 句 + 少量 tags +（可选）project / link / status（`completed | progress | note`）。超过 5 句的内容请改写成 Post，Lab Log 里只留一句 + link。

## 九、Timeline 门槛

**一年后回看是否仍值得保留。** 是 → 记；否 → 留在 Lab Log。日期支持 `2026-09-06` / `2026-09` / `2026` 三种精度（YAML 中必须加引号）。

## 十、命名风格

- Project：稳定的正式名，如 `Chiral Molecule Detection`
- Lab Log：当下的事实句，如 `COMSOL V3 validation passed`
- Timeline：节点化表述，如 `COMSOL optical model V3 completed`
- Post：可读标题，如 `COMSOL V3：手性光传播模型的建模与验证`

同一件事在不同模块**标题应当不同**——它们本来就不是同一篇内容。

## 十一、发布流程

1. 事情发生 → 先写 Lab Log（30 秒）；
2. 自问："一年后还重要吗？" → 是则加 Timeline 节点；
3. 属于某项目 → 检查 projects.yml 状态是否需要更新；
4. 同类记录攒够一篇长文 → 写 Post，回填 Lab Log / Timeline 的 `link`。

## 十二、常见误判

- **把 Lab Log 写成长文**：超过 5 句就该拆成 Post，日志只留一句加链接。
- **给小工具重复建项目**：同一主题优先更新已有条目，不要新开一份。
- **Timeline 塞日常**：参数调整、普通提交、日常阅读都不够格；拿不准就不进。
- **About 手动加内容**：About 全部来自三份数据源的自动聚合，改数据不改页面。
- **正文复制多处**：里程碑、日志、文章、项目各自只保留自己视角的一段话，用 link / article 字段互链。
- **为对齐英文分类乱改现有文章**：分类迁移是独立任务，日常维护沿用现状。

## 十三、速查表

| 内容 | 位置 |
|---|---|
| 日常实验/学习/网站进展 | Lab Log |
| 完整科研总结 | Post / Research |
| 长期课题与作品 | Projects |
| 重大节点（版本/投稿/接收/获奖） | Timeline |
| 技术教程 | Post / Notes |
| 摄影与生活 | Post / Life |
| 全站总览 | About（自动聚合，勿手填） |

## 十四、操作手册：每个部分具体怎么加内容

通用流程：**改文件 → `npx hexo clean && npx hexo generate` → `npx hexo server` 本地确认 → 按现有方式部署**（仓库 `deploy.type` 为空，产物在 `public/`）。数据文件（_data/*.yml）和文章的改动不需要动任何代码或版本号。

### 1. 正式文章 Posts

```bash
npx hexo new "文章标题"        # 生成 source/_posts/文章标题.md
```

编辑生成的文件，front matter 参考：

```yaml
---
title: COMSOL V3：手性光传播模型的建模与验证
date: 2026-10-01 12:00:00
categories:
  - 学习            # 现阶段用中文分类：教程/学习/随笔/日常（随笔下有"深度思考"子分类）
tags:
  - Chirality
  - COMSOL
cover: /img/cover-post.webp   # 可选；自定义配图放 source/img/，用 /img/xxx 路径
description: 摘要，用于首页文章列表
---
```

-  permalink 固定为 `/post/标题/`，中文标题可直接用；
-  写完后无需注册——文章自动出现在首页列表、归档、分类、标签、站内搜索。

### 2. Projects

编辑 `source/_data/projects.yml`，**在文件末尾追加**一段（顺序无所谓，渲染时自动分组排序）：

```yaml
- name: New Instrument            # 必填，唯一标识
  subtitle: 新型偏振调制装置
  description: 一两句话简介。
  status: In Progress             # In Progress | Completed | Maintaining | Paused
  started: 2027
  tags: [Optics, MCU]
  image: /img/projects/instrument.webp   # 可留空，自动显示占位波形
  article:                          # 关联正式文章的完整路径，如 /post/xxx/；留空无按钮
  github:                           # 留空无按钮；外链自动 noopener
  demo:
  featured: true                    # 是否重点展示（About 页也只读 featured/status）
```

改完即生效于 `/projects/` 与 About 的 Featured / Currently（`featured + In Progress` 会出现在 Researching，`featured + Maintaining` 出现在 Building）。

### 3. Lab Log

编辑 `source/_data/lablog.yml`，追加：

```yaml
- date: "2026-09-10"          # 必须加引号，保持字符串
  title: Optical setup alignment test
  content: 完成第一轮光路对准与偏振片安装测试。   # 1~3 句
  type: 实验                   # 科研|实验|仿真|阅读|开发|网站|笔记
  tags: [Optics, Polarization]
  project: Chiral Molecule Detection   # 留空则不显示；须与 projects.yml 的 name 一致
  link:                        # 关联文章/页面，留空则无按钮
  status: progress             # completed | progress | note | 留空
```

按日期倒序追加可读性最好（渲染本来就会自动排序）。首页 Recent Lab Logs 自动取最新 3 条，**不要**去 `source/js/wyxlab.js` 里另写日志。

### 4. Timeline

编辑 `source/_data/timeline.yml`，追加：

```yaml
- date: "2026-10"              # 支持 YYYY-MM-DD / YYYY-MM / YYYY，必须加引号
  title: First optical setup completed
  description: 完成第一版偏振光谱实验装置搭建。
  category: 科研               # 科研|项目|学习|网站|成就
  project: Chiral Molecule Detection
  link: /post/xxx/             # 可指向文章/Lab Log/Projects/外链，留空无按钮
  image:                       # 留空不占位；有图则自动 lazy loading
  milestone: true              # 只有真正的节点才设 true
```

### 5. About

**无日常操作。** 所有内容自动来自上面三份数据源。仅当要改固定文案时：Profile 文本、兴趣标签、Explore 入口在 `scripts/wyxlab-about.js` 顶部的 `PROFILE` / `INTERESTS` / `EXPLORE` 常量；改完照例 clean + generate。

### 6. 首页 Hero 与四张入口卡

- 中文副标题：`themes/butterfly/_config.yml` → `subtitle.sub`；
- 英文 tagline / 关键词 / 四张卡片（标题、说明、图标、href）：`source/js/wyxlab.js` 顶部常量与 `CARDS` 数组；
- **改了 wyxlab.css / wyxlab.js 后，必须把 `_config.yml` 里 inject 对应的 `?v=` 版本号 +1**（如 `v=20260906-links`），否则访客浏览器会命中旧缓存；纯数据文件改动不需要。

### 7. 导航

`themes/butterfly/_config.yml` → `menu:`。普通项 `名称: /路径/ || fas fa-xxx`；下拉为 `名称||fas fa-xxx:` + 缩进子项（参考现有 Lab / 文章）。图标只用 Font Awesome 6 free 已有的类名。

### 8. 快速自查

生成后重点确认：新页面/新卡片链接 200；深色模式与手机端（390px）无异常；Lab Log/Timeline 的 `project`、`link`、`image` 留空处没有多余按钮或空图。
