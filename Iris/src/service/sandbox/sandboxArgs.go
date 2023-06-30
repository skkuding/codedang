package sandbox

// "language_config": sub_config["config"],
//             "src": code,
//             "max_cpu_time": self._change_time(language, self.problem.time_limit),
//             "max_memory": self._change_memory(language, self.problem.memory_limit),
//             "test_case_id": self.problem.test_case_id,
//             "output": False,
//             "spj_version": self.problem.spj_version,
//             "spj_config": spj_config.get("config"),
//             "spj_compile_config": spj_config.get("compile"),
//             "spj_src": self.problem.spj_code,
//             "io_mode": self.problem.io_mode
// 						 --max_cpu_time=<n>        Max CPU Time (ms)
//   --max_real_time=<n>       Max Real Time (ms)
//   --max_memory=<n>          Max Memory (byte)
//   --memory_limit_check_only=<n> only check memory usage, do not setrlimit (default False)
//   --max_stack=<n>           Max Stack (byte, default 16M)
//   --max_process_number=<n>  Max Process Number
//   --max_output_size=<n>     Max Output Size (byte)
//   --exe_path=<str>          Exe Path
//   --input_path=<str>        Input Path
//   --output_path=<str>       Output Path
//   --error_path=<str>        Error Path
//   --args=<str>              Arg
//   --env=<str>               Env
//   --log_path=<str>          Log Path
//   --seccomp_rule_name=<str> Seccomp Rule Name
//   --uid=<n>                 UID (default 65534)
//   --gid=<n>\

// 	max_cpu_time=self._max_cpu_time,
// 	max_real_time=self._max_real_time,
// 	max_memory=self._max_memory,
// 	max_stack=128 * 1024 * 1024,
// 	max_output_size=max(test_case_info.get("output_size", 0) * 2, 1024 * 1024 * 16),
// 	max_process_number=_judger.UNLIMITED,
// 	exe_path=command[0],
// 	args=command[1::],
// 	env=env,
// 	log_path=JUDGER_RUN_LOG_PATH,
// 	seccomp_rule_name=seccomp_rule,
// 	uid=RUN_USER_UID,
// 	gid=RUN_GROUP_GID,
// 	memory_limit_check_only=self._run_config.get("memory_limit_check_only", 0),
// 	kwargs = {"input_path": in_file, "output_path": real_user_output_file, "error_path": real_user_output_file}

// 	self._run_config = run_config
// 	self._exe_path = exe_path
// 	self._max_cpu_time = max_cpu_time
// 	self._max_memory = max_memory
// 	self._max_real_time = self._max_cpu_time * 3
// 	self._test_case_dir = test_case_dir
// 	self._submission_dir = submission_dir

// 	self._pool = Pool(processes=psutil.cpu_count())
// 	self._test_case_info = self._load_test_case_info()

// 	self._spj_version = spj_version
// 	self._spj_config = spj_config
// 	self._output = output
// 	self._io_mode = io_mode
