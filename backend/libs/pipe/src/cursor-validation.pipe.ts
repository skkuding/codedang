import {
  type PipeTransform,
  Injectable,
  BadRequestException
} from '@nestjs/common'
import { InvalidCursorValueException } from '@libs/exception'

@Injectable()
export class CursorValidationPipe implements PipeTransform {
  transform(value: string) {
    // validation for default values
    if (value == null) {
      return 0
    } else {
      // implements parseIntPipe
      const cursor = parseInt(value, 10)
      if (isNaN(cursor)) {
        throw new BadRequestException('Cursor value must be number')
      }
      // validation for negative values
      if (cursor <= 0) {
        throw new InvalidCursorValueException(cursor)
      }

      return cursor
    }
  }
}

// For the Announcement module, ensure that the cursor is either a number or a valid Date.
// @Injectable()
// export class AnnouncementCursorValidationPipe implements PipeTransform {
//   transform(value: string) {
//     if (value == null) return 0
//     // check if cursor is number
//     let cursor: number | Date = Number(value)
//     // console.log(`cursor ${cursor} value ${value} Number ${Number(value)}`)
//     if (isNaN(cursor)) {
//       // check if cursor is Date
//       cursor = new Date(value)
//       if (isNaN(cursor.getTime())) {
//         throw new BadRequestException(
//           'Invalid cursor value. Must be a number or a valid date string.'
//         )
//       }
//     } else if (cursor <= 0) {
//       throw new InvalidCursorValueException(cursor)
//     }

//     return cursor
//   }
// }
