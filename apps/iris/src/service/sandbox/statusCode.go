package sandbox

const ( // ErrorCode
	SUCCESS = 0 - iota
	INVALID_CONFIG
	FORK_FAILED
	PTHREAD_FAILED
	WAIT_FAILED
	ROOT_REQUIRED
	LOAD_SECCOMP_FAILED
	SETRLIMIT_FAILED
	DUP2_FAILED
	SETUID_FAILED
	EXECVE_FAILED
	SPJ_ERROR
)

type ResultCode int8

// libjudger의 정의값
const ( // ResultCode
	RUN_SUCCESS ResultCode = 0 + iota // this only means the process exited normally
	CPU_TIME_LIMIT_EXCEEDED
	REAL_TIME_LIMIT_EXCEEDED
	MEMORY_LIMIT_EXCEEDED
	RUNTIME_ERROR
	SYSTEM_ERROR
)

// type SpecialExitCode int8

const (
	SPECIAL_OK int = 0 + iota
	SPECIAL_WA
	SPECAIL_PE
	SPECIAL_FAIL
)
