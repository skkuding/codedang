import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { CollaboratorStatus } from '@prisma/client'
import { UseDisableAdminGuard, type AuthenticatedRequest } from '@libs/auth'
import { IDValidationPipe } from '@libs/pipe'
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
