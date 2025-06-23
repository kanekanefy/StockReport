import { NextRequest, NextResponse } from 'next/server'
import { searchHKEXCompanies } from '@/lib/scrapers/hkex'
import { searchNYSECompanies, searchNASDAQCompanies } from '@/lib/scrapers/nyse'
import { searchSSECompanies, searchSZSECompanies } from '@/lib/scrapers/china'
import { CompanySearchResult, Exchange } from '@/types'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const exchange = searchParams.get('exchange') as Exchange

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    )
  }

  try {
    let results: CompanySearchResult[] = []

    // 根据交易所搜索
    switch (exchange) {
      case 'hkex':
        results = await searchHKEXCompanies(query)
        break
      case 'nyse':
        results = await searchNYSECompanies(query)
        break
      case 'nasdaq':
        results = await searchNASDAQCompanies(query)
        break
      case 'sse':
        results = await searchSSECompanies(query)
        break
      case 'szse':
        results = await searchSZSECompanies(query)
        break
      default:
        // 如果没指定交易所，搜索所有支持的交易所
        const [hkexResults, nyseResults, nasdaqResults, sseResults, szseResults] = await Promise.all([
          searchHKEXCompanies(query).catch(() => []),
          searchNYSECompanies(query).catch(() => []),
          searchNASDAQCompanies(query).catch(() => []),
          searchSSECompanies(query).catch(() => []),
          searchSZSECompanies(query).catch(() => [])
        ])
        results = [...hkexResults, ...nyseResults, ...nasdaqResults, ...sseResults, ...szseResults]
        break
    }

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, exchanges = ['hkex'], filters = {} } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    let allResults: CompanySearchResult[] = []

    // 并行搜索多个交易所
    const searchPromises = exchanges.map(async (exchange: Exchange) => {
      switch (exchange) {
        case 'hkex':
          return searchHKEXCompanies(query)
        case 'nyse':
          return searchNYSECompanies(query)
        case 'nasdaq':
          return searchNASDAQCompanies(query)
        case 'sse':
          return searchSSECompanies(query)
        case 'szse':
          return searchSZSECompanies(query)
        default:
          return []
      }
    })

    const searchResults = await Promise.all(searchPromises)
    allResults = searchResults.flat()

    // 应用过滤器
    if (filters.sector) {
      allResults = allResults.filter(result => 
        result.sector?.toLowerCase().includes(filters.sector.toLowerCase())
      )
    }

    if (filters.minMarketCap) {
      allResults = allResults.filter(result => 
        result.marketCap && result.marketCap >= filters.minMarketCap
      )
    }

    // 去重和排序
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.ticker === result.ticker && r.exchange === result.exchange)
    )

    return NextResponse.json({
      success: true,
      data: uniqueResults,
      total: uniqueResults.length,
      query,
      exchanges,
      filters,
    })
  } catch (error) {
    console.error('Search POST API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}