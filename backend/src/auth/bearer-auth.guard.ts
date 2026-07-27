import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { Request } from 'express'
import { IS_PUBLIC_KEY } from '../shared/http/public.decorator'
import { AuthService } from './auth.service'
import type { AuthenticatedActor } from './auth.types'

type AuthenticatedRequest = Request & { actor?: AuthenticatedActor }

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const authorization = request.header('authorization')
    const match = authorization?.match(/^Bearer\s+(.+)$/i)
    if (!match) {
      throw new UnauthorizedException({
        code: 'BEARER_TOKEN_REQUIRED',
        message: 'Authorization: Bearer <accessToken> is required.',
      })
    }

    request.actor = await this.authService.authenticate(match[1])
    return true
  }
}
