import { ForbiddenException } from '@nestjs/common'
import {
  CollaboratorRole,
  CollaboratorStatus,
  ProblemCreationMode,
  Role,
  ToolType
} from '@prisma/client'
import { expect } from 'chai'
import type { FileUpload } from 'graphql-upload/processRequest.mjs'
import { Readable } from 'node:stream'
import { stub } from 'sinon'
import type { PrismaService } from '@libs/prisma'
import type { StorageService } from '@libs/storage'
import { MandeuldangPermissionService } from '../auth/mandeuldang-permission.service'
import { FileService } from './file.service'

describe('Mandeuldang tool upload permissions', () => {
  const requester = { id: 2, role: Role.User }
  const db = {
    problem: { findUnique: stub() },
    mandeuldangCollaborator: { findUnique: stub() },
    mandeuldangTool: { upsert: stub() }
  }
  const storage = { uploadObject: stub() }
  const permissions = new MandeuldangPermissionService(
    db as unknown as PrismaService
  )
  const service = new FileService(
    db as unknown as PrismaService,
    storage as unknown as StorageService,
    permissions
  )
  const options = {
    roles: [CollaboratorRole.Owner, CollaboratorRole.Editor]
  }

  beforeEach(() => {
    db.problem.findUnique.reset()
    db.mandeuldangCollaborator.findUnique.reset()
    db.mandeuldangTool.upsert.reset()
    storage.uploadObject.reset()
    db.problem.findUnique.resolves({
      createdById: 1,
      creationMode: ProblemCreationMode.Mandeuldang
    })
    db.mandeuldangCollaborator.findUnique.resolves({
      role: CollaboratorRole.Editor,
      status: CollaboratorStatus.Approved
    })
    storage.uploadObject.resolves()
    db.mandeuldangTool.upsert.resolves({ id: 10 })
  })

  const createFile = (duringRead: () => void): FileUpload => {
    return {
      filename: 'generator.cpp',
      mimetype: 'text/plain',
      encoding: '7bit',
      createReadStream: () =>
        Readable.from(
          (async function* () {
            yield Buffer.from('int main() {')
            duringRead()
            yield Buffer.from('}')
          })()
        )
    } as FileUpload
  }

  for (const change of ['removed', 'demoted', 'unapproved']) {
    it(
      'rejects an editor ' + change + ' while receiving the file',
      async () => {
        await permissions.assertAccess(10, requester, options)
        const file = createFile(() => {
          db.mandeuldangCollaborator.findUnique.resolves(
            change === 'removed'
              ? null
              : {
                  role:
                    change === 'demoted'
                      ? CollaboratorRole.Reviewer
                      : CollaboratorRole.Editor,
                  status:
                    change === 'unapproved'
                      ? 'Pending'
                      : CollaboratorStatus.Approved
                }
          )
        })

        await expect(
          service.uploadMandeuldangToolFile(
            10,
            ToolType.Generator,
            file,
            requester
          )
        ).to.be.rejectedWith(ForbiddenException)
        expect(storage.uploadObject.called).to.equal(false)
        expect(db.mandeuldangTool.upsert.called).to.equal(false)
      }
    )
  }

  for (const owner of [false, true]) {
    it('allows ' + (owner ? 'the creator' : 'an approved editor'), async () => {
      if (owner) {
        db.problem.findUnique.resolves({
          createdById: requester.id,
          creationMode: ProblemCreationMode.Mandeuldang
        })
        db.mandeuldangCollaborator.findUnique.resolves(null)
      }
      const file = createFile(() => {
        expect(storage.uploadObject.called).to.equal(false)
        expect(db.mandeuldangCollaborator.findUnique.called).to.equal(false)
      })

      const result = await service.uploadMandeuldangToolFile(
        10,
        ToolType.Generator,
        file,
        requester
      )

      expect(result).to.deep.equal({ id: 10 })
      expect(storage.uploadObject.calledOnce).to.equal(true)
      expect(db.mandeuldangTool.upsert.calledOnce).to.equal(true)
      expect(db.mandeuldangCollaborator.findUnique.called).to.equal(!owner)
    })
  }
})
