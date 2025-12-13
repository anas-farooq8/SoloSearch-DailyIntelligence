"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  }
  tags: Tag[]
}

export function FiltersBar({ filters, onFilterChange, filterOptions, tags }: FiltersBarProps) {
  const scoreRanges = [
    { label: "All Scores", min: null, max: null },
    { label: "8-10 (Immediate)", min: 8, max: 10 },
    { label: "6-7 (High Interest)", min: 6, max: 7 },
    { label: "4-5 (Monitor)", min: 4, max: 5 },
    { label: "1-3 (Low)", min: 1, max: 3 },
  ]

  const clearFilters = () => {
    onFilterChange({
      search: "",
      minScore: null,
      maxScore: null,
      sectors: [],
      triggers: [],
      country: null,
      tagIds: [],
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.minScore !== null ||
    filters.sectors.length > 0 ||
    filters.triggers.length > 0 ||
    filters.country ||
    filters.tagIds.length > 0

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by company..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Score Range */}
        <Select
          value={filters.minScore !== null ? `${filters.minScore}-${filters.maxScore}` : "all"}
          onValueChange={(v) => {
            const range = scoreRanges.find((r) => (r.min !== null ? `${r.min}-${r.max}` : "all") === v)
            onFilterChange({ minScore: range?.min ?? null, maxScore: range?.max ?? null })
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Score Range" />
          </SelectTrigger>
          <SelectContent>
            {scoreRanges.map((range) => (
              <SelectItem key={range.label} value={range.min !== null ? `${range.min}-${range.max}` : "all"}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sectors Multi-select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[120px] bg-transparent">
              Sectors {filters.sectors.length > 0 && `(${filters.sectors.length})`}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
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
            <Button variant="outline" className="min-w-[120px] bg-transparent">
              Signals {filters.triggers.length > 0 && `(${filters.triggers.length})`}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
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
        <Select
          value={filters.country || "all"}
          onValueChange={(v) => onFilterChange({ country: v === "all" ? null : v })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {filterOptions.countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tags Multi-select */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[100px] bg-transparent">
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
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
