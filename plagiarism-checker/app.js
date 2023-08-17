import express from 'express'
import { router as checkerRouter } from './router/checker.js'

const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded())

app.use('/checker', checkerRouter)

app.use((err, req, res, next) => {
  console.log(err.stack)
  res.status(500).send({ error: err.message })
  next()
})

app.get('/', (req, res) => {
  res.send('code-plagiarism-checker')
})

app.listen(port, () => {
  console.log(`listening on port: ${port}`)
})
