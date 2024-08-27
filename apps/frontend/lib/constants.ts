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
  'Humanities / 인문과학계열',
  'Social Sciences / 사회과학계열',
  'Natural Sciences / 자연과학계열',
  'Engineering / 공학계열',
  'School of Convergence / 글로벌융합학부',
  'Confucian and Oriental Studies / 유학·동양학과',
  'Korean Language and Literature / 국어국문학과',
  'English Language and Literature / 영어영문학과',
  'French Language and Literature / 프랑스어문학과',
  'Chinese Language and Literature / 중어중문학과',
  'German Language and Literature / 독어독문학과',
  'Russian Language and Literature / 러시아어문학과',
  'Korean Literature in Classical Chinese / 한문학과',
  'History / 사학과',
  'Philosophy / 철학과',
  'Library and Information Science / 문헌정보학과',
  'Public Administration / 행정학과',
  'Political Science and Diplomacy / 정치외교학과',
  'Media & Communication / 미디어커뮤니케이션학과',
  'Sociology / 사회학과',
  'Social Welfare / 사회복지학과',
  'Psychology / 심리학과',
  'Consumer Science / 소비자학과',
  'Child Psychology and Education / 아동·청소년학과',
  'Global Leader / 글로벌리더학부',
  'Public Interest and Law / 공익과법연계전공',
  'Economics / 경제학과',
  'Statistics / 통계학과',
  'Global Economics / 글로벌경제학과',
  'Business Administration / 경영학과',
  'Global Business Administration / 글로벌경영학과',
  'Education / 교육학과',
  'Education in Classical Chinese / 한문교육과',
  'Mathematics Education / 수학교육과',
  'Computer Education / 컴퓨터교육과',
  'Fine Art / 미술학과',
  'Design / 디자인학과',
  'Dance / 무용학과',
  'Film, Television & Multimedia / 영상학과',
  'Theatre / 연기예술학과',
  'Fashion Design / 의상학과',
  'Biological Sciences / 생명과학과',
  'Mathematics / 수학과',
  'Physics / 물리학과',
  'Chemistry / 화학과',
  'Electronic and Electrical Engineering / 전자전기공학부',
  'Semiconductor Systems Engineering / 반도체시스템공학과',
  'Material-Component Convergence Engineering / 소재부품융합공학과',
  'Semiconductor Convergence Engineering / 반도체융합공학과',
  'Computer Science and Engineering	/ 소프트웨어학과',
  'Data Science Convergence Major / 데이터사이언스융합전공',
  'Artificial Intelligence Convergence Major / 인공지능융합전공',
  'Culture & Technology Convergence Major / 컬처앤테크놀로지융합전공',
  'Self Design Convergence Major / 자기설계융합전공',
  'Intelligent Software / 지능형소프트웨어학과',
  'Chemical Engineering / 화학공학/고분자공학부',
  'Advanced Materials Science and Engineering / 신소재공학부',
  'Mechanical Engineering / 기계공학부',
  'Civil, Architectural Engineering and Landscape Architecture / 건설환경공학부',
  'Systems Management Engineering / 시스템경영공학과',
  'Architecture / 건축학과',
  'Nano Engineering / 나노공학과',
  'Pharmacy / 약학과',
  'Food Science and Biotechnology	/ 식품생명공학과',
  'Bio-Mechatronic Engineering / 바이오메카트로닉스학과',
  'Integrative Biotechnology / 융합생명공학과',
  'Sport Science / 스포츠과학과',
  'School of Medicine(Preclinical Phase) / 의예과',
  'School of Medicine(Clinical Phase) / 의학과',
  'Global Biomedical Engineering / 글로벌바이오메디컬공학과',
  'Applied AI Convergence / 응용AI융합학부',
  'Energy / 에너지학과'
] as const
