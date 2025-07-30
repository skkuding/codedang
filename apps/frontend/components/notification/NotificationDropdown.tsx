'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import type { Notification } from '@/types/type'
import { Bell, X } from 'lucide-react'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

const INITIAL_FETCH_COUNT = 3
const SUBSEQUENT_FETCH_COUNT = 10

interface NotificationDropdownProps {
  isEditor?: boolean
}

export function NotificationDropdown({
  isEditor = false
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<number | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const fetchMoreNotifications = useCallback(async () => {
    if (isLoading || !hasMore || !cursor) {
      return
    }

    setIsLoading(true)
    try {
      const take = SUBSEQUENT_FETCH_COUNT
      const url = `notification?take=${take}&cursor=${cursor}`
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
  }, [isLoading, hasMore, cursor])

  useEffect(() => {
    if (isOpen) {
      const fetchInitialNotifications = async () => {
        setIsLoading(true)
        setNotifications([])
        setCursor(null)
        setShowAll(false)
        setHasMore(true)

        try {
          const take = INITIAL_FETCH_COUNT
          const url = `notification?take=${take}`
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
      fetchInitialNotifications()
    }
  }, [isOpen])

  const handleMarkAllAsRead = async () => {
    const originalNotifications = [...notifications]
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))

    try {
      await safeFetcherWithAuth.patch('notification/read-all').json()
    } catch (error) {
      setNotifications(originalNotifications)
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDeleteNotification = async (id: number) => {
    const originalNotifications = [...notifications]
    const originalCursor = cursor
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
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      const originalNotifications = [...notifications]
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      )
      try {
        await safeFetcherWithAuth
          .patch(`notification/${notification.id}/read`)
          .json()
      } catch (error) {
        setNotifications(originalNotifications)
        console.error('Failed to mark notification as read:', error)
      }
    }
    if (notification.url) {
      window.location.href = notification.url
    }
  }

  const handleViewAll = () => {
    setShowAll(true)
    fetchMoreNotifications()
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
        if (entries[0].isIntersecting && hasMore && showAll) {
          fetchMoreNotifications()
        }
      })

      if (node) {
        observerRef.current.observe(node)
      }
    },
    [isLoading, hasMore, showAll, fetchMoreNotifications]
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    )

    if (diffInMinutes < 1) {
      return 'Just now'
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    }
    if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hour${
        Math.floor(diffInMinutes / 60) > 1 ? 's' : ''
      } ago`
    }
    return date.toLocaleDateString('en-US')
  }

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className={cn(
          'relative flex items-center justify-center rounded-md p-2 transition-colors',
          isEditor ? 'text-gray-300 hover:text-white' : 'text-primary'
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md">
            {unreadCount}
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          'w-[360px]',
          isEditor &&
            'mr-5 rounded-sm border-none bg-slate-800 px-0 font-normal text-white'
        )}
        align="end"
      >
        <div className="py-4 pl-4">
          <div className="mb-3 flex items-center justify-between">
            <h3
              className={cn(
                'font-semibold',
                isEditor ? 'text-white' : 'text-gray-900'
              )}
            >
              Notification
            </h3>
            <button
              className={cn(
                'hover:text-primary pr-4 text-xs font-medium underline underline-offset-2',
                isEditor
                  ? 'text-gray-300 hover:text-white'
                  : 'hover:text-primary text-gray-500'
              )}
              onClick={handleMarkAllAsRead}
              disabled={notifications.every((n) => n.isRead) || isLoading}
              type="button"
            >
              Mark all as read
            </button>
          </div>
          {isLoading && notifications.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="border-t-primary h-6 w-6 animate-spin rounded-full border-2 border-gray-300" />
            </div>
          )}
          {!isLoading && notifications.length === 0 ? (
            <div
              className={cn(
                'py-8 text-center text-sm',
                isEditor ? 'text-gray-300' : 'text-gray-500'
              )}
            >
              No new notifications
            </div>
          ) : (
            <ScrollArea className="h-[360px]">
              <div className="space-y-3 pr-4">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    ref={
                      showAll && index === notifications.length - 1
                        ? lastElementRef
                        : null
                    }
                    className={cn(
                      'group relative cursor-pointer rounded-lg bg-neutral-50 p-3 transition-colors hover:bg-gray-100',
                      !notification.isRead &&
                        'bg-blue-100 font-semibold hover:bg-blue-200',
                      isEditor && 'bg-slate-700 text-white hover:bg-[#293548]',
                      isEditor &&
                        !notification.isRead &&
                        'bg-slate-500 font-semibold hover:bg-[#56657a]'
                    )}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleNotificationClick(notification)
                      }
                    }}
                  >
                    <button
                      className="notification-delete-btn absolute right-2 top-2 z-10 rounded p-1 text-gray-400 hover:text-gray-700 focus:outline-none"
                      aria-label="Delete notification"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNotification(notification.id)
                      }}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4
                          className={cn(
                            'text-sm font-medium',
                            !notification.isRead && 'font-semibold',
                            isEditor ? 'text-white' : 'text-gray-900'
                          )}
                        >
                          {notification.title}
                        </h4>
                        <p
                          className={cn(
                            'mt-1 overflow-hidden text-xs',
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
                        <div
                          className={cn(
                            'mt-2 text-xs',
                            isEditor ? 'text-gray-400' : 'text-gray-500'
                          )}
                        >
                          {formatTime(notification.createTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {!showAll && hasMore && (
                  <div className="flex justify-center pt-2">
                    <button
                      className={cn(
                        'hover:text-primary text-xs font-medium underline underline-offset-2',
                        isEditor
                          ? 'text-gray-300 hover:text-white'
                          : 'hover:text-primary text-gray-500'
                      )}
                      onClick={handleViewAll}
                      type="button"
                    >
                      View All
                    </button>
                  </div>
                )}
                {showAll && (
                  <div className="flex justify-center pt-2 text-center">
                    <p
                      className={cn(
                        'text-xs',
                        isEditor ? 'text-gray-400' : 'text-gray-500'
                      )}
                    >
                      Notifications older than 30 days are automatically deleted
                    </p>
                  </div>
                )}
                {showAll && isLoading && (
                  <div className="flex justify-center py-4">
                    <div className="border-t-primary h-4 w-4 animate-spin rounded-full border-2 border-gray-300" />
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
