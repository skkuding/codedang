import { Level } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class ProblemsResponseDto {
  @Expose() id: number
  @Expose() title: string
  @Expose() difficulty: Level
}
