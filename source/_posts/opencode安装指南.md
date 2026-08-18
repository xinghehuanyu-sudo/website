---
title: OpenCode 新手安装与上手指南
date: 2026-08-11 10:00:00
description: 从环境准备、安装与模型配置，到第一次运行和安全使用，用一篇文章快速完成 OpenCode 入门。
tags:
  - OpenCode
  - AI
  - 安装教程
categories:
  - 教程
---

## OpenCode 是什么？

一句话概括：**OpenCode 是运行在终端里的 AI 编程助手。**

它可以阅读项目、解释代码、修复问题、生成代码、执行命令、编写测试，也能配合 Git 完成小步修改。它的使用方式与 Claude Code 等终端编程助手相似，但更加开放，也便于按需切换模型。

如果你第一次接触这类工具，可以先把它理解成一位“住在终端里的结对程序员”：你负责提出目标和把关，它负责阅读、分析与执行。

---

## 一、安装前需要准备什么

| 准备项 | 说明 |
|---|---|
| 终端 | macOS 用 Terminal/iTerm2；Linux 自带终端；Windows 推荐 WSL2 + Windows Terminal |
| AI 模型 Key | 至少准备一个；可使用 Anthropic、OpenAI 或 OpenRouter 等服务 |
| Git | `git --version` 确认已安装，没装就 `brew install git` 或 `sudo apt install git` |
| 一个测试项目 | 不建议第一次就在重要项目里尝试，先建一个空目录熟悉流程 |

> Windows 用户建议优先使用 WSL2 Ubuntu，通常能获得更一致的终端体验和更好的兼容性。

---

## 二、安装 OpenCode

### macOS / Linux（推荐）

```bash
curl -fsSL https://opencode.ai/install | bash
exec $SHELL -l
opencode --version   # 看到版本号即成功
```

> 如果出现 `command not found`，可以把安装路径加入 PATH：
> ```bash
> echo 'export PATH="$HOME/.opencode/bin:$PATH"' >> ~/.zshrc
> source ~/.zshrc
> ```

### macOS 也可以用 Homebrew

```bash
brew install sst/tap/opencode
```

### Windows（WSL2 路径）

在管理员 PowerShell 中执行 `wsl --install`，重启后进入 Ubuntu，再按照上面的 macOS/Linux 步骤安装即可。

### 其他方式

- **npm**：`npm install -g opencode-ai`（需 Node.js 20+）
- **Scoop**（Windows 原生）：`scoop install opencode`
- **Docker**：适合服务器或需要隔离运行环境的场景

---

## 三、配置模型 Key

安装完成后，还需要为 OpenCode 配置可用的模型服务。

### 方式一：环境变量（最常用）

```bash
# Anthropic
export ANTHROPIC_API_KEY="你的Key"

# 或 OpenAI
export OPENAI_API_KEY="你的Key"

# 或 OpenRouter（推荐新手，一个 Key 用多模型）
export OPENROUTER_API_KEY="你的Key"
```

如果希望配置长期生效，可以将对应命令写入 `~/.zshrc` 或 `~/.bashrc`，然后重新加载终端配置。

### 方式二：配置文件

在项目根目录创建 `opencode.json`：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5"
}
```

如果不确定模型名称，可以启动 OpenCode 后输入 `/models` 查看可用列表。

### 使用本地模型

如果希望在本地运行模型，可以先安装 [Ollama](https://ollama.com/)，再拉取一个代码模型：

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

进入 TUI 界面后，可以依次尝试：

1. **`/init`** —— 生成 `AGENTS.md`，记录项目的基本信息与协作规则
2. **`请解释这个项目的结构`** —— 先让 AI 阅读并理解代码
3. **`帮我修改 index.js，让它输出 Hello OpenCode`** —— 体验一次小范围代码修改

> 刚开始使用时，建议保留修改和命令执行前的确认步骤。先看懂它准备做什么，再决定是否继续。

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

- **先理解，再动手**：先让 AI 阅读代码、解释结构，不要一开始就做大范围修改
- **保持任务具体**：例如“只修改 `src/auth/login.ts` 的跳转逻辑”，比“重写整个项目”更容易得到可控结果
- **先确认计划**：可以输入“请先给出修改计划，不要直接改代码”，确认方向后再执行
- **修改后及时验证**：运行测试、构建或静态检查，不要只看代码表面是否合理
- **借助 Git 留下退路**：新建分支后再修改，并通过 `git diff` 检查变化，确认无误后提交

---

## 七、安全提醒

- **不要把 API Key 写进代码或提交到 Git**，优先使用环境变量或安全的密钥管理方式
- 在来源不明的项目中，不要直接允许 AI 执行未经检查的命令
- 修改重要项目之前，先提交当前状态或创建独立分支
- 不要让 AI 在缺少审核的情况下直接修改生产配置或操作生产数据库

---

## 八、常见问题

| 问题 | 解决 |
|---|---|
| `command not found: opencode` | 重开终端，或检查 PATH 是否包含 `~/.opencode/bin` |
| npm 报 `EACCES` 权限错误 | 别用 `sudo`，装 nvm 管理 Node |
| 提示没有模型 / 未认证 | `env \| grep API_KEY` 检查 Key 是否生效 |
| 401 / 403 错误 | Key 复制错了、过期了、或 provider 选错了 |
| 网络超时 | 设置代理 `export https_proxy=http://127.0.0.1:7890`，或改用本地 Ollama |
| AI 改坏了代码 | 先用 `git diff` 检查变化，再用 `git restore <文件>` 按需恢复 |

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

OpenCode 的入门流程可以归纳为四步：**安装 → 配置模型 → 进入项目 → 启动**。

新手最推荐路径：

> **官方脚本安装 + 可用的模型服务 + 一个小型测试项目**

不必一开始就研究所有配置。先让它在测试项目中完成一次小修改，熟悉交互方式，再逐步引入真实工作流，会更轻松也更安全。
