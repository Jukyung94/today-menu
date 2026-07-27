import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { createHash } from 'node:crypto'
import type { Request, Response } from 'express'
import { Observable, of, tap } from 'rxjs'
import type { AuthenticatedActor } from '../auth/auth.types'
import { IdempotencyService } from './idempotency.service'

type ActorRequest = Request & { actor?: AuthenticatedActor }

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly service: IdempotencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<ActorRequest>()
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      return next.handle()
    }

    const idempotencyKey = request.header('idempotency-key')?.trim()
    if (!idempotencyKey) {
      throw new BadRequestException({
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key is required for mutation requests.',
      })
    }

    const response = context.switchToHttp().getResponse<Response>()
    const actorScope = request.actor?.actorId ?? request.ip ?? 'anonymous'
    const cacheKey = [
      actorScope,
      request.method,
      request.path,
      idempotencyKey,
    ].join(':')
    const requestHash = createHash('sha256')
      .update(JSON.stringify(request.body ?? {}))
      .digest('hex')
    const cached = this.service.get(cacheKey)

    if (cached) {
      if (cached.requestHash !== requestHash) {
        throw new ConflictException({
          code: 'IDEMPOTENCY_KEY_REUSED',
          message: 'The Idempotency-Key was already used with a different request.',
        })
      }
      response.status(cached.statusCode)
      response.setHeader('Idempotency-Replayed', 'true')
      return of(cached.responseBody)
    }

    return next.handle().pipe(
      tap((responseBody) => {
        this.service.save(cacheKey, {
          requestHash,
          statusCode: response.statusCode,
          responseBody,
        })
      }),
    )
  }
}
