// import { Separator } from '@radix-ui/react-dropdown-menu'
import CalendarTable from '../_components/CalendarTable'
import Announcement from './_components/Anouncement'
import Assignment from './_components/Assignment'
import Header from './_components/Header'
import Sidebar from './_components/Sidebar'
import TodoList from './_components/TodoList'

export default function Dashboard() {
  return (
    <>
      <div className="flex w-full">
        <Header />
      </div>
      <div className="flex w-full flex-row">
        <Sidebar />
        <div className="flex w-full flex-col">
          <div className="flex w-full flex-row">
            <Announcement />
            <TodoList />
          </div>
          <Assignment />
        </div>
      </div>
    </>
  )
}
