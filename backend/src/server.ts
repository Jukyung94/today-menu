import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { z } from 'zod'

const app = express()
const port = Number(process.env.PORT ?? 4000)
const minimumHistoryDays = 7

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json())

const recommendationRequest = z.object({
  mode: z.enum(['guided', 'random']).default('guided'),
  answers: z.array(z.string()).default([]),
})

const sampleMenus = [
  { name: '제육덮밥', tags: ['한식', '밥', '매콤한 맛'], reason: '매콤하고 든든한 한 끼가 필요한 오늘과 잘 맞아요.' },
  { name: '닭갈비 덮밥', tags: ['한식', '밥', '새로운 선택'], reason: '평소 취향은 살리되, 조금 다른 메뉴를 골라봤어요.' },
  { name: '김치찌개', tags: ['한식', '국물', '따뜻한'], reason: '밥과 함께 편안하게 즐기기 좋은 든든한 메뉴예요.' },
]

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'today-menu-api' })
})

app.get('/api/preferences/eligibility', (_request, response) => {
  // TODO: Supabase meal_logs에서 로그인 사용자의 실제 기록 일수를 계산합니다.
  const recordedDays = 12
  response.json({ minimumHistoryDays, recordedDays, canUseRandom: recordedDays >= minimumHistoryDays })
})

app.post('/api/recommendations', (request, response) => {
  const parsed = recommendationRequest.safeParse(request.body)
  if (!parsed.success) {
    response.status(400).json({ error: '추천 요청 형식이 올바르지 않습니다.' })
    return
  }

  // TODO: 사용자 선호도·최근 식사 이력을 Supabase에서 읽고, Ollama에 요약 JSON만 전송합니다.
  response.json({
    mode: parsed.data.mode,
    input: parsed.data.answers,
    recommendations: sampleMenus,
  })
})

app.listen(port, () => {
  console.log(`Today Menu API listening on http://localhost:${port}`)
})