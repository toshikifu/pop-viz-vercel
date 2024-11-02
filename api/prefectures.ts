import type { VercelRequest, VercelResponse } from '@vercel/node'
import fetch from 'node-fetch'

type ApiResponse = {
  statusCode?: string
  message: string | null
  description?: string
  result?: Prefectures[]
}

type Prefectures = {
  prefCode: number
  prefName: string
}

const API_URL = 'https://opendata.resas-portal.go.jp/api/v1'
const API_KEY = process.env.RESAS_API_KEY ?? ''
const ALLOWED_ORIGIN = process.env.FRONTEND_URL ?? ''

async function fetchPrefectures(): Promise<ApiResponse> {
  const response = await fetch(`${API_URL}/prefectures`, {
    headers: {
      'X-API-KEY': API_KEY,
    },
  })
  const data = await response.json() as ApiResponse
  return data
}

export default async function (req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin

  // CORSチェック：許可されたオリジンでなければ403で終了
  if (!origin || origin != ALLOWED_ORIGIN) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  // 許可されたオリジンに対してのみCORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // プリフライトリクエストの場合、早期リターン
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // 許可されている場合のみAPIリクエストを実行
  const result = await fetchPrefectures()

  // キャッシュ設定
  res.setHeader('Cache-Control', 's-maxage=86400, immutable')
  res.json(result)
}
