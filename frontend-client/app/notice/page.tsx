interface Notice {
  id: number
  title: string
  createTime: string
  isFixed: boolean
  createdBy: string
}

export default async function Notice() {
  // const notices = await fetch('http://localhost:5525/api/notice?take=5').then(
  //   (res) => res.json()
  // )
  return (
    <main>
      {/* {notices.map((notice: Notice) => {
        return (
          <div key={notice.id}>
            <h1>{notice.title}</h1>
            <p>{notice.createTime}</p>
            <p>{notice.createdBy}</p>
          </div>
        )
      })} */}
    </main>
  )
}
