export const OBJECT_STORAGE_PROVIDER = Symbol('OBJECT_STORAGE_PROVIDER')

export interface ObjectStorageProvider {
  put(input: {
    key: string
    contentType: string
    bytes: Buffer
  }): Promise<void>
}
