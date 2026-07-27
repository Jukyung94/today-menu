import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import type { Request, Response } from 'express'

interface ApiErrorShape {
  code?: string
  message?: string | string[]
  fieldErrors?: Record<string, string[]>
}

interface NormalizedApiError {
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
  requestId: string
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const request = context.getRequest<Request>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR
    const raw =
      exception instanceof HttpException ? exception.getResponse() : undefined
    const requestId = request.header('x-request-id') ?? randomUUID()
    const error = this.normalizeError(raw, status, requestId)

    response.status(status).json({
      error,
    })
  }

  private normalizeError(
    raw: string | object | undefined,
    status: number,
    requestId: string,
  ): NormalizedApiError {
    if (typeof raw === 'string') {
      return { code: `HTTP_${status}`, message: raw, requestId }
    }

    const shape = (raw ?? {}) as ApiErrorShape
    const message = Array.isArray(shape.message)
      ? shape.message.join('; ')
      : (shape.message ?? 'Unexpected server error')
    return {
      code: shape.code ?? `HTTP_${status}`,
      message,
      ...(shape.fieldErrors === undefined
        ? {}
        : { fieldErrors: shape.fieldErrors }),
      requestId,
    }
  }
}
