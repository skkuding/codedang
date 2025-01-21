'use client'

import React from 'react'

type Event = {
  id: string
  title: string
  description: string
  time: string
  color: string
  ariaLabel: string
}

const events: Event[] = [
  {
    id: '4220EAEA-D515-4EB5-B71D-67CF223DC42F',
    title: '저녁init회식',
    description: '하루 종일',
    time: '하루 종일',
    color: 'rgb(27, 173, 248)',
    ariaLabel: '약속, 저녁init회식, 하루 종일'
  },
  {
    id: '29037421-C3E5-4EB6-9336-88C0D4CF4821',
    title: 'DX문제풀이',
    description: '하루 종일',
    time: '하루 종일',
    color: 'rgb(27, 173, 248)',
    ariaLabel: '약속, DX문제풀이, 하루 종일'
  },
  {
    id: '3BEAA54C-2454-429D-B276-1AB9B124611B__20250120T100000Z',
    title: '1800사당init회의',
    description: '오후 7:00 - 오후 8:00',
    time: '오후 7:00 - 오후 8:00',
    color: 'rgb(99, 218, 56)',
    ariaLabel: '학교, 1800사당init회의, 오후 7:00 - 오후 8:00'
  }
]

export function CalendarTable() {
  return (
    <table
      aria-readonly="true"
      aria-label="캘린더 이벤트"
      role="grid"
      tabIndex={0}
    >
      <tbody role="rowgroup">
        {events.map((event) => (
          <tr
            key={event.id}
            className="home-tile-row calendar-row disable-scroll"
            role="row"
            tabIndex={-1}
          >
            <div className="color-bar" style={{ color: event.color }}>
              ㅣ
            </div>
            <td role="gridcell" className="primary">
              <div className="row-container">
                <div className="text">
                  <div className="title-holder">
                    <div className="title" />
                    <div className="first-line">{event.title}</div>
                  </div>
                  <div className="time second-line">
                    <div>{event.time}</div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
