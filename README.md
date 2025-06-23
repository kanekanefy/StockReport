# StockReport - 招股书智能分析系统

一个基于 Next.js 和 AI 的智能招股书下载和分析平台，支持多个交易所的招股书获取和专业投资分析。

## 功能特性

- 🔍 **多交易所支持**: 港交所(HKEX)、纽交所(NYSE)、纳斯达克(NASDAQ)、上交所(SSE)、深交所(SZSE)
- 📄 **智能PDF解析**: 自动提取招股书中的关键财务数据和业务信息
- 🤖 **AI投资分析**: 基于投资大师理论的多维度分析框架
- 📊 **报告生成**: 可定制的投资分析报告，支持多种格式导出
- 🚀 **现代化架构**: Next.js 14 + TypeScript + Tailwind CSS

## 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Node.js
- **AI**: OpenAI API
- **部署**: Vercel
- **数据处理**: pdf-parse, cheerio, puppeteer

## 快速开始

### 环境要求

- Node.js 18.17.0+
- npm 或 yarn

### 本地开发

1. 克隆项目
```bash
git clone <repository-url>
cd StockReport
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 并添加必要的 API keys
```

4. 启动开发服务器
```bash
npm run dev
```

5. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### Git Flow 工作流

本项目使用 git-flow 分支管理策略：

```bash
# 开始新功能开发
git flow feature start feature-name

# 完成功能开发
git flow feature finish feature-name

# 开始发布
git flow release start 1.0.0

# 完成发布
git flow release finish 1.0.0
```

## 开发指南

### 项目结构

```
StockReport/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API 路由
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx          # 首页
├── components/            # React 组件
├── lib/                  # 工具函数和配置
├── types/                # TypeScript 类型定义
├── public/               # 静态资源
└── data/                 # 数据存储目录
```

### 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 运行 ESLint
npm run type-check   # TypeScript 类型检查
npm run format       # 代码格式化
```

## 投资分析方法

系统支持以下投资大师的分析框架：

- **巴菲特价值投资法**: 关注内在价值、护城河和长期竞争优势
- **彼得·林奇成长股分析**: 重点分析成长性和PEG比率
- **格雷厄姆安全边际分析**: 关注安全边际和价值低估
- **菲利普·费舍15要点**: 全面的定性和定量分析

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署完成

### 环境变量

```bash
OPENAI_API_KEY=your_openai_api_key
KV_REST_API_URL=your_vercel_kv_url
KV_REST_API_TOKEN=your_vercel_kv_token
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git flow feature start new-feature`)
3. 提交更改 (`git commit -am 'Add new feature'`)
4. 推送到分支 (`git push origin feature/new-feature`)
5. 创建 Pull Request

## 许可证

MIT License

## 更新日志

### v0.1.0 (功能完整版)
- ✅ 初始项目架构和Next.js 14 + TypeScript框架
- ✅ 响应式UI组件和现代化界面设计
- ✅ 多交易所数据爬虫支持：
  - 港交所(HKEX) - 完整实现
  - 纽约证券交易所(NYSE) - 基础实现
  - 纳斯达克(NASDAQ) - 基础实现
  - 上海证券交易所(SSE) - 基础实现
  - 深圳证券交易所(SZSE) - 基础实现
- ✅ PDF下载和智能解析功能
- ✅ OpenAI GPT-4投资分析引擎
- ✅ 多种投资理论分析（巴菲特、林奇、格雷厄姆、费舍）
- ✅ 专业投资分析报告生成器（HTML格式）
- ✅ 完整的RESTful API路由系统
- ✅ 一键式工作流程API（/api/workflow）
- ✅ 交互式前端界面（搜索、工作流演示、功能展示）

### 已实现的完整工作流程
1. **公司搜索** - 支持5个主要交易所的公司搜索
2. **招股书获取** - 自动获取招股书文档列表
3. **PDF解析** - 智能下载和解析PDF文件
4. **AI分析** - 基于投资大师理论的多维度分析
5. **报告生成** - 生成专业的HTML投资分析报告

### 待优化功能
- 数据缓存和持久化（Redis/Vercel KV）
- PDF格式和Word格式报告导出
- 更多图表和数据可视化
- 用户认证和个人报告管理
- 实时数据更新和价格监控