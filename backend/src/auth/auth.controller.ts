import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { Public } from '../shared/http/public.decorator'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('guest')
  @HttpCode(HttpStatus.CREATED)
  createGuest() {
    return this.authService.createGuest()
  }
}
