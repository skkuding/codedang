import { PrismaClient } from '@prisma/client'
import { TOLERANCE_THRESHOLD } from '@libs/constants'

const prisma = new PrismaClient()

type TestcaseRow = {
  id: number
  problemId: number
  scoreWeight: number | null
  scoreWeightNumerator: number | null
  scoreWeightDenominator: number | null
}

type ValidationRow = {
  problemId: number
  totalWeight: number
  testcaseCount: number
}

const gcd = (a: number, b: number): number => {
  const aa = Math.abs(a)
  const bb = Math.abs(b)
  return bb === 0 ? aa : gcd(bb, aa % bb)
}

const main = async (): Promise<void> => {
  console.log('Starting migration fix...')

  try {
    // 검증 과정에서 문제가 있는 problem들을 찾기
    const problemsWithIncorrectWeights = await prisma.$queryRaw<
      ValidationRow[]
    >`
      SELECT
        problem_id AS "problemId",
        SUM(score_weight_numerator::float / NULLIF(score_weight_denominator, 0)) AS "totalWeight",
        COUNT(*) AS "testcaseCount"
      FROM problem_testcase
      WHERE score_weight_numerator IS NOT NULL
        AND score_weight_denominator IS NOT NULL
      GROUP BY problem_id
      HAVING ABS(SUM(score_weight_numerator::float / NULLIF(score_weight_denominator, 0)) - 1.0) > ${TOLERANCE_THRESHOLD}
    `

    if (problemsWithIncorrectWeights.length === 0) {
      console.log('All problems already have correct weights!')
      return
    }

    console.log('Found problems with incorrect weights:')
    problemsWithIncorrectWeights.forEach((p) => {
      console.log(
        `  Problem ${p.problemId}: Total weight = ${p.totalWeight} (${p.testcaseCount} testcases)`
      )
    })

    let totalFixed = 0

    // 각 문제별로 수정
    for (const problem of problemsWithIncorrectWeights) {
      const { problemId, testcaseCount } = problem

      console.log(`\nFixing Problem ${problemId}...`)

      // 해당 문제의 모든 테스트케이스 가져오기
      const testcases = await prisma.$queryRaw<TestcaseRow[]>`
        SELECT
          id,
          problem_id AS "problemId",
          score_weight AS "scoreWeight",
          score_weight_numerator AS "scoreWeightNumerator",
          score_weight_denominator AS "scoreWeightDenominator"
        FROM problem_testcase
        WHERE problem_id = ${problemId}
        ORDER BY id
      `

      // scoreWeight 패턴 분석
      const weights = testcases.map((tc) => tc.scoreWeight ?? 1)
      const isEqual = weights.every((w) => w === weights[0])

      if (isEqual) {
        // Equal distribution: 모든 테스트케이스에 1/n 할당
        console.log(`  Setting equal distribution (1/${testcaseCount})`)

        for (const tc of testcases) {
          await prisma.$executeRaw`
            UPDATE problem_testcase
            SET score_weight_numerator = 1,
                score_weight_denominator = ${testcaseCount}
            WHERE id = ${tc.id}
          `
          totalFixed++
        }
      } else {
        // Manual weights: 기존 scoreWeight를 기반으로 분수 계산
        console.log(`  Converting manual weights to fractions`)

        for (const tc of testcases) {
          const weight = tc.scoreWeight ?? 1
          const divisor = gcd(weight, 100)

          await prisma.$executeRaw`
            UPDATE problem_testcase
            SET score_weight_numerator = ${weight / divisor},
                score_weight_denominator = ${100 / divisor}
            WHERE id = ${tc.id}
          `
          totalFixed++
        }
      }
    }

    console.log(`\nMigration fix completed!`)
    console.log(`Total testcases fixed: ${totalFixed}`)

    // 재검증
    console.log('\nRe-validating migration...')

    const revalidation = await prisma.$queryRaw<ValidationRow[]>`
      SELECT
        problem_id AS "problemId",
        SUM(score_weight_numerator::float / NULLIF(score_weight_denominator, 0)) AS "totalWeight",
        COUNT(*) AS "testcaseCount"
      FROM problem_testcase
      WHERE score_weight_numerator IS NOT NULL
        AND score_weight_denominator IS NOT NULL
      GROUP BY problem_id
      HAVING ABS(SUM(score_weight_numerator::float / NULLIF(score_weight_denominator, 0)) - 1.0) > 0.001
    `

    if (revalidation.length > 0) {
      console.log('❌ Still have problems with incorrect total weights:')
      revalidation.forEach((v) => {
        console.log(
          `  Problem ${v.problemId}: Total weight = ${v.totalWeight} (${v.testcaseCount} testcases)`
        )
      })
    } else {
      console.log('✅ All problems now have correct total weights (sum = 1.0)')
    }

    // 최종 결과 요약
    console.log('\nFinal summary:')
    const allProblems = await prisma.$queryRaw<ValidationRow[]>`
      SELECT
        problem_id AS "problemId",
        SUM(score_weight_numerator::float / NULLIF(score_weight_denominator, 0)) AS "totalWeight",
        COUNT(*) AS "testcaseCount"
      FROM problem_testcase
      WHERE score_weight_numerator IS NOT NULL
        AND score_weight_denominator IS NOT NULL
      GROUP BY problem_id
      ORDER BY problem_id
    `

    allProblems.forEach((p) => {
      const status = Math.abs(p.totalWeight - 1.0) <= 0.001 ? '✅' : '❌'
      console.log(
        `  ${status} Problem ${p.problemId}: Total weight = ${p.totalWeight.toFixed(6)} (${p.testcaseCount} testcases)`
      )
    })
  } catch (error) {
    console.error('Migration fix failed:', error)
    throw error
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
