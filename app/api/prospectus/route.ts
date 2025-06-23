import { NextRequest, NextResponse } from 'next/server'
import { getCompanyProspectuses } from '@/lib/scrapers/hkex'
import { getUSCompanyProspectuses } from '@/lib/scrapers/nyse'
import { getChinaCompanyProspectuses } from '@/lib/scrapers/china'
import { Exchange } from '@/types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ticker = searchParams.get('ticker')
  const exchange = searchParams.get('exchange') as Exchange

  if (!ticker || !exchange) {
    return NextResponse.json(
      { error: 'Ticker and exchange parameters are required' },
      { status: 400 }
    )
  }

  try {
    let prospectuses: any[] = []

    switch (exchange) {
      case 'hkex':
        prospectuses = await getCompanyProspectuses(ticker)
        break
      case 'nyse':
        prospectuses = await getUSCompanyProspectuses(ticker, 'nyse')
        break
      case 'nasdaq':
        prospectuses = await getUSCompanyProspectuses(ticker, 'nasdaq')
        break
      case 'sse':
        prospectuses = await getChinaCompanyProspectuses(ticker, 'sse')
        break
      case 'szse':
        prospectuses = await getChinaCompanyProspectuses(ticker, 'szse')
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported exchange' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: prospectuses,
      total: prospectuses.length,
      ticker,
      exchange,
    })
  } catch (error) {
    console.error('Prospectus API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}