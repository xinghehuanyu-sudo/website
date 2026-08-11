
---

# 1. OpenCode 是什么？

OpenCode 是一个运行在终端里的 AI 编程助手 / AI Coding Agent，类似 Claude Code、Codex CLI 这类工具，但开源、可自配置模型。

它可以做这些事情：

- 阅读你的代码项目；
- 回答代码问题；
- 帮你修 bug；
- 生成代码；
- 执行命令；
- 重构项目；
- 写测试；
- 解释复杂代码；
- 配合 Git 做小步修改；
- 接入不同模型提供商，比如 Anthropic、OpenAI、OpenRouter、本地 Ollama 等。

简单理解：

> OpenCode = 终端里的 AI 程序员助手。

---

# 2. 安装前准备

在开始安装前，你需要准备以下内容。

---

## 2.1 操作系统要求

OpenCode 支持常见系统：

| 系统 | 支持情况 | 推荐程度 |
|---|---|---|
| macOS | 支持 | 推荐 |
| Linux | 支持 | 推荐 |
| Windows | 支持，但更推荐 WSL2 | Windows 用户建议用 WSL2 |

如果你是 Windows 用户，强烈建议先用 WSL2 安装 Ubuntu，然后在 Linux 环境里使用 OpenCode，体验更好，也少很多奇怪问题。

---

## 2.2 你需要准备一个终端

### macOS

可以使用：

- 自带 Terminal；
- iTerm2；
- Warp；
- VS Code 内置终端。

打开方式：

```bash
Command + 空格
```

输入：

```bash
Terminal
```

回车即可。

---

### Linux

直接打开你系统的终端即可。

常见终端：

- GNOME Terminal；
- Konsole；
- Alacritty；
- Kitty；
- WezTerm。

---

### Windows

推荐安装：

- Windows Terminal；
- PowerShell 7；
- WSL2 + Ubuntu。

如果你只是普通开发使用，推荐：

```text
Windows Terminal + WSL2 Ubuntu
```

---

## 2.3 你需要一个 AI 模型服务

OpenCode 本身只是客户端 / Agent 框架，它需要连接一个大模型。

你可以选择：

### 方案 A：Anthropic Claude

适合写代码，效果通常很好。

需要：

- Anthropic API Key；
- 或 Claude Pro / Max 订阅登录方式，具体以 OpenCode 当前版本支持为准。

官网：

```text
https://www.anthropic.com/
```

---

### 方案 B：OpenAI

需要 OpenAI API Key。

官网：

```text
https://platform.openai.com/
```

---

### 方案 C：OpenRouter

适合新手，因为一个 Key 可以访问很多模型。

官网：

```text
https://openrouter.ai/
```

优点：

- 一个账号可接很多模型；
- 可以按量付费；
- 对多模型切换友好。

---

### 方案 D：本地模型 Ollama

如果你不想联网调用 API，也不想付费，可以本地跑模型。

官网：

```text
https://ollama.com/
```

适合：

- 隐私敏感；
- 网络受限；
- 想免费体验；
- 有较好 CPU/GPU。

缺点：

- 本地小模型代码能力通常不如顶级云端模型；
- 配置稍微复杂一点；
- 对机器配置有要求。

---

## 2.4 推荐准备 Git

OpenCode 会修改你的代码，所以强烈建议你的项目使用 Git。

检查是否安装：

```bash
git --version
```

如果没有安装：

### macOS

```bash
xcode-select --install
```

或者用 Homebrew：

