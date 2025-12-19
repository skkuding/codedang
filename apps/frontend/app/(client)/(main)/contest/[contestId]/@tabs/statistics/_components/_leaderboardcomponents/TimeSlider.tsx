import { Slider } from '@/components/shadcn/slider'
import { useState, useEffect, useRef } from 'react'
import { IoIosPlayCircle } from 'react-icons/io'
import { IoPauseCircle } from 'react-icons/io5'

interface TimeSliderProps {
  currentSubmissionIndex: number | null
  submissionCount: number
  onSliderChange: (index: number) => void
  onReset: () => void
  contestStartTime: number
  contestEndTime: number
  currentSubmissionTime?: number | null
}
const formatDuration = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function TimeSlider({
  currentSubmissionIndex,
  submissionCount,
  onSliderChange,
  onReset,
  contestStartTime,
  contestEndTime,
  currentSubmissionTime
}: TimeSliderProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [displayTime, setDisplayTime] = useState<string>('00:00:00')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentIndexRef = useRef<number | null>(currentSubmissionIndex)

  useEffect(() => {
    currentIndexRef.current = currentSubmissionIndex
  }, [currentSubmissionIndex])

  const handleSliderValueChange = (value: number[]) => {
    onSliderChange(value[0])
  }

  const handleReset = () => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    onReset()
    setDisplayTime('00:00:00')
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    } else {
      const isAtEnd =
        currentIndexRef.current === submissionCount - 1 ||
        currentIndexRef.current === null

      if (isAtEnd && submissionCount > 0) {
        handleReset()
      }
      setIsPlaying(true)

      intervalRef.current = setInterval(() => {
        const nextIndex =
          currentIndexRef.current === null ? 0 : currentIndexRef.current + 1

        if (nextIndex >= submissionCount) {
          setIsPlaying(false)
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return
        }

        onSliderChange(nextIndex)
      }, 100)
    }
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
  useEffect(() => {
    if (currentSubmissionTime !== null && currentSubmissionTime !== undefined) {
      const elapsed = currentSubmissionTime - contestStartTime
      setDisplayTime(formatDuration(Math.max(0, elapsed)))
    } else {
      setDisplayTime('00:00:00')
    }
  }, [currentSubmissionTime, contestStartTime])

  const getTotalDuration = (): string => {
    return formatDuration(contestEndTime - contestStartTime)
  }
  return (
    <div className="h-17 bg-color-neutral-99 flex w-full items-center gap-[19px] rounded-xl px-5 py-4">
      <div className="text-primary flex w-[169px] text-xl font-normal leading-7 tracking-[-0.04em]">
        {displayTime} / {getTotalDuration()}
      </div>
      <Slider
        max={submissionCount - 1}
        min={0}
        color="yellow"
        className="w-[925px] cursor-pointer"
        onValueChange={(value) => handleSliderValueChange(value)}
        value={
          currentSubmissionIndex !== null
            ? [currentSubmissionIndex]
            : [submissionCount - 1]
        }
      />

      <button
        onClick={handlePlayPause}
        className="text-primary transition-colors hover:text-blue-600"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <IoPauseCircle size={48} />
        ) : (
          <IoIosPlayCircle size={48} />
        )}
      </button>
    </div>
  )
}
