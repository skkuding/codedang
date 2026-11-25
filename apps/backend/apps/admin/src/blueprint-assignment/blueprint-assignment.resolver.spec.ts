import { NestFactory } from '@nestjs/core'
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory
} from '@nestjs/graphql'
import { expect } from 'chai'
import {
  getNamedType,
  type GraphQLObjectType,
  type GraphQLSchema
} from 'graphql'
import { BlueprintAssignmentResolver } from './blueprint-assignment.resolver'

describe('BlueprintAssignment GraphQL contract', () => {
  let schema: GraphQLSchema
  before(async () => {
    const app = await NestFactory.create(GraphQLSchemaBuilderModule, {
      logger: false
    })
    try {
      schema = await app
        .get(GraphQLSchemaFactory)
        .create([BlueprintAssignmentResolver])
    } finally {
      await app.close()
    }
  })

  it('exposes create, edit, delete and immediate unlink mutations', () => {
    expect(
      Object.keys(schema.getMutationType()!.getFields())
    ).to.include.members([
      'createBlueprintAssignment',
      'updateBlueprintAssignment',
      'deleteBlueprintAssignment',
      'unlinkBlueprintAssignment'
    ])
  })

  it('returns the saved source for create and edit', () => {
    const fields = schema.getMutationType()!.getFields()
    for (const name of [
      'createBlueprintAssignment',
      'updateBlueprintAssignment'
    ]) {
      expect(getNamedType(fields[name].type).name).to.equal(
        'BlueprintAssignmentOutput'
      )
    }
  })

  it('provides searchable, paginated Assignment and Exercise reads', () => {
    const query = schema.getQueryType()!.getFields().getBlueprintAssignments
    expect(query.args.map((arg) => arg.name)).to.include.members([
      'blueprintCourseId',
      'isExercise',
      'search',
      'take',
      'cursor'
    ])
  })

  it('returns only populated content, linked copies and schedules without generated relation fields', () => {
    const output = getNamedType(
      schema.getQueryType()!.getFields().getBlueprintAssignment.type
    ) as GraphQLObjectType
    expect(Object.keys(output.getFields())).to.include.members([
      'id',
      'revision',
      'assignment',
      'blueprintAssignmentProblem'
    ])
    expect(Object.keys(output.getFields())).not.to.include.members([
      '_count',
      'createdBy',
      'blueprintCourse'
    ])
    const section = getNamedType(
      output.getFields().assignment.type
    ) as GraphQLObjectType
    expect(Object.keys(section.getFields())).to.include.members([
      'id',
      'groupId',
      'startTime',
      'dueTime',
      'endTime',
      'isVisible',
      'isFinalScoreVisible',
      'isRankVisible',
      'isJudgeResultVisible',
      'problems'
    ])
  })

  it('requires content/settings but leaves problem writes to the separate Problem APIs', () => {
    const input = schema.getType(
      'UpdateBlueprintAssignmentInput'
    ) as GraphQLObjectType
    for (const field of ['operationId', 'expectedRevision']) {
      expect(input.getFields()[field].type.toString()).to.match(/!$/)
    }
    for (const field of ['sections', 'title', 'description']) {
      expect(input.getFields()[field].type.toString()).not.to.match(/!$/)
    }
    for (const field of [
      'isVisible',
      'isRankVisible',
      'isJudgeResultVisible',
      'isFinalScoreVisible'
    ]) {
      expect(input.getFields()).not.to.have.property(field)
    }
    const settings = schema.getType(
      'BlueprintAssignmentSectionUpdateInput'
    ) as GraphQLObjectType
    for (const field of [
      'startTime',
      'dueTime',
      'endTime',
      'isVisible',
      'isFinalScoreVisible',
      'isRankVisible',
      'isJudgeResultVisible'
    ]) {
      expect(settings.getFields()[field].type.toString()).not.to.match(/!$/)
    }
    const unlink = getNamedType(
      schema.getMutationType()!.getFields().unlinkBlueprintAssignment.type
    ) as GraphQLObjectType
    expect(Object.keys(unlink.getFields()).sort()).to.deep.equal([
      'blueprintAssignmentId',
      'groupId',
      'id'
    ])
  })
  it('uses an assignment ID for existing entities and returns a deleted entity rather than an integer', () => {
    expect(
      schema
        .getQueryType()!
        .getFields()
        .getBlueprintAssignment.args.map(({ name }) => name)
    ).to.deep.equal(['blueprintAssignmentId'])
    const mutations = schema.getMutationType()!.getFields()
    for (const name of [
      'updateBlueprintAssignment',
      'deleteBlueprintAssignment'
    ]) {
      expect(mutations[name].args.map(({ name }) => name)).not.to.include(
        'blueprintCourseId'
      )
    }
    expect(
      getNamedType(
        schema.getMutationType()!.getFields().deleteBlueprintAssignment.type
      ).name
    ).to.equal('BlueprintAssignmentOutput')
    const impact = schema
      .getQueryType()!
      .getFields().getBlueprintAssignmentDeletionImpact
    expect(impact.args.map(({ name }) => name)).to.deep.equal([
      'blueprintAssignmentId'
    ])
    const fields = (getNamedType(impact.type) as GraphQLObjectType).getFields()
    expect(Object.keys(fields).sort()).to.deep.equal(
      [
        'assignmentCount',
        'deletable',
        'noticeCount',
        'qnaCount',
        'recordedStudentCount',
        'sectionCount',
        'studentCount',
        'submissionCount'
      ].sort()
    )
  })
})
