import {
  createScriptPrismaClient,
  runPrismaScript
} from '../libs/prisma/src/script-client'

const prisma = createScriptPrismaClient()

const main = async () => {
  console.log('Starting Solution Update Script.')

  const allProblems = await prisma.problem.findMany()
  const problemWithoutSolutions = allProblems.filter(
    (p) => p.solution.length === 0
  )

  console.log(
    `Found ${problemWithoutSolutions.length} problems with empty solution arrays.`
  )

  for (const problem of problemWithoutSolutions) {
    const newSolution = problem.languages.map((language) => ({
      code: '',
      language
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

void runPrismaScript(prisma, main)
