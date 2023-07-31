import express from 'express'
import { router as checkerRouter } from './checker/checker.js'

const app = express()
const port = 3000

app.use('/checker', checkerRouter)

app.get('/', (req, res) => {
  res.send('code-plagiarism-checker')
})

app.listen(port, () => {
  console.log(`listening on port: ${port}`)
})