```bash
brew install git
```

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install git -y
```

### Fedora

```bash
sudo dnf install git -y
```

### Arch

```bash
sudo pacman -S git
```

---

## 2.5 建议准备一个测试项目

不要第一次就在重要项目里使用。

你可以新建一个测试目录：

```bash
mkdir opencode-demo
cd opencode-demo
git init
```

然后新建一个文件：

```bash
echo "console.log('hello opencode')" > index.js
```

后面我们会在这个目录里启动 OpenCode。

---

# 3. 选择安装方式

OpenCode 常见安装方式有：

| 安装方式 | 适用系统 | 推荐人群 |
|---|---|---|
| 官方安装脚本 | macOS / Linux | 最推荐 |
| Homebrew | macOS / Linux | macOS 用户推荐 |
| npm | 全平台 | 已有 Node.js 的用户 |
| Scoop | Windows | Windows 原生用户 |
| WSL2 + Linux 安装 | Windows | 最推荐的 Windows 方式 |
| Docker | 全平台 | 服务器、隔离环境、团队部署 |

下面分别详细讲。

---

# 4. macOS / Linux 安装 OpenCode

---

## 4.1 方式一：官方安装脚本，最推荐

打开终端，执行：

```bash
curl -fsSL https://opencode.ai/install | bash
```

这个脚本会自动下载适合你系统的 OpenCode 可执行文件。

---

### 安装完成后检查

重新打开一个终端，或者执行：

```bash
exec $SHELL -l
```

然后检查版本：

```bash
opencode --version
```

如果看到版本号，说明安装成功。

例如可能输出类似：

```text
opencode version x.x.x
```

---

### 如果提示 `command not found: opencode`

这通常是 PATH 没配置好。

先看看安装目录里有没有：

```bash
ls ~/.opencode/bin
```

如果里面有 `opencode`，把它加入 PATH。

如果你用 zsh，macOS 默认通常是 zsh：

```bash
echo 'export PATH="$HOME/.opencode/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

如果你用 bash：

```bash
echo 'export PATH="$HOME/.opencode/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

再检查：

```bash
opencode --version
```

---

## 4.2 方式二：Homebrew 安装

如果你使用 macOS，推荐 Homebrew。

先检查 Homebrew：

```bash
brew --version
```

如果没有安装 Homebrew，先安装：

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

然后安装 OpenCode：

```bash
brew install sst/tap/opencode
```

如果以后想升级：

```bash
brew upgrade opencode
```

检查：

```bash
opencode --version
```

---

## 4.3 方式三：npm 安装

如果你已经安装了 Node.js，可以用 npm。

检查 Node：

```bash
node -v
```

建议 Node.js 20 或更新版本。

检查 npm：

```bash
npm -v
```

安装：

```bash
npm install -g opencode-ai
```

检查：

```bash
opencode --version
```

---

### 如果 npm 安装报权限错误

例如：

```text
EACCES: permission denied
```

不建议简单粗暴 `sudo`，更推荐安装 nvm。

安装 nvm 后，再安装 Node.js：

```bash
nvm install --lts
nvm use --lts
```

然后重新安装：

```bash
npm install -g opencode-ai
```

---

# 5. Windows 安装 OpenCode

Windows 有两种主要方式：

1. 推荐：WSL2 + Ubuntu；
2. 原生 Windows：Scoop 或 npm。

---

## 5.1 最推荐：Windows 使用 WSL2

### 第一步：安装 WSL2

以管理员身份打开 PowerShell，然后执行：

```powershell
wsl --install
```

安装完成后重启电脑。

重启后会自动进入 Ubuntu 初始化，设置用户名和密码。

---

### 第二步：更新 Ubuntu

进入 Ubuntu 终端：

```bash
sudo apt update
sudo apt upgrade -y
```

---

### 第三步：安装 OpenCode

在 Ubuntu 里执行：

```bash
curl -fsSL https://opencode.ai/install | bash
```

重新加载 shell：

```bash
exec $SHELL -l
```

检查：

```bash
opencode --version
```

---

### Windows 下使用 WSL 的注意事项

建议把项目放在 Linux 文件系统里，例如：

```bash
~/projects/my-app
```

不要放在：

```text
/mnt/c/Users/你的用户名/项目
```

因为跨文件系统性能差，Git 和文件监听也可能慢。

创建项目目录：

```bash
mkdir -p ~/projects/demo
cd ~/projects/demo
```

---

## 5.2 Windows 原生安装：Scoop

如果你不想用 WSL2，可以用 Scoop。

---

### 第一步：安装 Scoop

打开 PowerShell，执行：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

然后：

```powershell
irm get.scoop.sh | iex
```

---

### 第二步：添加 OpenCode bucket

```powershell
scoop bucket add opencode https://github.com/sst/scoop-bucket.git
```

---

### 第三步：安装 OpenCode

```powershell
scoop install opencode
```

检查：

```powershell
opencode --version
```

---

## 5.3 Windows 原生安装：npm

如果你已经安装了 Node.js，也可以：

```powershell
npm install -g opencode-ai
```

然后检查：

```powershell
opencode --version
```

---

# 6. 配置模型 Key

安装完成后，还需要让 OpenCode 知道使用哪个模型。

常见方式有三种：

1. 交互式登录；
2. 环境变量；
3. 配置文件。

---

## 6.1 方式一：交互式登录，最适合新手

在终端执行：

```bash
opencode auth login
```

如果这个命令在你的版本里不可用，也可以先启动 OpenCode：

```bash
opencode
```

然后在 TUI 里输入：

```text
/connect
```

或：

```text
/models
```

根据提示选择模型提供商并登录。

不同版本界面可能略有差异，以当前版本提示为准。

---

## 6.2 方式二：使用环境变量

这是最常用、最稳妥的方式。

---

### Anthropic

```bash
export ANTHROPIC_API_KEY="你的AnthropicKey"
```

永久生效：

如果你用 zsh：

```bash
echo 'export ANTHROPIC_API_KEY="你的AnthropicKey"' >> ~/.zshrc
source ~/.zshrc
```

如果你用 bash：

```bash
echo 'export ANTHROPIC_API_KEY="你的AnthropicKey"' >> ~/.bashrc
source ~/.bashrc
```

---

### OpenAI

```bash
export OPENAI_API_KEY="你的OpenAIKey"
```

永久生效：

```bash
echo 'export OPENAI_API_KEY="你的OpenAIKey"' >> ~/.zshrc
source ~/.zshrc
```

---

### OpenRouter

```bash
export OPENROUTER_API_KEY="你的OpenRouterKey"
```

永久生效：

```bash
echo 'export OPENROUTER_API_KEY="你的OpenRouterKey"' >> ~/.zshrc
source ~/.zshrc
```

---

## 6.3 方式三：使用配置文件

OpenCode 支持项目级配置和全局配置。

常见配置文件：

```text
opencode.json
```

你可以把它放在项目根目录：

```text
你的项目/
├── opencode.json
├── package.json
├── src/
└── ...
```

也可以放在全局配置目录，例如：

```text
~/.config/opencode/opencode.json
```

---

### 配置 Anthropic 示例

项目根目录创建：

```bash
nano opencode.json
```

写入：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5"
}
```

