import { Query, Resolver } from '@nestjs/graphql'
import { Public } from 'src/common/decorator/public.decorator'
import { Roles } from 'src/common/decorator/roles.decorator'

@Resolver('Temp')
export class TempResolver {
  @Query()
  async getTemp() {
    return { id: 1, name: 'temp' }
  }

  @Query()
  async getTempList() {
    return [
      { id: 1, name: 'temp' },
      { id: 2, name: 'temp' }
    ]
  }
}
