package sandbox

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"strconv"

	"github.com/skkuding/codedang/apps/iris/src/service/logger"
)

type Sandbox interface {
	Exec(args ExecArgs, input []byte) (ExecResult, error)
}

type sandbox struct {
	binaryPath string
	logger     logger.Logger
}

func NewSandbox(binaryPath string, logger logger.Logger) *sandbox {
	sandbox := sandbox{
		binaryPath: binaryPath,
		logger:     logger,
	}
	return &sandbox
}

func (s *sandbox) Exec(args ExecArgs, input []byte) (ExecResult, error) {
	argSlice := makeExecArgs(args)
	env := "--env=PATH=" + os.Getenv("PATH")
	argSlice = append(argSlice, env)
	cmd := exec.Command(s.binaryPath, argSlice...)

	var stdin bytes.Buffer
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdin = &stdin
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	stdin.Write(input)

	err := cmd.Run()
	if err != nil {
		return ExecResult{}, fmt.Errorf("sandbox execution failed: %w: %s", err, stderr.String())
	}

	res := ExecResult{}
	s.logger.Log(logger.DEBUG, fmt.Sprintf("sandbox result: %s", stdout.String()))
	err = json.Unmarshal(stdout.Bytes(), &res)
	if err != nil {
		return ExecResult{}, fmt.Errorf("failed to unmarshal sandbox result: %w", err)
	}

	return res, nil
}

type ExecResult struct {
	CpuTime    int        `json:"cpu_time"`
	RealTime   int        `json:"real_time"`
	Memory     int        `json:"memory"`
	Signal     int        `json:"signal"`
	ExitCode   int        `json:"exit_code"`
	ErrorCode  int        `json:"error"`
	ResultCode ResultCode `json:"result"`
}

type ExecArgs struct {
	MaxCpuTime           int
	MaxRealTime          int
	MaxMemory            int
	MaxStackSize         int
	MaxOutputSize        int
	ExePath              string
	InputPath            string
	OutputPath           string
	ErrorPath            string
	LogPath              string
	SeccompRuleName      string
	MemoryLimitCheckOnly bool
	Args                 []string
	Env                  []string
	Uid                  int
	Gid                  int
}

const (
	MaxCpuTime           = "--max_cpu_time="
	MaxRealTime          = "--max_real_time="
	MaxMemory            = "--max_memory="
	MaxStackSize         = "--max_stack="
	MaxOutputSize        = "--max_output_size="
	ExePath              = "--exe_path="
	InputPath            = "--input_path="
	OutputPath           = "--output_path="
	ErrorPath            = "--error_path="
	LogPath              = "--log_path="
	Args                 = "--args="
	Env                  = "--env="
	SeccompRuleName      = "--seccomp_rule_name="
	MemoryLimitCheckOnly = "--memory_limit_check_only="
	Uid                  = "--uid="
	Gid                  = "--gid="
)

// methods below is for the libjudger specific
func makeExecArgs(data ExecArgs) []string {
	argSlice := []string{}
	if !isEmptyInt(data.MaxCpuTime) {
		argSlice = concatIntArgs(argSlice, MaxCpuTime, data.MaxCpuTime)
	}
	if !isEmptyInt(data.MaxRealTime) {
		argSlice = concatIntArgs(argSlice, MaxRealTime, data.MaxRealTime)
	}
	if !isEmptyInt(data.MaxMemory) {
		argSlice = concatIntArgs(argSlice, MaxMemory, data.MaxMemory)
	}
	if !isEmptyInt(data.MaxStackSize) {
		argSlice = concatIntArgs(argSlice, MaxStackSize, data.MaxStackSize)
	}
	if !isEmptyInt(data.MaxOutputSize) {
		argSlice = concatIntArgs(argSlice, MaxOutputSize, data.MaxOutputSize)
	}
	if data.Uid >= 0 && data.Uid < 65534 {
		argSlice = concatIntArgs(argSlice, Uid, data.Uid)
	}
	if data.Gid >= 0 && data.Gid < 65534 {
		argSlice = concatIntArgs(argSlice, Gid, data.Gid)
	}
	if !isEmptyString(data.ExePath) {
		argSlice = concatStringArgs(argSlice, ExePath, data.ExePath)
	}
	if !isEmptyString(data.InputPath) {
		argSlice = concatStringArgs(argSlice, InputPath, data.InputPath)
	}
	if !isEmptyString(data.OutputPath) {
		argSlice = concatStringArgs(argSlice, OutputPath, data.OutputPath)
	}
	if !isEmptyString(data.ErrorPath) {
		argSlice = concatStringArgs(argSlice, ErrorPath, data.ErrorPath)
	}
	if !isEmptyString(data.LogPath) {
		argSlice = concatStringArgs(argSlice, LogPath, data.LogPath)
	}
	if !isEmptyString(data.SeccompRuleName) {
		argSlice = concatStringArgs(argSlice, SeccompRuleName, data.SeccompRuleName)
	}

	if data.MemoryLimitCheckOnly {
		argSlice = concatIntArgs(argSlice, MemoryLimitCheckOnly, 1)
	} else {
		argSlice = concatIntArgs(argSlice, MemoryLimitCheckOnly, 0)
	}

	if !isEmptySlice(data.Args) {
		argSlice = concatSliceArgs(argSlice, Args, data.Args)
	}
	if !isEmptySlice(data.Env) {
		argSlice = concatSliceArgs(argSlice, Env, data.Env)
	}
	return argSlice
}

func isEmptyString(str string) bool {
	return str == ""
}

func isEmptyInt(num int) bool {
	return num == 0
}

func isEmptySlice(slice []string) bool {
	return slice == nil
}

func concatStringArgs(argSlice []string, format string, arg string) []string {
	var b bytes.Buffer
	b.WriteString(format)
	b.WriteString(arg)
	return append(argSlice, b.String())
}

func concatIntArgs(argSlice []string, format string, arg int) []string {
	var b bytes.Buffer
	b.WriteString(format)
	b.WriteString(strconv.Itoa(arg))
	return append(argSlice, b.String())
}

func concatSliceArgs(argSlice []string, format string, arg []string) []string {
	var b bytes.Buffer
	for _, arg := range arg {
		b.WriteString(format)
		b.WriteString(arg)
		argSlice = append(argSlice, b.String())
		b.Reset()
	}
	return argSlice
}
