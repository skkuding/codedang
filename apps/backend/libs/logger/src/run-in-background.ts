export const runInBackground = (
  task: () => Promise<unknown>,
  onError: (error: unknown) => void
) => {
  void task().catch(onError)
}
