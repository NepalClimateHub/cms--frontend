import { useState, useEffect } from 'react'
import { format, setHours, setMinutes } from 'date-fns'
import { Button } from '@/ui/shadcn/button'
import { Calendar } from '@/ui/shadcn/calendar'
import { cn } from '@/ui/shadcn/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/shadcn/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/shadcn/select'
import { CalendarIcon, Clock, X } from 'lucide-react'
import { parseDate } from '@/utils/date-utils'

interface DateTimePickerProps {
  value?: Date | string | null
  onChange: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  className?: string
}

export const DateTimePicker = ({
  value,
  onChange,
  placeholder = 'Pick date and time',
  disabled = false,
  clearable = false,
  className,
}: DateTimePickerProps) => {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() =>
    parseDate(value)
  )

  useEffect(() => {
    setSelectedDate(parseDate(value))
  }, [value])

  const handleClear = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedDate(undefined)
    onChange(null)
    setOpen(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined)
      onChange(null)
      return
    }

    const currentHours = selectedDate ? selectedDate.getHours() : 12
    const currentMinutes = selectedDate ? selectedDate.getMinutes() : 0

    let newDate = setHours(date, currentHours)
    newDate = setMinutes(newDate, currentMinutes)

    setSelectedDate(newDate)
    onChange(newDate)
  }

  const handleTimeChange = (type: 'hour' | 'minute' | 'ampm', val: string) => {
    const baseDate = selectedDate || new Date()
    let hours = baseDate.getHours()
    let minutes = baseDate.getMinutes()

    if (type === 'hour') {
      const h12 = parseInt(val, 10)
      const isPM = hours >= 12
      hours = isPM ? (h12 === 12 ? 12 : h12 + 12) : h12 === 12 ? 0 : h12
    } else if (type === 'minute') {
      minutes = parseInt(val, 10)
    } else if (type === 'ampm') {
      const currentH12 = hours % 12 || 12
      if (val === 'PM') {
        hours = currentH12 === 12 ? 12 : currentH12 + 12
      } else {
        hours = currentH12 === 12 ? 0 : currentH12
      }
    }

    let updated = setHours(baseDate, hours)
    updated = setMinutes(updated, minutes)

    setSelectedDate(updated)
    onChange(updated)
  }

  const currentHours = selectedDate ? selectedDate.getHours() : 12
  const currentMinutes = selectedDate ? selectedDate.getMinutes() : 0
  const hour12 = currentHours % 12 || 12
  const ampm = currentHours >= 12 ? 'PM' : 'AM'

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString())
  const minutesList = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, '0')
  )

  const displayValue = parseDate(value)

  return (
    <div className={cn('relative flex items-center w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            type='button'
            className={cn(
              'w-full justify-start text-left font-normal',
              clearable && displayValue && 'pr-9',
              !displayValue && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <CalendarIcon className='mr-2 h-4 w-4 shrink-0' />
            <span className='truncate'>
              {displayValue ? (
                format(displayValue, 'PPP hh:mm a')
              ) : (
                <span>{placeholder}</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-3' align='start'>
          <div className='space-y-3'>
            <Calendar
              mode='single'
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={disabled}
              initialFocus
            />
            <div className='flex items-center justify-between gap-2 border-t pt-3'>
              <div className='flex items-center gap-1 text-sm font-medium text-muted-foreground'>
                <Clock className='h-4 w-4' />
                <span>Time</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <Select
                  disabled={!selectedDate || disabled}
                  value={hour12.toString()}
                  onValueChange={(val) => handleTimeChange('hour', val)}
                >
                  <SelectTrigger className='h-8 w-[64px] text-xs'>
                    <SelectValue placeholder='Hour' />
                  </SelectTrigger>
                  <SelectContent className='max-h-[160px]'>
                    {hoursList.map((h) => (
                      <SelectItem key={h} value={h} className='text-xs'>
                        {h.padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className='text-sm text-muted-foreground'>:</span>
                <Select
                  disabled={!selectedDate || disabled}
                  value={currentMinutes.toString().padStart(2, '0')}
                  onValueChange={(val) => handleTimeChange('minute', val)}
                >
                  <SelectTrigger className='h-8 w-[64px] text-xs'>
                    <SelectValue placeholder='Min' />
                  </SelectTrigger>
                  <SelectContent className='max-h-[160px]'>
                    {minutesList.map((m) => (
                      <SelectItem key={m} value={m} className='text-xs'>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  disabled={!selectedDate || disabled}
                  value={ampm}
                  onValueChange={(val) => handleTimeChange('ampm', val)}
                >
                  <SelectTrigger className='h-8 w-[64px] text-xs'>
                    <SelectValue placeholder='AM/PM' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='AM' className='text-xs'>
                      AM
                    </SelectItem>
                    <SelectItem value='PM' className='text-xs'>
                      PM
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {clearable && selectedDate && (
              <div className='flex items-center justify-between border-t pt-2'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-7 px-2 text-xs text-muted-foreground hover:text-destructive'
                  onClick={() => {
                    setSelectedDate(undefined)
                    onChange(null)
                    setOpen(false)
                  }}
                >
                  Clear
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-7 px-2 text-xs text-primary'
                  onClick={() => setOpen(false)}
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {clearable && displayValue && !disabled && (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted z-10 rounded-sm'
          onPointerDown={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onClick={handleClear}
          title='Clear'
        >
          <X className='h-4 w-4' />
          <span className='sr-only'>Clear</span>
        </Button>
      )}
    </div>
  )
}
