import {
  BadRequestException,
  ForbiddenException,
  NotFoundException
} from '@nestjs/common'
import { GUARDS_METADATA } from '@nestjs/common/constants'
import { Reflector } from '@nestjs/core'
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'
import {
  CollaboratorRole,
  CollaboratorStatus,
  ProblemCreationMode,
  Role
} from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import type { PrismaService } from '@libs/prisma'
import { CollaboratorResolver } from '../collaborator/collaborator.resolver'
import { MandeuldangResolver } from '../mandeuldang.resolver'
import { MandeuldangProblemResolver } from '../problem/resolvers/problem.resolver'
import { MandeuldangRolesGuard } from './mandeuldang-roles.guard'
import { MANDEULDANG_ROLES_KEY } from './mandeuldang-roles.metadata'

const { Owner, Editor, Reviewer } = CollaboratorRole
const routes = [
  {
    handler: MandeuldangProblemResolver.prototype.getMandeuldangProblem,
    roles: [Owner, Editor, Reviewer],
    path: 'id',
    args: { id: 10 }
  },
  {
    handler: MandeuldangProblemResolver.prototype.updateMandeuldangProblem,
    roles: [Owner, Editor],
    path: 'input.id',
    args: { input: { id: 10 } }
  },
  {
    handler: MandeuldangProblemResolver.prototype.deleteMandeuldangProblem,
    roles: [Owner],
    path: 'id',
    args: { id: 10 }
  },
  {
    handler: MandeuldangProblemResolver.prototype.publishMandeuldangProblem,
    roles: [Owner],
    path: 'id',
    args: { id: 10 }
  },
  {
    handler: MandeuldangResolver.prototype.uploadMandeuldangTool,
    roles: [Owner, Editor],
    path: 'input.problemId',
    args: { input: { problemId: 10 } }
  },
  {
    handler: MandeuldangResolver.prototype.deleteMandeuldangTool,
    roles: [Owner, Editor],
    path: 'problemId',
    args: { problemId: 10 }
  },
  {
    handler: MandeuldangResolver.prototype.runGenerator,
    roles: [Owner, Editor],
    path: 'problemId',
    args: { problemId: 10 }
  },
  {
    handler: MandeuldangResolver.prototype.runValidator,
    roles: [Owner, Editor],
    path: 'problemId',
    args: { problemId: 10 }
  },
  {
    handler: CollaboratorResolver.prototype.inviteCollaborator,
    roles: [Owner, Editor],
    path: 'problemId',
    args: { problemId: 10 }
  },
  {
    handler: CollaboratorResolver.prototype.getApprovedCollaborator,
    roles: [Owner, Editor, Reviewer],
    path: 'problemId',
    args: { problemId: 10 }
  },
  {
    handler: CollaboratorResolver.prototype.getPendingCollaborator,
    roles: [Owner],
    path: 'problemId',
    args: { problemId: 10 }
  },
  {
    handler: CollaboratorResolver.prototype.approveInvite,
    roles: [Owner],
    path: 'problemId',
    args: { problemId: 10, userId: 1 }
  },
  {
    handler: CollaboratorResolver.prototype.rejectInvite,
    roles: [Owner],
    path: 'problemId',
    args: { problemId: 10, userId: 1 }
  },
  {
    handler: CollaboratorResolver.prototype.updateCollaboratorRole,
    roles: [Owner],
    path: 'problemId',
    args: { problemId: 10, input: { userId: 1 } }
  },
  {
    handler: CollaboratorResolver.prototype.removeCollaborator,
    roles: [Owner],
    path: 'problemId',
    args: { problemId: 10, userId: 1 }
  }
]

