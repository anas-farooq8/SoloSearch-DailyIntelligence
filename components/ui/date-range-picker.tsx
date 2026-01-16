"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, subDays, subMonths, startOfDay, endOfDay } from "date-fns"

export interface DateRange {
  from: Date
  to: Date
}

export type DateRangePreset = "24h" | "7d" | "14d" | "30d" | "3m" | "custom"

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activePreset, setActivePreset] = useState<DateRangePreset>("30d")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [showCustomInputs, setShowCustomInputs] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".date-range-picker")) {
        setIsOpen(false)
        setShowCustomInputs(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const presets = [
    { id: "24h" as const, label: "24 hours" },
    { id: "7d" as const, label: "7 days" },
    { id: "14d" as const, label: "14 days" },
    { id: "30d" as const, label: "30 days" },
    { id: "3m" as const, label: "3 months" },
  ]

  const applyPreset = (preset: DateRangePreset) => {
    const now = new Date()
    let from: Date

    switch (preset) {
      case "24h":
        from = subDays(now, 1)
        break
      case "7d":
        from = subDays(now, 7)
        break
      case "14d":
        from = subDays(now, 14)
        break
      case "30d":
        from = subDays(now, 30)
        break
      case "3m":
        from = subMonths(now, 3)
        break
      default:
        return
    }

    from = startOfDay(from)
    const to = endOfDay(now)

    setActivePreset(preset)
    setShowCustomInputs(false)
    onChange({ from, to })
    setIsOpen(false)
  }

  const applyCustomRange = () => {
    if (!customStart || !customEnd) return

    const from = startOfDay(new Date(customStart))
    const to = endOfDay(new Date(customEnd))

    if (from > to) {
      alert("Start date must be before end date")
      return
    }

    setActivePreset("custom")
    onChange({ from, to })
    setIsOpen(false)
    setShowCustomInputs(false)
  }

  const getDisplayText = () => {
    if (activePreset === "custom") {
      return `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`
    }
    const preset = presets.find((p) => p.id === activePreset)
    return preset?.label || "Select range"
  }

  return (
    <div className={cn("date-range-picker relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto justify-between gap-2"
      >
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">{getDisplayText()}</span>
        <span className="sm:hidden">{activePreset === "custom" ? "Custom" : activePreset}</span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-slate-200 z-50 min-w-[280px]">
          {!showCustomInputs ? (
            <div className="p-3">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Date range</h3>
              <div className="space-y-1">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                      "hover:bg-slate-100",
                      activePreset === preset.id
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-slate-700"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowCustomInputs(true)
                    const today = format(new Date(), "yyyy-MM-dd")
                    const lastMonth = format(subMonths(new Date(), 1), "yyyy-MM-dd")
                    setCustomStart(lastMonth)
                    setCustomEnd(today)
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                    "hover:bg-slate-100",
                    activePreset === "custom"
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-slate-700"
                  )}
                >
                  Custom
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Custom range</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Start date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">End date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomInputs(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyCustomRange}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
