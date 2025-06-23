'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface WorkflowStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  duration?: number
  result?: any
}

export function WorkflowDemo() {
  const [query, setQuery] = useState('')
  const [exchange, setExchange] = useState('hkex')
  const [analysisMethod, setAnalysisMethod] = useState('buffett')
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { id: 'search', name: '搜索公司', status: 'pending' },
    { id: 'prospectus', name: '获取招股书', status: 'pending' },
    { id: 'parse', name: 'PDF解析', status: 'pending' },
    { id: 'analyze', name: 'AI分析', status: 'pending' },
    { id: 'report', name: '生成报告', status: 'pending' }
  ])
  const [result, setResult] = useState<any>(null)

  const updateStepStatus = (stepId: string, status: WorkflowStep['status'], result?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, result }
        : step
    ))
  }

  const runWorkflow = async () => {
    if (!query.trim()) return

    setIsRunning(true)
    setResult(null)
    
    // 重置所有步骤状态
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' as const })))

    try {
      // 调用工作流程API
      updateStepStatus('search', 'running')
      
      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          exchange,
          analysisMethod,
          batchAnalysis: false
        })
      })

      const data = await response.json()

      if (data.success) {
        // 模拟步骤进度
        const stepIds = ['search', 'prospectus', 'parse', 'analyze', 'report']
        
        for (let i = 0; i < stepIds.length; i++) {
          const stepId = stepIds[i]
          updateStepStatus(stepId, 'running')
          
          // 模拟处理时间
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          updateStepStatus(stepId, 'completed', data.data.steps[stepId])
        }

        setResult(data.data)
      } else {
        // 处理错误
        const failedStep = steps.find(step => step.status === 'running')
        if (failedStep) {
          updateStepStatus(failedStep.id, 'error')
        }
      }

    } catch (error) {
      console.error('Workflow error:', error)
      const runningStep = steps.find(step => step.status === 'running')
      if (runningStep) {
        updateStepStatus(runningStep.id, 'error')
      }
    } finally {
      setIsRunning(false)
    }
  }

  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'running':
        return '🔄'
      case 'completed':
        return '✅'
      case 'error':
        return '❌'
      default:
        return '⏳'
    }
  }

  const getStepColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500'
      case 'running':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">配置工作流程</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              搜索关键词
            </label>
            <Input
              type="text"
              placeholder="输入公司名称或股票代码..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isRunning}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              交易所
            </label>
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              disabled={isRunning}
            >
              <option value="hkex">港交所</option>
              <option value="nyse">纽交所</option>
              <option value="nasdaq">纳斯达克</option>
              <option value="sse">上交所</option>
              <option value="szse">深交所</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分析方法
            </label>
            <select
              value={analysisMethod}
              onChange={(e) => setAnalysisMethod(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              disabled={isRunning}
            >
              <option value="buffett">巴菲特价值投资</option>
              <option value="lynch">彼得·林奇成长股</option>
              <option value="graham">格雷厄姆安全边际</option>
              <option value="fisher">菲利普·费舍15要点</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <Button 
            onClick={runWorkflow} 
            disabled={isRunning || !query.trim()}
            className="w-full md:w-auto"
          >
            {isRunning ? '运行中...' : '开始分析工作流程'}
          </Button>
        </div>
      </div>

      {/* 工作流程步骤 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">工作流程进度</h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                <span className="text-sm">{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className={`font-medium ${getStepColor(step.status)}`}>
                  {getStepIcon(step.status)} {step.name}
                </div>
                {step.status === 'running' && (
                  <div className="text-sm text-blue-600 mt-1">处理中...</div>
                )}
                {step.status === 'completed' && step.result && (
                  <div className="text-sm text-green-600 mt-1">
                    {step.id === 'search' && `找到 ${step.result.resultsCount || 0} 个结果`}
                    {step.id === 'prospectus' && `获取 ${step.result.foundCount || 0} 个招股书`}
                    {step.id === 'parse' && `解析${step.result.documentProcessed ? '成功' : '失败'}`}
                    {step.id === 'analyze' && `生成 ${step.result.resultsCount || 0} 个分析`}
                    {step.id === 'report' && `报告大小：${Math.round((step.result.size || 0) / 1024)}KB`}
                  </div>
                )}
              </div>
              <div className="w-4 h-4">
                {step.status === 'running' && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 结果展示 */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-800 mb-4">工作流程完成！</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">搜索结果</h4>
              <p className="text-sm text-green-600">
                目标公司：{result.steps?.search?.targetCompany?.name}
              </p>
              <p className="text-sm text-green-600">
                股票代码：{result.steps?.search?.targetCompany?.ticker}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-green-700 mb-2">分析结果</h4>
              <p className="text-sm text-green-600">
                分析评分：{result.results?.analyses?.[0]?.score}/10
              </p>
              <p className="text-sm text-green-600">
                投资建议：{result.results?.analyses?.[0]?.recommendation}
              </p>
            </div>
          </div>
          
          {result.results?.reportHtml && (
            <div className="mt-4">
              <Button
                onClick={() => {
                  const newWindow = window.open()
                  if (newWindow) {
                    newWindow.document.write(result.results.reportHtml)
                    newWindow.document.close()
                  }
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                查看完整报告
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 演示提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <span className="text-blue-600">💡</span>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">演示提示：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>输入公司名称如&quot;腾讯&quot;、&quot;Apple&quot;或股票代码如&quot;0700&quot;、&quot;AAPL&quot;</li>
              <li>系统将自动完成搜索、解析、分析和报告生成的完整流程</li>
              <li>整个流程通常需要30-60秒完成</li>
              <li>生成的报告可以在新窗口中查看</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}