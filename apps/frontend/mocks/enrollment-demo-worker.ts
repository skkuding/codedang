/**
 * TEMPORARY DEMO-ONLY MSW browser worker. See enrollment-demo-store.ts.
 */
import { setupWorker } from 'msw/browser'
import { enrollmentDemoHandlers } from './enrollment-demo-handlers'

export const enrollmentDemoWorker = setupWorker(...enrollmentDemoHandlers)
