import { VercelRequest, VercelResponse } from "@vercel/node"
import { ALLOWED_ORIGIN, API_KEY, API_URL } from "../../../config"
import { ApiResponse } from "../../../type"

async function fetchPopulationComposition(): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/population/composition/perYear`, {
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
    const result = await fetchPopulationComposition()
  
    // キャッシュ設定
    res.setHeader('Cache-Control', 's-maxage=86400, immutable')
    res.json(result)
  }
  