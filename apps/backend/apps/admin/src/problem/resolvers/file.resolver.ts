import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { File } from '@generated'
import { AuthenticatedRequest } from '@libs/auth'
import { UseDisableAdminGuard } from '@libs/auth'
import { FileSource } from '../model/file.output'
import { UploadFileInput } from '../model/problem.input'
import { FileService } from '../services'

@Resolver()
export class FileResolver {
  constructor(private readonly fileService: FileService) {}

  @Mutation(() => FileSource)
  async uploadImage(
    @Args('input') input: UploadFileInput,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.fileService.uploadFile(input, req.user.id, true)
  }

  @Mutation(() => FileSource)
  async uploadFile(
    @Args('input') input: UploadFileInput,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.fileService.uploadFile(input, req.user.id, false)
  }

  @Mutation(() => File)
  @UseDisableAdminGuard() // Admin도 다른 사용자 파일 삭제 못함
  async deleteFile(
    @Args('filename') filename: string,
    @Context('req') req: AuthenticatedRequest
  ) {
    return await this.fileService.deleteFile(filename, req.user.id)
  }
}
