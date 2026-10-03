import { ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host'
import { Test } from '@nestjs/testing'
import {
  CollaboratorRole,
  CollaboratorStatus,
  ProblemCreationMode
} from '@prisma/client'
import { expect } from 'chai'
import { stub } from 'sinon'
import { PrismaService } from '@libs/prisma'
import { MandeuldangRolesGuard } from './mandeuldang-roles.guard'

describe('MandeuldangRolesGuard', () => {
  let guard: MandeuldangRolesGuard

  const db = {
    problem: {
      findUnique: stub()
    },
    mandeuldangCollaborator: {
      findUnique: stub()
    }
  }

  const reflector = {
    getAllAndOverride: stub()
  }

  const createContext = (userId: number) => {
    const context = new ExecutionContextHost([
      undefined,
      { problemId: 10 },
      { req: { user: { id: userId } } },
      undefined
    ])

    context.setType('graphql')
    return context
  }

  beforeEach(async () => {
    db.problem.findUnique.reset()
    db.mandeuldangCollaborator.findUnique.reset()
    reflector.getAllAndOverride.reset()

    db.problem.findUnique.resolves({
      createdById: 1,
      creationMode: ProblemCreationMode.Mandeuldang
    })

    reflector.getAllAndOverride.returns({
      roles: [CollaboratorRole.Owner, CollaboratorRole.Editor],
      problemIdPath: 'problemId'
    })

    const module = await Test.createTestingModule({
      providers: [
        MandeuldangRolesGuard,
        { provide: PrismaService, useValue: db },
        { provide: Reflector, useValue: reflector }
      ]
    }).compile()

    guard = module.get(MandeuldangRolesGuard)
  })

  it('Owner가 허용 역할에 포함되면 접근을 허용한다', async () => {
    const result = await guard.canActivate(createContext(1))

    expect(result).to.equal(true)
    expect(db.mandeuldangCollaborator.findUnique.called).to.equal(false)
  })

  it('Editor가 허용 역할에 포함되고 Approved 상태이면 접근을 허용한다', async () => {
    db.mandeuldangCollaborator.findUnique.resolves({
      role: CollaboratorRole.Editor,
      status: CollaboratorStatus.Approved
    })

    const result = await guard.canActivate(createContext(2))

    expect(result).to.equal(true)
  })

  const deniedCases = [
    {
      name: 'Reviewer가 Approved 상태가 아니라면 접근을 거절한다',
      role: CollaboratorRole.Reviewer,
      status: CollaboratorStatus.Approved
    },
    {
      name: 'Editor가 Pending 상태이면 접근을 거절한다',
      role: CollaboratorRole.Editor,
      status: CollaboratorStatus.Pending
    },
    {
      name: 'Editor가 Rejected 상태이면 접근을 거절한다',
      role: CollaboratorRole.Editor,
      status: CollaboratorStatus.Rejected
    },
    {
      name: '문제 생성자가 아니면 Owner 역할로 접근할 수 없다',
      role: CollaboratorRole.Owner,
      status: CollaboratorStatus.Approved
    }
  ]

  for (const testCase of deniedCases) {
    it(testCase.name, async () => {
      db.mandeuldangCollaborator.findUnique.resolves({
        role: testCase.role,
        status: testCase.status
      })

      let caught: unknown

      try {
        await guard.canActivate(createContext(2))
      } catch (error) {
        caught = error
      }

      expect(caught).to.be.instanceOf(ForbiddenException)
    })
  }
})
