import { BadRequestException, type PipeTransform } from '@nestjs/common'
import type { ZodSchema } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      console.log(value)
      const parsedValue = this.schema.parse(value)
      console.log(parsedValue)
      return parsedValue
    } catch (error) {
      throw new BadRequestException('Validation failed')
    }
  }
}
