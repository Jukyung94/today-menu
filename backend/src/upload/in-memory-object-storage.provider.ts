import { Injectable } from '@nestjs/common'
import type { ObjectStorageProvider } from './object-storage.provider'

@Injectable()
export class InMemoryObjectStorageProvider implements ObjectStorageProvider {
  private readonly objects = new Map<
    string,
    { contentType: string; bytes: Buffer }
  >()

  async put(input: {
    key: string
    contentType: string
    bytes: Buffer
  }): Promise<void> {
    this.objects.set(input.key, {
      contentType: input.contentType,
      bytes: Buffer.from(input.bytes),
    })
  }
}
