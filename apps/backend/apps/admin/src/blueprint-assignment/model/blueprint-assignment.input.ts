import {
  Field,
  GraphQLISODateTime,
  InputType,
  Int,
  OmitType,
  PartialType
} from '@nestjs/graphql'
import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsString,
  IsNotEmpty,
  Matches,
  MaxLength,
  IsOptional,
  IsUUID,
  Min,
  ValidateIf,
  ValidateNested
} from 'class-validator'
import { CreateAssignmentInput } from '@admin/assignment/model/assignment.input'

const isProvided = (_: object, value: unknown) => value !== undefined

@InputType()
export class BlueprintAssignmentSectionSettingsInput {
  @Field(() => Boolean, { nullable: true })
  @ValidateIf(isProvided)
  @IsBoolean()
  isVisible?: boolean

  @Field(() => Boolean, { nullable: true })
  @ValidateIf(isProvided)
  @IsBoolean()
  isFinalScoreVisible?: boolean

  @Field(() => Boolean, { nullable: true })
  @ValidateIf(isProvided)
  @IsBoolean()
  isRankVisible?: boolean

  @Field(() => Boolean, { nullable: true })
  @ValidateIf(isProvided)
  @IsBoolean()
  isJudgeResultVisible?: boolean
}

@InputType()
export class BlueprintAssignmentSectionInput extends BlueprintAssignmentSectionSettingsInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  groupId!: number

  @Field(() => GraphQLISODateTime)
  @IsDate()
  startTime!: Date

  @Field(() => GraphQLISODateTime)
  @IsDate()
  endTime!: Date

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  dueTime?: Date | null
}

@InputType()
export class BlueprintAssignmentSectionUpdateInput extends BlueprintAssignmentSectionSettingsInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  groupId!: number

  @Field(() => GraphQLISODateTime, { nullable: true })
  @ValidateIf(isProvided)
  @IsDate()
  startTime?: Date

  @Field(() => GraphQLISODateTime, { nullable: true })
  @ValidateIf(isProvided)
  @IsDate()
  endTime?: Date

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  dueTime?: Date | null
}

// Source visibility flags are creation defaults only; updates belong to sections.
@InputType()
export class CreateBlueprintAssignmentInput extends OmitType(
  CreateAssignmentInput,
  [
    'startTime',
    'endTime',
    'dueTime',
    'invitationCode',
    'isFinalScoreVisible'
  ] as const
) {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(120)
  title!: string

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  description!: string

  @Field(() => Int)
  @IsInt()
  @Min(1)
  week!: number

  @IsBoolean()
  isVisible!: boolean

  @IsBoolean()
  isRankVisible!: boolean

  @IsBoolean()
  isJudgeResultVisible!: boolean

  @ValidateIf(isProvided)
  @IsBoolean()
  enableCopyPaste?: boolean

  @ValidateIf(isProvided)
  @IsBoolean()
  autoFinalizeScore!: boolean

  @ValidateIf(isProvided)
  @IsBoolean()
  isExercise?: boolean

  @Field(() => String)
  @IsUUID()
  operationId!: string

  @Field(() => [BlueprintAssignmentSectionInput])
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((section: BlueprintAssignmentSectionInput) => section.groupId)
  @ValidateNested({ each: true })
  @Type(() => BlueprintAssignmentSectionInput)
  sections!: BlueprintAssignmentSectionInput[]
}

@InputType()
export class UpdateBlueprintAssignmentInput extends PartialType(
  OmitType(CreateBlueprintAssignmentInput, [
    'operationId',
    'sections',
    'isVisible',
    'isRankVisible',
    'isJudgeResultVisible'
  ] as const),
  { skipNullProperties: false }
) {
  @Field(() => String)
  @IsUUID()
  operationId!: string

  @Field(() => Int)
  @IsInt()
  @Min(1)
  expectedRevision!: number

  // A patch list for existing linked copies, never a new selection of import targets.
  @Field(() => [BlueprintAssignmentSectionUpdateInput], { nullable: true })
  @ValidateIf(isProvided)
  @IsArray()
  @ArrayUnique(
    (section: BlueprintAssignmentSectionUpdateInput) => section.groupId
  )
  @ValidateNested({ each: true })
  @Type(() => BlueprintAssignmentSectionUpdateInput)
  sections?: BlueprintAssignmentSectionUpdateInput[]
}
