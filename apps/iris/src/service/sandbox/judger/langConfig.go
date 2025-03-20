package judger

import (
	"fmt"
	"log"
	"os/exec"
	"strconv"
	"strings"

	"github.com/skkuding/codedang/apps/iris/src/common/constants"
	"github.com/skkuding/codedang/apps/iris/src/service/file"
	"github.com/skkuding/codedang/apps/iris/src/service/sandbox"
)

type langConfig struct {
	cConfig    JudgerConfig
	cppConfig  JudgerConfig
	javaConfig JudgerConfig
	pyConfig   JudgerConfig
	file       file.FileManager
}

type JudgerConfig struct {
	Language              sandbox.Language
	SrcName               string
	ExeName               string
	MaxCompileCpuTime     int
	MaxCompileRealTime    int
	MaxCompileMemory      int
	CompilerPath          string
	CompileArgs           string
	RunCommand            string
	RunArgs               string
	SeccompRule           string
	SeccompRuleFileIO     string
	MemoeryLimitCheckOnly bool
	env                   []string
}

func NewJudgerLangConfig(file file.FileManager, javaPolicyPath string) *langConfig {
	defaultEnv := []string{"LANG=en_US.UTF-8", "LANGUAGE=en_US:en", "LC_ALL=en_US.UTF-8"}
	var cConfig = JudgerConfig{
		Language:           sandbox.C,
		SrcName:            "main.c",
		ExeName:            "main",
		MaxCompileCpuTime:  3000,
		MaxCompileRealTime: 10000,
		MaxCompileMemory:   256 * 1024 * 1024,
		CompilerPath:       "/usr/bin/gcc",
		CompileArgs: "-DONLINE_JUDGE " +
			"-O2 -Wall -Werror=implicit-function-declaration -std=c11 " +
			"{srcPath} -lm -o {exePath}",
		RunCommand:            "{exePath}",
		RunArgs:               "",
		SeccompRule:           "c_cpp",
		SeccompRuleFileIO:     "c_cpp_file_io",
		MemoeryLimitCheckOnly: false,
		env:                   defaultEnv,
	}

	var cppConfig = JudgerConfig{
		Language:           sandbox.CPP,
		SrcName:            "main.cpp",
		ExeName:            "main",
		MaxCompileCpuTime:  10000,
		MaxCompileRealTime: 20000,
		MaxCompileMemory:   1024 * 1024 * 1024,
		CompilerPath:       "/usr/bin/g++",
		CompileArgs: "-DONLINE_JUDGE " +
			"-O2 -Wall -Werror=implicit-function-declaration " +
			"-std=c++14 {srcPath} -lm -o {exePath}",
		RunCommand:            "{exePath}",
		RunArgs:               "",
		SeccompRule:           "c_cpp",
		SeccompRuleFileIO:     "c_cpp_file_io",
		MemoeryLimitCheckOnly: false,
		env:                   defaultEnv,
	}

	var javaConfig = JudgerConfig{
		Language:           sandbox.JAVA,
		SrcName:            "Main.java",
		ExeName:            "Main",
		MaxCompileCpuTime:  5000,
		MaxCompileRealTime: 10000,
		MaxCompileMemory:   -1,
		CompilerPath:       "/usr/local/sdkman/candidates/java/current/bin/javac",
		CompileArgs:        "{srcPath} -d {exeDir} -encoding UTF8",
		RunCommand:         "/usr/local/sdkman/candidates/java/current/bin/java",
		RunArgs: "-cp {exeDir} " +
			"-XX:MaxRAM={maxMemory} " +
			"-Djava.security.manager " +
			"-Dfile.encoding=UTF-8 " +
			"-Djava.security.policy==" +
			javaPolicyPath + " " +
			"-Djava.awt.headless=true " +
			"Main",
		SeccompRule:           "",
		MemoeryLimitCheckOnly: true,
		env:                   defaultEnv,
	}

	pythonVersion, err := GetPythonVersion()
	if err != nil {
		pythonVersion = "312"
	}

	var pyConfig = JudgerConfig{
		Language: sandbox.PYTHON,
		SrcName:  "solution.py",
		ExeName:  fmt.Sprintf("__pycache__/solution.cpython-%s.pyc", pythonVersion),
		// ExeName:               "__pycache__/solution.cpython-312.pyc", // Default Version on Debian 11 (bullseye)
		MaxCompileCpuTime:     3000,
		MaxCompileRealTime:    10000,
		MaxCompileMemory:      128 * 1024 * 1024,
		CompilerPath:          "/usr/bin/python3",
		CompileArgs:           "-m py_compile {srcPath}",
		RunCommand:            "/usr/bin/python3",
		RunArgs:               "{exePath}",
		SeccompRule:           "general",
		MemoeryLimitCheckOnly: false,
		env:                   append(defaultEnv, "PYTHONIOENCODING=utf-8"),
	}

	return &langConfig{
		cConfig:    cConfig,
		cppConfig:  cppConfig,
		javaConfig: javaConfig,
		pyConfig:   pyConfig,
		file:       file,
	}
}

