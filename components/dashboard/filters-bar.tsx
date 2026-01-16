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
import { Skeleton } from "@/components/ui/skeleton"
import type { Filters, Tag } from "@/types/database"

interface FiltersBarProps {
  filters: Filters
  onFilterChange: (filters: Partial<Filters>) => void
  filterOptions: {
    sectors: string[]
    triggers: string[]
    sources: string[]
    groups: string[]
  }
  tags: Tag[]
  loading?: boolean
}

export function FiltersBar({ filters, onFilterChange, filterOptions, tags, loading = false }: FiltersBarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const clearFilters = () => {
    onFilterChange({
      search: "",
      minScore: 5,
      maxScore: 10,
      sectorGroup: 'all',
      sectors: [],
      triggers: [],
      sources: [],
      tagIds: [],
      groups: [],
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.minScore !== null ||
    filters.sectorGroup !== null ||
    filters.sectors.length > 0 ||
    filters.triggers.length > 0 ||
    filters.sources.length > 0 ||
    filters.tagIds.length > 0 ||
    filters.groups.length > 0

  // Show skeleton when loading
  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {/* Top Row: Search + Lead Score Range + Clear Button Skeleton */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 sm:p-4 border-b border-slate-100">
          {/* Search Bar Skeleton */}
          <div className="relative flex-1">
            <Skeleton className="h-10 w-full" />
          </div>
          
          {/* Lead Score Range Skeleton */}
          <div className="flex flex-col gap-2 md:w-[480px] bg-slate-50 p-3 rounded-lg border border-slate-200">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-full" />
          </div>
          
          {/* Clear Button Skeleton */}
          <Skeleton className="h-10 md:w-[120px]" />
        </div>

        {/* Filters Grid Skeleton */}
        <div className="p-3 sm:p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Prevent hydration mismatch by only rendering dropdowns after mount
  if (!mounted) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {/* Top Row: Search + Lead Score Range + Clear Button */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 sm:p-4 border-b border-slate-100">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search titles, companies, opportunities..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="pl-9 h-10 text-sm"
            />
          </div>
          
          {/* Lead Score Range Placeholder */}
          <div className="flex flex-col gap-2 md:w-[480px] bg-slate-50 p-3 rounded-lg border border-slate-200 animate-pulse">
            <div className="h-4 bg-slate-300 rounded w-32"></div>
            <div className="h-8 bg-slate-300 rounded"></div>
          </div>
          
          {/* Clear Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters} 
            className="cursor-pointer h-10 md:w-[120px] px-4 text-sm whitespace-nowrap"
          >
            <X className="h-4 w-4 mr-1.5" />
            Clear
          </Button>
        </div>

        {/* Filters Grid - Placeholder */}
        <div className="p-3 sm:p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      {/* Top Row: Search + Lead Score Range + Clear Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-3 sm:p-4 border-b border-slate-100">
        {/* Search Bar - takes more space on desktop */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search titles, companies, opportunities..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="pl-9 h-10 text-sm"
          />
        </div>
        
        {/* Lead Score Range - shows in row on desktop */}
        <div className="flex flex-col gap-2 md:w-[480px] bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Lead Score</span>
            <span className="text-sm font-bold text-blue-600">
              {filters.minScore ?? 5} - {filters.maxScore ?? 10}
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
        
        {/* Clear Button */}
        <Button 
          variant={hasActiveFilters ? "default" : "outline"} 
          size="sm" 
          onClick={clearFilters} 
          className="cursor-pointer h-10 md:w-[120px] px-4 text-sm whitespace-nowrap"
        >
          <X className="h-4 w-4 mr-1.5" />
          Clear
        </Button>
      </div>

      {/* Filters Grid */}
      <div className="p-3 sm:p-4 space-y-4">

        {/* Filter Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {/* Sector Group Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={`w-full justify-between cursor-pointer h-10 text-sm ${
                  filters.sectorGroup && filters.sectorGroup !== 'all' ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : ''
                }`}
              >
                <span className="truncate">
                  {filters.sectorGroup === 'health' && 'Health-related'}
                  {filters.sectorGroup === 'others' && 'Other Sectors'}
                  {(!filters.sectorGroup || filters.sectorGroup === 'all') && 'All Sectors'}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem
                checked={filters.sectorGroup === 'all'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onFilterChange({ sectorGroup: 'all' })
                  }
                }}
              >
                All Sectors
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.sectorGroup === 'health'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onFilterChange({ sectorGroup: 'health' })
                  }
                }}
              >
                Health-related
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.sectorGroup === 'others'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onFilterChange({ sectorGroup: 'others' })
                  }
                }}
              >
                Other Sectors
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sectors Multi-select */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={`w-full justify-between cursor-pointer h-10 text-sm ${
                  filters.sectors.length > 0 ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : ''
                }`}
              >
                <span className="truncate">Sectors {filters.sectors.length > 0 && `(${filters.sectors.length})`}</span>
                <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            <DropdownMenuCheckboxItem
              key="all-sectors"
              checked={filters.sectors.length === 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  onFilterChange({ sectors: [], sectorGroup: null })
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
                    sectorGroup: null, // Clear group when manually selecting sectors
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
              <Button 
                variant="outline" 
                className={`w-full justify-between cursor-pointer h-10 text-sm ${
                  filters.triggers.length > 0 ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : ''
                }`}
              >
                <span className="truncate">Signals {filters.triggers.length > 0 && `(${filters.triggers.length})`}</span>
                <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
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

          {/* Groups - Named categories */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={`w-full justify-between cursor-pointer h-10 text-sm ${
                  filters.groups.length > 0 ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : ''
                }`}
              >
                <span className="truncate">Groups {filters.groups.length > 0 && `(${filters.groups.length})`}</span>
                <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
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
            {[
              { id: "1", name: "NHS Contracts" },
              { id: "2", name: "Startup Funding & Grants" },
              { id: "3", name: "HealthTech Media Coverage" },
            ].map((group) => (
              <DropdownMenuCheckboxItem
                key={group.id}
                checked={filters.groups.includes(group.id)}
                onCheckedChange={(checked) => {
                  onFilterChange({
                    groups: checked ? [...filters.groups, group.id] : filters.groups.filter((g) => g !== group.id),
                  })
                }}
              >
                {group.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
          </DropdownMenu>

          {/* Sources Multi-select */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={`w-full justify-between cursor-pointer h-10 text-sm ${
                  filters.sources.length > 0 ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : ''
                }`}
              >
                <span className="truncate">Sources {filters.sources.length > 0 && `(${filters.sources.length})`}</span>
                <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
            <DropdownMenuCheckboxItem
              key="all-sources"
              checked={filters.sources.length === 0}
              onCheckedChange={(checked) => {
                if (checked) {
                  onFilterChange({ sources: [], groups: [] }) // Clear groups when manually clearing sources
                }
              }}
            >
              All Sources
            </DropdownMenuCheckboxItem>
            {(filterOptions.sources || []).map((source) => (
              <DropdownMenuCheckboxItem
                key={source}
                checked={filters.sources.includes(source)}
                onCheckedChange={(checked) => {
                  onFilterChange({
                    sources: checked ? [...filters.sources, source] : filters.sources.filter((s) => s !== source),
                    groups: [], // Clear groups when manually selecting sources
                  })
                }}
              >
                {source}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
          </DropdownMenu>

          {/* Tags Multi-select */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={`w-full justify-between cursor-pointer h-10 text-sm ${
                  filters.tagIds.length > 0 ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : ''
                }`}
              >
                <span className="truncate">Tags {filters.tagIds.length > 0 && `(${filters.tagIds.length})`}</span>
                <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* Untagged option */}
              <DropdownMenuCheckboxItem
                key="no-tags"
                checked={filters.tagIds.includes('NO_TAGS')}
                onCheckedChange={(checked) => {
                  onFilterChange({
                    tagIds: checked 
                      ? [...filters.tagIds, 'NO_TAGS'] 
                      : filters.tagIds.filter((id) => id !== 'NO_TAGS'),
                  })
                }}
              >
                <span className="inline-block w-3 h-3 rounded-full mr-2 border border-slate-300 bg-slate-100" />
                Untagged
              </DropdownMenuCheckboxItem>
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
        </div>
      </div>
    </div>
  )
}
