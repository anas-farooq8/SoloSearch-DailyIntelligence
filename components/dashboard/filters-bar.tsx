"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, X, ChevronDown } from "lucide-react"
import type { Filters, Tag } from "@/types/database"

interface FiltersBarProps {
  filters: Filters
  onFilterChange: (filters: Partial<Filters>) => void
  filterOptions: {
    sectors: string[]
    triggers: string[]
    countries: string[]
    groups: string[]
  }
  tags: Tag[]
}

export function FiltersBar({ filters, onFilterChange, filterOptions, tags }: FiltersBarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const clearFilters = () => {
    onFilterChange({
      search: "",
      minScore: 5,
      maxScore: 10,
      sectors: [],
      triggers: [],
      country: null,
      tagIds: [],
      groups: [],
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.minScore !== null ||
    filters.sectors.length > 0 ||
    filters.triggers.length > 0 ||
    filters.country ||
    filters.tagIds.length > 0 ||
    filters.groups.length > 0

  // Prevent hydration mismatch by only rendering dropdowns after mount
  if (!mounted) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search - safe to render */}
          <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="pl-9 h-9 text-sm"
            />
          </div>
          {/* Placeholder buttons for layout */}
          <div className="flex-1 sm:flex-none sm:w-[200px] h-9" />
          <Button variant="outline" className="flex-1 sm:flex-none sm:min-w-[120px] bg-transparent h-9 text-sm" disabled>
            Sectors {filters.sectors.length > 0 && `(${filters.sectors.length})`}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none sm:min-w-[120px] bg-transparent h-9 text-sm" disabled>
            Signals {filters.triggers.length > 0 && `(${filters.triggers.length})`}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none sm:w-[120px] bg-transparent h-9 text-sm" disabled>
            {filters.country || "Countries"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none sm:min-w-[100px] bg-transparent h-9 text-sm" disabled>
            Tags {filters.tagIds.length > 0 && `(${filters.tagIds.length})`}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="cursor-pointer h-9 text-sm w-full sm:w-auto">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Score Range Slider - Dual handles for min and max */}
        <div className="flex flex-col gap-2 flex-1 sm:flex-none sm:w-[300px]">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Score: {filters.minScore ?? 5} - {filters.maxScore ?? 10}
              {filters.minScore === filters.maxScore && filters.minScore !== null && " (exact match)"}
            </span>
          </div>
          <div className="relative h-8 flex items-center">
            {/* Track background */}
            <div className="absolute w-full h-2 bg-slate-200 rounded-full pointer-events-none"></div>
            {/* Active track */}
            <div
              className="absolute h-2 bg-blue-600 rounded-full pointer-events-none"
              style={{
                left: `${((filters.minScore ?? 5) - 5) * 20}%`,
                right: `${100 - ((filters.maxScore ?? 10) - 5) * 20}%`,
              }}
            ></div>
            {/* Min Score Slider */}
            <input
              type="range"
              min="5"
              max="10"
              value={filters.minScore ?? 5}
              onChange={(e) => {
                const newMin = parseInt(e.target.value)
                const currentMax = filters.maxScore ?? 10
                if (newMin <= currentMax) {
                  onFilterChange({ minScore: newMin })
                }
              }}
              className="absolute w-full h-2 bg-transparent appearance-none cursor-grab active:cursor-grabbing pointer-events-auto"
              style={{
                zIndex: filters.minScore === filters.maxScore ? 5 : 3,
              }}
            />
            {/* Max Score Slider */}
            <input
              type="range"
              min="5"
              max="10"
              value={filters.maxScore ?? 10}
              onChange={(e) => {
                const newMax = parseInt(e.target.value)
                const currentMin = filters.minScore ?? 5
                if (newMax >= currentMin) {
                  onFilterChange({ maxScore: newMax })
                }
              }}
              className="absolute w-full h-2 bg-transparent appearance-none cursor-grab active:cursor-grabbing pointer-events-auto"
              style={{ zIndex: 4 }}
            />
          </div>
          <style jsx>{`
            input[type="range"] {
              pointer-events: none;
            }
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #2563eb;
              cursor: grab;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              pointer-events: auto;
            }
            input[type="range"]::-moz-range-thumb {
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #2563eb;
              cursor: grab;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              pointer-events: auto;
            }
            input[type="range"]:active::-webkit-slider-thumb {
              cursor: grabbing;
            }
            input[type="range"]:active::-moz-range-thumb {
              cursor: grabbing;
            }
            input[type="range"]::-webkit-slider-thumb:hover {
              background: #1d4ed8;
              transform: scale(1.1);
            }
            input[type="range"]::-moz-range-thumb:hover {
              background: #1d4ed8;
              transform: scale(1.1);
            }
          `}</style>
        </div>

        {/* Sectors Multi-select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 sm:flex-none sm:min-w-[120px] bg-transparent cursor-pointer h-9 text-sm">
              Sectors {filters.sectors.length > 0 && `(${filters.sectors.length})`}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            <DropdownMenuCheckboxItem
              key="all-sectors"
              checked={filters.sectors.length === 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  onFilterChange({ sectors: [] })
                }
              }}
            >
              All Sectors
            </DropdownMenuCheckboxItem>
            {filterOptions.sectors.map((sector) => (
              <DropdownMenuCheckboxItem
                key={sector}
                checked={filters.sectors.includes(sector)}
                onCheckedChange={(checked) => {
                  onFilterChange({
                    sectors: checked ? [...filters.sectors, sector] : filters.sectors.filter((s) => s !== sector),
                  })
                }}
              >
                {sector}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Triggers Multi-select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 sm:flex-none sm:min-w-[120px] bg-transparent cursor-pointer h-9 text-sm">
              Signals {filters.triggers.length > 0 && `(${filters.triggers.length})`}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            <DropdownMenuCheckboxItem
              key="all-triggers"
              checked={filters.triggers.length === 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  onFilterChange({ triggers: [] })
                }
              }}
            >
              All Triggers
            </DropdownMenuCheckboxItem>
            {filterOptions.triggers.map((trigger) => (
              <DropdownMenuCheckboxItem
                key={trigger}
                checked={filters.triggers.includes(trigger)}
                onCheckedChange={(checked) => {
                  onFilterChange({
                    triggers: checked ? [...filters.triggers, trigger] : filters.triggers.filter((t) => t !== trigger),
                  })
                }}
              >
                {trigger}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Country */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 sm:flex-none sm:w-[120px] bg-transparent cursor-pointer h-9 text-sm">
              {filters.country || "Countries"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            <DropdownMenuCheckboxItem
              key="all-countries"
              checked={!filters.country}
              onCheckedChange={(checked) => {
                if (checked) {
                  onFilterChange({ country: null })
                }
              }}
            >
              All Countries
            </DropdownMenuCheckboxItem>
            {filterOptions.countries.map((country) => (
              <DropdownMenuCheckboxItem
                key={country}
                checked={filters.country === country}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onFilterChange({ country })
                  }
                }}
              >
                {country}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Groups - Static values 1, 2, 3 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 sm:flex-none sm:min-w-[120px] bg-transparent cursor-pointer h-9 text-sm">
              Groups {filters.groups.length > 0 && `(${filters.groups.length})`}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem
              key="all-groups"
              checked={filters.groups.length === 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  onFilterChange({ groups: [] })
                }
              }}
            >
              All Groups
            </DropdownMenuCheckboxItem>
            {["1", "2", "3"].map((group) => (
              <DropdownMenuCheckboxItem
                key={group}
                checked={filters.groups.includes(group)}
                onCheckedChange={(checked) => {
                  onFilterChange({
                    groups: checked ? [...filters.groups, group] : filters.groups.filter((g) => g !== group),
                  })
                }}
              >
                Group {group}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tags Multi-select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-1 sm:flex-none sm:min-w-[100px] bg-transparent cursor-pointer h-9 text-sm">
              Tags {filters.tagIds.length > 0 && `(${filters.tagIds.length})`}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {tags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag.id}
                checked={filters.tagIds.includes(tag.id)}
                onCheckedChange={(checked) => {
                  onFilterChange({
                    tagIds: checked ? [...filters.tagIds, tag.id] : filters.tagIds.filter((id) => id !== tag.id),
                  })
                }}
              >
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="cursor-pointer h-9 text-sm w-full sm:w-auto">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