然后配合环境变量：

```bash
export ANTHROPIC_API_KEY="你的AnthropicKey"
```

> 注意：模型名称可能随版本变化。如果不确定，启动 OpenCode 后使用 `/models` 查看可用模型。

---

### 配置 OpenAI 示例

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "openai/gpt-5"
}
```

配合：

```bash
export OPENAI_API_KEY="你的OpenAIKey"
```

---

### 配置 OpenRouter 示例

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "openrouter/auto"
}
```

或者指定具体模型，例如：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "openrouter/anthropic/claude-sonnet-4.5"
}
```

配合：

```bash
export OPENROUTER_API_KEY="你的OpenRouterKey"
```

如果不确定模型 ID，可以在 OpenRouter 网站模型页复制，或在 OpenCode 里使用：

```text
/models
```

---

# 7. 使用本地 Ollama 模型

如果你想完全本地运行，可以使用 Ollama。

---

## 7.1 安装 Ollama

官网：

```text
https://ollama.com/
```

macOS / Windows 可以直接下载安装包。

Linux 可以执行：

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

检查：

```bash
ollama --version
```

---

## 7.2 拉取一个模型

例如：

```bash
ollama pull qwen2.5-coder:14b
```

如果你的机器配置较低，可以试小一点的模型：

```bash
ollama pull qwen2.5-coder:7b
```

运行测试：

```bash
ollama run qwen2.5-coder:14b
```

能对话说明 Ollama 正常。

退出：

```text
/bye
```

---

## 7.3 在 OpenCode 里配置 Ollama

在项目里创建 `opencode.json`：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": {
        "baseURL": "http://localhost:11434/v1"
      },
      "models": {
        "qwen2.5-coder:14b": {
          "name": "Qwen 2.5 Coder 14B"
        }
      }
    }
  },
  "model": "ollama/qwen2.5-coder:14b"
}
```

