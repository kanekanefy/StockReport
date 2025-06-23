'use client'

import { useState } from 'react'

interface Feature {
  id: string
  title: string
  description: string
  icon: string
  details: string[]
  tech: string[]
  status: 'completed' | 'development' | 'planned'
}

const features: Feature[] = [
  {
    id: 'exchanges',
    title: '多交易所支持',
    description: '支持全球主要证券交易所的公司搜索和招股书获取',
    icon: '🌐',
    details: [
      '港交所(HKEX) - 完整支持',
      '纽约证券交易所(NYSE) - 基础支持',
      '纳斯达克(NASDAQ) - 基础支持',
      '上海证券交易所(SSE) - 基础支持',
      '深圳证券交易所(SZSE) - 基础支持'
    ],
    tech: ['Web Scraping', 'SEC EDGAR API', 'Real-time Data'],
    status: 'completed'
  },
  {
    id: 'pdf-parsing',
    title: 'PDF智能解析',
    description: '自动下载和解析招股书PDF文件，提取关键财务数据',
    icon: '📄',
    details: [
      '自动PDF下载和验证',
      '智能文本提取和清洗',
      '财务数据自动识别',
      '业务信息结构化提取',
      '支持中英文混合文档'
    ],
    tech: ['pdf-parse', 'OCR', 'NLP', 'Data Extraction'],
    status: 'completed'
  },
  {
    id: 'ai-analysis',
    title: 'AI投资分析',
    description: '基于投资大师理论的多维度智能分析框架',
    icon: '🤖',
    details: [
      '巴菲特价值投资分析法',
      '彼得·林奇成长股分析',
      '格雷厄姆安全边际分析',
      '菲利普·费舍15要点分析',
      '支持批量分析模式'
    ],
    tech: ['OpenAI GPT-4', 'Investment Theory', 'Financial Modeling'],
    status: 'completed'
  },
  {
    id: 'report-generation',
    title: '专业报告生成',
    description: '生成结构化的投资分析报告，支持多种格式导出',
    icon: '📊',
    details: [
      'HTML格式专业报告',
      '中英文双语支持',
      '可定制报告模板',
      '详细的图表和数据',
      '投资建议和风险评估'
    ],
    tech: ['HTML Templates', 'CSS Styling', 'Data Visualization'],
    status: 'completed'
  },
  {
    id: 'workflow',
    title: '自动化工作流',
    description: '一键完成从搜索到报告生成的完整投资分析流程',
    icon: '⚡',
    details: [
      '端到端自动化流程',
      '实时进度跟踪',
      '错误处理和重试机制',
      '批量处理能力',
      'RESTful API接口'
    ],
    tech: ['Next.js API', 'Async Processing', 'Error Handling'],
    status: 'completed'
  },
  {
    id: 'data-caching',
    title: '数据缓存优化',
    description: '智能缓存机制，提升数据获取和分析效率',
    icon: '💾',
    details: [
      'Redis缓存支持',
      '智能缓存策略',
      '数据更新机制',
      '性能监控',
      '存储优化'
    ],
    tech: ['Redis', 'Vercel KV', 'Caching Strategy'],
    status: 'planned'
  }
]

export function FeatureShowcase() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)

  const getStatusColor = (status: Feature['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'development':
        return 'bg-yellow-100 text-yellow-800'
      case 'planned':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: Feature['status']) => {
    switch (status) {
      case 'completed':
        return '已完成'
      case 'development':
        return '开发中'
      case 'planned':
        return '计划中'
      default:
        return '未知'
    }
  }

  return (
    <div className="space-y-6">
      {/* 功能网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`p-6 border rounded-lg cursor-pointer transition-all duration-200 ${
              selectedFeature?.id === feature.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => setSelectedFeature(feature)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{feature.icon}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                {getStatusText(feature.status)}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* 详细信息 */}
      {selectedFeature && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{selectedFeature.icon}</span>
              <div>
                <h3 className="text-xl font-semibold">{selectedFeature.title}</h3>
                <p className="text-gray-600">{selectedFeature.description}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedFeature.status)}`}>
              {getStatusText(selectedFeature.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 功能详情 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">功能特点</h4>
              <ul className="space-y-2">
                {selectedFeature.details.map((detail, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm text-gray-700">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 技术栈 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">技术栈</h4>
              <div className="flex flex-wrap gap-2">
                {selectedFeature.tech.map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 统计信息 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">开发进度统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {features.filter(f => f.status === 'completed').length}
            </div>
            <div className="text-sm opacity-90">已完成功能</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {features.filter(f => f.status === 'development').length}
            </div>
            <div className="text-sm opacity-90">开发中功能</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {features.filter(f => f.status === 'planned').length}
            </div>
            <div className="text-sm opacity-90">计划功能</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(features.filter(f => f.status === 'completed').length / features.length) * 100}%` 
              }}
            ></div>
          </div>
          <p className="text-sm mt-2 opacity-90">
            整体进度: {Math.round((features.filter(f => f.status === 'completed').length / features.length) * 100)}%
          </p>
        </div>
      </div>

      {/* 技术架构 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">技术架构</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">前端技术</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Next.js 14</li>
              <li>• React 18</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">后端技术</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Next.js API Routes</li>
              <li>• Node.js</li>
              <li>• OpenAI API</li>
              <li>• PDF Parser</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">数据处理</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Web Scraping</li>
              <li>• SEC EDGAR API</li>
              <li>• PDF Processing</li>
              <li>• NLP Analysis</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">部署运维</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Vercel Hosting</li>
              <li>• Git Flow</li>
              <li>• ESLint/Prettier</li>
              <li>• CI/CD Pipeline</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}