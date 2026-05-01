import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql'
import { CollaboratorStatus } from '@prisma/client'
import { AuthenticatedRequest } from '@libs/auth'
import { IDValidationPipe } from '@libs/pipe'
import { CollaboratorService } from './collaborator.service'
import {
  CollaboratorInput,
  CollaboratorUpdateInput
} from './model/collaborator.input'

@Resolver()
export class CollaboratorResolver {
  constructor(private readonly collaboratorService: CollaboratorService) {}

  @Mutation()
  async inviteCollaborator(
    @Context('req') req: AuthenticatedRequest,
    @Args('polygonId', { type: () => Int }, IDValidationPipe) polygonId: number,
    @Args('input') input: CollaboratorInput
  ) {
    return await this.collaboratorService.inviteCollaborator(
      req.user.id,
      polygonId,
      input
    )
  }

  @Query()
  async getActiveCollaborator(
    @Args('polygonId', { type: () => Int }, IDValidationPipe) polygonId: number
  ) {
    return await this.collaboratorService.getCollaboratorsByStatus(
      polygonId,
      CollaboratorStatus.Active
    )
  }

  @Query()
  async getPendingCollaborator(
    @Args('polygonId', { type: () => Int }, IDValidationPipe) polygonId: number
  ) {
    return await this.collaboratorService.getCollaboratorsByStatus(
      polygonId,
      CollaboratorStatus.Pending
    )
  }

  @Mutation()
  async approveInvite(
    @Context('req') req: AuthenticatedRequest,
    @Args('polygonId', { type: () => Int }, IDValidationPipe) polygonId: number,
    @Args('userId', { type: () => Int }, IDValidationPipe) userId: number
  ) {
    return await this.collaboratorService.approveCollaborator(
      req.user.id,
      polygonId,
      userId
    )
  }

  @Mutation()
  async rejectInvite(
    @Context('req') req: AuthenticatedRequest,
    @Args('polygonId', { type: () => Int }, IDValidationPipe) polygonId: number,
    @Args('userId', { type: () => Int }, IDValidationPipe) userId: number
  ) {
    return await this.collaboratorService.rejectCollaborator(
      req.user.id,
      polygonId,
      userId
    )
  }

  @Mutation()
  async updateCollaboratorRole(
    @Context('req') req: AuthenticatedRequest,
    @Args('polygonId', { type: () => Int }, IDValidationPipe) polygonId: number,
    @Args('input') input: CollaboratorUpdateInput
  ) {
    return await this.collaboratorService.updateCollaboratorRole(
      req.user.id,
      polygonId,
      input
    )
  }

  @Mutation()
  async removeCollaborator(
    @Context('req') req: AuthenticatedRequest,
    @Args('polygonId', { type: () => Int }, IDValidationPipe) polygonId: number,
    @Args('userId', { type: () => Int }, IDValidationPipe) userId: number
  ) {
    return await this.collaboratorService.removeCollaborator(
      req.user.id,
      polygonId,
      userId
    )
  }
}