如果你拉取的是 7b：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": {
        "baseURL": "http://localhost:11434/v1"
      },
      "models": {
        "qwen2.5-coder:7b": {
          "name": "Qwen 2.5 Coder 7B"
        }
      }
    }
  },
  "model": "ollama/qwen2.5-coder:7b"
}
```

然后启动：

```bash
opencode
```

---

# 8. 第一次运行 OpenCode

进入你的项目目录：

```bash
cd opencode-demo
```

启动：

```bash
opencode
```

你会进入一个终端 TUI 界面。

---

## 8.1 第一次建议执行 `/init`

在 OpenCode 输入框里输入：

```text
/init
```

它会帮你生成一个类似 `AGENTS.md` 的项目说明文件。

这个文件可以告诉 AI：

- 项目是什么；
- 怎么运行；
- 怎么测试；
- 代码风格；
- 禁止事项；
- 目录结构；
- 常用命令。

例如你可以后续手动补充：

```md
# Project Rules

This is a Node.js project.

Use pnpm.

Run tests with:

```bash
pnpm test
```

Do not modify database migrations without confirmation.
```

---

## 8.2 尝试问一个问题

在 OpenCode 里输入：

```text
请解释这个项目的结构
```

或者：

```text
帮我看一下 index.js 是做什么的
```

或者：

```text
帮我写一个 README
```

---

## 8.3 尝试让它修改代码

例如：

```text
把 index.js 改成输出 "Hello OpenCode"
```

它会给出修改计划或直接修改文件。

如果它要执行命令或修改文件，注意看确认提示。

新手阶段建议保持确认，不要完全放开自动执行。

---

# 9. 常用操作和快捷键

不同版本可能略有差异，但常见能力如下。

---

## 9.1 常用斜杠命令

在 OpenCode TUI 里可以输入：

```text
/help
```

查看帮助。

常见命令可能包括：

```text
/init
/models
/connect
/help
/compact
/sessions
/share
/undo
/redo
```

说明：

| 命令 | 作用 |
|---|---|
| `/init` | 初始化项目说明 |
| `/models` | 选择模型 |
| `/connect` | 登录模型提供商 |
| `/help` | 查看帮助 |
| `/compact` | 压缩上下文 |
| `/sessions` | 查看会话 |
| `/undo` | 撤销 AI 修改 |
| `/redo` | 恢复撤销 |
| `/share` | 分享会话 |

如果你的版本没有某个命令，以 `/help` 为准。

---

## 9.2 引用文件

可以用 `@` 引用文件。

例如：

```text
请解释 @src/index.ts
```

或者：

```text
帮我修复 @package.json 里的脚本问题
```

---

## 9.3 执行 shell 命令

有些版本支持用 `!` 前缀执行命令。

例如：

```text
!ls -la
```

或者：

```text
!git status
```

---

## 9.4 退出 OpenCode

通常可以按：

```text
Ctrl + C
```

或：

```text
Ctrl + D
```

也可以输入：

```text
/exit
```

如果支持的话。

---

# 10. 项目级配置示例

推荐每个项目都放一个 `opencode.json`。

---

## 10.1 最简单配置

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5"
}
```

---

## 10.2 使用 OpenRouter

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "openrouter/auto"
}
```

---

## 10.3 使用本地 Ollama

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": {
        "baseURL": "http://localhost:11434/v1"
      },
      "models": {
        "qwen2.5-coder:14b": {
          "name": "Qwen 2.5 Coder 14B"
        }
      }
    }
  },
  "model": "ollama/qwen2.5-coder:14b"
}
```

---

## 10.4 使用自定义 OpenAI-Compatible 服务

如果你用的是国内中转、自建网关、vLLM、One API、New API、LM Studio 等，通常可以配置 OpenAI-Compatible provider。

示例：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "myprovider": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "My Provider",
      "options": {
        "baseURL": "https://your-endpoint.com/v1"
      },
      "models": {
        "your-model-id": {
          "name": "Your Model"
        }
      }
    }
  },
  "model": "myprovider/your-model-id"
}
```

然后设置 Key：

```bash
export MYPROVIDER_API_KEY="你的Key"
```

如果环境变量名不生效，也可以在 OpenCode 里用 `/connect` 或查看当前版本文档中对应 provider 的认证方式。

---

# 11. Docker 部署 OpenCode

如果你想把 OpenCode 部署到服务器、容器、隔离环境，可以用 Docker。

---

## 11.1 安装 Docker

检查：

```bash
docker --version
```

如果没有安装：

### Ubuntu / Debian

```bash
sudo apt update
sudo apt install docker.io -y
sudo systemctl enable --now docker
```

### macOS / Windows

安装 Docker Desktop：

```text
https://www.docker.com/products/docker-desktop/
```

---

## 11.2 创建一个 Dockerfile

新建目录：

```bash
mkdir opencode-docker
cd opencode-docker
```

创建文件：

```bash
nano Dockerfile
```

写入：

```dockerfile
FROM node:22-bookworm

