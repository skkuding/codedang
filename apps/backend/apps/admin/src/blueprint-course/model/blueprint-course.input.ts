import { Field, InputType, Int } from '@nestjs/graphql'
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'

/**
 * Blueprint 강좌 생성 입력입니다.
 *
 * Section별 값인 classNum과 config는 포함하지 않습니다.
 * courseTitle을 제외한 공통 필드는 Section을 만들 때 각 Section의 CourseInfo로 복사됩니다.
 */
@InputType()
export class BlueprintCourseInput {
  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  courseTitle: string

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  courseNum: string

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  semester: string

  @Field(() => Int, { nullable: false })
  @IsInt()
  @Min(1)
  week: number

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  professor: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  email?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  website?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  office?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phoneNum?: string
}
