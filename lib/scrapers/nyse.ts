import axios from 'axios'
import * as cheerio from 'cheerio'
import { CompanySearchResult, ProspectusInfo } from '@/types'

// 纽约证券交易所API配置
const NYSE_BASE_URL = 'https://www.nyse.com'
const SEC_BASE_URL = 'https://www.sec.gov'
const EDGAR_SEARCH_URL = 'https://efts.sec.gov/LATEST/search-index'

/**
 * 搜索NYSE上市公司
 */
export async function searchNYSECompanies(query: string): Promise<CompanySearchResult[]> {
  try {
    // 使用SEC EDGAR API进行搜索
    const response = await axios.get(`${EDGAR_SEARCH_URL}`, {
      params: {
        q: query,
        dateRange: 'all',
        category: 'custom',
        forms: ['10-K', 'S-1', 'F-1'], // 重点关注IPO相关文件
        startdt: '2020-01-01',
        enddt: new Date().toISOString().split('T')[0]
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StockReport/1.0; research)',
        'Accept': 'application/json'
      },
      timeout: 15000,
    })

    const results: CompanySearchResult[] = []
    
    if (response.data && response.data.hits && response.data.hits.hits) {
      const hits = response.data.hits.hits.slice(0, 20) // 限制结果数量
      
      for (const hit of hits) {
        const source = hit._source
        if (source && source.display_names && source.display_names.length > 0) {
          const companyName = source.display_names[0]
          const ticker = extractTickerFromCompanyName(companyName) || source.ticker
          
          if (ticker && companyName) {
            results.push({
              id: `nyse-${ticker}`,
              name: cleanCompanyName(companyName),
              ticker: ticker,
              exchange: 'nyse',
              sector: determineSector(companyName),
            })
          }
        }
      }
    }

    // 如果SEC搜索没有结果，使用备用搜索
    if (results.length === 0) {
      return await fallbackNYSESearch(query)
    }

    // 去重
    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.ticker === result.ticker)
    )

    return uniqueResults

  } catch (error) {
    console.error('NYSE search error:', error)
    return await fallbackNYSESearch(query)
  }
}

/**
 * 备用NYSE搜索
 */
async function fallbackNYSESearch(query: string): Promise<CompanySearchResult[]> {
  // 使用知名NYSE公司列表进行模糊匹配
  const knownNYSECompanies = [
    { name: 'Apple Inc.', ticker: 'AAPL', sector: 'Technology' },
    { name: 'Microsoft Corporation', ticker: 'MSFT', sector: 'Technology' },
    { name: 'Amazon.com Inc.', ticker: 'AMZN', sector: 'Consumer Discretionary' },
    { name: 'Alphabet Inc.', ticker: 'GOOGL', sector: 'Technology' },
    { name: 'Tesla Inc.', ticker: 'TSLA', sector: 'Consumer Discretionary' },
    { name: 'Meta Platforms Inc.', ticker: 'META', sector: 'Technology' },
    { name: 'NVIDIA Corporation', ticker: 'NVDA', sector: 'Technology' },
    { name: 'JPMorgan Chase & Co.', ticker: 'JPM', sector: 'Financial Services' },
    { name: 'Johnson & Johnson', ticker: 'JNJ', sector: 'Healthcare' },
    { name: 'Visa Inc.', ticker: 'V', sector: 'Financial Services' },
    { name: 'Procter & Gamble Co.', ticker: 'PG', sector: 'Consumer Staples' },
    { name: 'Mastercard Inc.', ticker: 'MA', sector: 'Financial Services' },
    { name: 'UnitedHealth Group Inc.', ticker: 'UNH', sector: 'Healthcare' },
    { name: 'Home Depot Inc.', ticker: 'HD', sector: 'Consumer Discretionary' },
    { name: 'Bank of America Corp.', ticker: 'BAC', sector: 'Financial Services' }
  ]

  const filtered = knownNYSECompanies.filter(company => 
    company.name.toLowerCase().includes(query.toLowerCase()) ||
    company.ticker.toLowerCase().includes(query.toLowerCase())
  )

  return filtered.map(company => ({
    id: `nyse-${company.ticker}`,
    name: company.name,
    ticker: company.ticker,
    exchange: 'nyse',
    sector: company.sector
  }))
}

/**
 * 搜索NASDAQ上市公司
 */
