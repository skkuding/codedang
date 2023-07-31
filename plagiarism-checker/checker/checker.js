/**
 * 입력된 파일들간의 유사도 검사를 실행하고 유사도에 관한 가공된 정보 반환하는 모듈
 */
import express from 'express'

export const router = express.Router()

router.get('/', (req, res) => {
  res.send('checker')
})
