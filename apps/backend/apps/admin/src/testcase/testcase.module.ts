import { Module } from '@nestjs/common'
import { StorageModule } from '@libs/storage'
import { TestcaseResolver } from './testcase.resolver'
import { TestcaseService } from './testcase.service'

@Module({
  imports: [StorageModule],
  providers: [TestcaseResolver, TestcaseService]
})
export class TestcaseModule {}
