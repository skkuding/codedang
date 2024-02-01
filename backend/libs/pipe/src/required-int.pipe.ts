import {
  type ArgumentMetadata,
  Injectable,
  ParseIntPipe,
  UnprocessableEntityException,
  BadRequestException
} from '@nestjs/common'

@Injectable()
export class RequiredIntPipe extends ParseIntPipe {
  constructor(private item: string) {
    super()
  }

  async transform(value: string, metadata: ArgumentMetadata) {
    if (value == null) {
      throw new UnprocessableEntityException(
        `Required query is missing: ${this.item}`
      )
    }
    try {
      return await super.transform(value, metadata)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new UnprocessableEntityException(error.message)
      }
      throw error
    }
  }
}
