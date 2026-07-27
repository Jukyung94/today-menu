import {
  BadRequestException,
  ConflictException,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { PreferenceService } from '../preference/preference.service'
import { RecommendationService } from '../recommendation/recommendation.service'
import {
  RecommendationMode,
  type RecommendationContext,
} from '../recommendation/recommendation.types'
import type { StartRecommendationDto } from './dto/start-recommendation.dto'
import type { SubmitAnswerDto } from './dto/submit-answer.dto'
import {
  CONVERSATION_REPOSITORY,
  type ConversationRepository,
} from './conversation.repository'
import {
  ConversationStatus,
  type RecommendationSession,
  type SelectedValue,
} from './conversation.types'
import { RECOMMENDATION_QUESTIONS } from './questions'

const SESSION_TTL_MS = 30 * 60 * 1000

@Injectable()
export class ConversationService {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly repository: ConversationRepository,
    private readonly recommendationService: RecommendationService,
    private readonly preferenceService: PreferenceService,
  ) {}

  async start(actorId: string, dto: StartRecommendationDto) {
    const now = new Date()
    const session: RecommendationSession = {
      id: randomUUID(),
      actorId,
      mode: dto.mode,
      ...(dto.locale ? { locale: dto.locale } : {}),
      status: ConversationStatus.IN_PROGRESS,
      version: 1,
      context: { contextVersion: 1 },
      answers: [],
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + SESSION_TTL_MS).toISOString(),
    }

    if (dto.mode === RecommendationMode.PERSONALIZED_RANDOM) {
      const eligibility =
        await this.preferenceService.getRecommendationEligibility(actorId)
      if (!eligibility.eligible) {
        throw new UnprocessableEntityException({
          code: 'PERSONALIZED_RECOMMENDATION_NOT_ELIGIBLE',
          message: `At least ${eligibility.minimumHistoryDays} recorded meal days are required.`,
          fieldErrors: {
            mode: [`${eligibility.remainingDays} more recorded day(s) required`],
          },
        })
      }
      session.context.attributes = { personalized: true }
      await this.complete(session)
    }

    await this.repository.create(session)
    return this.toResponse(session)
  }

  async get(actorId: string, sessionId: string) {
    const session = await this.getOwnedSession(actorId, sessionId)
    this.assertNotExpired(session)
    return this.toResponse(session)
  }

  async submitAnswer(
    actorId: string,
    sessionId: string,
    dto: SubmitAnswerDto,
  ) {
    const session = await this.getOwnedSession(actorId, sessionId)
    this.assertNotExpired(session)
    if (session.status !== ConversationStatus.IN_PROGRESS) {
      throw new ConflictException({
        code: 'SESSION_ALREADY_COMPLETED',
        message: 'The recommendation session is already completed.',
      })
    }
    if (session.version !== dto.sessionVersion) {
      throw new ConflictException({
        code: 'SESSION_VERSION_CONFLICT',
        message: `Expected sessionVersion ${session.version}.`,
        fieldErrors: {
          sessionVersion: [`current version is ${session.version}`],
        },
      })
    }

    const question = RECOMMENDATION_QUESTIONS[session.answers.length]
    if (!question || question.key !== dto.questionKey) {
      throw new BadRequestException({
        code: 'UNEXPECTED_QUESTION',
        message: `The current question is ${question?.key ?? 'none'}.`,
        fieldErrors: {
          questionKey: [`expected ${question?.key ?? 'none'}`],
        },
      })
    }
    this.validateSelectedValues(question.key, question.selectionType, question.options, dto.selectedValues)

    session.answers.push({
      questionKey: dto.questionKey,
      selectedValues: dto.selectedValues,
      answeredAt: new Date().toISOString(),
    })
    session.context = this.applyAnswer(
      session.context,
      dto.questionKey,
      dto.selectedValues,
    )
    session.version += 1

    if (session.answers.length === RECOMMENDATION_QUESTIONS.length) {
      await this.complete(session)
    }

    const saved = await this.repository.saveIfVersion(session, dto.sessionVersion)
    if (!saved) {
      throw new ConflictException({
        code: 'SESSION_VERSION_CONFLICT',
        message: 'The recommendation session changed while the answer was processed.',
      })
    }
    return this.toResponse(session)
  }

  private async complete(session: RecommendationSession): Promise<void> {
    session.recommendations = await this.recommendationService.recommend({
      actorId: session.actorId,
      sessionId: session.id,
      context: session.context,
    })
    session.status = ConversationStatus.COMPLETED
    session.completedAt = new Date().toISOString()
  }

  private async getOwnedSession(
    actorId: string,
    sessionId: string,
  ): Promise<RecommendationSession> {
    const session = await this.repository.findById(sessionId)
    if (!session || session.actorId !== actorId) {
      throw new NotFoundException({
        code: 'RECOMMENDATION_SESSION_NOT_FOUND',
        message: 'The recommendation session was not found.',
      })
    }
    return session
  }

  private assertNotExpired(session: RecommendationSession): void {
    if (
      session.status === ConversationStatus.IN_PROGRESS &&
      new Date(session.expiresAt).getTime() <= Date.now()
    ) {
      throw new GoneException({
        code: 'RECOMMENDATION_SESSION_EXPIRED',
        message: 'The recommendation session has expired.',
      })
    }
  }

  private validateSelectedValues(
    questionKey: string,
    selectionType: 'SINGLE' | 'MULTIPLE' | 'NUMBER',
    options: Array<{ value: SelectedValue }> | undefined,
    selectedValues: SelectedValue[],
  ): void {
    if (selectionType === 'SINGLE' && selectedValues.length !== 1) {
      throw new BadRequestException({
        code: 'INVALID_ANSWER',
        message: 'Exactly one value must be selected.',
        fieldErrors: { selectedValues: ['exactly one value is required'] },
      })
    }
    const allowed = new Set(options?.map((option) => option.value))
    if (options && selectedValues.some((value) => !allowed.has(value))) {
      throw new BadRequestException({
        code: 'INVALID_ANSWER',
        message: `The answer contains an unsupported value for ${questionKey}.`,
        fieldErrors: { selectedValues: ['contains an unsupported value'] },
      })
    }
  }

  private applyAnswer(
    context: RecommendationContext,
    questionKey: string,
    selectedValues: SelectedValue[],
  ): RecommendationContext {
    const next = { ...context, contextVersion: context.contextVersion + 1 }
    if (questionKey === 'tastes') {
      next.tastes = selectedValues.map(String)
    } else if (
      questionKey === 'category' ||
      questionKey === 'mealForm' ||
      questionKey === 'situation'
    ) {
      next[questionKey] = String(selectedValues[0])
    }
    return next
  }

  private toResponse(session: RecommendationSession) {
    const base = {
      sessionId: session.id,
      mode: session.mode,
      status: session.status,
      version: session.version,
      context: session.context,
    }
    if (session.status === ConversationStatus.COMPLETED) {
      return {
        ...base,
        status: ConversationStatus.COMPLETED,
        recommendations: session.recommendations ?? [],
        completedAt: session.completedAt,
      }
    }

    return {
      ...base,
      status: ConversationStatus.IN_PROGRESS,
      progress: {
        current: session.answers.length + 1,
        estimatedTotal: RECOMMENDATION_QUESTIONS.length,
      },
      nextQuestion: RECOMMENDATION_QUESTIONS[session.answers.length],
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }
  }
}