RUN npm install -g opencode-ai

WORKDIR /workspace

CMD ["opencode"]
```

保存退出。

---

## 11.3 构建镜像

```bash
docker build -t opencode .
```

---

## 11.4 运行容器

假设你使用 Anthropic：

```bash
docker run --rm -it \
  -v "$PWD:/workspace" \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  opencode
```

如果你使用 OpenRouter：

```bash
docker run --rm -it \
  -v "$PWD:/workspace" \
  -e OPENROUTER_API_KEY="$OPENROUTER_API_KEY" \
  opencode
```

如果你使用 OpenAI：

```bash
docker run --rm -it \
  -v "$PWD:/workspace" \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  opencode
```

---

## 11.5 Windows PowerShell 下运行 Docker

PowerShell 里当前目录变量是 `${PWD}`：

```powershell
docker run --rm -it `
  -v ${PWD}:/workspace `
  -e ANTHROPIC_API_KEY=$env:ANTHROPIC_API_KEY `
  opencode
```

---

## 11.6 Docker 里连接本地 Ollama

如果 Ollama 在宿主机上运行，Linux 下可以用：

```bash
docker run --rm -it \
  --network host \
  -v "$PWD:/workspace" \
  opencode
```

macOS / Windows Docker Desktop 下，通常用：

```text
http://host.docker.internal:11434/v1
```

例如 `opencode.json`：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "ollama": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Ollama",
      "options": {
        "baseURL": "http://host.docker.internal:11434/v1"
      },
      "models": {
        "qwen2.5-coder:14b": {
          "name": "Qwen 2.5 Coder 14B"
        }
      }
    }
  },
  "model": "ollama/qwen2.5-coder:14b"
}
```

---

# 12. 在服务器上使用 OpenCode

如果你想在远程 Linux 服务器上使用 OpenCode，步骤和本地类似。

---

## 12.1 SSH 登录服务器

```bash
ssh user@your-server-ip
```

---

## 12.2 安装基础依赖

Ubuntu / Debian：

```bash
sudo apt update
sudo apt install curl git -y
```

---

## 12.3 安装 OpenCode

```bash
curl -fsSL https://opencode.ai/install | bash
```

重新加载：

```bash
exec $SHELL -l
```

检查：

```bash
opencode --version
```

---

## 12.4 配置模型 Key

例如：

```bash
echo 'export ANTHROPIC_API_KEY="你的Key"' >> ~/.bashrc
source ~/.bashrc
```

---

## 12.5 使用 tmux 或 screen

因为 OpenCode 是交互式 TUI，SSH 断线可能影响会话。推荐用 tmux。

安装 tmux：

```bash
sudo apt install tmux -y
```

启动：

```bash
tmux new -s opencode
```

进入项目：

```bash
cd ~/projects/your-project
opencode
```

断开会话：

```text
Ctrl + B
然后按 D
```

重新连接：

```bash
tmux attach -t opencode
```

---

# 13. 推荐的新手上手流程

下面是一个完整的新手流程。

---

## 13.1 macOS / Linux 最短路径

```bash
curl -fsSL https://opencode.ai/install | bash
exec $SHELL -l
opencode --version
```

配置 Key：

```bash
export ANTHROPIC_API_KEY="你的Key"
```

创建测试项目：

```bash
mkdir ~/opencode-demo
cd ~/opencode-demo
git init
echo "console.log('hello')" > index.js
```

启动：

```bash
opencode
```

进入后输入：

```text
/init
```

然后输入：

```text
请解释这个项目
```

再试：

```text
帮我修改 index.js，让它输出 Hello OpenCode
```

---

## 13.2 Windows WSL2 最短路径

管理员 PowerShell：

```powershell
wsl --install
```

重启后进入 Ubuntu：

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install curl git -y
curl -fsSL https://opencode.ai/install | bash
exec $SHELL -l
opencode --version
```

