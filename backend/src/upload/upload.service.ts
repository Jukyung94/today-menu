import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import {
  OBJECT_STORAGE_PROVIDER,
  type ObjectStorageProvider,
} from './object-storage.provider'
import { UPLOAD_REPOSITORY, type UploadRepository } from './upload.repository'
import { UploadStatus } from './upload.types'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

@Injectable()
export class UploadService {
  constructor(
    @Inject(UPLOAD_REPOSITORY)
    private readonly repository: UploadRepository,
    @Inject(OBJECT_STORAGE_PROVIDER)
    private readonly storageProvider: ObjectStorageProvider,
  ) {}

  async create(actorId: string, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        code: 'UPLOAD_FILE_REQUIRED',
        message: 'A multipart file field named file is required.',
        fieldErrors: { file: ['file is required'] },
      })
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException({
        code: 'UNSUPPORTED_UPLOAD_TYPE',
        message: 'Only image uploads are supported.',
        fieldErrors: { file: ['only image files are supported'] },
      })
    }
    if (file.size > MAX_IMAGE_BYTES) {
      throw new BadRequestException({
        code: 'UPLOAD_TOO_LARGE',
        message: 'Image uploads must be 5 MB or smaller.',
        fieldErrors: { file: ['maximum size is 5 MB'] },
      })
    }

    const uploadId = randomUUID()
    await this.storageProvider.put({
      key: `${actorId}/${uploadId}`,
      contentType: file.mimetype,
      bytes: file.buffer,
    })

    const record = {
      id: uploadId,
      actorId,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      status: UploadStatus.READY,
      createdAt: new Date().toISOString(),
    }
    await this.repository.save(record)
    return {
      uploadId: record.id,
      fileName: record.originalFileName,
      mimeType: record.mimeType,
      size: record.size,
      status: record.status,
      createdAt: record.createdAt,
    }
  }

  async assertOwned(uploadId: string, actorId: string): Promise<void> {
    const upload = await this.repository.findById(uploadId)
    if (!upload || upload.actorId !== actorId) {
      throw new NotFoundException({
        code: 'UPLOAD_NOT_FOUND',
        message: 'The upload was not found.',
      })
    }
  }
}
