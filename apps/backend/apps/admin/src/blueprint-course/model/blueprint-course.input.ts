import { Field, InputType, Int } from '@nestjs/graphql'
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateIf
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

// 필드를 생략(undefined)했을 때만 검증을 건너뜁니다. null은 검증합니다.
// (@IsOptional()은 null도 건너뛰므로 필수 필드의 null을 막지 못합니다.)
const isProvided = (_: object, value: unknown) => value !== undefined

/**
 * Blueprint 강좌 수정 입력입니다. 입력한 필드만 수정합니다.
 *
 * - 필수 필드(courseTitle, courseNum, semester, week, professor):
 *   생략하면 변경하지 않고, null·빈 문자열·공백만 있는 문자열은 거부합니다.
 * - 선택 필드(email, website, office, phoneNum):
 *   생략하면 변경하지 않고, null이면 값을 지우며, 빈 문자열·공백만 있는 문자열은 거부합니다.
 * - 모든 필드를 생략한 입력({})은 서비스에서 거부합니다.
 *
 * GraphQL에서 필수 필드를 non-null로 선언하면 생략할 수 없으므로 모두 nullable로 두고,
 * null 거부는 class-validator로 처리합니다. 입력값은 trim하지 않습니다.
 */
@InputType()
export class UpdateBlueprintCourseInput {
  @Field(() => String, { nullable: true })
  @ValidateIf(isProvided)
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'courseTitle must not be blank' })
  courseTitle?: string

  @Field(() => String, { nullable: true })
  @ValidateIf(isProvided)
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'courseNum must not be blank' })
  courseNum?: string

  @Field(() => String, { nullable: true })
  @ValidateIf(isProvided)
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'semester must not be blank' })
  semester?: string

  @Field(() => Int, { nullable: true })
  @ValidateIf(isProvided)
  @IsInt()
  @Min(1)
  week?: number

  @Field(() => String, { nullable: true })
  @ValidateIf(isProvided)
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'professor must not be blank' })
  professor?: string

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'email must not be blank' })
  email?: string | null

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'website must not be blank' })
  website?: string | null

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'office must not be blank' })
  office?: string | null

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(NOT_BLANK, { message: 'phoneNum must not be blank' })
  phoneNum?: string | null
}
