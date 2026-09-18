import { assertS3SdkCompatibility } from './notion-s3.mjs'

const loaded = assertS3SdkCompatibility({ requireExact: true, allowFallback: false })
console.log(`n8n S3 SDK preflight passed: @aws-sdk/client-s3 ${loaded.version}`)
