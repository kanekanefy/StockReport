# StockReport 开发文档

## 项目概述

StockReport 是一个基于 Next.js 14 的智能招股书分析系统，集成了 OpenAI GPT-4，能够自动下载、解析招股书并生成专业的投资分析报告。

## 技术栈

### 前端技术
- **Next.js 14** - React 全栈框架，App Router
- **React 18** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Lucide React** - 现代图标库

### 后端技术
- **Next.js API Routes** - 服务端 API
- **Node.js** - 运行时环境
- **OpenAI API** - GPT-4 智能分析
- **Axios** - HTTP 客户端
- **Cheerio** - 服务端 HTML 解析

### 数据处理
- **pdf-parse** - PDF 文件解析
- **Financial Data Extraction** - 财务数据提取
- **Multi-language Support** - 中英文支持

## 项目结构

```
StockReport/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API 路由
│   │   ├── analyze/       # 投资分析 API
│   │   ├── download/      # PDF 下载和解析
│   │   ├── prospectus/    # 招股书获取
│   │   ├── report/        # 报告生成
│   │   ├── search/        # 公司搜索
│   │   └── workflow/      # 工作流程 API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx          # 首页
├── components/            # React 组件
│   ├── features/         # 功能展示组件
│   ├── forms/           # 表单组件
│   ├── ui/              # 基础 UI 组件
│   └── workflow/        # 工作流程组件
├── lib/                  # 工具库和配置
│   ├── analyzers/       # 投资分析引擎
│   ├── generators/      # 报告生成器
│   ├── parsers/         # PDF 解析器
│   ├── scrapers/        # 数据爬虫
│   └── utils/           # 工具函数
├── types/               # TypeScript 类型定义
└── data/               # 数据存储目录
```

## API 接口文档

### 1. 公司搜索 API
```
GET/POST /api/search
```
**参数:**
- `q` (string): 搜索关键词
- `exchange` (string, 可选): 交易所代码 (hkex, nyse, nasdaq, sse, szse)

**返回:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "ticker": "string",
      "exchange": "string",
      "sector": "string"
    }
  ]
}
```

### 2. 招股书获取 API
```
GET /api/prospectus?ticker=xxx&exchange=xxx
```

### 3. PDF 下载解析 API
```
POST /api/download
```
**请求体:**
```json
{
  "documentUrl": "string",
  "ticker": "string",
  "exchange": "string"
}
```

### 4. 投资分析 API
```
POST /api/analyze
```
**请求体:**
```json
{
  "prospectusText": "string",
  "financialData": {},
  "companyInfo": {},
  "method": "buffett|lynch|graham|fisher",
  "batchAnalysis": false
}
```

### 5. 报告生成 API
```
POST /api/report
```
**请求体:**
```json
{
  "analyses": [],
  "companyInfo": {},
  "financialData": {},
  "config": {
    "language": "zh|en",
    "format": "html|pdf|docx",
    "template": "basic|comprehensive|executive"
  }
}
```

### 6. 工作流程 API
```
POST /api/workflow
```
**请求体:**
```json
{
  "query": "string",
  "exchange": "hkex",
  "analysisMethod": "buffett",
  "batchAnalysis": false,
  "reportConfig": {}
}
```

## 投资分析理论

### 1. 巴菲特价值投资法
- 关注企业内在价值
- 寻找护城河和竞争优势
- 评估管理层质量
- 分析长期增长潜力

### 2. 彼得·林奇成长股分析
- 重点关注营收和利润增长
- 分析 PEG 比率
- 评估行业地位和市场机会
- 考察管理层执行力

### 3. 格雷厄姆安全边际分析
- 计算安全边际
- 分析资产负债表稳健性
- 评估盈利稳定性
- 关注估值保守性

### 4. 菲利普·费舍15要点
- 产品和服务长期前景
- 研发能力和创新
- 销售组织有效性
- 利润率改善空间

## 数据爬虫实现

### 港交所 (HKEX)
- 使用港交所官方 API
- 支持公司搜索和招股书获取
- 实现数据清洗和格式化

### 美股 (NYSE/NASDAQ)
- 集成 SEC EDGAR API
- 支持 S-1, F-1 等招股书文件
- 处理美股股票代码格式

### A股 (SSE/SZSE)
- 预设知名公司列表
- 支持股票代码识别
- 板块信息自动判断

## 开发指南

### 环境设置
1. 克隆项目
2. 安装依赖: `npm install`
3. 配置环境变量: 复制 `.env.example` 到 `.env.local`
4. 启动开发服务器: `npm run dev`

### 必要的环境变量
```bash
OPENAI_API_KEY=your_openai_api_key
KV_REST_API_URL=your_vercel_kv_url (可选)
KV_REST_API_TOKEN=your_vercel_kv_token (可选)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token (可选)
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

### Git Flow 工作流
```bash
# 开始新功能
git flow feature start feature-name

# 完成功能
git flow feature finish feature-name

# 创建发布分支
git flow release start 1.0.0

# 完成发布
git flow release finish 1.0.0
```

## 性能优化

### 前端优化
- React 组件懒加载
- 图片优化和懒加载
- CSS 按需加载
- JavaScript 代码分割

### 后端优化
- API 响应缓存
- 数据库查询优化
- PDF 处理优化
- OpenAI API 调用优化

### 缓存策略
- 公司搜索结果缓存
- 招股书文件缓存
- 分析结果缓存
- 报告模板缓存

## 部署指南

### Vercel 部署
1. 连接 GitHub 仓库
2. 配置环境变量
3. 自动部署

### 自定义部署
1. 构建项目: `npm run build`
2. 设置环境变量
3. 启动服务: `npm run start`

## 错误处理

### API 错误处理
- 统一错误响应格式
- 详细错误信息记录
- 重试机制实现
- 降级策略

### 前端错误处理
- Error Boundary 实现
- 用户友好的错误提示
- 加载状态管理
- 网络错误处理

## 安全考虑

### API 安全
- API 密钥保护
- 请求频率限制
- 输入验证和清理
- CORS 配置

### 数据安全
- 敏感数据加密
- 安全的文件上传
- SQL 注入防护
- XSS 攻击防护

## 测试策略

### 单元测试
- 组件测试
- 工具函数测试
- API 路由测试

### 集成测试
- 工作流程测试
- 端到端测试
- 性能测试

## 监控和日志

### 应用监控
- 性能指标监控
- 错误率监控
- API 响应时间
- 用户行为分析

### 日志管理
- 结构化日志
- 错误日志收集
- 访问日志分析
- 安全事件记录

## 贡献指南

### 开发流程
1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 创建 Pull Request

### 代码规范
- 使用 TypeScript
- 遵循 ESLint 规则
- 编写单元测试
- 更新文档

### 提交规范
- feat: 新功能
- fix: 错误修复
- docs: 文档更新
- style: 代码格式
- refactor: 重构
- test: 测试相关
- chore: 其他更改

## 版本历史

### v0.1.0 (2024-06-23)
- 完整的投资分析工作流程
- 多交易所数据爬虫支持
- OpenAI GPT-4 智能分析
- 专业报告生成功能
- 现代化 Web 界面

## 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues: 报告问题和功能请求
- 项目文档: 查看详细文档
- 技术支持: 获取开发帮助