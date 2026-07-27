export enum UploadStatus {
  READY = 'READY',
}

export interface UploadedFileRecord {
  id: string
  actorId: string
  originalFileName: string
  mimeType: string
  size: number
  status: UploadStatus
  createdAt: string
}