配置 Key：

```bash
export ANTHROPIC_API_KEY="你的Key"
```

创建项目：

```bash
mkdir -p ~/projects/demo
cd ~/projects/demo
git init
echo "console.log('hello')" > index.js
```

启动：

```bash
opencode
```

---

# 14. 升级 OpenCode

根据安装方式不同，升级方式不同。

---

## 14.1 官方脚本安装

重新执行安装脚本：

```bash
curl -fsSL https://opencode.ai/install | bash
```

然后检查：

```bash
opencode --version
```

---

## 14.2 Homebrew 安装

```bash
brew update
brew upgrade opencode
```

---

## 14.3 npm 安装

```bash
npm update -g opencode-ai
```

或者重新安装：

```bash
npm install -g opencode-ai
```

---

## 14.4 Scoop 安装

```powershell
scoop update opencode
```

---

## 14.5 Docker 安装

重新构建镜像：

```bash
docker build --no-cache -t opencode .
```

---

# 15. 卸载 OpenCode

---

## 15.1 官方脚本安装

删除可执行文件目录，例如：

```bash
rm -rf ~/.opencode
```

然后从 shell 配置文件里删除 PATH：

编辑：

```bash
nano ~/.zshrc
```

或：

```bash
nano ~/.bashrc
```

删掉类似这行：

```bash
export PATH="$HOME/.opencode/bin:$PATH"
```

重新加载：

```bash
source ~/.zshrc
```

或：

```bash
source ~/.bashrc
```

---

## 15.2 Homebrew 卸载

```bash
brew uninstall opencode
```

---

## 15.3 npm 卸载

```bash
npm uninstall -g opencode-ai
```

---

## 15.4 Scoop 卸载

```powershell
scoop uninstall opencode
```

---

## 15.5 删除配置

如果需要彻底清理，可以删除配置目录，例如：

```bash
rm -rf ~/.config/opencode
```

同时删除项目里的：

```text
opencode.json
AGENTS.md
```

如果你不想保留它们的话。

---

# 16. 常见问题排查

---

## 16.1 `opencode: command not found`

原因：

- 没安装成功；
- PATH 没配置；
- 终端没重启。

解决：

重新打开终端，或：

```bash
exec $SHELL -l
```

检查安装目录：

```bash
ls ~/.opencode/bin
```

如果存在，添加 PATH：

```bash
echo 'export PATH="$HOME/.opencode/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## 16.2 npm 安装时报 `EACCES`

原因：

- 全局安装权限不足。

解决：

不要用 `sudo npm install -g`，推荐用 nvm：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
```

重新打开终端：

```bash
nvm install --lts
nvm use --lts
npm install -g opencode-ai
```

---

## 16.3 启动后提示没有模型或未认证

解决：

检查环境变量：

```bash
env | grep ANTHROPIC_API_KEY
env | grep OPENAI_API_KEY
env | grep OPENROUTER_API_KEY
```

如果没有输出，说明没生效。

重新设置：

```bash
export ANTHROPIC_API_KEY="你的Key"
```

并写入 shell 配置。

---

## 16.4 API 返回 401 / 403

常见原因：

- Key 复制错了；
- Key 过期；
- 账号欠费；
- 没有模型权限；
- 使用了错误的 provider；
- 网络代理导致请求异常。

解决：

重新生成 Key，并确认你配置的是对应 provider。

例如 Anthropic Key 不应配置到 OpenAI provider。

---

## 16.5 网络连接失败 / timeout

如果你在中国大陆或公司网络环境，可能需要代理。

临时设置代理：

```bash
export https_proxy=http://127.0.0.1:7890
export http_proxy=http://127.0.0.1:7890
```

如果你本地代理端口不是 7890，请改成自己的端口。

也可以考虑：

- 使用本地 Ollama；
- 使用自建模型网关；
- 使用 OpenAI-Compatible 中转服务。

---

## 16.6 Windows PowerShell 执行脚本失败

例如：

```text
cannot be loaded because running scripts is disabled
```

解决：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

然后重新执行命令。

---

## 16.7 TUI 界面乱码

可能原因：

- 终端不支持某些字符；
- 字体不支持图标；
- 终端编码不是 UTF-8。

