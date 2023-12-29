import { MailerModule } from '@nestjs-modules/mailer'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { LoggerModule } from 'nestjs-pino'
import { JwtAuthModule, JwtAuthGuard } from '@libs/auth'
import { CacheConfigService } from '@libs/cache'
import { pinoLoggerModuleOption } from '@libs/logger'
import { PrismaModule } from '@libs/prisma'
import { AnnouncementModule } from './announcement/announcement.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ContestModule } from './contest/contest.module'
import { EmailModule } from './email/email.module'
import { MailerConfigService } from './email/mailerConfig.service'
import { GroupModule } from './group/group.module'
import { NoticeModule } from './notice/notice.module'
import { ProblemModule } from './problem/problem.module'
import { SubmissionModule } from './submission/submission.module'
import { UserModule } from './user/user.module'
import { WorkbookModule } from './workbook/workbook.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfigService
    }),
    JwtAuthModule,
    MailerModule.forRootAsync({
      useClass: MailerConfigService
    }),
    PrismaModule,
    AuthModule,
    ContestModule,
    GroupModule,
    NoticeModule,
    ProblemModule,
    SubmissionModule,
    UserModule,
    WorkbookModule,
    EmailModule,
    AnnouncementModule,
    LoggerModule.forRoot(pinoLoggerModuleOption)
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }]
})
export class AppModule {}
