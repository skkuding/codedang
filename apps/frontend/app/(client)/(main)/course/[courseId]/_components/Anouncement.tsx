export default function Announcement() {
  return (
    <div className="rounded bg-gray-100 p-4">
      <h3 className="mb-2 text-lg font-bold">Recent Announcement</h3>
      <p>[편독] 3주차 과제 1번 문제 수정사항</p>
      <p>[편독] 확인된 공지임을 이렇게 보이는 식</p>
      <p>최근 3개의 공지임이 보여지는 곳</p>
      <button className="mt-2 text-blue-500">Show More</button>
    </div>
  )
}
