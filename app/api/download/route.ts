import { NextRequest, NextResponse } from 'next/server'
import { downloadAndParsePDF } from '@/lib/parsers/pdf'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentUrl, ticker, exchange } = body

    if (!documentUrl) {
      return NextResponse.json(
        { error: 'Document URL is required' },
        { status: 400 }
      )
    }

    // 验证URL格式
    try {
      new URL(documentUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // 下载和解析PDF
    const result = await downloadAndParsePDF(documentUrl)

    return NextResponse.json({
      success: true,
      data: {
        ticker,
        exchange,
        documentUrl,
        text: result.text.substring(0, 10000), // 限制返回文本长度
        financialData: result.financialData,
        businessInfo: result.businessInfo,
        metadata: result.metadata,
        extractedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Download and parse error:', error)
    
    // 返回错误信息
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Failed to download and parse document',
        message: errorMessage,
        success: false
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    )
  }

  try {
    // 验证URL
    new URL(url)
    
    const result = await downloadAndParsePDF(url)
    
    return NextResponse.json({
      success: true,
      data: {
        url,
        text: result.text.substring(0, 5000), // 预览前5000字符
        financialData: result.financialData,
        businessInfo: result.businessInfo,
        metadata: result.metadata,
        extractedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('PDF download error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process PDF',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}