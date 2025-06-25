
"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface TimePickerProps {
  time?: string
  onChange: (time?: string) => void
}

export function TimePicker({ time, onChange }: TimePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !time && "text-muted-foreground"
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {time ? time : <span>Selecione um horário</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-2">
          <div className="grid grid-flow-col gap-2">
            <Input
              type="time"
              value={time}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
