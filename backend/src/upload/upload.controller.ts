import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { AuthenticatedActor } from '../auth/auth.types'
import { CurrentActor } from '../shared/http/current-actor.decorator'
import { UploadService } from './upload.service'

@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @CurrentActor() actor: AuthenticatedActor,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.uploadService.create(actor.actorId, file)
  }
}
