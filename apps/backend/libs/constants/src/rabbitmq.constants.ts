export const PUBLISH_CHANNEL = 'submission-publish-channel'
export const CONSUME_CHANNEL = 'result-consume-channel'

export const EXCHANGE = 'iris.e.direct.judge'

export const SUBMISSION_KEY = 'judge.submission'
export const RESULT_KEY = 'judge.result'

export const RESULT_QUEUE = 'iris.q.judge.result'

export const ORIGIN_HANDLER_NAME = 'codedang-handler'

export const JUDGE_MESSAGE_TYPE = 'judge'
export const RUN_MESSAGE_TYPE = 'run'
export const USER_TESTCASE_MESSAGE_TYPE = 'userTestCase'

/**
 * 채점 요청 메세지 우선순위
 */
export const MESSAGE_PRIORITY_HIGH = 3
export const MESSAGE_PRIORITY_MIDDLE = 2
export const MESSAGE_PRIORITY_LOW = 1

/**
 * 표절 검사 요청 메시지 관련
 */

export const CHECK_EXCHANGE = 'plag.e.direct.check'

export const CHECK_KEY = 'check.request'
export const CHECK_RESULT_KEY = 'check.result'

export const CHECK_RESULT_QUEUE = 'plag.q.check.result'

export const CHECK_MESSAGE_TYPE = 'check'

/**
 * Polygon Tool 업로드 -> Queue
 */

export const POLYGON_EXCHANGE = 'iris.e.direct.polygon'

export const POLYGON_GENERATOR_KEY = 'polygon.generator'
export const POLYGON_GENERATOR_MESSAGE_TYPE = 'generate'

export const POLYGON_VALIDATOR_KEY = 'polygon.validator'
export const POLYGON_VALIDATOR_MESSAGE_TYPE = 'validator'

export const POLYGON_CHECKER_KEY = 'polygon.checker'
export const POLYGON_CHECKER_MESSAGE_TYPE = 'checker'

export const POLYGON_GENERATOR_RESULT_KEY = 'polygon.generate.result'
export const POLYGON_GENERATOR_RESULT_QUEUE = 'iris.q.polygon.generate.result'

export const POLYGON_VALIDATOR_RESULT_KEY = 'polygon.validate.result'
export const POLYGON_VALIDATOR_RESULT_QUEUE = 'iris.q.polygon.validate.result'
