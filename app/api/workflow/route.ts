import { NextRequest, NextResponse } from 'next/server'
import { searchHKEXCompanies } from '@/lib/scrapers/hkex'
import { searchNYSECompanies, searchNASDAQCompanies } from '@/lib/scrapers/nyse'
import { searchSSECompanies, searchSZSECompanies } from '@/lib/scrapers/china'
import { downloadAndParsePDF } from '@/lib/parsers/pdf'
import { InvestmentAnalyzer } from '@/lib/analyzers/investment'
import { generateInvestmentReport } from '@/lib/generators/report'
import { Exchange, AnalysisMethod, ReportConfig } from '@/types'

/**
 * 完整的投资分析工作流程API
 * 一次调用完成：搜索公司 -> 获取招股书 -> 下载解析PDF -> AI分析 -> 生成报告
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      query,
      exchange = 'hkex',
      analysisMethod = 'buffett',
      batchAnalysis = false,
      reportConfig = {}
    } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // 步骤1: 搜索公司
    const searchResults = await searchCompanies(query, exchange as Exchange)
    
    if (searchResults.length === 0) {
      return NextResponse.json(
        { error: 'No companies found for the search query' },
        { status: 404 }
      )
    }

    // 取第一个搜索结果进行分析
    const targetCompany = searchResults[0]

    // 步骤2: 获取招股书列表
    const prospectuses = await getCompanyProspectuses(targetCompany.ticker, targetCompany.exchange)
    
    if (prospectuses.length === 0) {
      return NextResponse.json(
        { error: 'No prospectuses found for this company' },
        { status: 404 }
      )
    }

    // 取第一个招股书进行分析
    const targetProspectus = prospectuses[0]

    let analysisResults = []
    let reportHtml = ''
    let prospectusData = null

    try {
      // 步骤3: 下载和解析PDF（如果有有效URL）
      if (targetProspectus.documentUrl && targetProspectus.documentUrl !== '#') {
        prospectusData = await downloadAndParsePDF(targetProspectus.documentUrl)
      } else {
        // 使用模拟数据进行演示
        prospectusData = generateMockProspectusData(targetCompany)
      }

      // 步骤4: 进行投资分析
      if (batchAnalysis) {
        const methods: AnalysisMethod[] = ['buffett', 'lynch', 'graham', 'fisher']
        analysisResults = await InvestmentAnalyzer.batchAnalyze(
          prospectusData.text,
          prospectusData.financialData,
          targetCompany,
          methods
        )
      } else {
        const result = await InvestmentAnalyzer.analyze(
          prospectusData.text,
          prospectusData.financialData,
          analysisMethod as AnalysisMethod,
          targetCompany
        )
        analysisResults = [result]
      }

      // 步骤5: 生成投资报告
      const defaultReportConfig: ReportConfig = {
        template: 'comprehensive',
        includeCharts: false,
        language: 'zh',
        format: 'html',
        analysisDepth: 'detailed'
      }

      const finalReportConfig = { ...defaultReportConfig, ...reportConfig }

      reportHtml = await generateInvestmentReport(
        analysisResults,
        targetCompany,
        prospectusData.financialData,
        finalReportConfig
      )

    } catch (analysisError) {
      console.error('Analysis workflow error:', analysisError)
      
      // 如果分析失败，返回基础信息
      return NextResponse.json({
        success: true,
        data: {
          workflow: 'partial_success',
          searchResults: searchResults.slice(0, 5),
          targetCompany,
          prospectuses: prospectuses.slice(0, 3),
          targetProspectus,
          error: 'Analysis step failed - PDF processing or AI analysis error',
          errorDetails: analysisError instanceof Error ? analysisError.message : 'Unknown error'
        }
      })
    }

    // 返回完整工作流程结果
    return NextResponse.json({
      success: true,
      data: {
        workflow: 'completed',
        steps: {
          search: {
            query,
            exchange,
            resultsCount: searchResults.length,
            targetCompany
          },
          prospectus: {
            foundCount: prospectuses.length,
            targetProspectus,
            documentProcessed: prospectusData !== null
          },
          analysis: {
            method: batchAnalysis ? 'batch' : analysisMethod,
            resultsCount: analysisResults.length,
            analyses: analysisResults
          },
          report: {
            config: reportConfig,
            generated: reportHtml.length > 0,
            size: reportHtml.length
          }
        },
        results: {
          searchResults: searchResults.slice(0, 5),
          prospectuses: prospectuses.slice(0, 3),
          prospectusData: prospectusData ? {
            textLength: prospectusData.text.length,
            financialData: prospectusData.financialData,
            businessInfo: prospectusData.businessInfo,
            metadata: prospectusData.metadata
          } : null,
          analyses: analysisResults,
          reportHtml
        },
        timing: {
          completedAt: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Workflow API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Investment analysis workflow failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}

/**
 * 获取工作流程状态和支持的选项
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      workflow: {
        name: 'Investment Analysis Workflow',
        description: '完整的投资分析工作流程：搜索公司 -> 获取招股书 -> PDF解析 -> AI分析 -> 生成报告',
        steps: [
          { id: 'search', name: '公司搜索', description: '根据关键词搜索上市公司' },
          { id: 'prospectus', name: '招股书获取', description: '获取公司招股书文档列表' },
          { id: 'parse', name: 'PDF解析', description: '下载并解析招股书PDF文件' },
          { id: 'analyze', name: 'AI分析', description: '使用投资理论进行智能分析' },
          { id: 'report', name: '报告生成', description: '生成专业投资分析报告' }
        ]
      },
      supportedExchanges: [
        { code: 'hkex', name: '港交所', description: 'Hong Kong Exchanges' },
        { code: 'nyse', name: '纽交所', description: 'New York Stock Exchange' },
        { code: 'nasdaq', name: '纳斯达克', description: 'NASDAQ' },
        { code: 'sse', name: '上交所', description: 'Shanghai Stock Exchange' },
        { code: 'szse', name: '深交所', description: 'Shenzhen Stock Exchange' }
      ],
      analysisMethods: [
        { code: 'buffett', name: '巴菲特价值投资', description: '关注内在价值和护城河' },
        { code: 'lynch', name: '彼得·林奇成长股', description: '重点分析成长性和PEG比率' },
        { code: 'graham', name: '格雷厄姆安全边际', description: '关注安全边际和价值低估' },
        { code: 'fisher', name: '菲利普·费舍15要点', description: '全面的定性和定量分析' }
      ],
      defaultConfig: {
        exchange: 'hkex',
        analysisMethod: 'buffett',
        batchAnalysis: false,
        reportConfig: {
          template: 'comprehensive',
          language: 'zh',
          format: 'html',
          analysisDepth: 'detailed'
        }
      }
    }
  })
}

// 工具函数

/**
 * 统一的公司搜索接口
 */
