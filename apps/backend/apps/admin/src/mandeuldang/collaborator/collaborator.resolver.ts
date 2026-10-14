import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { CollaboratorRole, CollaboratorStatus } from '@prisma/client'
import { UseDisableAdminGuard, type AuthenticatedRequest } from '@libs/auth'
import { IDValidationPipe } from '@libs/pipe'
import { UseMandeuldangRoles } from '../auth/mandeuldang-roles.decorator'
import { CollaboratorService } from './collaborator.service'
import {
  CollaboratorInput,
  CollaboratorUpdateInput
} from './model/collaborator.input'
import {
  CollaboratorOutput,
  CollaboratorMutationOutput
} from './model/collaborator.output'

@Resolver()
@UseDisableAdminGuard()
export class CollaboratorResolver {
  constructor(private readonly collaboratorService: CollaboratorService) {}

  @Mutation(() => CollaboratorMutationOutput)
  @UseMandeuldangRoles({
    roles: [CollaboratorRole.Owner, CollaboratorRole.Editor],
    problemIdPath: 'problemId'
  })
  async inviteCollaborator(
    @Context('req') req: AuthenticatedRequest,
    @Args('problemId', { type: () => Int }, IDValidationPipe) problemId: number,
    @Args('input') input: CollaboratorInput
  ): Promise<CollaboratorMutationOutput> {
    return await this.collaboratorService.inviteCollaborator(
      req.user.id,
      problemId,
      input
    )
  }

  @Query(() => [CollaboratorOutput])
  @UseMandeuldangRoles({
    roles: [
      CollaboratorRole.Owner,
      CollaboratorRole.Editor,
      CollaboratorRole.Reviewer
    ],
    problemIdPath: 'problemId'
  })
  async getApprovedCollaborator(
    @Context('req') req: AuthenticatedRequest,
    @Args('problemId', { type: () => Int }, IDValidationPipe) problemId: number
  ): Promise<CollaboratorOutput[]> {
    return await this.collaboratorService.getCollaboratorsByStatus(
      req.user.id,
      problemId,
      CollaboratorStatus.Approved
    )
  }

  @Query(() => [CollaboratorOutput])
  @UseMandeuldangRoles({
    roles: [CollaboratorRole.Owner],
    problemIdPath: 'problemId'
  })
  async getPendingCollaborator(
    @Context('req') req: AuthenticatedRequest,
    @Args('problemId', { type: () => Int }, IDValidationPipe) problemId: number
  ): Promise<CollaboratorOutput[]> {
    return await this.collaboratorService.getCollaboratorsByStatus(
      req.user.id,
      problemId,
      CollaboratorStatus.Pending
    )
  }

  @Mutation(() => CollaboratorMutationOutput)
  @UseMandeuldangRoles({
    roles: [CollaboratorRole.Owner],
    problemIdPath: 'problemId'
  })
  async approveInvite(
    @Context('req') req: AuthenticatedRequest,
    @Args('problemId', { type: () => Int }, IDValidationPipe) problemId: number,
    @Args('userId', { type: () => Int }, IDValidationPipe) userId: number
  ): Promise<CollaboratorMutationOutput> {
    return await this.collaboratorService.approveCollaborator(
      req.user.id,
      problemId,
      userId
    )
  }

  @Mutation(() => CollaboratorMutationOutput)
  @UseMandeuldangRoles({
    roles: [CollaboratorRole.Owner],
    problemIdPath: 'problemId'
  })
  async rejectInvite(
    @Context('req') req: AuthenticatedRequest,
    @Args('problemId', { type: () => Int }, IDValidationPipe) problemId: number,
    @Args('userId', { type: () => Int }, IDValidationPipe) userId: number
  ): Promise<CollaboratorMutationOutput> {
    return await this.collaboratorService.rejectCollaborator(
      req.user.id,
      problemId,
      userId
    )
  }

  @Mutation(() => CollaboratorMutationOutput)
  @UseMandeuldangRoles({
    roles: [CollaboratorRole.Owner],
    problemIdPath: 'problemId'
  })
  async updateCollaboratorRole(
    @Context('req') req: AuthenticatedRequest,
    @Args('problemId', { type: () => Int }, IDValidationPipe) problemId: number,
    @Args('input') input: CollaboratorUpdateInput
  ): Promise<CollaboratorMutationOutput> {
    return await this.collaboratorService.updateCollaboratorRole(
      req.user.id,
      problemId,
      input
    )
  }

  @Mutation(() => CollaboratorMutationOutput)
  @UseMandeuldangRoles({
    roles: [CollaboratorRole.Owner],
    problemIdPath: 'problemId'
  })
  async removeCollaborator(
    @Context('req') req: AuthenticatedRequest,
    @Args('problemId', { type: () => Int }, IDValidationPipe) problemId: number,
    @Args('userId', { type: () => Int }, IDValidationPipe) userId: number
  ): Promise<CollaboratorMutationOutput> {
    return await this.collaboratorService.removeCollaborator(
      req.user.id,
      problemId,
      userId
    )
  }
}
