import { MailerModule } from '@nestjs-modules/mailer'
import { CacheModule } from '@nestjs/cache-manager'
import { Module, type OnApplicationBootstrap } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD, HttpAdapterHost } from '@nestjs/core'
import type { Server } from 'http'
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
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly refHost: HttpAdapterHost) {}

  onApplicationBootstrap() {
    // Keep-Alive timeout of reverse proxy must be longer than of the backend
    // Set timeout of Caddy to 60s and of the backend to 61s to avoid timeout error
    // https://adamcrowder.net/posts/node-express-api-and-aws-alb-502/
    const server: Server = this.refHost.httpAdapter.getHttpServer()
    server.keepAliveTimeout = 61 * 1000
    server.headersTimeout = 62 * 1000
  }
}
