'use client'

//import bootstrap5Plugin from '@fullcalendar/bootstrap5'
//import '@fullcalendar/bootstrap5/main.css'
//import 'bootstrap/dist/css/bootstrap.min.css'
//부트스트랩을 쓰면 완전 좋은데 이게 잘 안 되서 일단 보류.
//컴포넌트의 세부 요소의 css를 바꾸려면 tailwind에서 자식요소의 스타일 바꾸는 법을 찾아보자.
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from '@fullcalendar/react'

export default function Dashboard() {
  return (
    <div className="container mt-4">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        timeZone="UTC"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        }}
        weekNumbers={true}
        dayMaxEvents={true}
        events={[
          { title: 'All Day Event', start: '2025-01-01' },
          { title: 'Long Event', start: '2025-01-07', end: '2025-01-10' },
          { title: 'Repeating Event', start: '2025-01-09T16:00:00' },
          { title: 'Conference', start: '2025-01-14', end: '2025-01-16' },
          {
            title: 'Meeting',
            start: '2025-01-15T10:30:00',
            end: '2025-01-15T12:30:00'
          },
          { title: 'Lunch', start: '2025-01-15T12:00:00' },
          { title: 'Birthday Party', start: '2025-01-16T07:00:00' },
          {
            title: 'Click for Google',
            url: 'http://google.com/',
            start: '2025-01-27'
          }
        ]}
      />
    </div>
  )
}
