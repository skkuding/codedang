// Runs before the specs are loaded, so the logger picks these up
process.env.APP_ENV = 'test'
process.env.LOG_LEVEL ??= 'silent'
