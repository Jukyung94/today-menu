import { Module } from '@nestjs/common'
import { RecommendationModule } from '../recommendation/recommendation.module'
import { UploadModule } from '../upload/upload.module'
import { InMemoryMealLogRepository } from './in-memory-meal-log.repository'
import { MealLogController } from './meal-log.controller'
import { MEAL_LOG_REPOSITORY } from './meal-log.repository'
import { MealLogService } from './meal-log.service'

@Module({
  imports: [RecommendationModule, UploadModule],
  controllers: [MealLogController],
  providers: [
    MealLogService,
    { provide: MEAL_LOG_REPOSITORY, useClass: InMemoryMealLogRepository },
  ],
  exports: [MealLogService, MEAL_LOG_REPOSITORY],
})
export class MealLogModule {}
