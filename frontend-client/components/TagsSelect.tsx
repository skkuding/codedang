'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Command, CommandInput } from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { CommandList } from 'cmdk'
import { useEffect, useState } from 'react'
import { IoClose } from 'react-icons/io5'

interface Tag {
  id: number
  name: string
}

interface DataProps {
  options: Tag[]
  onChange: (selectedValues: number[]) => void
  defaultValue?: number[]
}

export default function TagsSelect({
  options,
  onChange,
  defaultValue
}: DataProps) {
  const [selectedValues, setSelectedValues] = useState<number[]>([])
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    if (defaultValue) {
      setSelectedValues(defaultValue)
    }
  }, [defaultValue])

  const handleCheckboxChange = (value: number) => {
    setSelectedValues((prevSelectedValues) => {
      if (prevSelectedValues.includes(value)) {
        return prevSelectedValues.filter((id) => id !== value)
      } else {
        return [...prevSelectedValues, value]
      }
    })
  }

  return (
    <Popover onOpenChange={() => onChange(selectedValues)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={'sm'}
          className="h-10 border hover:bg-gray-50"
        >
          <PlusCircledIcon className="mr-2 h-4 w-4" />
          <p className="font-bold">Tags</p>
          {selectedValues.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="space-x-1">
                {selectedValues.length >= 4 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.length} selected
                  </Badge>
                ) : (
                  <div className="flex space-x-1">
                    {selectedValues.map((value) => {
                      const matchingOption = options.find(
                        (option) => option.id === value
                      )
                      return (
                        <Badge
                          key={matchingOption?.id}
                          variant="secondary"
                          className="rounded-sm px-1 font-normal"
                        >
                          {matchingOption?.name}
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput
            placeholder="search"
            value={inputValue}
            onValueChange={(e) => setInputValue(e)}
          />
          <CommandList>
            <div className="p-2">
              {inputValue === ''
                ? options.map((option) => (
                    <Badge
                      key={option.id}
                      variant="secondary"
                      className={`mr-2 cursor-pointer rounded-lg border-solid px-2 font-normal hover:bg-gray-100/80 active:bg-gray-100/80
                  ${selectedValues.includes(option.id) ? 'border-gray-100/80 bg-gray-100/80' : 'border-gray-200/80 bg-white '}
                `}
                      onClick={() => handleCheckboxChange(option.id)}
                    >
                      {option.name}
                      {selectedValues.includes(option.id) ? (
                        <IoClose className="ml-2 h-[14px] w-[14px] text-gray-500" />
                      ) : (
                        ''
                      )}
                    </Badge>
                  ))
                : options
                    .filter((option) =>
                      option.name
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                    )
                    .map((option) => (
                      <Badge
                        key={option.id}
                        variant="secondary"
                        className={`mr-2 cursor-pointer rounded-lg border-solid px-2 font-normal hover:bg-gray-100/80 active:bg-gray-100/80
                  ${selectedValues.includes(option.id) ? 'border-gray-100/80 bg-gray-100/80' : 'border-gray-200/80 bg-white '}
                `}
                        onClick={() => handleCheckboxChange(option.id)}
                      >
                        {option.name}
                        {selectedValues.includes(option.id) ? (
                          <IoClose className="ml-2 h-[14px] w-[14px] text-gray-500" />
                        ) : (
                          ''
                        )}
                      </Badge>
                    ))}
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
