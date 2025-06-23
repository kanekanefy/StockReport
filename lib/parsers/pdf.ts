import axios from 'axios'
import pdf from 'pdf-parse'
import { FinancialData } from '@/types'

/**
 * PDF下载和解析工具类
 */
export class PDFParser {
  /**
   * 下载PDF文件
   */
  static async downloadPDF(url: string): Promise<Buffer> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      return Buffer.from(response.data)
    } catch (error) {
      throw new Error(`Failed to download PDF: ${error}`)
    }
  }

  /**
   * 解析PDF文本内容
   */
  static async parsePDFText(pdfBuffer: Buffer): Promise<string> {
    try {
      const data = await pdf(pdfBuffer)
      return data.text
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error}`)
    }
  }

  /**
   * 从PDF中提取财务数据
   */
  static extractFinancialData(text: string): Partial<FinancialData> {
    const financialData: Partial<FinancialData> = {}
    
    try {
      // 提取营收数据 (支持中英文)
      const revenuePatterns = [
        /revenue[:\s]+([0-9,]+\.?[0-9]*)/gi,
        /total revenue[:\s]+([0-9,]+\.?[0-9]*)/gi,
        /营业收入[：:\s]+([0-9,]+\.?[0-9]*)/gi,
        /总收入[：:\s]+([0-9,]+\.?[0-9]*)/gi
      ]
      
      const revenueMatches = this.extractNumbersByPatterns(text, revenuePatterns)
      if (revenueMatches.length > 0) {
        financialData.revenue = revenueMatches.slice(0, 3) // 最近3年
      }

      // 提取净利润
      const netIncomePatterns = [
        /net income[:\s]+([0-9,]+\.?[0-9]*)/gi,
        /profit for the year[:\s]+([0-9,]+\.?[0-9]*)/gi,
        /净利润[：:\s]+([0-9,]+\.?[0-9]*)/gi,
        /年度利润[：:\s]+([0-9,]+\.?[0-9]*)/gi
      ]
      
      const netIncomeMatches = this.extractNumbersByPatterns(text, netIncomePatterns)
      if (netIncomeMatches.length > 0) {
        financialData.netIncome = netIncomeMatches.slice(0, 3)
      }

      // 提取总资产
      const totalAssetsPatterns = [
        /total assets[:\s]+([0-9,]+\.?[0-9]*)/gi,
        /总资产[：:\s]+([0-9,]+\.?[0-9]*)/gi
      ]
      
      const totalAssetsMatch = this.extractNumbersByPatterns(text, totalAssetsPatterns)
      if (totalAssetsMatch.length > 0) {
        financialData.totalAssets = totalAssetsMatch[0]
      }

      // 提取负债
      const totalDebtPatterns = [
        /total liabilities[:\s]+([0-9,]+\.?[0-9]*)/gi,
        /total debt[:\s]+([0-9,]+\.?[0-9]*)/gi,
        /总负债[：:\s]+([0-9,]+\.?[0-9]*)/gi
      ]
      
      const totalDebtMatch = this.extractNumbersByPatterns(text, totalDebtPatterns)
      if (totalDebtMatch.length > 0) {
        financialData.totalDebt = totalDebtMatch[0]
      }

      // 提取股东权益
      const equityPatterns = [
        /shareholders['\s]*equity[:\s]+([0-9,]+\.?[0-9]*)/gi,
        /total equity[:\s]+([0-9,]+\.?[0-9]*)/gi,
        /股东权益[：:\s]+([0-9,]+\.?[0-9]*)/gi
      ]
      
      const equityMatch = this.extractNumbersByPatterns(text, equityPatterns)
      if (equityMatch.length > 0) {
        financialData.shareholderEquity = equityMatch[0]
      }

      // 提取现金流数据
      const cashFlowPatterns = [
        /operating cash flow[:\s]+([0-9,]+\.?[0-9]*)/gi,
        /cash from operations[:\s]+([0-9,]+\.?[0-9]*)/gi,
        /经营活动现金流[：:\s]+([0-9,]+\.?[0-9]*)/gi
      ]
      
      const cashFlowMatches = this.extractNumbersByPatterns(text, cashFlowPatterns)
      if (cashFlowMatches.length > 0) {
        financialData.operatingCashFlow = cashFlowMatches.slice(0, 3)
      }

      // 计算财务比率
      if (financialData.netIncome && financialData.shareholderEquity) {
        financialData.roe = (financialData.netIncome[0] / financialData.shareholderEquity) * 100
      }

      if (financialData.netIncome && financialData.totalAssets) {
        financialData.roa = (financialData.netIncome[0] / financialData.totalAssets) * 100
      }

      if (financialData.totalDebt && financialData.shareholderEquity) {
        financialData.debtToEquity = financialData.totalDebt / financialData.shareholderEquity
      }

    } catch (error) {
      console.error('Error extracting financial data:', error)
    }

    return financialData
  }

  /**
   * 使用多个正则模式提取数字
   */
  private static extractNumbersByPatterns(text: string, patterns: RegExp[]): number[] {
    const numbers: number[] = []
    
    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const numberStr = match[1].replace(/,/g, '')
        const number = parseFloat(numberStr)
        if (!isNaN(number)) {
          numbers.push(number)
        }
      }
    }
    
    return numbers
  }

  /**
   * 提取业务关键信息
   */
  static extractBusinessInfo(text: string): {
    businessModel?: string
    marketPosition?: string
    competitiveAdvantages?: string[]
    risks?: string[]
    managementTeam?: string[]
  } {
    const businessInfo: any = {}

    try {
      // 提取业务模式描述
      const businessModelPatterns = [
        /business model[:\s]+([^.]{100,500})/gi,
        /our business[:\s]+([^.]{100,500})/gi,
        /业务模式[：:\s]+([^。]{100,500})/gi
      ]
      
      const businessModelMatch = this.extractTextByPatterns(text, businessModelPatterns)
      if (businessModelMatch) {
        businessInfo.businessModel = businessModelMatch
      }

      // 提取竞争优势
      const advantagePatterns = [
        /competitive advantages?[:\s]+([^.]{100,500})/gi,
        /our strengths?[:\s]+([^.]{100,500})/gi,
        /竞争优势[：:\s]+([^。]{100,500})/gi
      ]
      
      const advantages = this.extractMultipleTextByPatterns(text, advantagePatterns)
      if (advantages.length > 0) {
        businessInfo.competitiveAdvantages = advantages
      }

      // 提取风险因素
      const riskPatterns = [
        /risk factors?[:\s]+([^.]{100,500})/gi,
        /risks?[:\s]+([^.]{100,500})/gi,
        /风险因素[：:\s]+([^。]{100,500})/gi
      ]
      
      const risks = this.extractMultipleTextByPatterns(text, riskPatterns)
      if (risks.length > 0) {
        businessInfo.risks = risks
      }

    } catch (error) {
      console.error('Error extracting business info:', error)
    }

    return businessInfo
  }

  /**
   * 使用多个正则模式提取文本
   */
  private static extractTextByPatterns(text: string, patterns: RegExp[]): string | null {
    for (const pattern of patterns) {
      const match = pattern.exec(text)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
    return null
  }

  /**
   * 使用多个正则模式提取多个文本
   */
  private static extractMultipleTextByPatterns(text: string, patterns: RegExp[]): string[] {
    const results: string[] = []
    
    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        if (match[1]) {
          results.push(match[1].trim())
        }
      }
    }
    
    return results
  }

  /**
   * 验证PDF文件
   */
  static async validatePDF(pdfBuffer: Buffer): Promise<boolean> {
    try {
      const data = await pdf(pdfBuffer)
      return data.numpages > 0 && data.text.length > 100
    } catch {
      return false
    }
  }

  /**
   * 获取PDF元数据
   */
  static async getPDFMetadata(pdfBuffer: Buffer): Promise<{
    pages: number
    title?: string
    author?: string
    creationDate?: Date
  }> {
    try {
      const data = await pdf(pdfBuffer)
      return {
        pages: data.numpages,
        title: data.info?.Title,
        author: data.info?.Author,
        creationDate: data.info?.CreationDate
      }
    } catch (error) {
      throw new Error(`Failed to get PDF metadata: ${error}`)
    }
  }
}

/**
 * PDF处理工具函数
 */
export async function downloadAndParsePDF(url: string): Promise<{
  text: string
  financialData: Partial<FinancialData>
  businessInfo: any
  metadata: any
}> {
  try {
    // 下载PDF
    const pdfBuffer = await PDFParser.downloadPDF(url)
    
    // 验证PDF
    const isValid = await PDFParser.validatePDF(pdfBuffer)
    if (!isValid) {
      throw new Error('Invalid PDF file')
    }
    
    // 解析文本
    const text = await PDFParser.parsePDFText(pdfBuffer)
    
    // 提取财务数据
    const financialData = PDFParser.extractFinancialData(text)
    
    // 提取业务信息
    const businessInfo = PDFParser.extractBusinessInfo(text)
    
    // 获取元数据
    const metadata = await PDFParser.getPDFMetadata(pdfBuffer)
    
    return {
      text,
      financialData,
      businessInfo,
      metadata
    }
  } catch (error) {
    throw new Error(`PDF processing failed: ${error}`)
  }
}