func (l *langConfig) GetConfig(language sandbox.Language) (JudgerConfig, error) {
	switch language {
	case sandbox.C:
		return l.cConfig, nil
	case sandbox.CPP:
		return l.cppConfig, nil
	case sandbox.JAVA:
		return l.javaConfig, nil
	// case PYTHON2:
	// 	return py2Config, nil
	case sandbox.PYTHON:
		return l.pyConfig, nil
	}
	return JudgerConfig{}, fmt.Errorf("unsupported language: %s", language)
}

func (l *langConfig) MakeSrcPath(dir string, language sandbox.Language) (string, error) {
	c, err := l.GetConfig(language)
	if err != nil {
		return "", err
	}
	return l.file.MakeFilePath(dir, c.SrcName).String(), nil
}

func GetPythonVersion() (string, error) {
	cmd := exec.Command("python3", "--version")
	output, err := cmd.Output()
	if err != nil {
		log.Fatal(err)
	}

	versionParts := strings.Split(string(output), " ")
	version := strings.Split(versionParts[1], ".")
	return version[0] + version[1], nil
}

func (l *langConfig) ToCompileExecArgs(dir string, language sandbox.Language) (ExecArgs, error) {
	c, err := l.GetConfig(language)
	if err != nil {
		return ExecArgs{}, err
	}

	outputPath := l.file.MakeFilePath(dir, constants.COMPILE_OUT_FILE).String()
	srcPath := l.file.MakeFilePath(dir, c.SrcName).String()
	exePath := l.file.MakeFilePath(dir, c.ExeName).String()
	exeDir := l.file.MakeFilePath(dir, "").String()

	args := strings.Replace(c.CompileArgs, "{srcPath}", srcPath, 1)
	args = strings.Replace(args, "{exePath}", exePath, 1)
	args = strings.Replace(args, "{exeDir}", exeDir, 1)

	var argSlice []string
	if args != "" {
		argSlice = strings.Split(args, " ")
	}

	return ExecArgs{
		ExePath:      c.CompilerPath,
		MaxCpuTime:   c.MaxCompileCpuTime,
		MaxRealTime:  c.MaxCompileRealTime,
		MaxMemory:    c.MaxCompileMemory,
		MaxStackSize: 128 * 1024 * 1024,
		// FIXME: testcase크기 따라서 설정하거나, 그냥 바로 stdout 읽어오거나
		MaxOutputSize: 20 * 1024 * 1024,
		OutputPath:    outputPath,
		ErrorPath:     outputPath,
		LogPath:       constants.COMPILE_LOG_PATH,
		Args:          argSlice,
	}, nil
}

func (l *langConfig) ToRunExecArgs(dir string, language sandbox.Language, order int, limit sandbox.Limit, fileIo bool) (ExecArgs, error) {
	c, err := l.GetConfig(language)
	if err != nil {
		return ExecArgs{}, err
	}

	exePath := l.file.MakeFilePath(dir, c.ExeName).String()
	exeDir := l.file.MakeFilePath(dir, "").String()
	outputPath := l.file.MakeFilePath(dir, strconv.Itoa(order)+".out").String()
	errorPath := l.file.MakeFilePath(dir, strconv.Itoa(order)+".error").String()

	// run args 설정
	args := strings.Replace(c.RunArgs, "{maxMemory}", strconv.Itoa(limit.Memory), 1)
	args = strings.Replace(args, "{exePath}", exePath, 1)
	args = strings.Replace(args, "{exeDir}", exeDir, 1)

	var argSlice []string
	if args != "" {
		argSlice = strings.Split(args, " ")
	}

	maxMemory := limit.Memory
	// if c.Language == sandbox.JAVA {
	// 	maxMemory = -1
	// }

	return ExecArgs{
		ExePath:      strings.Replace(c.RunCommand, "{exePath}", exePath, 1),
		MaxCpuTime:   limit.CpuTime,
		MaxRealTime:  limit.RealTime,
		MaxMemory:    maxMemory,
		MaxStackSize: 128 * 1024 * 1024,
		// FIXME: testcase크기 따라서 설정하거나, 그냥 바로 stdout 읽어오거나 -> 이러면 order 필요없음
		MaxOutputSize: 10 * 1024 * 1024,
		// file에 쓰는거랑 stdout이랑 크게 차이 안남
		// https://stackoverflow.com/questions/29700478/redirecting-of-stdout-in-bash-vs-writing-to-file-in-c-with-fprintf-speed
		OutputPath:           outputPath,
		ErrorPath:            errorPath, // byte buffer로
		LogPath:              constants.RUN_LOG_PATH,
		SeccompRuleName:      c.SeccompRule,
		MemoryLimitCheckOnly: c.MemoeryLimitCheckOnly,
		Args:                 argSlice,
	}, nil
}
