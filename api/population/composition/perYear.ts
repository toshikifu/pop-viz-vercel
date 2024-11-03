import { VercelRequest, VercelResponse } from "@vercel/node"
import { ALLOWED_ORIGIN, API_KEY, API_URL } from "../../../config"
import { ApiResponse } from "../../../type"

async function fetchPopulationComposition(prefCode: string, addArea: string | undefined = undefined): Promise<ApiResponse> {
  const params = new URLSearchParams()
  params.append('prefCode', prefCode)
  params.append('cityCode', '-')
  if (addArea) {
    params.append('addArea', addArea)
  }
  
  const response = await fetch(`${API_URL}/population/composition/perYear?${params}`, {
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

  const { prefCode, addArea } = req.query

  // Validate parameter
  if (!prefCode || typeof prefCode !== 'string') {
    res.status(400).json({ message: 'Invalid parameter. predCode is required and must be a string.' })
    return
  }

  // 許可されている場合のみAPIリクエストを実行
  try {
    const result = await fetchPopulationComposition(prefCode, addArea as string)

    // キャッシュ設定
    res.setHeader('Cache-Control', 's-maxage=86400, immutable')
    res.json(result)
  } catch (error) {
    console.error('Error fetching population data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
