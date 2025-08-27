// apps/backend/scripts/migrate-scoreweight.ts
import { PrismaClient } from '@prisma/client'

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
  console.log('Starting migration...')

  try {
    // Raw query with camelCase aliases to satisfy naming-convention
    const testcases = await prisma.$queryRaw<TestcaseRow[]>`
      SELECT
        id,
        problem_id AS "problemId",
        score_weight AS "scoreWeight",
        score_weight_numerator AS "scoreWeightNumerator",
        score_weight_denominator AS "scoreWeightDenominator"
      FROM problem_testcase
      ORDER BY problem_id, id
    `

    if (testcases.length === 0) {
      console.log('No testcases found')
      return
    }

    // Check if any already migrated
    const alreadyMigrated = testcases.some(
      (tc) =>
        tc.scoreWeightNumerator !== null && tc.scoreWeightDenominator !== null
    )

    if (alreadyMigrated) {
      console.log(
        'Some testcases already have fraction values. Checking for missing ones...'
      )
    }

    // Group by problemId
    const problemGroups: Record<number, TestcaseRow[]> = {}
    testcases.forEach((tc) => {
      if (!problemGroups[tc.problemId]) {
        problemGroups[tc.problemId] = []
      }
      problemGroups[tc.problemId].push(tc)
    })

    let totalMigrated = 0
    let totalSkipped = 0

    // Process each problem
    for (const [problemIdStr, tcs] of Object.entries(problemGroups)) {
      const problemId = Number(problemIdStr)

      // Skip ones fully migrated
      const needsMigration = tcs.filter(
        (tc) =>
          tc.scoreWeightNumerator === null || tc.scoreWeightDenominator === null
      )

      if (needsMigration.length === 0) {
        console.log(`Problem ${problemId}: Already migrated, skipping...`)
        totalSkipped += tcs.length
        continue
      }

      // Equal distribution based on scoreWeight
      const weights = tcs.map((tc) => tc.scoreWeight ?? 1)
      const isEqual = weights.every((w) => w === weights[0])

      if (isEqual && tcs.length > 0) {
        // Equal distribution: 1/n
        console.log(
          `Problem ${problemId}: Setting equal distribution (1/${tcs.length})`
        )

        for (const tc of tcs) {
          if (
            tc.scoreWeightNumerator === null ||
            tc.scoreWeightDenominator === null
          ) {
            await prisma.$executeRaw`
              UPDATE problem_testcase
              SET score_weight_numerator = 1,
                  score_weight_denominator = ${tcs.length}
              WHERE id = ${tc.id}
            `
            totalMigrated++
          }
        }
      } else {
        // Manual weights: use existing weight as numerator, 100 as denominator (reduced)
        console.log(`Problem ${problemId}: Converting manual weights`)

        for (const tc of tcs) {
          if (
            tc.scoreWeightNumerator === null ||
            tc.scoreWeightDenominator === null
          ) {
            const weight = tc.scoreWeight ?? 1
            const divisor = gcd(weight, 100)

            await prisma.$executeRaw`
              UPDATE problem_testcase
              SET score_weight_numerator = ${weight / divisor},
                  score_weight_denominator = ${100 / divisor}
              WHERE id = ${tc.id}
            `
            totalMigrated++
          }
        }
      }
    }

    console.log('\nMigration completed successfully!')
    console.log(`Total testcases migrated: ${totalMigrated}`)
    console.log(`Total testcases skipped (already migrated): ${totalSkipped}`)

    // Validate: sum of weights per problem equals 1
    console.log('\nValidating migration...')

    const validation = await prisma.$queryRaw<ValidationRow[]>`
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

    if (validation.length > 0) {
      console.log('Warning: Some problems have incorrect total weights:')
      validation.forEach((v) => {
        console.log(
          `  Problem ${v.problemId}: Total weight = ${v.totalWeight} (${v.testcaseCount} testcases)`
        )
      })
    } else {
      console.log('All problems have correct total weights (sum = 1.0)')
    }
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
