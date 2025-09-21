'use client'

import { Badge } from '@/components/shadcn/badge'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import {
  fetchIsSubscribed,
  handleRequestPermissionAndSubscribe
} from '@/libs/push-subscription'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import { formatTimeAgo } from '@/libs/utils'
import NotiIcon from '@/public/icons/notification.svg'
import type { Notification } from '@/types/type'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover'
import { NotificationOptionsMenu } from './NotificationOptionsMenu'

const FETCH_COUNT = 10

interface NotificationDropdownProps {
  isEditor?: boolean
}

export function NotificationDropdown({
  isEditor = false
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadApiCount, setUnreadApiCount] = useState(0)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<number | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const fetchMoreNotifications = useCallback(async () => {
    if (isLoading || !hasMore || !cursor) {
      return
    }

    setIsLoading(true)
    try {
      const take = FETCH_COUNT
      let url = `notification?take=${take}&cursor=${cursor}`
      if (filter === 'unread') {
        url += '&isRead=false'
      }

      const data = await safeFetcherWithAuth.get(url).json()
      const newNotifications = Array.isArray(data) ? data : []

      setNotifications((prev) => [...prev, ...newNotifications])
      setHasMore(newNotifications.length === take)
      if (newNotifications.length > 0) {
        setCursor(newNotifications[newNotifications.length - 1].id)
      }
    } catch (error) {
      console.error('Error fetching more notifications:', error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, cursor, filter])

  useEffect(() => {
    const fetchInitialUnreadCount = async () => {
      try {
        const textData = await safeFetcherWithAuth
          .get('notification/unread-count')
          .text()
        setUnreadApiCount(parseInt(textData, 10) || 0)
      } catch (error) {
        console.error('Error fetching initial unread count:', error)
        setUnreadApiCount(0)
      }
    }
    fetchInitialUnreadCount()

    fetchIsSubscribed(setIsSubscribed)
  }, [])

  useEffect(() => {
    const fetchInitialNotifications = async () => {
      setIsLoading(true)
      setNotifications([])
      setCursor(null)
      setHasMore(true)

      try {
        const take = FETCH_COUNT
        let url = `notification?take=${take}`
        if (filter === 'unread') {
          url += '&isRead=false'
        }

        const data = await safeFetcherWithAuth.get(url).json()
        const initialNotifications = Array.isArray(data) ? data : []

        setNotifications(initialNotifications)
        setHasMore(initialNotifications.length === take)
        if (initialNotifications.length > 0) {
          setCursor(initialNotifications[initialNotifications.length - 1].id)
        }
      } catch (error) {
        console.error('Error fetching initial notifications:', error)
        setHasMore(false)
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      // localStorage에서 권한 요청 호출 여부 확인
      const permissionRequested = localStorage.getItem(
        'push_permission_requested'
      )
      // 한 번도 호출하지 않았고, 권한이 default 상태일 때만 호출
      if (!permissionRequested) {
        handleRequestPermissionAndSubscribe(isSubscribed, setIsSubscribed)
        // 호출했다고 localStorage에 저장
        localStorage.setItem('push_permission_requested', 'true')
      }
      fetchInitialNotifications()
    } else {
      setFilter('all')
    }
  }, [isOpen, filter, isSubscribed])

  const handleMarkAllAsRead = async () => {
    const originalUnreadCount = unreadApiCount
    setUnreadApiCount(0)
    if (filter === 'unread') {
      setNotifications([])
    }

    try {
      await safeFetcherWithAuth.patch('notification/read-all').json()
      if (filter === 'all') {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      }
    } catch (error) {
      if (filter === 'unread') {
        setFilter('all')
      }
      setUnreadApiCount(originalUnreadCount)
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDeleteNotification = async (id: number, isRead: boolean) => {
    const originalNotifications = [...notifications]
    const originalCursor = cursor
    const originalUnreadCount = unreadApiCount
    if (!isRead) {
      setUnreadApiCount((prev) => Math.max(0, prev - 1))
    }
    const newNotifications = originalNotifications.filter((n) => n.id !== id)
    const newCursor =
      newNotifications.length > 0
        ? newNotifications[newNotifications.length - 1].id
        : null

    setNotifications(newNotifications)
    setCursor(newCursor)

    try {
      await safeFetcherWithAuth.delete(`notification/${id}`).json()
    } catch (error) {
      console.error('Failed to delete notification:', error)
      setNotifications(originalNotifications)
      setCursor(originalCursor)
      setUnreadApiCount(originalUnreadCount)
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      const originalUnreadCount = unreadApiCount
      setUnreadApiCount((prev) => Math.max(0, prev - 1))
      const updatedNotifications = notifications.map((n) =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
      setNotifications(updatedNotifications)

      try {
        await safeFetcherWithAuth
          .patch(`notification/${notification.id}/read`)
          .json()
      } catch (error) {
        setUnreadApiCount(originalUnreadCount)
        setNotifications(notifications)
        console.error('Failed to mark notification as read:', error)
      }
    }
    if (notification.url) {
      window.location.href = notification.url
    }
  }

  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) {
        return
      }
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchMoreNotifications()
        }
      })

      if (node) {
        observerRef.current.observe(node)
      }
    },
    [isLoading, hasMore, fetchMoreNotifications]
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className={cn(
          'relative flex min-w-fit items-center justify-center rounded-md p-2 transition-colors',
          isEditor ? 'text-gray-300 hover:text-white' : 'text-primary'
        )}
      >
        <Image
          className="min-w-fit"
          src={NotiIcon}
          alt="notification"
          width={18}
          height={21}
        />
        {unreadApiCount > 0 && (
          <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 shadow-md" />
        )}
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'w-[360px] py-1 pl-0 pr-1',
          isEditor &&
            'mr-5 rounded-sm border-none bg-slate-800 px-0 font-normal text-white'
        )}
        align="end"
      >
        <div className="pt-4">
          <div className="mb-2 flex items-center justify-between px-4">
            <div
              className={cn(
                'text-xl font-semibold',
                isEditor ? 'text-white' : 'text-gray-900'
              )}
            >
              Notification
            </div>
            <NotificationOptionsMenu
              isLoading={isLoading}
              isEditor={isEditor}
              setIsOpen={setIsOpen}
              handleMarkAllAsRead={handleMarkAllAsRead}
            />
          </div>
          <div
            className={cn(
              'bg-color-neutral-99 mb-1 ml-4 flex w-[168px] rounded-full p-1',
              isEditor && 'bg-[#121728]'
            )}
          >
            <button
              className={cn(
                'text-color-neutral-80 h-6 w-20 rounded-full bg-transparent text-sm font-medium transition-colors',
                filter === 'all' && !isEditor && 'text-primary bg-white',
                filter === 'all' && isEditor && 'text-primary bg-[#334155]'
              )}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={cn(
                'text-color-neutral-80 h-6 w-20 rounded-full bg-transparent text-sm font-medium transition-colors',
                filter === 'unread' && !isEditor && 'text-primary bg-white',
                filter === 'unread' && isEditor && 'text-primary bg-[#334155]'
              )}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
          </div>

          {isLoading && notifications.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="border-t-primary h-6 w-6 animate-spin rounded-full border-2 border-gray-300" />
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div
              className={cn(
                'py-8 text-center text-sm',
                isEditor ? 'text-gray-300' : 'text-gray-500'
              )}
            >
              No new notifications
            </div>
          )}

          {notifications.length > 0 && (
            <ScrollArea
              className="h-[426px]"
              bottomFade={!isEditor}
              topFade={!isEditor}
            >
              <div className="space-y-3 px-4 pt-2">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    ref={
                      index === notifications.length - 1 ? lastElementRef : null
                    }
                    className={cn(
                      'hover:bg-color-neutral-99 group relative h-[114px] cursor-pointer rounded-lg bg-white p-3 shadow-[0_4px_20px_0_rgba(53,78,116,0.10)]',
                      isEditor && 'bg-[#334155] text-white hover:bg-[#293548]'
                    )}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <button
                      className="notification-delete-btn absolute right-2 top-3 z-10 rounded text-gray-400 hover:text-gray-700 focus:outline-none"
                      aria-label="Delete notification"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNotification(
                          notification.id,
                          notification.isRead
                        )
                      }}
                      type="button"
                    >
                      <X className="h-6 w-6" />
                    </button>
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex-1">
                        <div
                          className={cn(
                            'flex items-center gap-1.5 font-medium',
                            isEditor ? 'text-white' : 'text-gray-900'
                          )}
                        >
                          <Badge
                            className={cn(isEditor && 'bg-[#41526A]')}
                            variant={
                              notification.type === 'Assignment'
                                ? 'Course'
                                : 'Contest'
                            }
                          >
                            {notification.type === 'Assignment'
                              ? 'Course'
                              : notification.type}
                          </Badge>
                          {notification.title}
                          {!notification.isRead && (
                            <div className="bg-primary h-2 w-2 rounded-full" />
                          )}
                        </div>
                        <p
                          className={cn(
                            'mt-1.5 overflow-hidden text-sm',
                            isEditor ? 'text-gray-300' : 'text-gray-600'
                          )}
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {notification.message}
                        </p>
                      </div>
                      <div
                        className={cn(
                          'text-xs',
                          isEditor ? 'text-gray-400' : 'text-gray-500'
                        )}
                      >
                        {formatTimeAgo(notification.createTime)}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center pt-8 text-center">
                  <p
                    className={cn(
                      'text-xs',
                      isEditor ? 'text-gray-400' : 'text-gray-500'
                    )}
                  >
                    You&apos;ve viewed all notifications from the past 30 days.
                  </p>
                  <div className="h-14" />
                </div>
                {isLoading && (
                  <div className="flex justify-center py-4">
                    <div className="border-t-primary h-4 w-4 animate-spin rounded-full border-2 border-gray-300" />
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
