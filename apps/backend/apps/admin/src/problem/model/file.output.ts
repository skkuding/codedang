import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({ description: 'file' })
export class FileSource {
  @Field(() => String)
  src: string
}

@ObjectType({ description: 'problem attachment upload result' })
export class ProblemAttachmentUpload {
  /**
   * 업로드된 파일의 첨부 ID (File.filename)
   * 본문 HTML의 data-attachment-id 값으로 사용한다.
   */
  @Field(() => String)
  attachmentId: string
}
