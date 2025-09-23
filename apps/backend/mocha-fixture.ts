import { use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

export const mochaGlobalSetup = async () => {
  use(chaiAsPromised)
}
