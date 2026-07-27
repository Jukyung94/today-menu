import type { UploadedFileRecord } from './upload.types'

export const UPLOAD_REPOSITORY = Symbol('UPLOAD_REPOSITORY')

export interface UploadRepository {
  save(upload: UploadedFileRecord): Promise<void>
  findById(uploadId: string): Promise<UploadedFileRecord | null>
}