export async function searchNASDAQCompanies(query: string): Promise<CompanySearchResult[]> {
  try {
    // 类似NYSE的搜索逻辑，但针对NASDAQ
    const response = await axios.get(`${EDGAR_SEARCH_URL}`, {
      params: {
        q: query,
        dateRange: 'all',
        category: 'custom',
        forms: ['10-K', 'S-1', 'F-1'],
        startdt: '2020-01-01',
        enddt: new Date().toISOString().split('T')[0]
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StockReport/1.0; research)',
        'Accept': 'application/json'
      },
      timeout: 15000,
    })

    const results: CompanySearchResult[] = []
    
    if (response.data && response.data.hits && response.data.hits.hits) {
      const hits = response.data.hits.hits.slice(0, 20)
      
      for (const hit of hits) {
        const source = hit._source
        if (source && source.display_names && source.display_names.length > 0) {
          const companyName = source.display_names[0]
          const ticker = extractTickerFromCompanyName(companyName) || source.ticker
          
          if (ticker && companyName && isLikelyNASDAQ(ticker)) {
            results.push({
              id: `nasdaq-${ticker}`,
              name: cleanCompanyName(companyName),
              ticker: ticker,
              exchange: 'nasdaq',
              sector: determineSector(companyName),
            })
          }
        }
      }
    }

    if (results.length === 0) {
      return await fallbackNASDAQSearch(query)
    }

    const uniqueResults = results.filter((result, index, self) => 
      index === self.findIndex(r => r.ticker === result.ticker)
    )

    return uniqueResults

  } catch (error) {
    console.error('NASDAQ search error:', error)
    return await fallbackNASDAQSearch(query)
  }
}

/**
 * 备用NASDAQ搜索
 */
async function fallbackNASDAQSearch(query: string): Promise<CompanySearchResult[]> {
  const knownNASDAQCompanies = [
    { name: 'Netflix Inc.', ticker: 'NFLX', sector: 'Communication Services' },
    { name: 'PayPal Holdings Inc.', ticker: 'PYPL', sector: 'Financial Services' },
    { name: 'Adobe Inc.', ticker: 'ADBE', sector: 'Technology' },
    { name: 'Cisco Systems Inc.', ticker: 'CSCO', sector: 'Technology' },
    { name: 'PepsiCo Inc.', ticker: 'PEP', sector: 'Consumer Staples' },
    { name: 'Intel Corporation', ticker: 'INTC', sector: 'Technology' },
    { name: 'Comcast Corporation', ticker: 'CMCSA', sector: 'Communication Services' },
    { name: 'Broadcom Inc.', ticker: 'AVGO', sector: 'Technology' },
    { name: 'Texas Instruments Inc.', ticker: 'TXN', sector: 'Technology' },
    { name: 'Qualcomm Inc.', ticker: 'QCOM', sector: 'Technology' },
    { name: 'Amgen Inc.', ticker: 'AMGN', sector: 'Healthcare' },
    { name: 'Starbucks Corporation', ticker: 'SBUX', sector: 'Consumer Discretionary' },
    { name: 'Gilead Sciences Inc.', ticker: 'GILD', sector: 'Healthcare' },
    { name: 'Mondelez International Inc.', ticker: 'MDLZ', sector: 'Consumer Staples' },
    { name: 'Advanced Micro Devices Inc.', ticker: 'AMD', sector: 'Technology' }
  ]

  const filtered = knownNASDAQCompanies.filter(company => 
    company.name.toLowerCase().includes(query.toLowerCase()) ||
    company.ticker.toLowerCase().includes(query.toLowerCase())
  )

  return filtered.map(company => ({
    id: `nasdaq-${company.ticker}`,
    name: company.name,
    ticker: company.ticker,
    exchange: 'nasdaq',
    sector: company.sector
  }))
}

/**
 * 获取美股公司的招股书列表
 */
