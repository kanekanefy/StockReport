import { NextRequest, NextResponse } from 'next/server'
import { InvestmentAnalyzer } from '@/lib/analyzers/investment'
import { AnalysisMethod } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      prospectusText, 
      financialData = {}, 
      companyInfo, 
      method = 'buffett',
      batchAnalysis = false 
    } = body

    // 验证必需参数
    if (!prospectusText || !companyInfo) {
      return NextResponse.json(
        { error: 'Prospectus text and company info are required' },
        { status: 400 }
      )
    }

    if (!companyInfo.name || !companyInfo.ticker || !companyInfo.exchange) {
      return NextResponse.json(
        { error: 'Company name, ticker, and exchange are required' },
        { status: 400 }
      )
    }

    // 检查OpenAI API密钥
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    let results;

    if (batchAnalysis) {
      // 批量分析（所有方法）
      const methods: AnalysisMethod[] = ['buffett', 'lynch', 'graham', 'fisher'];
      results = await InvestmentAnalyzer.batchAnalyze(
        prospectusText,
        financialData,
        companyInfo,
        methods
      );
    } else {
      // 单一方法分析
      const result = await InvestmentAnalyzer.analyze(
        prospectusText,
        financialData,
        method as AnalysisMethod,
        companyInfo
      );
      results = [result];
    }

    return NextResponse.json({
      success: true,
      data: {
        analyses: results,
        companyInfo,
        method: batchAnalysis ? 'batch' : method,
        analyzedAt: new Date().toISOString(),
        textLength: prospectusText.length
      }
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Investment analysis failed',
        message: errorMessage,
        success: false
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const method = searchParams.get('method');

  // 返回支持的分析方法信息
  const analysisMethodsInfo = {
    buffett: {
      name: '巴菲特价值投资法',
      description: '关注内在价值、护城河和长期竞争优势',
      focusAreas: [
        '企业内在价值评估',
        '可持续竞争优势',
        '管理层质量',
        '财务稳健性',
        '长期增长潜力'
      ]
    },
    lynch: {
      name: '彼得·林奇成长股分析',
      description: '重点分析成长性和PEG比率',
      focusAreas: [
        '营收和利润增长',
        'PEG比率分析',
        '行业地位',
        '市场机会',
        '竞争优势'
      ]
    },
    graham: {
      name: '格雷厄姆安全边际分析',
      description: '关注安全边际和价值低估',
      focusAreas: [
        '安全边际计算',
        '资产负债表分析',
        '盈利稳定性',
        '估值保守性',
        '下行风险控制'
      ]
    },
    fisher: {
      name: '菲利普·费舍15要点',
      description: '全面的定性和定量分析',
      focusAreas: [
        '产品长期前景',
        '研发投入',
        '销售组织',
        '利润率趋势',
        '管理层远见'
      ]
    }
  };

  if (method && method in analysisMethodsInfo) {
    return NextResponse.json({
      success: true,
      data: analysisMethodsInfo[method as keyof typeof analysisMethodsInfo]
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      availableMethods: analysisMethodsInfo,
      defaultMethod: 'buffett',
      supportsBatchAnalysis: true
    }
  });
}