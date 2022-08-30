export class GetUserProfileDto {
  readonly username: string

  readonly role: string

  readonly email: string

  readonly lastLogin: Date

  readonly updateTime: Date

  readonly UserProfile: { realName: string }
}
