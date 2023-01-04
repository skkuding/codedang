import { use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

export async function mochaGlobalSetup() {
  use(chaiAsPromised)
}
