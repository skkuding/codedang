export function Assignment() {
  return (
    <div className="mt-6 w-full rounded bg-gray-100 p-4">
      <h3 className="mb-2 text-lg font-bold">Assignment</h3>
      <div>
        <h4 className="font-bold">Ongoing</h4>
        <ul>
          <li>Title 1</li>
          <li>Title 2</li>
        </ul>
      </div>
      <div>
        <h4 className="mt-4 font-bold">Finished</h4>
        <p>No assignments</p>
      </div>
      <div>
        <h4 className="mt-4 font-bold">Upcoming</h4>
        <p>No assignments</p>
      </div>
    </div>
  )
}
