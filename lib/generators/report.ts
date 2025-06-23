import { AnalysisResult, ReportConfig, FinancialData } from '@/types'

/**
 * 投资分析报告生成器
 */
export class ReportGenerator {
  /**
   * 生成投资分析报告
   */
  static generateReport(
    analyses: AnalysisResult[],
    companyInfo: {
      name: string
      ticker: string
      exchange: string
      sector?: string
    },
    financialData: Partial<FinancialData>,
    config: ReportConfig = {
      template: 'comprehensive',
      includeCharts: false,
      language: 'zh',
      format: 'html',
      analysisDepth: 'detailed'
    }
  ): string {
    const { language, template, analysisDepth } = config

    if (language === 'en') {
      return this.generateEnglishReport(analyses, companyInfo, financialData, template, analysisDepth)
    }

    return this.generateChineseReport(analyses, companyInfo, financialData, template, analysisDepth)
  }

  /**
   * 生成中文报告
   */
  private static generateChineseReport(
    analyses: AnalysisResult[],
    companyInfo: any,
    financialData: Partial<FinancialData>,
    template: string,
    depth: string
  ): string {
    const timestamp = new Date().toLocaleString('zh-CN')
    const avgScore = analyses.length > 0 
      ? analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length 
      : 0

    let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyInfo.name} - 投资分析报告</title>
    <style>
        ${this.getReportStyles()}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>投资分析报告</h1>
            <div class="company-info">
                <h2>${companyInfo.name}</h2>
                <p class="ticker">${companyInfo.ticker} · ${companyInfo.exchange.toUpperCase()}</p>
                ${companyInfo.sector ? `<p class="sector">行业：${companyInfo.sector}</p>` : ''}
            </div>
            <div class="report-meta">
                <p>报告生成时间：${timestamp}</p>
                <p>综合评分：<span class="score score-${this.getScoreClass(avgScore)}">${avgScore.toFixed(1)}/10</span></p>
            </div>
        </header>

        <section class="executive-summary">
            <h3>执行摘要</h3>
            ${this.generateExecutiveSummary(analyses, avgScore)}
        </section>

        <section class="financial-overview">
            <h3>财务概览</h3>
            ${this.generateFinancialOverview(financialData)}
        </section>

        <section class="analysis-details">
            <h3>详细分析</h3>
            ${this.generateAnalysisDetails(analyses)}
        </section>

        <section class="investment-recommendation">
            <h3>投资建议</h3>
            ${this.generateInvestmentRecommendation(analyses)}
        </section>

        <section class="risk-assessment">
            <h3>风险评估</h3>
            ${this.generateRiskAssessment(analyses)}
        </section>

        <footer class="footer">
            <p>免责声明：本报告仅供参考，不构成投资建议。投资有风险，入市需谨慎。</p>
            <p>数据来源：招股书分析 | 分析方法：多种投资理论综合分析</p>
        </footer>
    </div>
</body>
</html>`

    return html
  }

  /**
   * 生成英文报告
   */
  private static generateEnglishReport(
    analyses: AnalysisResult[],
    companyInfo: any,
    financialData: Partial<FinancialData>,
    template: string,
    depth: string
  ): string {
    const timestamp = new Date().toLocaleString('en-US')
    const avgScore = analyses.length > 0 
      ? analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length 
      : 0

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${companyInfo.name} - Investment Analysis Report</title>
    <style>
        ${this.getReportStyles()}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>Investment Analysis Report</h1>
            <div class="company-info">
                <h2>${companyInfo.name}</h2>
                <p class="ticker">${companyInfo.ticker} · ${companyInfo.exchange.toUpperCase()}</p>
                ${companyInfo.sector ? `<p class="sector">Sector: ${companyInfo.sector}</p>` : ''}
            </div>
            <div class="report-meta">
                <p>Report Generated: ${timestamp}</p>
                <p>Overall Score: <span class="score score-${this.getScoreClass(avgScore)}">${avgScore.toFixed(1)}/10</span></p>
            </div>
        </header>

        <section class="executive-summary">
            <h3>Executive Summary</h3>
            ${this.generateExecutiveSummaryEN(analyses, avgScore)}
        </section>

        <section class="financial-overview">
            <h3>Financial Overview</h3>
            ${this.generateFinancialOverviewEN(financialData)}
        </section>

        <section class="analysis-details">
            <h3>Detailed Analysis</h3>
            ${this.generateAnalysisDetailsEN(analyses)}
        </section>

        <section class="investment-recommendation">
            <h3>Investment Recommendation</h3>
            ${this.generateInvestmentRecommendationEN(analyses)}
        </section>

        <section class="risk-assessment">
            <h3>Risk Assessment</h3>
            ${this.generateRiskAssessmentEN(analyses)}
        </section>

        <footer class="footer">
            <p>Disclaimer: This report is for reference only and does not constitute investment advice. Investment involves risks.</p>
            <p>Data Source: Prospectus Analysis | Method: Multi-theory Investment Analysis</p>
        </footer>
    </div>
</body>
</html>`

