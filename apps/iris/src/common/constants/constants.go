package constants

type Env string

const (
	Production Env = "production"
	Stage      Env = "stage"
)

const (
	Success = 1 + iota
	Fail
)

const DIR_NAME_LEN = 16
const MAX_SUBMISSION = 10
const EVENT_CHAN_SIZE = 10
const TASK_EXEC = "Execute"
const TASK_EXITED = "Exited"
const PUBLISH_RESULT = "Publish"

// const BASE_DIR = "./results"
// const SANDBOX_BASE = "/app/sandbox" // for docker, FIXME: 환경변수로 설정

const SANDBOX_BASE = "./lib/judger" // for local
const RESULT_PATH = SANDBOX_BASE + "/results"
const LIBJUDGER_PATH = SANDBOX_BASE + "/libjudger.so"
const JAVA_POLICY_PATH = SANDBOX_BASE + "/policy/java_policy"

// const BASE_DIR = "/go/src/workspace/results"
const BASE_FILE_MODE = 0711

// FIXME: logger 구현 후 다시 설정
const (
	SANDBOX_LOG_BASE = "/app/sandbox/logs"
	COMPILE_LOG_PATH = SANDBOX_LOG_BASE + "/compile/log.out"
	RUN_LOG_PATH     = SANDBOX_LOG_BASE + "/run/log.out"
	COMPILE_OUT_FILE = "compile.out"
)

const (
	// LOG_PATH_DEV  = "./logs/server.log"
	LOG_PATH_STAGE = "./logs/server.log"
	LOG_PATH_PROD  = "./logs/server.log" // "/app/logs/server.log"
)

const MAX_MQ_CHANNEL = 10

const TESTCASE_GET_TIMEOUT = 10
const TOKEN_HEADER = "judge-server-token"

const (
	EXCHANGE   = "judger-exchange"
	RESULT_KEY = "result"
)
