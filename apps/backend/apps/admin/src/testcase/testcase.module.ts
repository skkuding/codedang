import { Module } from '@nestjs/common'
import { StorageModule } from '@admin/storage/storage.module'
import { TestcaseResolver } from './testcase.resolver'
import { TestcaseService } from './testcase.service'

@Module({
  imports: [StorageModule],
  providers: [TestcaseResolver, TestcaseService]
})
export class TestcaseModule {}
