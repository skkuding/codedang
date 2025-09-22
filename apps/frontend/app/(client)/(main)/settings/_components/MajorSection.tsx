import { Button } from '@/components/shadcn/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/shadcn/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { colleges } from '@/libs/constants'
import { cn } from '@/libs/utils'
import { FaCheck, FaChevronDown } from 'react-icons/fa6'
import { useSettingsContext } from './context'

export function MajorSection() {
  const {
    isLoading,
    updateNow,
    majorState: { majorOpen, setMajorOpen, majorValue, setMajorValue },
    collegeState: {
      collegeOpen,
      setCollegeOpen,
      collegeValue,
      setCollegeValue
    },
    defaultProfileValues
  } = useSettingsContext()

  const getMajorDisplayValue = () => {
    if (updateNow) {
      return majorValue === 'none'
        ? 'Department Information Unavailable / 학과 정보 없음'
        : majorValue
    }

    return majorValue || defaultProfileValues.major
  }

  const getCollegeDisplayValue = () => {
    if (updateNow) {
      return collegeValue === 'none'
        ? 'Department Information Unavailable / 학과 정보 없음'
        : collegeValue
    }

    return collegeValue || defaultProfileValues.college
  }

  return (
    <>
      <label className="-mb-4 mt-2 text-xs">First Major</label>
      <div className="flex flex-col gap-1">
        <Popover open={collegeOpen} onOpenChange={setCollegeOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={collegeOpen}
              variant="outline"
              role="combobox"
              className={cn(
                'justify-between border-gray-200 font-normal text-neutral-600 hover:bg-white',
                (() => {
                  if (updateNow) {
                    return collegeValue === 'none' || isLoading
                      ? 'border-red-500 text-neutral-400'
                      : 'border-primary'
                  }
                  return collegeValue === defaultProfileValues.college
                    ? 'text-neutral-400'
                    : 'border-primary'
                })()
              )}
            >
              <span className="truncate">
                {isLoading ? 'Loading...' : getCollegeDisplayValue()}
              </span>
              <FaChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[555px] p-0">
            <Command>
              <CommandInput placeholder="Search affiliation..." />
              <ScrollArea>
                <CommandEmpty>No affiliation found.</CommandEmpty>
                <CommandGroup>
                  <CommandList className="h-40">
                    {colleges?.map((college) => (
                      <CommandItem
                        key={college.name}
                        value={college.name}
                        onSelect={(currentValue) => {
                          setCollegeValue(currentValue)
                          setMajorValue('none')
                          setCollegeOpen(false)
                        }}
                      >
                        <FaCheck
                          className={cn(
                            'mr-2 h-4 w-4',
                            collegeValue === college.name
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {college.name}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </ScrollArea>
            </Command>
          </PopoverContent>
        </Popover>
        <Popover open={majorOpen} onOpenChange={setMajorOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={majorOpen}
              variant="outline"
              role="combobox"
              className={cn(
                'justify-between border-gray-200 font-normal text-neutral-600 hover:bg-white',
                (() => {
                  if (updateNow) {
                    return majorValue === 'none' || isLoading
                      ? 'border-red-500 text-neutral-400'
                      : 'border-primary'
                  }
                  return majorValue === defaultProfileValues.major
                    ? 'text-neutral-400'
                    : 'border-primary'
                })()
              )}
            >
              <span className="truncate">
                {isLoading ? 'Loading...' : getMajorDisplayValue()}
              </span>
              <FaChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[555px] p-0">
            <Command>
              <CommandInput placeholder="Search major..." />
              <ScrollArea>
                <CommandEmpty>No major found.</CommandEmpty>
                <CommandGroup>
                  <CommandList className="h-40">
                    {colleges
                      ?.filter((college) => college.name === collegeValue)
                      .flatMap((college) => college.majors)
                      .map((major) => (
                        <CommandItem
                          key={major}
                          value={major}
                          onSelect={(currentValue) => {
                            setMajorValue(currentValue)
                            setMajorOpen(false)
                          }}
                        >
                          <FaCheck
                            className={cn(
                              'mr-2 h-4 w-4',
                              majorValue === major ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {major}
                        </CommandItem>
                      ))}
                  </CommandList>
                </CommandGroup>
              </ScrollArea>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}
