export type Lang = 'C' | 'Cpp' | 'Java' | 'Python3' | 'PyPy3'

export interface PolicyRule {
  bannedImports?: string[]
  bannedTokens?: string[]
}

export const POLICY_RULES: Record<Lang, PolicyRule> = {
  Python3: {
    bannedImports: [
      'os',
      'subprocess',
      'socket',
      'ctypes',
      'multiprocessing',
      'importlib',
      'shutil',
      'pathlib'
    ],
    bannedTokens: ['__import__', 'eval', 'exec', 'open']
  },
  PyPy3: {
    bannedImports: [
      'os',
      'subprocess',
      'socket',
      'ctypes',
      'multiprocessing',
      'importlib',
      'shutil',
      'pathlib'
    ],
    bannedTokens: ['__import__', 'eval', 'exec', 'open']
  },
  Java: {
    bannedImports: [
      'java.lang.Runtime',
      'java.lang.ProcessBuilder',
      'java.lang.reflect',
      'java.net',
      'java.nio.file',
      'java.io'
    ],
    bannedTokens: []
  },
  C: {
    bannedImports: ['sys/socket.h', 'unistd.h'],
    bannedTokens: ['system', 'popen', 'fork', 'execve', 'ptrace', 'socket']
  },
  Cpp: {
    bannedImports: ['sys/socket.h', 'unistd.h'],
    bannedTokens: ['system', 'popen', 'fork', 'execve', 'ptrace', 'socket']
  }
}
