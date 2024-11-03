export type ApiResponse = {
    statusCode?: string
    message: string | null
    description?: string
    result?: Prefectures[]
  }
  
export type Prefectures = {
    prefCode: number
    prefName: string
  }
