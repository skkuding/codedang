import { Field, InputType, Int } from '@nestjs/graphql'
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min
} from 'class-validator'

// 공백이 아닌 문자가 하나 이상 있어야 합니다. 입력값은 trim하지 않습니다.
const NOT_BLANK = /\S/

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
  @Matches(NOT_BLANK, { message: 'courseTitle must not be blank' })
  courseTitle: string

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'courseNum must not be blank' })
  courseNum: string

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'semester must not be blank' })
  semester: string

  @Field(() => Int, { nullable: false })
  @IsInt()
  @Min(1)
  week: number

  @Field(() => String, { nullable: false })
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'professor must not be blank' })
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
