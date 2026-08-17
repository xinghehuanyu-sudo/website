---
title: OpenCode 新手安装部署与上手指南
date: 2026-08-11 10:00:00
tags:
  - OpenCode
  - AI
  - 安装教程
categories:
  - 教程
---

# OpenCode 新手安装与上手指南

## OpenCode 是什么？

一句话：**运行在终端里的 AI 编程助手**。

它能读你的代码、修 bug、生成代码、执行命令、写测试、配合 Git 做小步修改。类似 Claude Code，但开源、可自由切换模型。

---

## 一、安装前你需要准备什么

| 准备项 | 说明 |
|---|---|
| 终端 | macOS 用 Terminal/iTerm2；Linux 自带终端；Windows 推荐 WSL2 + Windows Terminal |
| AI 模型 Key | 至少一个，推荐 Anthropic 或 OpenRouter（一个 Key 可访问多模型） |
| Git | `git --version` 确认已安装，没装就 `brew install git` 或 `sudo apt install git` |
| 一个测试项目 | **别第一次就在重要项目里用**，先建个空目录练手 |

> Windows 用户强烈建议先装 WSL2 Ubuntu，体验和兼容性都更好。

---

## 二、安装 OpenCode

### macOS / Linux（最推荐）

```bash
curl -fsSL https://opencode.ai/install | bash
exec $SHELL -l
opencode --version   # 看到版本号即成功
```

> 如果提示 `command not found`，把安装路径加入 PATH：
> ```bash
> echo 'export PATH="$HOME/.opencode/bin:$PATH"' >> ~/.zshrc
> source ~/.zshrc
> ```

### macOS 也可以用 Homebrew

```bash
brew install sst/tap/opencode
```

### Windows（WSL2 路径）

管理员 PowerShell 执行 `wsl --install`，重启后进入 Ubuntu，然后按上面 macOS/Linux 的步骤装即可。

### 其他方式

- **npm**：`npm install -g opencode-ai`（需 Node.js 20+）
- **Scoop**（Windows 原生）：`scoop install opencode`
- **Docker**：适合服务器或隔离环境，文末有简要说明

---

## 三、配置模型 Key

装好 OpenCode 后，还得告诉它用哪个大模型。

### 方式一：环境变量（最常用）

```bash
# Anthropic
export ANTHROPIC_API_KEY="你的Key"

# 或 OpenAI
export OPENAI_API_KEY="你的Key"

# 或 OpenRouter（推荐新手，一个 Key 用多模型）
export OPENROUTER_API_KEY="你的Key"
```

写入 `~/.zshrc`（或 `~/.bashrc`）让它永久生效。

### 方式二：配置文件

在项目根目录创建 `opencode.json`：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5"
}
```

模型名不确定时，启动后输入 `/models` 查看可用列表。

### 想用本地模型（免费、离线）？

装好 [Ollama](https://ollama.com/)，拉个模型：

```bash
ollama pull qwen2.5-coder:14b
```

然后 `opencode.json` 这样写：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": { "baseURL": "http://localhost:11434/v1" },
      "models": {
        "qwen2.5-coder:14b": { "name": "Qwen 2.5 Coder 14B" }
      }
    }
  },
  "model": "ollama/qwen2.5-coder:14b"
}
```

---

## 四、第一次运行

```bash
mkdir ~/opencode-demo && cd ~/opencode-demo
git init
echo "console.log('hello')" > index.js
opencode
```

进入 TUI 界面后，依次试试：

1. **`/init`** — 生成 `AGENTS.md`，告诉 AI 项目的基本信息和规则
2. **`请解释这个项目的结构`** — 让 AI 先理解你的代码
3. **`帮我修改 index.js，让它输出 Hello OpenCode`** — 体验 AI 改代码

> 新手阶段建议保留每次修改的确认提示，别一上来就放开自动执行。

---

## 五、常用操作速查

| 操作 | 用法 |
|---|---|
| 查看帮助 | `/help` |
| 切换模型 | `/models` |
| 登录提供商 | `/connect` |
| 压缩上下文 | `/compact` |
| 撤销 AI 修改 | `/undo` |
| 引用文件 | `请解释 @src/index.ts` |
| 执行命令 | `!git status` |
| 退出 | `Ctrl + C` 或 `Ctrl + D` |

---

## 六、新手使用技巧

- **先理解，再动手**：先让 AI 读代码、解释结构，别一上来就大改
- **小步修改**：说"只修改 `src/auth/login.ts` 的跳转逻辑"，别说"重写整个项目"
- **先要计划**：输入"请先给出修改计划，不要直接改代码"，确认后再执行
- **改完跑测试**：让 AI 改完后顺手跑一遍测试
- **用 Git 分支**：`git checkout -b feat/test`，改完 `git diff` 看一眼，满意再提交

---

## 七、安全提醒

- **别把 API Key 写进代码或提交到 Git**，用环境变量管理
- 不可信项目里不要盲目允许 AI 执行命令
- 重要项目先 `git commit` 备份再让 AI 动手
- 不要在生产服务器上直接让 AI 改配置、操作数据库

---

## 八、常见问题

| 问题 | 解决 |
|---|---|
| `command not found: opencode` | 重开终端，或检查 PATH 是否包含 `~/.opencode/bin` |
| npm 报 `EACCES` 权限错误 | 别用 `sudo`，装 nvm 管理 Node |
| 提示没有模型 / 未认证 | `env \| grep API_KEY` 检查 Key 是否生效 |
| 401 / 403 错误 | Key 复制错了、过期了、或 provider 选错了 |
| 网络超时 | 设置代理 `export https_proxy=http://127.0.0.1:7890`，或改用本地 Ollama |
| AI 改坏了代码 | `git checkout .` 一键撤销，或 `git diff` 挑着恢复 |

---

## 九、升级与卸载

```bash
# 升级（官方脚本安装）
curl -fsSL https://opencode.ai/install | bash

# 卸载
rm -rf ~/.opencode
# 然后从 ~/.zshrc 里删掉对应的 PATH 行
```

---

## 总结

OpenCode 上手就四步：**安装 → 配 Key → 进项目 → 启动**。

新手最推荐路径：

> **官方脚本安装 + Anthropic / OpenRouter Key + 小测试项目**

别想太多，先跑起来，改一行代码试试手感，自然就熟了。