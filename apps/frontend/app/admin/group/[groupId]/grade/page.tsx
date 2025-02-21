export default function Page({ params }: { params: { groupId: string } }) {
  const { groupId } = params
  return <div>{groupId} Grade Page</div>
}
