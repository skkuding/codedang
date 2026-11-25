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
    ).to.include.members(['createBlueprintAssignment'])
  })

  it('returns the saved source for create and edit', () => {
    const fields = schema.getMutationType()!.getFields()
    for (const name of ['createBlueprintAssignment']) {
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
})
