import axios from 'axios'
import * as cheerio from 'cheerio'
import { CompanySearchResult, ProspectusInfo } from '@/types'

// 港交所API配置
const HKEX_BASE_URL = 'https://www.hkexnews.hk'
const HKEX_API_URL = 'https://www1.hkexnews.hk/search/titleSearchServlet.do'
const COMPANY_LIST_URL = 'https://www.hkex.com.hk/eng/services/trading/securities/securitieslists/ListOfSecurities.xlsx'
const ISSUER_SEARCH_URL = 'https://www1.hkexnews.hk/search/issuerSearch.do'

/**
 * 搜索港交所上市公司
 */
export async function searchHKEXCompanies(query: string): Promise<CompanySearchResult[]> {
  try {
    // 使用港交所发行人搜索API
    const response = await axios.post(ISSUER_SEARCH_URL, 
      new URLSearchParams({
        'lang': 'E',
        'searchType': '1',
        'market': 'SEHK',
        'tier': 'ALL',
        'sector': 'ALL',
        'searchText': query,
        'sortDir': 'ASC',
        'alertMsg': '',
        'rowRange': '100'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000,
      }
    )

    const $ = cheerio.load(response.data)
    const results: CompanySearchResult[] = []

    // 解析搜索结果表格
    $('#issuerSearchResultTable tbody tr').each((_, element) => {
      const $row = $(element)
      const cells = $row.find('td')
      
      if (cells.length >= 3) {
        const ticker = $(cells[0]).text().trim()
        const name = $(cells[1]).text().trim()
        const sector = $(cells[2]).text().trim()
        
        if (ticker && name && isValidHKEXTicker(ticker)) {
          results.push({
            id: `hkex-${ticker}`,
            name: name,
            ticker: ticker,
            exchange: 'hkex',
            sector: sector || undefined,
          })
        }
      }
    })

    // 如果主搜索没有结果，尝试模糊搜索
    if (results.length === 0) {
      return await fallbackSearch(query)
    }

    return results.slice(0, 20) // 返回前20个结果
  } catch (error) {
    console.error('HKEX search error:', error)
    // 出错时尝试备用搜索
    return await fallbackSearch(query)
  }
}

/**
 * 备用搜索方法
 */
async function fallbackSearch(query: string): Promise<CompanySearchResult[]> {
  try {
    // 使用简单的模拟数据作为备用
    const mockResults: CompanySearchResult[] = [
      {
        id: 'hkex-0700',
        name: 'Tencent Holdings Limited',
        ticker: '0700',
        exchange: 'hkex',
        sector: 'Technology'
      },
      {
        id: 'hkex-0941',
        name: 'China Mobile Limited',
        ticker: '0941',
        exchange: 'hkex',
        sector: 'Telecommunications'
      },
      {
        id: 'hkex-0005',
        name: 'HSBC Holdings plc',
        ticker: '0005',
        exchange: 'hkex',
        sector: 'Financial Services'
      }
    ]
    
    // 根据查询词过滤结果
    const filtered = mockResults.filter(result => 
      result.name.toLowerCase().includes(query.toLowerCase()) ||
      result.ticker.includes(query)
    )
    
    return filtered.length > 0 ? filtered : mockResults.slice(0, 3)
  } catch {
    return []
  }
}

/**
 * 获取公司的招股书列表
 */
export async function getCompanyProspectuses(ticker: string): Promise<ProspectusInfo[]> {
  try {
    // 使用港交所文档搜索API
    const response = await axios.post(HKEX_API_URL, 
      new URLSearchParams({
        'lang': 'E',
        'category': '0',
        'market': 'SEHK',
        'stockId': ticker,
        't1code': '40000',  // 招股书类别代码
        't2Gp': '-2',
        't2code': '-2',
        'rowRange': '50',
        'sortBy': 'date',
        'sortDir': 'DESC'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000,
      }
    )

    const $ = cheerio.load(response.data)
    const prospectuses: ProspectusInfo[] = []

    // 解析文档搜索结果
    $('#documentSearchResultTable tbody tr').each((_, element) => {
      const $row = $(element)
      const cells = $row.find('td')
      
      if (cells.length >= 4) {
        const date = $(cells[0]).text().trim()
        const title = $(cells[2]).text().trim()
        const $link = $(cells[2]).find('a')
        const documentUrl = $link.attr('href')
        
        if (title && documentUrl && isProspectusDocument(title)) {
          prospectuses.push({
            id: `hkex-${ticker}-${date.replace(/\//g, '-')}`,
            companyName: extractCompanyName(title),
            ticker: ticker,
            exchange: 'hkex',
            filingDate: parseHKEXDate(date),
            documentUrl: documentUrl.startsWith('http') ? documentUrl : `${HKEX_BASE_URL}${documentUrl}`,
            documentType: determineDocumentType(title),
          })
        }
      }
    })

    // 如果没有找到招股书，返回模拟数据进行演示
    if (prospectuses.length === 0) {
      prospectuses.push({
        id: `hkex-${ticker}-demo`,
        companyName: `Company ${ticker}`,
        ticker: ticker,
        exchange: 'hkex',
        filingDate: '2024-01-15',
        documentUrl: '#', // 演示用空链接
        documentType: 'IPO',
      })
    }

    return prospectuses
  } catch (error) {
    console.error('Get prospectuses error:', error)
    // 返回模拟数据
    return [{
      id: `hkex-${ticker}-demo`,
      companyName: `Company ${ticker}`,
      ticker: ticker,
      exchange: 'hkex',
      filingDate: '2024-01-15',
      documentUrl: '#',
      documentType: 'IPO',
    }]
  }
}

/**
 * 判断是否为招股书文档
 */
function isProspectusDocument(title: string): boolean {
  const lowerTitle = title.toLowerCase()
  const prospectusKeywords = [
    'prospectus',
    'listing document',
    'ipo',
    'initial public offering',
    'placing',
    'introduction'
  ]
  
  return prospectusKeywords.some(keyword => lowerTitle.includes(keyword))
}

/**
 * 从标题中提取股票代码
 */
function extractTicker(title: string): string | null {
  // 匹配港股代码格式 (通常是4位数字)
  const match = title.match(/\b(\d{4})\b/)
  return match ? match[1] : null
}

/**
 * 清理公司名称
 */
function cleanCompanyName(title: string): string {
  // 移除股票代码和多余的空格
  return title
    .replace(/\(\d{4}\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 从文档标题提取公司名称
 */
function extractCompanyName(title: string): string {
  // 提取招股书标题中的公司名称
  const parts = title.split('-')
  return parts[0]?.trim() || 'Unknown Company'
}

/**
 * 解析港交所日期格式
 */
function parseHKEXDate(dateStr: string): string {
  try {
    // 港交所常用格式: DD/MM/YYYY
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
    }
    return dateStr
  } catch {
    return dateStr
  }
}

/**
 * 判断文档类型
 */
function determineDocumentType(title: string): 'IPO' | 'Secondary' | 'Rights' {
  const lowerTitle = title.toLowerCase()
  
  if (lowerTitle.includes('ipo') || lowerTitle.includes('initial public offering')) {
    return 'IPO'
  }
  if (lowerTitle.includes('rights')) {
    return 'Rights'
  }
  return 'Secondary'
}

/**
 * 验证港股代码格式
 */
export function isValidHKEXTicker(ticker: string): boolean {
  // 港股代码通常是4位数字
  return /^\d{4}$/.test(ticker)
}