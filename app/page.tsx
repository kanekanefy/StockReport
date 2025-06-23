'use client'

import { useState } from 'react'
import { CompanySearch } from '@/components/forms/company-search'
import { WorkflowDemo } from '@/components/workflow/workflow-demo'
import { FeatureShowcase } from '@/components/features/feature-showcase'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'search' | 'workflow' | 'features'>('search')

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            StockReport
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            智能招股书分析系统 - 自动下载和分析投资机会
          </p>
          <div className="mt-8 flex justify-center">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              ✅ 支持5个交易所 | ✅ AI智能分析 | ✅ 专业报告生成
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              公司搜索
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'workflow'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              工作流程演示
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'features'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              功能特性
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          {activeTab === 'search' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">公司搜索与分析</h2>
              <p className="text-gray-600 mb-6">
                搜索全球主要交易所的上市公司，获取招股书并进行智能投资分析
              </p>
              <CompanySearch />
            </div>
          )}

          {activeTab === 'workflow' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">完整工作流程演示</h2>
              <p className="text-gray-600 mb-6">
                体验从搜索公司到生成投资分析报告的完整流程
              </p>
              <WorkflowDemo />
            </div>
          )}

          {activeTab === 'features' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">系统功能特性</h2>
              <FeatureShowcase />
            </div>
          )}
        </div>

        {/* Status Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">StockReport v0.1.0 - 核心功能已完成</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">5+</div>
            <div className="text-sm opacity-90">支持交易所</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">4</div>
            <div className="text-sm opacity-90">投资理论分析</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">AI</div>
            <div className="text-sm opacity-90">智能分析引擎</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">PDF</div>
            <div className="text-sm opacity-90">智能解析</div>
          </div>
        </div>
      </div>
    </main>
  )
}