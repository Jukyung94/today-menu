import { Module } from '@nestjs/common'
import { MealLogModule } from '../meal-log/meal-log.module'
import { PreferenceController } from './preference.controller'
import { PreferenceService } from './preference.service'

@Module({
  imports: [MealLogModule],
  controllers: [PreferenceController],
  providers: [PreferenceService],
  exports: [PreferenceService],
})
export class PreferenceModule {}
