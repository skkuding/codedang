import { Test, type TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { BlueprintCourseResolver } from './blueprint-course.resolver'
import { BlueprintCourseService } from './blueprint-course.service'

describe('BlueprintCourseResolver', () => {
  let resolver: BlueprintCourseResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlueprintCourseResolver,
        { provide: BlueprintCourseService, useValue: {} }
      ]
    }).compile()

    resolver = module.get<BlueprintCourseResolver>(BlueprintCourseResolver)
  })

  it('should be defined', () => {
    expect(resolver).to.be.ok
  })
})
