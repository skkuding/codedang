package main

type CompileOption struct {
	Filename   string
	CompileCmd []string
	ExecuteCmd []string
}

const (
	C          = "C"
	CPP        = "Cpp"
	JAVA       = "Java"
	GO         = "Go"
	PYTHON     = "Python3"
	JAVASCRIPT = "Javascript"
)

var CompileOptions = map[string]CompileOption{
	C: {
		Filename:   "/code/main.c",
		CompileCmd: []string{"/usr/bin/gcc", "-o", "/code/main", "/code/main.c"},
		ExecuteCmd: []string{"/usr/bin/stdbuf", "-o0", "/code/main"},
	},
	CPP: {
		Filename:   "/code/main.cpp",
		CompileCmd: []string{"/usr/bin/g++", "-o", "/code/main", "/code/main.cpp"},
		ExecuteCmd: []string{"/usr/bin/stdbuf", "-o0", "/code/main"},
	},
	JAVA: {
		Filename:   "/code/Main.java",
		CompileCmd: []string{"/usr/bin/javac", "/code/Main.java"},
		ExecuteCmd: []string{"/usr/bin/java", "-cp", "/code", "Main"},
	},
	GO: {
		Filename:   "/code/main.go",
		CompileCmd: []string{"/usr/bin/go", "build", "-o", "/code/main", "/code/main.go"},
		ExecuteCmd: []string{"/code/main"},
	},
	PYTHON: {
		Filename:   "/code/main.py",
		CompileCmd: []string{},
		ExecuteCmd: []string{"/usr/bin/python3", "/code/main.py"},
	},
	JAVASCRIPT: {
		Filename:   "/code/main.js",
		CompileCmd: []string{},
		ExecuteCmd: []string{"/usr/bin/node", "/code/main.js"},
	},
}
