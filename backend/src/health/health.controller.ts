import { Controller, Get } from '@nestjs/common'
import { Public } from '../shared/http/public.decorator'

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  getHealth() {
    return {
      status: 'OK',
      service: 'today-menu-api',
      timestamp: new Date().toISOString(),
    }
  }
}
