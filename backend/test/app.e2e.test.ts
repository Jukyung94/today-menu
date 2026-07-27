import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { configureApp } from '../src/shared/http/configure-app'

describe('Today Menu API', () => {
  let app: INestApplication
  let accessToken: string
  let sessionId: string
  let firstResultId: string

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = module.createNestApplication()
    configureApp(app)
    await app.init()

    const guest = await request(app.getHttpServer())
      .post('/api/v1/auth/guest')
      .set('Idempotency-Key', 'guest-test')
      .send({})
      .expect(201)
    accessToken = guest.body.accessToken
  })

  afterAll(async () => {
    await app.close()
  })

  it('exposes public health', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
    expect(response.body.status).toBe('OK')
    expect(response.body.timestamp).toEqual(expect.any(String))
  })

  it('requires bearer auth and uses the common error contract', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/meal-logs')
      .expect(401)
    expect(response.body).toEqual({
      error: {
        code: 'BEARER_TOKEN_REQUIRED',
        message: expect.any(String),
        requestId: expect.any(String),
      },
    })
  })

  it('completes a guided session with sessionVersion concurrency', async () => {
    const start = await authorizedPost('/api/v1/recommendation-sessions', {
      mode: 'GUIDED',
      locale: 'ko-KR',
    }, 'start-guided').expect(201)

    expect(start.body).toMatchObject({
      mode: 'GUIDED',
      status: 'IN_PROGRESS',
      version: 1,
      context: { contextVersion: 1 },
      nextQuestion: { key: 'category', selectionType: 'SINGLE' },
    })

    let session = start.body
    sessionId = session.sessionId
    const answers = [
      ['category', ['KOREAN']],
      ['mealForm', ['RICE']],
      ['tastes', ['SPICY']],
      ['situation', ['HEARTY']],
    ] as const

    for (const [index, [questionKey, selectedValues]] of answers.entries()) {
      const response = await authorizedPost(
        `/api/v1/recommendation-sessions/${session.sessionId}/answers`,
        {
          sessionVersion: session.version,
          questionKey,
          selectedValues,
        },
        `answer-${index}`,
      ).expect(200)
      session = response.body
      if (index === 0) {
        const stale = await authorizedPost(
          `/api/v1/recommendation-sessions/${session.sessionId}/answers`,
          {
            sessionVersion: 1,
            questionKey: 'mealForm',
            selectedValues: ['RICE'],
          },
          'stale-in-progress',
        ).expect(409)
        expect(stale.body.error.code).toBe('SESSION_VERSION_CONFLICT')
      }
    }

    expect(session).toMatchObject({
      mode: 'GUIDED',
      status: 'COMPLETED',
      version: 5,
      context: {
        contextVersion: 5,
        category: 'KOREAN',
        mealForm: 'RICE',
        tastes: ['SPICY'],
        situation: 'HEARTY',
      },
    })
    expect(session.recommendations).toHaveLength(3)
    firstResultId = session.recommendations[0].resultId
    expect(session.recommendations[0]).toMatchObject({
      rank: 1,
      food: { name: '제육덮밥', category: 'KOREAN' },
    })

    const fetched = await request(app.getHttpServer())
      .get(`/api/v1/recommendation-sessions/${sessionId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    expect(fetched.body).toEqual(session)
  })

  it('accepts feedback for an owned recommendation result', async () => {
    const response = await authorizedPost(
      '/api/v1/recommendation-feedback',
      {
        resultId: firstResultId,
        actionType: 'SELECTED',
        rating: 5,
      },
      'feedback-selected',
    ).expect(201)
    expect(response.body).toMatchObject({
      resultId: firstResultId,
      actionType: 'SELECTED',
      rating: 5,
    })
  })

  it('uploads an image through the replaceable storage provider', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/uploads')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', 'upload-image')
      .attach('file', Buffer.from('fake-png'), {
        filename: 'meal.png',
        contentType: 'image/png',
      })
      .expect(201)
    expect(response.body).toMatchObject({
      fileName: 'meal.png',
      mimeType: 'image/png',
      status: 'READY',
    })
  })

  it('replays a request with the same idempotency key', async () => {
    const body = {
      customFoodName: '비빔밥',
      rating: 5,
      eatenAt: '2026-07-28T03:00:00.000Z',
    }
    const first = await authorizedPost(
      '/api/v1/meal-logs',
      body,
      'meal-log-replay',
    ).expect(201)
    const replay = await authorizedPost(
      '/api/v1/meal-logs',
      body,
      'meal-log-replay',
    ).expect(201)

    expect(replay.headers['idempotency-replayed']).toBe('true')
    expect(replay.body.mealLogId).toBe(first.body.mealLogId)

    const listed = await request(app.getHttpServer())
      .get('/api/v1/meal-logs')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    expect(listed.body).toMatchObject({
      total: 1,
      limit: 20,
      offset: 0,
    })
    expect(listed.body.items[0].mealLogId).toBe(first.body.mealLogId)
  })

  it('reports personalized recommendation eligibility', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/preferences/recommendation-eligibility')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    expect(response.body).toMatchObject({
      eligible: false,
      minimumHistoryDays: 7,
      recordedDays: 1,
      remainingDays: 6,
    })
  })

  it('completes personalized random mode after seven recorded days', async () => {
    for (let day = 1; day <= 6; day += 1) {
      await authorizedPost(
        '/api/v1/meal-logs',
        {
          customFoodName: `테스트 메뉴 ${day}`,
          rating: 4,
          eatenAt: `2026-07-${String(day).padStart(2, '0')}T03:00:00.000Z`,
        },
        `eligibility-meal-${day}`,
      ).expect(201)
    }

    const eligibility = await request(app.getHttpServer())
      .get('/api/v1/preferences/recommendation-eligibility')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
    expect(eligibility.body).toMatchObject({
      eligible: true,
      recordedDays: 7,
      remainingDays: 0,
    })

    const personalized = await authorizedPost(
      '/api/v1/recommendation-sessions',
      { mode: 'PERSONALIZED_RANDOM' },
      'start-personalized',
    ).expect(201)
    expect(personalized.body).toMatchObject({
      mode: 'PERSONALIZED_RANDOM',
      status: 'COMPLETED',
      version: 1,
      context: {
        contextVersion: 1,
        attributes: { personalized: true },
      },
    })
    expect(personalized.body.recommendations).toHaveLength(3)
  })

  function authorizedPost(path: string, body: object | undefined, key: string) {
    return request(app.getHttpServer())
      .post(path)
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Idempotency-Key', key)
      .send(body)
  }
})
