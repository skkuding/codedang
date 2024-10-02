export default function TopicSection({ updateNow }: { updateNow: boolean }) {
  return (
    <>
      <h1 className="-mb-1 text-center text-2xl font-bold">Settings</h1>
      <p className="text-center text-sm text-neutral-500">
        {updateNow
          ? 'You must update your information'
          : 'You can change your information'}
      </p>
    </>
  )
}
