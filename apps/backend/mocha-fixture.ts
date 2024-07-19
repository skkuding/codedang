import { use } from 'chai'
import * as chaiAsPromised from 'chai-as-promised'

export const mochaGlobalSetup = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  use((chaiAsPromised as any).default)
}
