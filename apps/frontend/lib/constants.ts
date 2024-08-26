/**
 * The base URL for the client API.
 * @constant
 */
export const baseUrl = process.env.NEXT_PUBLIC_BASEURL

/**
 * The base URL for the admin API.
 * @constant
 */
export const adminBaseUrl = process.env.NEXT_PUBLIC_GQL_BASEURL

/**
 * The milliseconds per minute.
 * @constant
 */
const MILLSECONDS_PER_MINUTE = 60000

/**
 * The time in milliseconds that the access token expires.
 * @constant
 */
export const ACCESS_TOKEN_EXPIRE_TIME = 30 * MILLSECONDS_PER_MINUTE

/**
 * The meta base URL for open graph and twitter card.
 * @constant
 */
export const metaBaseUrl = process.env.VERCEL_URL || process.env.NEXT_URL

/**
 * The languages that are supported by the grading system.
 * @constant
 */
export const languages = ['C', 'Cpp', 'Java', 'Python3'] as const

/**
 * The levels of difficulty for problems.
 * @constant
 */
export const levels = [
  'Level1',
  'Level2',
  'Level3',
  'Level4',
  'Level5'
] as const

/**
 * The list of majors that students can choose.
 * @constant
 */
export const majors = [
  '학과 정보 없음',
  '자유전공계열',
  '인문과학계열',
  '유학·동양학과',
  '국어국문학과',
  '영어영문학과',
  '프랑스어문학과',
  '중어중문학과',
  '독어독문학과',
  '러시아어문학과',
  '한문학과',
  '사학과',
  '철학과',
  '문헌정보학과',
  '사회과학계열',
  '행정학과',
  '정치외교학과',
  '미디어커뮤니케이션학과',
  '사회학과',
  '사회복지학과',
  '심리학과',
  '소비자학과',
  '아동·청소년학과',
  '경제학과',
  '통계학과',
  '경영학과',
  '글로벌리더학부',
  '글로벌경제학과',
  '글로벌경영학과',
  '교육학과',
  '한문교육과',
  '영상학과',
  '의상학과',
  '자연과학계열',
  '생명과학과',
  '수학과',
  '물리학과',
  '화학과',
  '식품생명공학과',
  '바이오메카트로닉스학과',
  '융합생명공학과',
  '전자전기공학부',
  '공학계열',
  '화학공학/고분자공학부',
  '신소재공학부',
  '기계공학부',
  '건설환경공학부',
  '시스템경영공학과',
  '나노공학과',
  '소프트웨어학과',
  '반도체시스템공학과',
  '지능형소프트웨어학과',
  '글로벌바이오메디컬공학과',
  '반도체융합공학과',
  '에너지학과',
  '양자정보공학과',
  '건축학과',
  '소재부품융합공학과',
  '약학과',
  '의예과',
  '수학교육과',
  '컴퓨터교육과',
  '글로벌융합학부',
  '데이터사이언스융합전공',
  '인공지능융합전공',
  '컬처앤테크놀로지융합전공',
  '자기설계융합전공',
  '연기예술학과',
  '무용학과',
  '미술학과',
  '디자인학과',
  '스포츠과학과'
] as const