export async function getUSCompanyProspectuses(ticker: string, exchange: 'nyse' | 'nasdaq'): Promise<ProspectusInfo[]> {
  try {
    // 使用SEC EDGAR API搜索招股书
    const response = await axios.get(`${EDGAR_SEARCH_URL}`, {
      params: {
        q: ticker,
        dateRange: 'all',
        category: 'custom',
        forms: ['S-1', 'F-1', '424B1', '424B2', '424B3', '424B4', '424B5'], // 招股书相关表格
        startdt: '2015-01-01',
        enddt: new Date().toISOString().split('T')[0]
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StockReport/1.0; research)',
        'Accept': 'application/json'
      },
      timeout: 15000,
    })

    const prospectuses: ProspectusInfo[] = []

    if (response.data && response.data.hits && response.data.hits.hits) {
      const hits = response.data.hits.hits.slice(0, 10) // 限制结果数量
      
      for (const hit of hits) {
        const source = hit._source
        if (source) {
          const filingDate = source.file_date || source.period_ending
          const documentUrl = source.root_form ? 
            `${SEC_BASE_URL}/Archives/edgar/data/${source.ciks[0]}/${source.root_form.replace(/-/g, '')}/${source.root_form}` :
            '#'

          prospectuses.push({
            id: `${exchange}-${ticker}-${filingDate}`,
            companyName: source.display_names?.[0] || `Company ${ticker}`,
            ticker: ticker,
            exchange: exchange,
            filingDate: formatSECDate(filingDate),
            documentUrl: documentUrl,
            documentType: determineUSDocumentType(source.form),
            fileSize: source.size,
          })
        }
      }
    }

    // 如果没有找到招股书，返回模拟数据
    if (prospectuses.length === 0) {
      prospectuses.push({
        id: `${exchange}-${ticker}-demo`,
        companyName: `Company ${ticker}`,
        ticker: ticker,
        exchange: exchange,
        filingDate: '2024-01-15',
        documentUrl: '#', // 演示用空链接
        documentType: 'IPO',
      })
    }

    return prospectuses

  } catch (error) {
    console.error('Get US prospectuses error:', error)
    // 返回模拟数据
    return [{
      id: `${exchange}-${ticker}-demo`,
      companyName: `Company ${ticker}`,
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
 * 从公司名称中提取股票代码
 */
function extractTickerFromCompanyName(name: string): string | null {
  // 匹配括号内的股票代码
  const match = name.match(/\(([A-Z]{1,5})\)/)
  return match ? match[1] : null
}

/**
 * 清理公司名称
 */
function cleanCompanyName(name: string): string {
  return name
    .replace(/\([A-Z]{1,5}\)/g, '') // 移除股票代码
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 根据公司名称推断行业
 */
function determineSector(companyName: string): string {
  const name = companyName.toLowerCase()
  
  if (name.includes('bank') || name.includes('financial') || name.includes('capital')) {
    return 'Financial Services'
  }
  if (name.includes('tech') || name.includes('software') || name.includes('systems')) {
    return 'Technology'
  }
  if (name.includes('pharma') || name.includes('bio') || name.includes('health')) {
    return 'Healthcare'
  }
  if (name.includes('energy') || name.includes('oil') || name.includes('gas')) {
    return 'Energy'
  }
  if (name.includes('retail') || name.includes('consumer')) {
    return 'Consumer Discretionary'
  }
  
  return 'Diversified'
}

/**
 * 判断是否可能是NASDAQ股票
 */
function isLikelyNASDAQ(ticker: string): boolean {
  // NASDAQ通常有更多4-5字母的股票代码
  return ticker.length >= 4 || /^[A-Z]{3,5}$/.test(ticker)
}

/**
 * 格式化SEC日期
 */
function formatSECDate(dateStr: string): string {
  try {
    if (!dateStr) return new Date().toISOString().split('T')[0]
    
    // SEC日期通常是YYYY-MM-DD格式
    if (dateStr.includes('-')) {
      return dateStr.split('T')[0] // 移除时间部分
    }
    
    return dateStr
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

/**
 * 确定美股文档类型
 */
function determineUSDocumentType(form: string): 'IPO' | 'Secondary' | 'Rights' {
  if (!form) return 'IPO'
  
  const formUpper = form.toUpperCase()
  
  if (formUpper.includes('S-1') || formUpper.includes('F-1')) {
    return 'IPO'
  }
  if (formUpper.includes('424B')) {
    return 'Secondary'
  }
  
  return 'IPO'
}

/**
 * 验证美股股票代码格式
 */
export function isValidUSSTicker(ticker: string): boolean {
  // 美股代码通常是1-5个字母
  return /^[A-Z]{1,5}$/.test(ticker.toUpperCase())
}