describe('MandeuldangRolesGuard', () => {
  const db = {
    problem: { findUnique: stub() },
    mandeuldangCollaborator: { findUnique: stub() }
  }
  const guard = new MandeuldangRolesGuard(
    new Reflector(),
    db as unknown as PrismaService
  )
  const createContext = (
    handler: (...args: never[]) => unknown,
    args: unknown,
    userId = 2,
    role: Role = Role.User
  ) => {
    const context = new ExecutionContextHost(
      [undefined, args, { req: { user: { id: userId, role } } }, undefined],
      MandeuldangProblemResolver,
      handler
    )
    context.setType('graphql')
    return context
  }

  beforeEach(() => {
    db.problem.findUnique.reset()
    db.mandeuldangCollaborator.findUnique.reset()
    db.problem.findUnique.resolves({
      createdById: 1,
      creationMode: ProblemCreationMode.Mandeuldang
    })
    db.mandeuldangCollaborator.findUnique.resolves(null)
  })

  for (const route of routes) {
    describe(route.handler.name, () => {
      it('역할 가드와 허용 역할, 문제 ID 경로가 설정되어 있다', () => {
        expect(Reflect.getMetadata(GUARDS_METADATA, route.handler)).to.include(
          MandeuldangRolesGuard
        )
        expect(
          Reflect.getMetadata(MANDEULDANG_ROLES_KEY, route.handler)
        ).to.deep.equal({
          roles: route.roles,
          problemIdPath: route.path
        })
      })

      it('Owner의 접근을 허용한다', async () => {
        expect(
          await guard.canActivate(createContext(route.handler, route.args, 1))
        ).to.equal(true)
        expect(db.problem.findUnique.firstCall.args[0].where).to.deep.equal({
          id: 10
        })
        expect(db.mandeuldangCollaborator.findUnique.called).to.equal(false)
      })

      for (const role of [Editor, Reviewer]) {
        for (const status of Object.values(CollaboratorStatus)) {
          const allowed =
            status === CollaboratorStatus.Approved &&
            (route.roles as CollaboratorRole[]).includes(role)
          it(
            role + ' / ' + status + (allowed ? ' 접근 허용' : ' 접근 거절'),
            async () => {
              db.mandeuldangCollaborator.findUnique.resolves({ role, status })
              const result = guard.canActivate(
                createContext(route.handler, route.args)
              )
              if (allowed) {
                expect(await result).to.equal(true)
              } else {
                await expect(result).to.be.rejectedWith(ForbiddenException)
              }
            }
          )
        }
      }

      for (const role of Object.values(Role)) {
        it('협업자가 아닌 ' + role + '의 접근을 거절한다', async () => {
          await expect(
            guard.canActivate(createContext(route.handler, route.args, 2, role))
          ).to.be.rejectedWith(ForbiddenException)
        })
      }

      it('생성자가 아닌 사용자의 Owner 협업 행은 인정하지 않는다', async () => {
        db.mandeuldangCollaborator.findUnique.resolves({
          role: Owner,
          status: CollaboratorStatus.Approved
        })
        await expect(
          guard.canActivate(createContext(route.handler, route.args))
        ).to.be.rejectedWith(ForbiddenException)
      })
    })
  }

  const route = routes[0]
  it('문제가 없으면 접근을 거절한다', async () => {
    db.problem.findUnique.resolves(null)
    await expect(
      guard.canActivate(createContext(route.handler, route.args, 1))
    ).to.be.rejectedWith(NotFoundException)
  })
  it('일반 문제에는 만들당 권한을 적용하지 않는다', async () => {
    db.problem.findUnique.resolves({
      createdById: 1,
      creationMode: ProblemCreationMode.Legacy
    })
    await expect(
      guard.canActivate(createContext(route.handler, route.args, 1))
    ).to.be.rejectedWith(NotFoundException)
  })
  for (const id of [
    undefined,
    null,
    '10',
    0,
    -1,
    1.5,
    Number.MAX_SAFE_INTEGER + 1
  ]) {
    it('잘못된 문제 ID를 거절한다: ' + String(id), async () => {
      await expect(
        guard.canActivate(createContext(route.handler, { id }, 1))
      ).to.be.rejectedWith(BadRequestException)
      expect(db.problem.findUnique.called).to.equal(false)
    })
  }
  it('권한 설정이 없는 요청을 거절한다', async () => {
    await expect(
      guard.canActivate(createContext(() => undefined, { id: 10 }))
    ).to.be.rejectedWith(ForbiddenException)
  })
  it('인증된 사용자 ID가 없으면 거절한다', async () => {
    await expect(
      guard.canActivate(createContext(route.handler, route.args, 0))
    ).to.be.rejectedWith(ForbiddenException)
    expect(db.problem.findUnique.called).to.equal(false)
  })
})
