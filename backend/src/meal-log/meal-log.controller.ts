import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common'
import type { AuthenticatedActor } from '../auth/auth.types'
import { CurrentActor } from '../shared/http/current-actor.decorator'
import { CreateMealLogDto } from './dto/create-meal-log.dto'
import { ListMealLogsDto } from './dto/list-meal-logs.dto'
import { MealLogService } from './meal-log.service'

@Controller('meal-logs')
export class MealLogController {
  constructor(private readonly mealLogService: MealLogService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @CurrentActor() actor: AuthenticatedActor,
    @Body() dto: CreateMealLogDto,
  ) {
    return this.mealLogService.create(actor.actorId, dto)
  }

  @Get()
  list(
    @CurrentActor() actor: AuthenticatedActor,
    @Query() query: ListMealLogsDto,
  ) {
    return this.mealLogService.list(actor.actorId, query.limit, query.offset)
  }
}
