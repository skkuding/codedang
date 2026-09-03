/**
 * TEMPORARY DEMO-ONLY: starts the MSW mock worker so reviewers can see the
 * course enrollment security feature (roster names + student ID
 * verification) working in the preview deployment, ahead of the real
 * backend contract. Next.js auto-loads this file on the client — see
 * https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 *
 * DELETE this file (and mocks/enrollment-demo-*) once the backend ships
 * and the frontend is reconnected for real.
 */
import { enrollmentDemoWorker } from '@/mocks/enrollment-demo-worker'

enrollmentDemoWorker.start({ onUnhandledRequest: 'bypass' })
