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
import { CalendarIcon, Clock } from 'lucide-react'

interface DateTimePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export const DateTimePicker = ({
  value,
  onChange,
  placeholder = 'Pick date and time',
  disabled = false,
}: DateTimePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value)

  useEffect(() => {
    setSelectedDate(value)
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined)
      onChange(undefined)
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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <CalendarIcon className='mr-2 h-4 w-4' />
          {value ? format(value, 'PPP hh:mm a') : <span>{placeholder}</span>}
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
        </div>
      </PopoverContent>
    </Popover>
  )
}