    return html
  }

  /**
   * 生成执行摘要
   */
  private static generateExecutiveSummary(analyses: AnalysisResult[], avgScore: number): string {
    if (analyses.length === 0) {
      return '<p>暂无分析数据可用于生成摘要。</p>'
    }

    const recommendations = analyses.map(a => a.recommendation)
    const mostCommonRec = this.getMostCommon(recommendations)
    const methods = analyses.map(a => this.getMethodNameCN(a.method)).join('、')

    return `
    <div class="summary-card">
        <p><strong>综合评估：</strong>基于${methods}等投资理论的综合分析，该公司获得平均评分 ${avgScore.toFixed(1)}/10分。</p>
        <p><strong>主要建议：</strong>多数分析方法建议 <span class="recommendation">${this.getRecommendationCN(mostCommonRec)}</span>。</p>
        <p><strong>投资亮点：</strong>${this.getTopStrengths(analyses).join('、')}。</p>
        <p><strong>主要风险：</strong>${this.getTopRisks(analyses).join('、')}。</p>
    </div>`
  }

  /**
   * 生成英文执行摘要
   */
  private static generateExecutiveSummaryEN(analyses: AnalysisResult[], avgScore: number): string {
    if (analyses.length === 0) {
      return '<p>No analysis data available for summary generation.</p>'
    }

    const recommendations = analyses.map(a => a.recommendation)
    const mostCommonRec = this.getMostCommon(recommendations)
    const methods = analyses.map(a => this.getMethodNameEN(a.method)).join(', ')

    return `
    <div class="summary-card">
        <p><strong>Overall Assessment:</strong> Based on comprehensive analysis using ${methods} investment theories, the company received an average score of ${avgScore.toFixed(1)}/10.</p>
        <p><strong>Primary Recommendation:</strong> Majority of analysis methods suggest <span class="recommendation">${mostCommonRec}</span>.</p>
        <p><strong>Key Strengths:</strong> ${this.getTopStrengths(analyses).join(', ')}.</p>
        <p><strong>Major Risks:</strong> ${this.getTopRisks(analyses).join(', ')}.</p>
    </div>`
  }

  /**
   * 生成财务概览
   */
  private static generateFinancialOverview(data: Partial<FinancialData>): string {
    const formatNumber = (num: number | undefined) => 
      num ? `${(num / 1e8).toFixed(2)}亿` : '未提供'

    const formatPercent = (num: number | undefined) => 
      num ? `${num.toFixed(2)}%` : '未提供'

    return `
    <div class="financial-grid">
        <div class="financial-item">
            <label>营业收入</label>
            <value>${data.revenue?.map(formatNumber).join(' → ') || '未提供'}</value>
        </div>
        <div class="financial-item">
            <label>净利润</label>
            <value>${data.netIncome?.map(formatNumber).join(' → ') || '未提供'}</value>
        </div>
        <div class="financial-item">
            <label>总资产</label>
            <value>${formatNumber(data.totalAssets)}</value>
        </div>
        <div class="financial-item">
            <label>股东权益回报率</label>
            <value>${formatPercent(data.roe)}</value>
        </div>
        <div class="financial-item">
            <label>资产回报率</label>
            <value>${formatPercent(data.roa)}</value>
        </div>
        <div class="financial-item">
            <label>负债权益比</label>
            <value>${data.debtToEquity ? data.debtToEquity.toFixed(2) : '未提供'}</value>
        </div>
    </div>`
  }

  /**
   * 生成英文财务概览
   */
  private static generateFinancialOverviewEN(data: Partial<FinancialData>): string {
    const formatNumber = (num: number | undefined) => 
      num ? `$${(num / 1e9).toFixed(2)}B` : 'N/A'

    const formatPercent = (num: number | undefined) => 
      num ? `${num.toFixed(2)}%` : 'N/A'

    return `
    <div class="financial-grid">
        <div class="financial-item">
            <label>Revenue</label>
            <value>${data.revenue?.map(formatNumber).join(' → ') || 'N/A'}</value>
        </div>
        <div class="financial-item">
            <label>Net Income</label>
            <value>${data.netIncome?.map(formatNumber).join(' → ') || 'N/A'}</value>
        </div>
        <div class="financial-item">
            <label>Total Assets</label>
            <value>${formatNumber(data.totalAssets)}</value>
        </div>
        <div class="financial-item">
            <label>ROE</label>
            <value>${formatPercent(data.roe)}</value>
        </div>
        <div class="financial-item">
            <label>ROA</label>
            <value>${formatPercent(data.roa)}</value>
        </div>
        <div class="financial-item">
            <label>Debt/Equity</label>
            <value>${data.debtToEquity ? data.debtToEquity.toFixed(2) : 'N/A'}</value>
        </div>
    </div>`
  }

  /**
   * 生成分析详情
   */
  private static generateAnalysisDetails(analyses: AnalysisResult[]): string {
    return analyses.map(analysis => `
    <div class="analysis-section">
        <h4>${this.getMethodNameCN(analysis.method)}分析</h4>
        <div class="analysis-score">
            评分：<span class="score score-${this.getScoreClass(analysis.score)}">${analysis.score}/10</span>
            建议：<span class="recommendation">${this.getRecommendationCN(analysis.recommendation)}</span>
        </div>
        
        <div class="analysis-content">
            <div class="strengths">
                <h5>优势</h5>
                <ul>
                    ${analysis.strengths.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
            
            <div class="weaknesses">
                <h5>劣势</h5>
                <ul>
                    ${analysis.weaknesses.map(w => `<li>${w}</li>`).join('')}
                </ul>
            </div>
            
            <div class="summary">
                <h5>分析总结</h5>
                <p>${analysis.summary}</p>
            </div>
        </div>
    </div>
    `).join('')
  }

  /**
   * 生成英文分析详情
   */
  private static generateAnalysisDetailsEN(analyses: AnalysisResult[]): string {
    return analyses.map(analysis => `
    <div class="analysis-section">
        <h4>${this.getMethodNameEN(analysis.method)} Analysis</h4>
        <div class="analysis-score">
            Score: <span class="score score-${this.getScoreClass(analysis.score)}">${analysis.score}/10</span>
            Recommendation: <span class="recommendation">${analysis.recommendation}</span>
        </div>
        
        <div class="analysis-content">
            <div class="strengths">
                <h5>Strengths</h5>
                <ul>
                    ${analysis.strengths.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
            
            <div class="weaknesses">
                <h5>Weaknesses</h5>
                <ul>
                    ${analysis.weaknesses.map(w => `<li>${w}</li>`).join('')}
                </ul>
            </div>
            
            <div class="summary">
                <h5>Summary</h5>
                <p>${analysis.summary}</p>
            </div>
        </div>
    </div>
    `).join('')
  }

  /**
   * 生成投资建议
   */
  private static generateInvestmentRecommendation(analyses: AnalysisResult[]): string {
    const recommendations = analyses.map(a => a.recommendation)
    const recCounts = this.countRecommendations(recommendations)
    
    return `
    <div class="recommendation-summary">
        <div class="rec-distribution">
            ${Object.entries(recCounts).map(([rec, count]) => `
                <div class="rec-item">
                    <span class="rec-label">${this.getRecommendationCN(rec)}</span>
                    <span class="rec-count">${count}票</span>
                </div>
            `).join('')}
        </div>
        
        <div class="final-recommendation">
            <h4>最终建议</h4>
            <p>${this.generateFinalRecommendation(analyses)}</p>
        </div>
    </div>`
  }

  /**
   * 生成英文投资建议
   */
  private static generateInvestmentRecommendationEN(analyses: AnalysisResult[]): string {
    const recommendations = analyses.map(a => a.recommendation)
    const recCounts = this.countRecommendations(recommendations)
    
    return `
    <div class="recommendation-summary">
        <div class="rec-distribution">
            ${Object.entries(recCounts).map(([rec, count]) => `
                <div class="rec-item">
                    <span class="rec-label">${rec}</span>
                    <span class="rec-count">${count} votes</span>
                </div>
            `).join('')}
        </div>
        
        <div class="final-recommendation">
            <h4>Final Recommendation</h4>
            <p>${this.generateFinalRecommendationEN(analyses)}</p>
        </div>
    </div>`
  }

  /**
   * 生成风险评估
   */
  private static generateRiskAssessment(analyses: AnalysisResult[]): string {
    const allRisks = analyses.flatMap(a => a.risks)
    const topRisks = this.getTopRisks(analyses)
    
    return `
    <div class="risk-content">
        <div class="top-risks">
            <h4>主要风险因素</h4>
            <ul class="risk-list">
                ${topRisks.map(risk => `<li class="risk-item">${risk}</li>`).join('')}
            </ul>
        </div>
        
        <div class="risk-mitigation">
            <h4>风险缓解建议</h4>
            <ul>
                <li>建议投资者根据自身风险承受能力合理配置资产</li>
                <li>密切关注公司经营状况和行业发展趋势</li>
                <li>定期审视投资组合，适时调整持仓比例</li>
                <li>充分了解相关法律法规和市场规则</li>
            </ul>
        </div>
    </div>`
  }

  /**
   * 生成英文风险评估
   */
  private static generateRiskAssessmentEN(analyses: AnalysisResult[]): string {
    const topRisks = this.getTopRisks(analyses)
    
    return `
    <div class="risk-content">
        <div class="top-risks">
            <h4>Major Risk Factors</h4>
            <ul class="risk-list">
                ${topRisks.map(risk => `<li class="risk-item">${risk}</li>`).join('')}
            </ul>
        </div>
        
        <div class="risk-mitigation">
            <h4>Risk Mitigation Recommendations</h4>
            <ul>
                <li>Allocate assets according to your risk tolerance</li>
                <li>Monitor company operations and industry trends closely</li>
                <li>Regularly review and adjust portfolio positions</li>
                <li>Understand relevant laws, regulations, and market rules</li>
            </ul>
        </div>
    </div>`
  }

  /**
   * 工具方法
   */
  private static getScoreClass(score: number): string {
    if (score >= 8) return 'excellent'
    if (score >= 6) return 'good'
    if (score >= 4) return 'average'
    return 'poor'
  }

  private static getMostCommon<T>(arr: T[]): T {
    const counts = arr.reduce((acc, item) => {
      acc[item as string] = (acc[item as string] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b)[0] as T
  }

  private static getTopStrengths(analyses: AnalysisResult[]): string[] {
    const allStrengths = analyses.flatMap(a => a.strengths)
    return Array.from(new Set(allStrengths)).slice(0, 3)
  }

  private static getTopRisks(analyses: AnalysisResult[]): string[] {
    const allRisks = analyses.flatMap(a => a.risks)
    return Array.from(new Set(allRisks)).slice(0, 5)
  }

  private static countRecommendations(recommendations: string[]): Record<string, number> {
    return recommendations.reduce((acc, rec) => {
      acc[rec] = (acc[rec] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  private static getMethodNameCN(method: string): string {
    const names: Record<string, string> = {
      buffett: '巴菲特价值投资',
      lynch: '彼得·林奇成长股',
      graham: '格雷厄姆安全边际',
      fisher: '菲利普·费舍15要点'
    }
    return names[method] || method
  }

  private static getMethodNameEN(method: string): string {
    const names: Record<string, string> = {
      buffett: 'Buffett Value Investing',
      lynch: 'Peter Lynch Growth',
      graham: 'Graham Safety Margin',
      fisher: 'Philip Fisher 15 Points'
    }
    return names[method] || method
  }

  private static getRecommendationCN(rec: string): string {
    const names: Record<string, string> = {
      'Buy': '买入',
      'Hold': '持有',
      'Sell': '卖出',
      'Avoid': '避免'
    }
    return names[rec] || rec
  }

  private static generateFinalRecommendation(analyses: AnalysisResult[]): string {
    const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length
    const recommendations = analyses.map(a => a.recommendation)
    const mostCommon = this.getMostCommon(recommendations)
    
    if (avgScore >= 7) {
      return `基于综合分析，该公司展现出良好的投资价值，建议${this.getRecommendationCN(mostCommon)}。投资者可考虑将其纳入投资组合，但仍需关注相关风险因素。`
    } else if (avgScore >= 5) {
      return `该公司表现中等，存在一定投资机会但风险并存。建议投资者谨慎对待，可考虑${this.getRecommendationCN(mostCommon)}，但应密切关注公司动态。`
    } else {
      return `基于当前分析，该公司投资价值相对有限，建议投资者${this.getRecommendationCN(mostCommon)}。如考虑投资，需要更深入的尽职调查。`
    }
  }

  private static generateFinalRecommendationEN(analyses: AnalysisResult[]): string {
    const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length
    const recommendations = analyses.map(a => a.recommendation)
    const mostCommon = this.getMostCommon(recommendations)
    
    if (avgScore >= 7) {
      return `Based on comprehensive analysis, the company demonstrates good investment value. We recommend ${mostCommon}. Investors may consider including it in their portfolio while monitoring risk factors.`
    } else if (avgScore >= 5) {
      return `The company shows moderate performance with both opportunities and risks. We suggest ${mostCommon} with caution and close monitoring of company developments.`
    } else {
      return `Based on current analysis, the company's investment value is relatively limited. We recommend ${mostCommon}. Further due diligence is required if considering investment.`
    }
  }

  /**
   * 获取报告样式
   */
  private static getReportStyles(): string {
    return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
      .container { max-width: 1200px; margin: 0 auto; padding: 20px; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
      .header { text-align: center; border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
      .header h1 { color: #007bff; font-size: 2.5rem; margin-bottom: 10px; }
      .header h2 { color: #333; font-size: 2rem; margin-bottom: 5px; }
      .ticker { font-size: 1.2rem; color: #666; font-weight: bold; }
      .sector { color: #888; }
      .report-meta { margin-top: 15px; font-size: 0.9rem; color: #666; }
      .score { font-weight: bold; padding: 2px 8px; border-radius: 4px; }
      .score-excellent { background: #d4edda; color: #155724; }
      .score-good { background: #d1ecf1; color: #0c5460; }
      .score-average { background: #fff3cd; color: #856404; }
      .score-poor { background: #f8d7da; color: #721c24; }
      section { margin: 30px 0; }
      h3 { color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; margin-bottom: 20px; }
      h4 { color: #495057; margin: 20px 0 10px; }
      h5 { color: #6c757d; margin: 15px 0 8px; }
      .summary-card, .recommendation-summary, .risk-content { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
      .financial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
      .financial-item { background: white; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6; text-align: center; }
      .financial-item label { display: block; font-weight: bold; color: #6c757d; margin-bottom: 5px; }
      .financial-item value { display: block; font-size: 1.2rem; color: #007bff; font-weight: bold; }
      .analysis-section { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
      .analysis-score { margin-bottom: 15px; }
      .analysis-content { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
      .strengths, .weaknesses { background: white; padding: 15px; border-radius: 6px; }
      .summary { grid-column: 1 / -1; background: white; padding: 15px; border-radius: 6px; }
      .strengths { border-left: 4px solid #28a745; }
      .weaknesses { border-left: 4px solid #dc3545; }
      ul { padding-left: 20px; }
      li { margin: 5px 0; }
      .recommendation { font-weight: bold; color: #007bff; }
      .rec-distribution { display: flex; gap: 15px; margin-bottom: 20px; }
      .rec-item { background: white; padding: 10px 15px; border-radius: 6px; text-align: center; flex: 1; }
      .rec-label { display: block; font-weight: bold; }
      .rec-count { color: #666; font-size: 0.9rem; }
      .final-recommendation { background: white; padding: 20px; border-radius: 6px; }
      .risk-list { list-style-type: none; padding: 0; }
      .risk-item { background: white; padding: 10px; margin: 5px 0; border-left: 3px solid #dc3545; border-radius: 4px; }
      .footer { text-align: center; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 0.8rem; }
      @media (max-width: 768px) {
        .container { padding: 10px; }
        .header h1 { font-size: 2rem; }
        .header h2 { font-size: 1.5rem; }
        .analysis-content { grid-template-columns: 1fr; }
        .rec-distribution { flex-direction: column; }
      }
    `
  }
}

/**
 * 快速生成报告
 */
export async function generateInvestmentReport(
  analyses: AnalysisResult[],
  companyInfo: any,
  financialData: Partial<FinancialData>,
  config?: Partial<ReportConfig>
): Promise<string> {
  const defaultConfig: ReportConfig = {
    template: 'comprehensive',
    includeCharts: false,
    language: 'zh',
    format: 'html',
    analysisDepth: 'detailed'
  }

  const finalConfig = { ...defaultConfig, ...config }
  
  return ReportGenerator.generateReport(analyses, companyInfo, financialData, finalConfig)
}