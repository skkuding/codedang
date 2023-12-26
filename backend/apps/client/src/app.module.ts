import { MailerModule } from '@nestjs-modules/mailer'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { LoggerModule } from 'nestjs-pino'
import { JwtAuthModule, JwtAuthGuard } from '@libs/auth'
import { CacheConfigService } from '@libs/cache'
import { PrismaModule } from '@libs/prisma'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ClarificationModule } from './clarification/clarification.module'
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
    ClarificationModule,
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
        autoLogging: true,
        formatters: {
          level(label) {
            return { level: label }
          },
          log(object) {
            if (process.env.NODE_ENV !== 'production') {
              if (object.err) {
                return {
                  level: object.level,
                  pid: object.pid,
                  time: object.time,
                  msg: object.msg,
                  err: object.err,
                  responseTime: object.responseTime
                }
              } else {
                return {
                  level: object.level,
                  pid: object.pid,
                  time: object.time,
                  msg: object.msg,
                  responseTime: object.responseTime
                }
              }
            } else {
              return object
            }
          }
        }
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }]
})
export class AppModule {}
