import { NextRequest, NextResponse } from 'next/server'
import { generateInvestmentReport } from '@/lib/generators/report'
import { AnalysisResult, ReportConfig } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      analyses, 
      companyInfo, 
      financialData = {}, 
      config = {} 
    } = body

    // 验证必需参数
    if (!analyses || !Array.isArray(analyses) || analyses.length === 0) {
      return NextResponse.json(
        { error: 'Analyses array is required and cannot be empty' },
        { status: 400 }
      )
    }

    if (!companyInfo || !companyInfo.name || !companyInfo.ticker || !companyInfo.exchange) {
      return NextResponse.json(
        { error: 'Company info with name, ticker, and exchange is required' },
        { status: 400 }
      )
    }

    // 验证分析结果格式
    const isValidAnalysis = analyses.every((analysis: any) => 
      analysis.id && 
      analysis.method && 
      typeof analysis.score === 'number' &&
      analysis.recommendation &&
      Array.isArray(analysis.strengths) &&
      Array.isArray(analysis.weaknesses) &&
      Array.isArray(analysis.risks)
    )

    if (!isValidAnalysis) {
      return NextResponse.json(
        { error: 'Invalid analysis result format' },
        { status: 400 }
      )
    }

    // 设置默认配置
    const reportConfig: ReportConfig = {
      template: config.template || 'comprehensive',
      includeCharts: config.includeCharts || false,
      language: config.language || 'zh',
      format: config.format || 'html',
      analysisDepth: config.analysisDepth || 'detailed'
    }

    // 生成报告
    const reportHtml = await generateInvestmentReport(
      analyses as AnalysisResult[],
      companyInfo,
      financialData,
      reportConfig
    )

    // 计算报告统计信息
    const avgScore = analyses.reduce((sum: number, a: any) => sum + a.score, 0) / analyses.length
    const recommendations = analyses.map((a: any) => a.recommendation)
    const mostCommonRec = getMostCommonRecommendation(recommendations)

    return NextResponse.json({
      success: true,
      data: {
        reportHtml,
        config: reportConfig,
        stats: {
          totalAnalyses: analyses.length,
          averageScore: Math.round(avgScore * 10) / 10,
          mostCommonRecommendation: mostCommonRec,
          analysisMethodsUsed: Array.from(new Set(analyses.map((a: any) => a.method))),
          reportSize: reportHtml.length,
          generatedAt: new Date().toISOString()
        },
        companyInfo
      }
    })

  } catch (error) {
    console.error('Report generation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate investment report',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const format = searchParams.get('format')

  // 返回支持的报告配置信息
  const supportedConfigs = {
    templates: [
      {
        id: 'basic',
        name: '基础报告',
        description: '包含主要分析结果和建议'
      },
      {
        id: 'comprehensive',
        name: '综合报告',
        description: '详细的多维度分析报告'
      },
      {
        id: 'executive',
        name: '高管摘要',
        description: '精简的高层决策报告'
      }
    ],
    languages: [
      { code: 'zh', name: '中文' },
      { code: 'en', name: 'English' }
    ],
    formats: [
      { code: 'html', name: 'HTML', description: '网页格式，支持样式和交互' },
      { code: 'pdf', name: 'PDF', description: 'PDF文档，适合打印和分享' },
      { code: 'docx', name: 'Word', description: 'Word文档，可编辑' }
    ],
    analysisDepths: [
      { code: 'basic', name: '基础分析' },
      { code: 'detailed', name: '详细分析' },
      { code: 'comprehensive', name: '全面分析' }
    ],
    defaultConfig: {
      template: 'comprehensive',
      includeCharts: false,
      language: 'zh',
      format: 'html',
      analysisDepth: 'detailed'
    }
  }

  if (format && ['html', 'pdf', 'docx'].includes(format)) {
    return NextResponse.json({
      success: true,
      data: supportedConfigs.formats.find(f => f.code === format)
    })
  }

  return NextResponse.json({
    success: true,
    data: supportedConfigs
  })
}

// 工具函数
function getMostCommonRecommendation(recommendations: string[]): string {
  const counts = recommendations.reduce((acc, rec) => {
    acc[rec] = (acc[rec] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0]
}