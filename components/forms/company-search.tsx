'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CompanySearchResult, Exchange } from '@/types'

interface CompanySearchProps {
  onResults?: (results: CompanySearchResult[]) => void
}

export function CompanySearch({ onResults }: CompanySearchProps) {
  const [query, setQuery] = useState('')
  const [exchange, setExchange] = useState<Exchange>('hkex')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<CompanySearchResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        q: query,
        exchange: exchange,
      })

      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.data)
        onResults?.(data.data)
      } else {
        setError(data.error || '搜索失败')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="输入公司名称或股票代码..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>
        <select
          value={exchange}
          onChange={(e) => setExchange(e.target.value as Exchange)}
          className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          disabled={loading}
        >
          <option value="hkex">港交所</option>
          <option value="nyse">纽交所</option>
          <option value="nasdaq">纳斯达克</option>
          <option value="sse">上交所</option>
          <option value="szse">深交所</option>
        </select>
        <Button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? '搜索中...' : '搜索'}
        </Button>
      </div>

      {error && (
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">搜索结果 ({results.length})</h3>
          <div className="grid gap-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{result.name}</h4>
                    <p className="text-sm text-gray-600">
                      {result.ticker} · {result.exchange.toUpperCase()}
                    </p>
                    {result.sector && (
                      <p className="text-sm text-gray-500 mt-1">{result.sector}</p>
                    )}
                  </div>
                  {result.marketCap && (
                    <div className="text-sm text-gray-600">
                      市值: ${(result.marketCap / 1e9).toFixed(1)}B
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="text-center py-8 text-gray-500">
          未找到相关公司，请尝试其他关键词
        </div>
      )}
    </div>
  )
}