export enum ActorType {
  GUEST = 'GUEST',
}

export interface AuthenticatedActor {
  actorId: string
  actorType: ActorType
}

export interface AccessTokenRecord extends AuthenticatedActor {
  accessToken: string
  expiresAt: string
}
