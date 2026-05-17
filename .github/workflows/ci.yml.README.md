# CI Workflow

`ci.yml` uses a gate-based structure so that pull requests can require one stable
check while individual jobs run only when their related files change.

The workflow has three main parts:

1. `Detect Changes` checks changed paths and exposes outputs such as
   `typecheck`, `backend_test`, `frontend`, and `infra_ansible`.
2. CI jobs use job-level `if` conditions based on those outputs.
3. `CI Gate` always runs and fails if any CI job failed or was cancelled.

Skipped jobs are treated as passing by `CI Gate`.
When `.github/workflows/ci.yml` changes, every conditional CI job should run so
workflow edits can exercise the jobs they may affect.

## Adding or changing CI jobs

When adding a conditional CI job:

1. Add a path filter under `Detect Changes`.
2. Include the shared CI workflow path in that filter:

   ```yaml
   - *ci_workflow_path
   ```

3. Add the matching output to `detect-changes.outputs`.
4. Use a job-level condition like:

   ```yaml
   if: needs['detect-changes'].outputs.<output_name> == 'true'
   ```

5. Add the job to `CI Gate`'s `needs`.
6. Add the job result to the `results` array in `CI Gate`.

`Validate CI Workflow` runs when `.github/workflows/ci.yml` changes and checks
that these links are not missing. It also checks that each conditional path
filter includes the shared `ci_workflow_path`.

## Required checks

Branch protection should require:

- `CI Gate`
- `CodeQL`

Do not require individual CI jobs such as `Typecheck`, `Lint Node.js`, or
`Ansible Lint`; conditional jobs may be skipped and job names may change as the
workflow evolves.
