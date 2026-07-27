import { Module } from '@nestjs/common'
import { InMemoryUploadRepository } from './in-memory-upload.repository'
import { InMemoryObjectStorageProvider } from './in-memory-object-storage.provider'
import { OBJECT_STORAGE_PROVIDER } from './object-storage.provider'
import { UploadController } from './upload.controller'
import { UPLOAD_REPOSITORY } from './upload.repository'
import { UploadService } from './upload.service'

@Module({
  controllers: [UploadController],
  providers: [
    UploadService,
    { provide: UPLOAD_REPOSITORY, useClass: InMemoryUploadRepository },
    {
      provide: OBJECT_STORAGE_PROVIDER,
      useClass: InMemoryObjectStorageProvider,
    },
  ],
  exports: [UploadService],
})
export class UploadModule {}
