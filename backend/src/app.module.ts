import { Module } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { BearerAuthGuard } from './auth/bearer-auth.guard'
import { ConversationModule } from './conversation/conversation.module'
import { FeedbackModule } from './feedback/feedback.module'
import { HealthModule } from './health/health.module'
import { IdempotencyInterceptor } from './idempotency/idempotency.interceptor'
import { IdempotencyModule } from './idempotency/idempotency.module'
import { LlmModule } from './llm/llm.module'
import { MealLogModule } from './meal-log/meal-log.module'
import { PreferenceModule } from './preference/preference.module'
import { RecommendationModule } from './recommendation/recommendation.module'
import { UploadModule } from './upload/upload.module'
import { ApiExceptionFilter } from './shared/http/api-exception.filter'

@Module({
  imports: [
    AuthModule,
    ConversationModule,
    FeedbackModule,
    HealthModule,
    IdempotencyModule,
    LlmModule,
    MealLogModule,
    PreferenceModule,
    RecommendationModule,
    UploadModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: BearerAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: IdempotencyInterceptor },
    { provide: APP_FILTER, useClass: ApiExceptionFilter },
  ],
})
export class AppModule {}
