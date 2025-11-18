import {
  BadRequestException,
  Injectable,
  type PipeTransform
} from '@nestjs/common'

@Injectable()
export class StatisticsModeValidationPipe implements PipeTransform {
  transform(value: unknown): 'distribution' | 'timeline' | undefined {
    if (!value || value === '') {
      return undefined
    }

    const allowedModes: Array<'distribution' | 'timeline'> = [
      'distribution',
      'timeline'
    ]

    if (
      typeof value !== 'string' ||
      !allowedModes.includes(value as 'distribution' | 'timeline')
    ) {
      throw new BadRequestException('Invalid mode parameter')
    }

    return value as 'distribution' | 'timeline'
  }
}
