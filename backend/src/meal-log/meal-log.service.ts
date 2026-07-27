import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { RecommendationService } from '../recommendation/recommendation.service'
import { UploadService } from '../upload/upload.service'
import type { CreateMealLogDto } from './dto/create-meal-log.dto'
import {
  MEAL_LOG_REPOSITORY,
  type MealLogRepository,
} from './meal-log.repository'

@Injectable()
export class MealLogService {
  constructor(
    @Inject(MEAL_LOG_REPOSITORY)
    private readonly repository: MealLogRepository,
    private readonly recommendationService: RecommendationService,
    private readonly uploadService: UploadService,
  ) {}

  async create(actorId: string, dto: CreateMealLogDto) {
    if (!dto.recommendationResultId && !dto.foodId && !dto.customFoodName?.trim()) {
      throw new BadRequestException({
        code: 'MEAL_FOOD_REQUIRED',
        message:
          'recommendationResultId, foodId, or customFoodName must be provided.',
        fieldErrors: {
          customFoodName: ['one food identifier is required'],
        },
      })
    }
    if (dto.recommendationResultId) {
      const result = await this.recommendationService.findOwnedResult(
        dto.recommendationResultId,
        actorId,
      )
      if (!result) {
        throw new NotFoundException({
          code: 'RECOMMENDATION_RESULT_NOT_FOUND',
          message: 'The recommendation result was not found.',
        })
      }
    }
    for (const photoId of dto.photoIds ?? []) {
      await this.uploadService.assertOwned(photoId, actorId)
    }

    const now = new Date().toISOString()
    const mealLog = {
      id: randomUUID(),
      actorId,
      ...(dto.recommendationResultId
        ? { recommendationResultId: dto.recommendationResultId }
        : {}),
      ...(dto.foodId ? { foodId: dto.foodId } : {}),
      ...(dto.customFoodName?.trim()
        ? { customFoodName: dto.customFoodName.trim() }
        : {}),
      rating: dto.rating,
      ...(dto.note?.trim() ? { note: dto.note.trim() } : {}),
      photoIds: dto.photoIds ?? [],
      eatenAt: dto.eatenAt ?? now,
      createdAt: now,
    }
    await this.repository.save(mealLog)
    return this.toResponse(mealLog)
  }

  async list(actorId: string, limit: number, offset: number) {
    const all = await this.repository.listByActor(actorId)
    return {
      items: all.slice(offset, offset + limit).map((item) => this.toResponse(item)),
      total: all.length,
      limit,
      offset,
    }
  }

  async countRecordedDays(actorId: string): Promise<number> {
    const all = await this.repository.listByActor(actorId)
    return new Set(all.map((mealLog) => mealLog.eatenAt.slice(0, 10))).size
  }

  private toResponse(mealLog: Awaited<ReturnType<MealLogRepository['listByActor']>>[number]) {
    const { id, actorId: _actorId, ...response } = mealLog
    return { mealLogId: id, ...response }
  }
}
