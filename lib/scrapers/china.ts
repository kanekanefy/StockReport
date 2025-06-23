import axios from 'axios'
import * as cheerio from 'cheerio'
import { CompanySearchResult, ProspectusInfo } from '@/types'

// 中国证券交易所API配置
const SSE_BASE_URL = 'http://www.sse.com.cn'
const SZSE_BASE_URL = 'http://www.szse.cn'
const CSRC_BASE_URL = 'http://www.csrc.gov.cn'

/**
 * 搜索上海证券交易所公司
 */
export async function searchSSECompanies(query: string): Promise<CompanySearchResult[]> {
  try {
    // 由于网络限制，使用预设的知名上交所公司列表
    return await fallbackSSESearch(query)
  } catch (error) {
    console.error('SSE search error:', error)
    return await fallbackSSESearch(query)
  }
}

/**
 * 备用上交所搜索
 */
async function fallbackSSESearch(query: string): Promise<CompanySearchResult[]> {
  const knownSSECompanies = [
    { name: '中国石油化工股份有限公司', ticker: '600028', sector: '能源' },
    { name: '中国石油天然气股份有限公司', ticker: '601857', sector: '能源' },
    { name: '中国工商银行股份有限公司', ticker: '601398', sector: '金融' },
    { name: '中国建设银行股份有限公司', ticker: '601939', sector: '金融' },
    { name: '中国农业银行股份有限公司', ticker: '601288', sector: '金融' },
    { name: '中国银行股份有限公司', ticker: '601988', sector: '金融' },
    { name: '贵州茅台酒股份有限公司', ticker: '600519', sector: '消费品' },
    { name: '五粮液股份有限公司', ticker: '000858', sector: '消费品' },
    { name: '中国平安保险(集团)股份有限公司', ticker: '601318', sector: '金融' },
    { name: '招商银行股份有限公司', ticker: '600036', sector: '金融' },
    { name: '中国人寿保险股份有限公司', ticker: '601628', sector: '金融' },
    { name: '中国太保', ticker: '601601', sector: '金融' },
    { name: '上海浦东发展银行股份有限公司', ticker: '600000', sector: '金融' },
    { name: '兴业银行股份有限公司', ticker: '601166', sector: '金融' },
    { name: '民生银行', ticker: '600016', sector: '金融' },
    { name: '中信证券股份有限公司', ticker: '600030', sector: '金融' },
    { name: '海通证券股份有限公司', ticker: '600837', sector: '金融' },
    { name: '华泰证券股份有限公司', ticker: '601688', sector: '金融' },
    { name: '中国联合网络通信股份有限公司', ticker: '600050', sector: '通信' },
    { name: '中国移动通信股份有限公司', ticker: '600941', sector: '通信' }
  ]

  const filtered = knownSSECompanies.filter(company => 
    company.name.includes(query) ||
    company.ticker.includes(query) ||
    company.sector.includes(query)
  )

  return filtered.map(company => ({
    id: `sse-${company.ticker}`,
    name: company.name,
    ticker: company.ticker,
    exchange: 'sse',
    sector: company.sector
  }))
}

/**
 * 搜索深圳证券交易所公司
 */
export async function searchSZSECompanies(query: string): Promise<CompanySearchResult[]> {
  try {
    // 由于网络限制，使用预设的知名深交所公司列表
    return await fallbackSZSESearch(query)
  } catch (error) {
    console.error('SZSE search error:', error)
    return await fallbackSZSESearch(query)
  }
}

/**
 * 备用深交所搜索
 */
async function fallbackSZSESearch(query: string): Promise<CompanySearchResult[]> {
  const knownSZSECompanies = [
    { name: '腾讯控股有限公司', ticker: '000700', sector: '科技' },
    { name: '深圳市腾讯计算机系统有限公司', ticker: '000700', sector: '科技' },
    { name: '比亚迪股份有限公司', ticker: '002594', sector: '汽车' },
    { name: '万科企业股份有限公司', ticker: '000002', sector: '房地产' },
    { name: '中国平安保险(集团)股份有限公司', ticker: '000001', sector: '金融' },
    { name: '美的集团股份有限公司', ticker: '000333', sector: '家电' },
    { name: '格力电器股份有限公司', ticker: '000651', sector: '家电' },
    { name: '海康威视数字技术股份有限公司', ticker: '002415', sector: '科技' },
    { name: '大族激光科技产业集团股份有限公司', ticker: '002008', sector: '科技' },
    { name: '深圳迈瑞生物医疗电子股份有限公司', ticker: '300760', sector: '医疗' },
    { name: '宁德时代新能源科技股份有限公司', ticker: '300750', sector: '新能源' },
    { name: '东方财富信息股份有限公司', ticker: '300059', sector: '金融科技' },
    { name: '顺丰控股股份有限公司', ticker: '002352', sector: '物流' },
    { name: '三一重工股份有限公司', ticker: '600031', sector: '机械' },
    { name: '中兴通讯股份有限公司', ticker: '000063', sector: '通信' },
    { name: '京东方科技集团股份有限公司', ticker: '000725', sector: '科技' },
    { name: '立讯精密工业股份有限公司', ticker: '002475', sector: '电子' },
    { name: '温氏食品集团股份有限公司', ticker: '300498', sector: '农业' },
    { name: '牧原食品股份有限公司', ticker: '002714', sector: '农业' },
    { name: '恒瑞医药股份有限公司', ticker: '600276', sector: '医药' }
  ]

  const filtered = knownSZSECompanies.filter(company => 
    company.name.includes(query) ||
    company.ticker.includes(query) ||
    company.sector.includes(query)
  )

  return filtered.map(company => ({
    id: `szse-${company.ticker}`,
    name: company.name,
    ticker: company.ticker,
    exchange: 'szse',
    sector: company.sector
  }))
}

