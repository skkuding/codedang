import { PrismaClient } from '@prisma/client'
import type { Language } from '@prisma/client'

const prisma = new PrismaClient()

const main = async () => {
  console.log('Starting Solution Update Script.')

  const allProblems = await prisma.problem.findMany()
  const targetProblems = allProblems.filter((p) => p.solution.length === 0)

  console.log(
    `Found ${targetProblems.length} problems with empty solution arrays.`
  )

  for (const problem of targetProblems) {
    const newSolution = problem.languages.map((lang) => ({
      code: '',
      language: lang as keyof typeof Language
    }))

    await prisma.problem.update({
      where: { id: problem.id },
      data: { solution: newSolution }
    })

    console.log(
      `Updated Problem ${problem.id} with ${newSolution.length} solutions.`
    )
  }

  console.log('All empty solution fields updated!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
