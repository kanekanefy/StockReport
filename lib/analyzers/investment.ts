import OpenAI from 'openai'
import { AnalysisResult, AnalysisMethod, FinancialData } from '@/types'

// 创建OpenAI客户端实例
function createOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-build'
  })
}

/**
 * 投资分析引擎
 */
export class InvestmentAnalyzer {
  /**
   * 执行投资分析
   */
  static async analyze(
    prospectusText: string,
    financialData: Partial<FinancialData>,
    method: AnalysisMethod,
    companyInfo: {
      name: string
      ticker: string
      exchange: string
      sector?: string
    }
  ): Promise<AnalysisResult> {
    try {
      const analysisPrompt = this.buildAnalysisPrompt(
        prospectusText,
        financialData,
        method,
        companyInfo
      )

      const openai = createOpenAIClient()
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(method)
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })

      const analysisText = completion.choices[0]?.message?.content || ''
      
      return this.parseAnalysisResult(analysisText, method, companyInfo)

    } catch (error) {
      console.error('Investment analysis error:', error)
      throw new Error(`Analysis failed: ${error}`)
    }
  }

  /**
   * 构建分析提示词
   */
  private static buildAnalysisPrompt(
    prospectusText: string,
    financialData: Partial<FinancialData>,
    method: AnalysisMethod,
    companyInfo: any
  ): string {
    const textPreview = prospectusText.substring(0, 8000) // 限制文本长度
    
    return `
请基于${this.getMethodName(method)}的投资理论，对以下公司进行投资分析：

公司信息：
- 名称：${companyInfo.name}
- 股票代码：${companyInfo.ticker}
- 交易所：${companyInfo.exchange}
- 行业：${companyInfo.sector || '未知'}

财务数据：
${this.formatFinancialData(financialData)}

招股书内容摘要：
${textPreview}

请按照以下格式提供分析：

评分：[1-10分]
投资建议：[Buy/Hold/Sell/Avoid]

优势：
- [优势1]
- [优势2]
- [优势3]

劣势：
- [劣势1]
- [劣势2]
- [劣势3]

风险：
- [风险1]
- [风险2]
- [风险3]

关键指标：
- [指标1]：[数值]
- [指标2]：[数值]
- [指标3]：[数值]

总结：
[200字以内的投资总结]
`
  }

  /**
   * 获取系统提示词
   */
  private static getSystemPrompt(method: AnalysisMethod): string {
    const prompts = {
      buffett: `你是一个遵循巴菲特价值投资理论的专业投资分析师。请重点关注：
1. 企业的内在价值和安全边际
2. 可持续的竞争优势（护城河）
3. 管理层的能力和诚信
4. 稳定增长的盈利能力
5. 合理的估值水平
请提供客观、专业的投资分析。`,

      lynch: `你是一个遵循彼得·林奇成长股投资理论的专业投资分析师。请重点关注：
1. 公司的成长性和增长潜力
2. PEG比率的合理性
3. 行业地位和市场机会
4. 管理层执行力
5. 财务健康状况
请提供客观、专业的投资分析。`,

      graham: `你是一个遵循格雷厄姆安全边际理论的专业投资分析师。请重点关注：
1. 安全边际的充足性
2. 资产负债表的稳健性
3. 盈利的稳定性
4. 估值的保守性
5. 风险控制
请提供客观、专业的投资分析。`,

      fisher: `你是一个遵循菲利普·费舍成长股理论的专业投资分析师。请重点关注：
1. 产品和服务的长期前景
2. 研发能力和创新
3. 销售组织的有效性
4. 利润率的改善空间
5. 管理层的长远规划
请提供客观、专业的投资分析。`
    }

    return prompts[method] || prompts.buffett
  }

  /**
   * 格式化财务数据
   */
  private static formatFinancialData(data: Partial<FinancialData>): string {
    const formatNumber = (num: number | undefined) => 
      num ? num.toLocaleString() : '未提供'

    return `
营业收入：${data.revenue?.map(formatNumber).join(', ') || '未提供'}
净利润：${data.netIncome?.map(formatNumber).join(', ') || '未提供'}
总资产：${formatNumber(data.totalAssets)}
总负债：${formatNumber(data.totalDebt)}
股东权益：${formatNumber(data.shareholderEquity)}
ROE：${data.roe ? data.roe.toFixed(2) + '%' : '未提供'}
ROA：${data.roa ? data.roa.toFixed(2) + '%' : '未提供'}
负债权益比：${data.debtToEquity ? data.debtToEquity.toFixed(2) : '未提供'}
流动比率：${data.currentRatio ? data.currentRatio.toFixed(2) : '未提供'}
`
  }

  /**
   * 解析分析结果
   */
  private static parseAnalysisResult(
    analysisText: string,
    method: AnalysisMethod,
    companyInfo: any
  ): AnalysisResult {
    try {
      // 提取评分
      const scoreMatch = analysisText.match(/评分：(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;

      // 提取投资建议
      const recommendationMatch = analysisText.match(/投资建议：(Buy|Hold|Sell|Avoid)/);
      const recommendation = (recommendationMatch?.[1] as any) || 'Hold';

      // 提取优势
      const strengthsMatch = analysisText.match(/优势：([\s\S]*?)劣势：/);
      const strengths = this.extractListItems(strengthsMatch?.[1] || '');

      // 提取劣势
      const weaknessesMatch = analysisText.match(/劣势：([\s\S]*?)风险：/);
      const weaknesses = this.extractListItems(weaknessesMatch?.[1] || '');

      // 提取风险
      const risksMatch = analysisText.match(/风险：([\s\S]*?)关键指标：/);
      const risks = this.extractListItems(risksMatch?.[1] || '');

      // 提取关键指标
      const metricsMatch = analysisText.match(/关键指标：([\s\S]*?)总结：/);
      const keyMetrics = this.extractMetrics(metricsMatch?.[1] || '');

      // 提取总结
      const summaryMatch = analysisText.match(/总结：([\s\S]*)$/);
      const summary = summaryMatch?.[1]?.trim() || '分析总结未能正确提取';

      return {
        id: `analysis-${companyInfo.ticker}-${Date.now()}`,
        prospectusId: `prospectus-${companyInfo.ticker}`,
        method,
        score,
        summary,
        strengths,
        weaknesses,
        risks,
        recommendation,
        keyMetrics,
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error parsing analysis result:', error);
      
      // 返回默认结果
      return {
        id: `analysis-${companyInfo.ticker}-${Date.now()}`,
        prospectusId: `prospectus-${companyInfo.ticker}`,
        method,
        score: 5,
        summary: '分析过程中出现错误，请重试',
        strengths: [],
        weaknesses: [],
        risks: [],
        recommendation: 'Hold',
        keyMetrics: {},
        createdAt: new Date().toISOString()
      };
    }
  }

  /**
   * 提取列表项
   */
  private static extractListItems(text: string): string[] {
    const items = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-'))
      .map(line => line.substring(1).trim())
      .filter(item => item.length > 0);

    return items.length > 0 ? items : ['暂无相关信息'];
  }

  /**
   * 提取指标数据
   */
  private static extractMetrics(text: string): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.includes('：'));

    for (const line of lines) {
      const [key, value] = line.split('：');
      if (key && value) {
        const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
        if (!isNaN(numValue)) {
          metrics[key.replace('-', '').trim()] = numValue;
        }
      }
    }

    return metrics;
  }

  /**
   * 获取分析方法名称
   */
  private static getMethodName(method: AnalysisMethod): string {
    const names = {
      buffett: '巴菲特价值投资',
      lynch: '彼得·林奇成长股投资',
      graham: '格雷厄姆安全边际',
      fisher: '菲利普·费舍成长股'
    };
    
    return names[method] || '价值投资';
  }

  /**
   * 批量分析（使用多种方法）
   */
  static async batchAnalyze(
    prospectusText: string,
    financialData: Partial<FinancialData>,
    companyInfo: any,
    methods: AnalysisMethod[] = ['buffett', 'lynch', 'graham', 'fisher']
  ): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    for (const method of methods) {
      try {
        const result = await this.analyze(prospectusText, financialData, method, companyInfo);
        results.push(result);
        
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Analysis failed for method ${method}:`, error);
      }
    }

    return results;
  }
}

/**
 * 快速分析函数
 */
export async function quickAnalysis(
  prospectusText: string,
  financialData: Partial<FinancialData>,
  companyInfo: any,
  method: AnalysisMethod = 'buffett'
): Promise<AnalysisResult> {
  return InvestmentAnalyzer.analyze(prospectusText, financialData, method, companyInfo);
}