/**
 * 获取A股公司招股书列表
 */
export async function getChinaCompanyProspectuses(ticker: string, exchange: 'sse' | 'szse'): Promise<ProspectusInfo[]> {
  try {
    // 由于实际爬取A股招股书数据比较复杂，这里提供模拟数据
    const prospectuses: ProspectusInfo[] = []

    // 生成模拟招股书数据
    const mockProspectuses = [
      {
        type: 'IPO招股说明书',
        date: '2023-12-15',
        docType: 'IPO' as const
      },
      {
        type: '首次公开发行股票招股说明书',
        date: '2023-11-20',
        docType: 'IPO' as const
      },
      {
        type: '配股说明书',
        date: '2024-01-10',
        docType: 'Rights' as const
      }
    ]

    mockProspectuses.forEach((mock, index) => {
      prospectuses.push({
        id: `${exchange}-${ticker}-${index}`,
        companyName: getCompanyNameByTicker(ticker, exchange),
        ticker: ticker,
        exchange: exchange,
        filingDate: mock.date,
        documentUrl: generateMockDocumentUrl(ticker, exchange, mock.type),
        documentType: mock.docType,
      })
    })

    return prospectuses

  } catch (error) {
    console.error('Get China prospectuses error:', error)
    
    // 返回最基本的模拟数据
    return [{
      id: `${exchange}-${ticker}-demo`,
      companyName: getCompanyNameByTicker(ticker, exchange),
      ticker: ticker,
      exchange: exchange,
      filingDate: '2024-01-15',
      documentUrl: '#',
      documentType: 'IPO',
    }]
  }
}

/**
 * 工具函数
 */

/**
 * 根据股票代码获取公司名称
 */
function getCompanyNameByTicker(ticker: string, exchange: 'sse' | 'szse'): string {
  // 简单的映射，实际应用中应该查询数据库
  const companyMap: Record<string, string> = {
    '600519': '贵州茅台酒股份有限公司',
    '000858': '五粮液股份有限公司',
    '600036': '招商银行股份有限公司',
    '000002': '万科企业股份有限公司',
    '000001': '中国平安保险集团股份有限公司',
    '000700': '腾讯控股有限公司',
    '002594': '比亚迪股份有限公司',
    '300760': '深圳迈瑞生物医疗电子股份有限公司',
    '300750': '宁德时代新能源科技股份有限公司'
  }

  return companyMap[ticker] || `公司${ticker}`
}

/**
 * 生成模拟文档URL
 */
function generateMockDocumentUrl(ticker: string, exchange: string, docType: string): string {
  // 实际应用中这里应该是真实的文档URL
  return `#mock-document-${exchange}-${ticker}-${docType.replace(/\s+/g, '-')}`
}

/**
 * 验证A股股票代码格式
 */
export function isValidChinaTicker(ticker: string): boolean {
  // A股代码通常是6位数字
  return /^\d{6}$/.test(ticker)
}

/**
 * 判断股票代码属于哪个交易所
 */
export function getChinaExchangeByTicker(ticker: string): 'sse' | 'szse' | null {
  if (!isValidChinaTicker(ticker)) {
    return null
  }

  const code = parseInt(ticker)
  
  // 上交所: 600xxx, 601xxx, 603xxx, 605xxx, 688xxx(科创板)
  if ((code >= 600000 && code <= 603999) || 
      (code >= 605000 && code <= 605999) ||
      (code >= 688000 && code <= 688999)) {
    return 'sse'
  }
  
  // 深交所: 000xxx(主板), 001xxx(主板), 002xxx(中小板), 003xxx(主板), 300xxx(创业板)
  if ((code >= 0 && code <= 3999) ||
      (code >= 300000 && code <= 300999)) {
    return 'szse'
  }
  
  return null
}

/**
 * 获取板块信息
 */
export function getChinaBoardInfo(ticker: string): string {
  if (!isValidChinaTicker(ticker)) {
    return '未知板块'
  }

  const code = parseInt(ticker)
  
  if (code >= 688000 && code <= 688999) {
    return '科创板'
  }
  if (code >= 300000 && code <= 300999) {
    return '创业板'
  }
  if ((code >= 600000 && code <= 603999) || (code >= 605000 && code <= 605999)) {
    return '上交所主板'
  }
  if (code >= 2000 && code <= 2999) {
    return '中小板'
  }
  if ((code >= 0 && code <= 1999) || (code >= 3000 && code <= 3999)) {
    return '深交所主板'
  }
  
  return '未知板块'
}

/**
 * 格式化A股股票代码显示
 */
export function formatChinaTicker(ticker: string, exchange?: 'sse' | 'szse'): string {
  if (!isValidChinaTicker(ticker)) {
    return ticker
  }

  const detectedExchange = exchange || getChinaExchangeByTicker(ticker)
  const suffix = detectedExchange === 'sse' ? '.SH' : '.SZ'
  
  return `${ticker}${suffix}`
}

/**
 * 搜索所有A股市场
 */
export async function searchChinaStocks(query: string): Promise<CompanySearchResult[]> {
  try {
    const [sseResults, szseResults] = await Promise.all([
      searchSSECompanies(query).catch(() => []),
      searchSZSECompanies(query).catch(() => [])
    ])

    const allResults = [...sseResults, ...szseResults]
    
    // 去重
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.ticker === result.ticker)
    )

    return uniqueResults.slice(0, 20) // 限制返回结果数量

  } catch (error) {
    console.error('China stocks search error:', error)
    return []
  }
}