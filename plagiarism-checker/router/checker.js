import { execSync } from 'child_process'
import express from 'express'
import fs from 'fs'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir)
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const fileNameWithoutExt = path.basename(file.originalname, ext)
    cb(null, fileNameWithoutExt + '-' + uuidv4() + ext)
  }
})

const upload = multer({ storage: storage })

/** 표절검사 할 파일 업로드 */
router.post('/upload', upload.array('files'), (req, res) => {
  res.send({ message: 'File uploaded' })
})

/** 업로드되어있는 파일 표절검사 진행 */
router.get('/check', (req, res) => {
  let language = req.query.language
  if (!language) {
    return res.status(400).send({ error: 'language query needed' })
  }

  language = language.toLowerCase()
  if (
    !(
      language === 'python3' ||
      language === 'c' ||
      language === 'c++' ||
      language === 'java'
    )
  ) {
    return res
      .status(400)
      .send({ error: 'only python3, c, c++, java are supported' })
  }

  const commands = {
    jplag: `java -jar jplag-4.3.0.jar -l ${language} ./uploads`,
    unzip: 'unzip result -d ./unziped'
  }

  for (const commandName in commands) {
    try {
      execSync(commands[commandName])
    } catch (err) {
      return res.status(500).send({ error: err.message })
    }
  }

  const resultFilePath = path.join(path.resolve(), 'unziped', 'overview.json')
  fs.readFile(resultFilePath, 'utf-8', (error, data) => {
    if (error) {
      return res.status(500).send({ error: error.message })
    }

    try {
      const jsonObject = JSON.parse(data)
      const result = jsonObject.metrics[0].topComparisons

      return res.send(result)
    } catch (error) {
      return res.status(500).send({ error: error.message })
    }
  })
})

/** 업로드되어있는 코드 파일, 검사 결과 파일 삭제 */
router.post('/clear', (req, res) => {
  if (fs.existsSync('./unziped')) {
    try {
      execSync('rm -rf ./unziped')
    } catch (err) {
      return res.status(500).send({ error: err.message })
    }
  }
  if (fs.existsSync('./result.zip')) {
    try {
      execSync('rm ./result.zip')
    } catch (err) {
      return res.status(500).send({ error: err.message })
    }
  }
  if (fs.existsSync('./uploads')) {
    try {
      execSync('find ./uploads -mindepth 1 -delete')
    } catch (err) {
      return res.status(500).send({ error: err.message })
    }
  }

  res.send({ message: 'all uploaded files cleared' })
})
