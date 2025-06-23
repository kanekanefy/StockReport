// 交易所类型
export type Exchange = 'hkex' | 'nyse' | 'nasdaq' | 'sse' | 'szse'

// 公司搜索结果
export interface CompanySearchResult {
  id: string
  name: string
  ticker: string
  exchange: Exchange
  sector?: string
  marketCap?: number
  prospectusUrl?: string
}

// 招股书信息
export interface ProspectusInfo {
  id: string
  companyName: string
  ticker: string
  exchange: Exchange
  filingDate: string
  documentUrl: string
  documentType: 'IPO' | 'Secondary' | 'Rights'
  fileSize?: number
  pages?: number
}

// 分析方法类型
export type AnalysisMethod = 
  | 'buffett'     // 巴菲特价值投资
  | 'lynch'       // 彼得·林奇成长股
  | 'graham'      // 格雷厄姆安全边际
  | 'fisher'      // 菲利普·费舍15要点

// 分析结果
export interface AnalysisResult {
  id: string
  prospectusId: string
  method: AnalysisMethod
  score: number // 1-10分
  summary: string
  strengths: string[]
  weaknesses: string[]
  risks: string[]
  recommendation: 'Buy' | 'Hold' | 'Sell' | 'Avoid'
  keyMetrics: Record<string, number>
  createdAt: string
}

// 财务数据
export interface FinancialData {
  revenue: number[]        // 营收(最近3年)
  netIncome: number[]      // 净利润
  totalAssets: number      // 总资产
  totalDebt: number        // 总负债
  shareholderEquity: number // 股东权益
  operatingCashFlow: number[] // 经营现金流
  freeCashFlow: number[]   // 自由现金流
  roe: number             // 股东权益回报率
  roa: number             // 资产回报率
  debtToEquity: number    // 负债权益比
  currentRatio: number    // 流动比率
}

// 报告配置
export interface ReportConfig {
  template: string
  includeCharts: boolean
  language: 'zh' | 'en'
  format: 'pdf' | 'docx' | 'html'
  analysisDepth: 'basic' | 'detailed' | 'comprehensive'
}