解决：

使用现代终端，例如：

- iTerm2；
- Windows Terminal；
- WezTerm；
- Alacritty；
- Kitty。

确保编码是 UTF-8：

```bash
echo $LANG
```

建议包含：

```text
UTF-8
```

例如：

```text
en_US.UTF-8
```

或：

```text
zh_CN.UTF-8
```

---

## 16.8 Docker 里无法访问本地 Ollama

Linux 下可以尝试：

```bash
--network host
```

macOS / Windows Docker Desktop 下使用：

```text
http://host.docker.internal:11434/v1
```

并确认 Ollama 正在运行：

```bash
ollama list
```

---

## 16.9 修改文件后项目坏了怎么办？

如果你有 Git：

```bash
git status
git diff
git checkout .
```

如果只想撤销部分文件：

```bash
git checkout -- 文件名
```

如果已经提交：

```bash
git log
git revert 提交ID
```

所以再次强调：

> 使用 OpenCode 前，先把项目纳入 Git，并保持工作区干净。

---

# 17. 安全建议

OpenCode 可以读文件、改文件、执行命令，所以一定要注意安全。

---

## 17.1 不要把 API Key 提交到 Git

错误示例：

```json
{
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "sk-ant-xxxx"
      }
    }
  }
}
```

强烈不建议把真实 Key 写进会被提交的文件里。

推荐：

```bash
export ANTHROPIC_API_KEY="你的Key"
```

并把敏感文件加入 `.gitignore`：

```gitignore
.env
*.local.json
secrets/
```

---

## 17.2 不要在不可信项目里盲目允许命令执行

有些项目里的说明文件可能包含诱导 AI 执行危险命令的内容。

新手阶段建议：

- 每次执行命令前看清楚；
- 不要随便允许 `rm -rf`；
- 不要随便允许写 SSH key；
- 不要随便允许上传文件；
- 不要随便执行未知脚本。

---

## 17.3 重要项目先备份

使用 Git：

```bash
git status
git add .
git commit -m "backup before opencode"
```

或者复制一份项目目录。

---

## 17.4 生产环境谨慎

不要直接在生产服务器上用 AI 自动改配置、重启服务、操作数据库。

建议：

- 在开发机操作；
- 用 Git 分支；
- 用测试环境验证；
- 人工 review 后再部署。

---

# 18. 推荐的项目结构

一个适合 OpenCode 使用的项目可以包含：

```text
your-project/
├── AGENTS.md          # 给 AI 看的项目规则
├── opencode.json      # OpenCode 配置
├── .gitignore
├── README.md
├── src/
├── tests/
└── package.json
```

---

## 18.1 `AGENTS.md` 示例

```md
# Agent Rules

This is a TypeScript project using pnpm.

## Commands

Install dependencies:

```bash
pnpm install
```

Run dev server:

```bash
pnpm dev
```

Run tests:

```bash
pnpm test
```

## Rules

- Do not delete existing tests.
- Prefer small, focused changes.
- Always run tests after modifying code.
- Do not modify CI configuration without confirmation.
```

---

# 19. 新手使用技巧

---

## 19.1 先让 AI 理解项目

不要一上来就让它大改。

先问：

```text
请先阅读项目结构，不要修改文件，告诉我这个项目是做什么的
```

然后：

```text
请列出这个项目的主要入口文件和核心模块
```

再：

```text
请告诉我如果要修复登录 bug，应该看哪些文件
```

---

## 19.2 小步修改

不要说：

```text
帮我重写整个项目
```

更好的说法：

```text
请只修改 src/auth/login.ts，修复 token 过期后没有跳转登录页的问题
```

---

## 19.3 要求 AI 先给计划

例如：

```text
请先给出修改计划，不要直接改代码
```

确认后再说：

```text
按这个计划执行
```

---

## 19.4 让 AI 修改后跑测试

例如：

```text
修改完成后，请运行测试，并告诉我结果
```

---

## 19.5 使用 Git 分支

```bash
git checkout -b feat/opencode-test
```

让 AI 改完后：

```bash
git diff
```

满意再提交：

```bash
git add .
git commit -m "feat: update login redirect"
```

---

# 20. 一份适合新手的最小配置方案

如果你是第一次使用，我建议这样配置。

---

## 20.1 安装

