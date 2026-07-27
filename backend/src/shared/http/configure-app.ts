import { ValidationPipe } from '@nestjs/common'
import type { INestApplication } from '@nestjs/common'

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1')
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  })
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
}
