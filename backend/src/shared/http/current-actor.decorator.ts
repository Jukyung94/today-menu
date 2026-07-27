import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { AuthenticatedActor } from '../../auth/auth.types'

export const CurrentActor = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedActor => {
    const request = context.switchToHttp().getRequest<{ actor: AuthenticatedActor }>()
    return request.actor
  },
)
