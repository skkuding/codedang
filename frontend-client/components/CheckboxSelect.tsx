import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { useState } from 'react'

interface DataProps {
  title: string
  options: string[]
  onChange: (selectedValues: string[]) => void
}

export default function LanguageSelect({
  title,
  options,
  onChange
}: DataProps) {
  const [selectedValues, setSelectedValues] = useState([] as string[])

  const handleCheckboxChange = (option: string) => {
    setSelectedValues((prevSelectedValues) => {
      if (prevSelectedValues.includes(option)) {
        return prevSelectedValues.filter((value) => value !== option)
      } else {
        return [...prevSelectedValues, option]
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
          <p className="font-bold">{title}</p>
          {selectedValues.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <div className="space-x-1">
                {selectedValues.length == options.length ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    All
                  </Badge>
                ) : (
                  <div className="flex space-x-1">
                    {selectedValues.map((value) => (
                      <Badge
                        key={value}
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[115px] p-0" align="start">
        <Command>
          <CommandEmpty>No language found.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem key={option} value={option} className="gap-x-2">
                <Checkbox
                  checked={selectedValues.includes(option)}
                  onCheckedChange={() => handleCheckboxChange(option)}
                ></Checkbox>
                {option}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