macOS / Linux：

```bash
curl -fsSL https://opencode.ai/install | bash
exec $SHELL -l
opencode --version
```

Windows：

```text
安装 WSL2 Ubuntu，然后在 Ubuntu 里执行同样命令。
```

---

## 20.2 模型选择

新手推荐顺序：

1. Anthropic Claude；
2. OpenRouter；
3. OpenAI；
4. 本地 Ollama。

如果你不想折腾，优先选：

```text
Anthropic
```

或：

```text
OpenRouter
```

---

## 20.3 设置 Key

Anthropic：

```bash
export ANTHROPIC_API_KEY="你的Key"
```

写入配置：

```bash
echo 'export ANTHROPIC_API_KEY="你的Key"' >> ~/.zshrc
source ~/.zshrc
```

---

## 20.4 创建测试项目

```bash
mkdir ~/opencode-demo
cd ~/opencode-demo
git init
echo "console.log('hello')" > index.js
```

---

## 20.5 启动

```bash
opencode
```

进入后依次尝试：

```text
/help
/models
/init
```

然后输入：

```text
请解释当前项目
```

再输入：

```text
帮我修改 index.js，让它输出 Hello OpenCode
```

---

# 21. 最终快速检查清单

安装完成前，请确认：

- [ ] 终端可以正常打开；
- [ ] `opencode --version` 有输出；
- [ ] 已经准备至少一个模型 Key；
- [ ] Key 已经通过环境变量或登录方式配置；
- [ ] 已进入一个测试项目；
- [ ] 项目已初始化 Git；
- [ ] 可以启动 `opencode`；
- [ ] 可以使用 `/models` 或 `/connect` 看到模型；
- [ ] 可以让 AI 读取文件；
- [ ] 可以让 AI 修改一个简单文件；
- [ ] 能用 `git diff` 查看修改；
- [ ] 知道如何用 `git checkout .` 撤销修改。

---

# 22. 如果还是失败，按这个顺序排查

你可以按下面顺序检查：

```text
1. opencode --version 是否能运行？
2. 终端是否能访问外网？
3. API Key 是否设置成功？
4. provider 是否选对？
5. 模型名是否正确？
6. 是否需要代理？
7. 是否使用了过旧的 OpenCode 版本？
8. 是否在项目目录里启动？
9. 是否有文件权限问题？
10. 是否可以用本地 Ollama 排除 API 问题？
```

---

# 23. 一个完整示例：从零到能改代码

下面以 macOS/Linux + Anthropic 为例，完整走一遍。

```bash
curl -fsSL https://opencode.ai/install | bash
exec $SHELL -l
opencode --version
```

设置 Key：

```bash
export ANTHROPIC_API_KEY="你的Key"
echo 'export ANTHROPIC_API_KEY="你的Key"' >> ~/.zshrc
source ~/.zshrc
```

创建项目：

```bash
mkdir ~/opencode-demo
cd ~/opencode-demo
git init
echo "console.log('hello')" > index.js
```

启动：

```bash
opencode
```

进入 OpenCode 后输入：

```text
/init
```

然后输入：

```text
请阅读 index.js，并告诉我它的作用
```

再输入：

```text
请修改 index.js，让它输出 Hello OpenCode
```

退出 OpenCode 后查看修改：

```bash
cat index.js
git diff
```

如果满意：

```bash
git add index.js
git commit -m "chore: update hello message"
```

如果不满意：

```bash
git checkout -- index.js
```

---

# 24. 总结

OpenCode 的部署其实不复杂，核心就是四步：

```text
1. 安装 OpenCode
2. 配置模型 Key
3. 进入项目目录
4. 启动 opencode
```

新手最推荐路径：

```text
macOS / Linux：
官方脚本安装 + Anthropic/OpenRouter Key + 小项目测试

Windows：
WSL2 Ubuntu + 官方脚本安装 + Anthropic/OpenRouter Key + 小项目测试
```

如果你想要更保守、离线、隐私优先：

```text
Ollama 本地模型 + OpenCode OpenAI-Compatible 配置
```

如果你要部署到服务器：

```text
Linux 服务器 + curl 安装 + tmux + 环境变量 Key + Git 项目
```

如果你要隔离环境：

```text
Docker + 项目目录挂载 + 环境变量传入 Key
```