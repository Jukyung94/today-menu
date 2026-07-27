import { Injectable } from '@nestjs/common'
import type { UploadRepository } from './upload.repository'
import type { UploadedFileRecord } from './upload.types'

@Injectable()
export class InMemoryUploadRepository implements UploadRepository {
  private readonly uploads = new Map<string, UploadedFileRecord>()

  async save(upload: UploadedFileRecord): Promise<void> {
    this.uploads.set(upload.id, structuredClone(upload))
  }

  async findById(uploadId: string): Promise<UploadedFileRecord | null> {
    const upload = this.uploads.get(uploadId)
    return upload ? structuredClone(upload) : null
  }
}