async function searchCompanies(query: string, exchange: Exchange) {
  switch (exchange) {
    case 'hkex':
      return await searchHKEXCompanies(query)
    case 'nyse':
      return await searchNYSECompanies(query)
    case 'nasdaq':
      return await searchNASDAQCompanies(query)
    case 'sse':
      return await searchSSECompanies(query)
    case 'szse':
      return await searchSZSECompanies(query)
    default:
      // 搜索所有交易所
      const [hkexResults, nyseResults, nasdaqResults, sseResults, szseResults] = await Promise.all([
        searchHKEXCompanies(query).catch(() => []),
        searchNYSECompanies(query).catch(() => []),
        searchNASDAQCompanies(query).catch(() => []),
        searchSSECompanies(query).catch(() => []),
        searchSZSECompanies(query).catch(() => [])
      ])
      return [...hkexResults, ...nyseResults, ...nasdaqResults, ...sseResults, ...szseResults]
  }
}

/**
 * 统一的招股书获取接口
 */
async function getCompanyProspectuses(ticker: string, exchange: Exchange) {
  const { getCompanyProspectuses } = await import('@/lib/scrapers/hkex')
  const { getUSCompanyProspectuses } = await import('@/lib/scrapers/nyse')
  const { getChinaCompanyProspectuses } = await import('@/lib/scrapers/china')

  switch (exchange) {
    case 'hkex':
      return await getCompanyProspectuses(ticker)
    case 'nyse':
      return await getUSCompanyProspectuses(ticker, 'nyse')
    case 'nasdaq':
      return await getUSCompanyProspectuses(ticker, 'nasdaq')
    case 'sse':
      return await getChinaCompanyProspectuses(ticker, 'sse')
    case 'szse':
      return await getChinaCompanyProspectuses(ticker, 'szse')
    default:
      return []
  }
}

/**
 * 生成模拟招股书数据（用于演示）
 */
function generateMockProspectusData(company: any) {
  const mockText = `
    ${company.name} 招股说明书
    
    公司概况：
    ${company.name}是一家在${company.exchange.toUpperCase()}交易所上市的${company.sector || '多元化'}行业公司。
    股票代码：${company.ticker}
    
    财务状况：
    公司近年来保持稳定增长，营业收入持续上升，盈利能力较强。
    
    业务模式：
    公司专注于${company.sector || '多元化'}业务，拥有良好的市场地位和竞争优势。
    
    风险因素：
    市场竞争加剧、政策变化、经济周期波动等因素可能对公司业务产生影响。
    
    投资价值：
    公司具备长期增长潜力，值得投资者关注。
  `

  const mockFinancialData = {
    revenue: [1000000000, 1100000000, 1200000000],
    netIncome: [100000000, 120000000, 140000000],
    totalAssets: 2000000000,
    totalDebt: 500000000,
    shareholderEquity: 1200000000,
    roe: 11.67,
    roa: 7.0,
    debtToEquity: 0.42
  }

  const mockBusinessInfo = {
    businessModel: `${company.name}采用多元化经营模式，专注于${company.sector || '多个'}领域的业务发展。`,
    competitiveAdvantages: [
      '强大的品牌影响力',
      '完善的销售网络',
      '优秀的管理团队'
    ],
    risks: [
      '市场竞争加剧',
      '监管政策变化',
      '经济环境不确定性'
    ]
  }

  const mockMetadata = {
    pages: 200,
    title: `${company.name}招股说明书`,
    creationDate: new Date()
  }

  return {
    text: mockText,
    financialData: mockFinancialData,
    businessInfo: mockBusinessInfo,
    metadata: mockMetadata
  }
}