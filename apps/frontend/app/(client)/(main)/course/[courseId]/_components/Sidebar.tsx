type Category = {
  title: string
}

const categories: Category[] = [
  {
    title: 'Home'
  },
  {
    title: 'Announcement'
  },
  {
    title: 'Assignment'
  },
  {
    title: 'Exam'
  },
  {
    title: 'Grade'
  }
]

export default function Sidebar() {
  return (
    <aside className="min-h-screen w-64 bg-gray-200 p-4">
      <ul>
        {categories.map((category, index) => (
          <li key={index} className="mb-2">
            {category.title}
          </li>
        ))}
      </ul>
    </aside>
  )
}
