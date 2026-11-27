import { expect } from 'chai'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import {
  BlueprintAssignmentSectionUpdateInput,
  UpdateBlueprintAssignmentInput
} from '@admin/blueprint-assignment/model/blueprint-assignment.input'
import { resolveAssignmentSectionSettings } from './assignment-section-settings'

const current = {
  startTime: new Date('2027-01-01'),
  dueTime: new Date('2027-01-02'),
  endTime: new Date('2027-01-03'),
  isVisible: true,
  isRankVisible: true,
  isJudgeResultVisible: true,
  isFinalScoreVisible: true
}

describe('Assignment per-section settings', () => {
  it('preserves omitted fields and retains explicit false and null values', () => {
    expect(resolveAssignmentSectionSettings(current, {})).to.deep.equal({})
    expect(
      resolveAssignmentSectionSettings(current, {
        dueTime: null,
        isVisible: false,
        isFinalScoreVisible: false,
        isRankVisible: false,
        isJudgeResultVisible: false
      })
    ).to.deep.equal({
      dueTime: null,
      isVisible: false,
      isFinalScoreVisible: false,
      isRankVisible: false,
      isJudgeResultVisible: false
    })
    expect(current.dueTime.toISOString()).to.equal('2027-01-02T00:00:00.000Z')
  })

  for (const key of [
    'isVisible',
    'isFinalScoreVisible',
    'isRankVisible',
    'isJudgeResultVisible'
  ] as const) {
    it(`rejects null ${key} in nested inputs and in the service`, async () => {
      const value = { groupId: 1, [key]: null }
      expect(
        await validate(
          plainToInstance(BlueprintAssignmentSectionUpdateInput, value)
        )
      ).not.to.be.empty
      expect(() =>
        resolveAssignmentSectionSettings(current, value as never)
      ).to.throw(`${key} must be a boolean`)
    })
  }

  for (const key of ['startTime', 'endTime'] as const) {
    it(`rejects null ${key} while validating patches against the existing schedule`, async () => {
      expect(
        await validate(
          plainToInstance(BlueprintAssignmentSectionUpdateInput, {
            groupId: 1,
            [key]: null
          })
        )
      ).not.to.be.empty
      expect(() =>
        resolveAssignmentSectionSettings(current, { [key]: null } as never)
      ).to.throw('valid date')
    })
  }

  it('rejects invalid merged schedules instead of validating the patch in isolation', () => {
    expect(() =>
      resolveAssignmentSectionSettings(current, {
        startTime: new Date('2027-01-02T12:00:00Z')
      })
    ).to.throw('dueTime')
    expect(() =>
      resolveAssignmentSectionSettings(current, {
        dueTime: new Date('2027-02-01')
      })
    ).to.throw('endTime')
    expect(() =>
      resolveAssignmentSectionSettings(current, {
        endTime: new Date('2026-12-01')
      })
    ).to.throw('endTime')
    expect(() =>
      resolveAssignmentSectionSettings(current, {
        endTime: new Date('invalid')
      })
    ).to.throw('valid date')
  })

  it('accepts settings-only Update input without common fields or complete schedules', async () => {
    const input = plainToInstance(UpdateBlueprintAssignmentInput, {
      operationId: 'a4946fd8-7740-4ada-a12c-ef6d41c06493',
      expectedRevision: 1,
      sections: [
        {
          groupId: 1,
          dueTime: null,
          isVisible: false,
          isFinalScoreVisible: false
        }
      ]
    })
    expect(await validate(input)).to.be.empty
    expect(
      await validate(
        plainToInstance(BlueprintAssignmentSectionUpdateInput, {
          groupId: 1,
          dueTime: null
        })
      )
    ).to.be.empty
  })

  it('rejects a null section patch list', async () => {
    expect(
      await validate(
        plainToInstance(UpdateBlueprintAssignmentInput, {
          operationId: 'a4946fd8-7740-4ada-a12c-ef6d41c06493',
          expectedRevision: 1,
          sections: null
        })
      )
    ).not.to.be.empty
  })
})
