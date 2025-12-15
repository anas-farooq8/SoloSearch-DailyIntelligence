"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, ExternalLink, Download, Plus, ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react"
import type { Article, Tag, Filters } from "@/types/database"
import { exportToExcel } from "@/lib/export"

interface LeadsTableProps {
  articles: Article[]
  total: number
  page: number
  onPageChange: (page: number) => void
  loading: boolean
  tags: Tag[]
  onTagUpdate: (articleId: string, tagId: string, action: "add" | "remove") => void
  filters: Filters
  userId: string
}

function getScoreBand(score: number) {
  if (score >= 8) return { label: "Immediate outreach", emoji: "", color: "bg-red-100 text-red-800" }
  if (score >= 6) return { label: "High interest", emoji: "", color: "bg-green-100 text-green-800" }
  if (score >= 4) return { label: "Monitor", emoji: "", color: "bg-amber-100 text-amber-800" }
  return { label: "Low", emoji: "", color: "bg-slate-100 text-slate-800" }
}

export function LeadsTable({
  articles,
  total,
  page,
  onPageChange,
  loading,
  tags,
  onTagUpdate,
  filters,
  userId,
}: LeadsTableProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [sortBy, setSortBy] = useState<'score' | 'date' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const pageSize = 20
  const totalPages = Math.ceil(total / pageSize)

  const handleSort = (field: 'score' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortedArticles = [...articles].sort((a, b) => {
    if (!sortBy) return 0
    
    if (sortBy === 'score') {
      const diff = a.lead_score - b.lead_score
      return sortOrder === 'asc' ? diff : -diff
    } else if (sortBy === 'date') {
      const dateA = new Date(a.updated_at).getTime()
      const dateB = new Date(b.updated_at).getTime()
      const diff = dateA - dateB
      return sortOrder === 'asc' ? diff : -diff
    }
    return 0
  })

  const displayArticles = sortBy ? sortedArticles : articles

  const handleExport = async () => {
    await exportToExcel(articles, filters)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
        <p className="text-slate-600">No leads found matching your filters.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-b border-slate-200 gap-2 sm:gap-0">
        <p className="text-xs sm:text-sm text-slate-600">
          Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, total)} of {total} leads
        </p>
        <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm">
          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      <div className="overflow-x-auto -mx-px">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] min-w-[100px]">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('score')}
                  className="h-8 px-2 hover:bg-slate-100 cursor-pointer text-xs whitespace-nowrap"
                >
                  Score
                  {sortBy === 'score' ? (
                    sortOrder === 'asc' ? <ArrowUp className="ml-1 h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="w-[180px] min-w-[150px]">Company</TableHead>
              <TableHead className="w-[150px] min-w-[120px]">Group</TableHead>
              <TableHead className="min-w-[120px]">Sector</TableHead>
              <TableHead className="min-w-[120px]">Signals</TableHead>
              <TableHead className="min-w-[100px]">Amount</TableHead>
              <TableHead className="min-w-[100px]">Source</TableHead>
              <TableHead className="min-w-[140px]">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('date')}
                  className="h-8 px-2 hover:bg-slate-100 cursor-pointer text-xs whitespace-nowrap"
                >
                  Processed Date
                  {sortBy === 'date' ? (
                    sortOrder === 'asc' ? <ArrowUp className="ml-1 h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="min-w-[120px]">Tags</TableHead>
              <TableHead className="min-w-[120px]">Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayArticles.map((article) => {
              const band = getScoreBand(article.lead_score)
              const articleTags = article.tags || []

              return (
                <TableRow 
                  key={article.id} 
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <TableCell className="pl-4 sm:pl-5">
                    <Badge className={`${band.color} text-xs`}>
                      {article.lead_score}
                    </Badge>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1 leading-tight">{band.label}</p>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <p className="text-xs sm:text-sm text-slate-900 font-medium truncate" title={article.company}>
                      {article.company || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <p className="text-xs sm:text-sm text-slate-600 truncate" title={article.group_name}>
                      {article.group_name || "-"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(article.sector || []).slice(0, 2).map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px] sm:text-xs">
                          {s}
                        </Badge>
                      ))}
                      {(article.sector || []).length > 2 && (
                        <Badge variant="secondary" className="text-[10px] sm:text-xs">
                          +{article.sector.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(article.trigger_signal || []).slice(0, 2).map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px] sm:text-xs">
                          {t}
                        </Badge>
                      ))}
                      {(article.trigger_signal || []).length > 2 && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          +{article.trigger_signal.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs sm:text-sm text-slate-600">{article.amount || "-"}</p>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 text-xs sm:text-sm"
                    >
                      <span className="truncate">{article.source}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                      {new Date(article.updated_at).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap gap-1">
                      {articleTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          style={{ backgroundColor: tag.color, color: "#fff" }}
                          className="cursor-pointer text-[10px] sm:text-xs"
                          onClick={() => onTagUpdate(article.id, tag.id, "remove")}
                        >
                          {tag.name} ×
                        </Badge>
                      ))}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {tags
                            .filter((t) => !articleTags.some((at) => at.id === t.id))
                            .map((tag) => (
                              <DropdownMenuCheckboxItem
                                key={tag.id}
                                onCheckedChange={() => onTagUpdate(article.id, tag.id, "add")}
                              >
                                <span
                                  className="inline-block w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: tag.color }}
                                />
                                {tag.name}
                              </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                      {article.location_region && `${article.location_region}, `}
                      {article.location_country}
                    </p>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 border-t border-slate-200 gap-2 sm:gap-0">
        <p className="text-xs sm:text-sm text-slate-600">
          Page {page + 1} of {totalPages}
        </p>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(page - 1)} 
            disabled={page === 0}
            className="flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onPageChange(page + 1)} 
            disabled={page >= totalPages - 1}
            className="flex-1 sm:flex-none h-8 sm:h-9 text-xs sm:text-sm"
          >
            <span className="sm:hidden">Next</span>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 sm:ml-1" />
          </Button>
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <Dialog open onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="max-w-[1600px] w-[98vw] sm:w-[90vw] max-h-[90vh] sm:max-h-[95vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
              <div className="flex items-start gap-3">
                <DialogTitle className="text-base sm:text-xl md:text-2xl font-bold pr-2 sm:pr-6 text-slate-900 leading-tight flex-1">
                  {selectedArticle.title}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close"
                  onClick={() => setSelectedArticle(null)}
                  className="h-8 w-8 sm:h-9 sm:w-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 md:space-y-8 overflow-y-auto flex-1">
              {/* Company Details Card (moved to top) */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 md:p-5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 sm:mb-4 border-b pb-2">Company Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  {selectedArticle.company && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Company</h4>
                      <p className="text-sm sm:text-base text-slate-900 font-medium break-words">{selectedArticle.company}</p>
                    </div>
                  )}
                  {selectedArticle.group_name && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Group</h4>
                      <p className="text-sm sm:text-base text-slate-900 font-medium break-words">{selectedArticle.group_name}</p>
                    </div>
                  )}
                  {selectedArticle.buyer && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Buyer</h4>
                      <p className="text-sm sm:text-base text-slate-900 font-medium break-words">{selectedArticle.buyer}</p>
                    </div>
                  )}
                  {selectedArticle.amount && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Amount</h4>
                      <p className="text-sm sm:text-base text-slate-900 font-medium">{selectedArticle.amount}</p>
                    </div>
                  )}
                  {selectedArticle.solution && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Solution</h4>
                      <p className="text-sm sm:text-base text-slate-900 break-words">{selectedArticle.solution}</p>
                    </div>
                  )}
                  {(selectedArticle.location_region || selectedArticle.location_country) && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Location</h4>
                      <p className="text-sm sm:text-base text-slate-900">
                        {selectedArticle.location_region && `${selectedArticle.location_region}, `}
                        {selectedArticle.location_country}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Classification (moved up) */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 md:p-5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 sm:mb-4 border-b pb-2">Classification</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  {selectedArticle.sector && selectedArticle.sector.length > 0 && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-2 sm:mb-3">Sectors</h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {selectedArticle.sector.map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedArticle.trigger_signal && selectedArticle.trigger_signal.length > 0 && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-2 sm:mb-3">Trigger Signals</h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {selectedArticle.trigger_signal.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Score */}
              <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3">Lead Score</h3>
                <Badge className={`${getScoreBand(selectedArticle.lead_score).color} text-sm sm:text-base px-2 sm:px-3 py-1`}>
                  {selectedArticle.lead_score} - {getScoreBand(selectedArticle.lead_score).label}
                </Badge>
              </div>

              {/* Why This Matters */}
              {selectedArticle.why_this_matters && (
                <div className="bg-blue-50 p-3 sm:p-4 md:p-5 rounded-lg border border-blue-200">
                  <h3 className="text-sm sm:text-base font-bold text-blue-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <span className="text-lg sm:text-xl">💡</span> Why This Matters
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedArticle.why_this_matters}</p>
                </div>
              )}

              {/* Outreach Angle */}
              {selectedArticle.outreach_angle && (
                <div className="bg-green-50 p-3 sm:p-4 md:p-5 rounded-lg border border-green-200">
                  <h3 className="text-sm sm:text-base font-bold text-green-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <span className="text-lg sm:text-xl">🎯</span> Outreach Angle
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedArticle.outreach_angle}</p>
                </div>
              )}

              {/* Additional Details */}
              {selectedArticle.additional_details && (
                <div className="bg-purple-50 p-3 sm:p-4 md:p-5 rounded-lg border border-purple-200">
                  <h3 className="text-sm sm:text-base font-bold text-purple-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <span className="text-lg sm:text-xl">📋</span> Additional Details
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{selectedArticle.additional_details}</p>
                </div>
              )}

              {/* Source Information Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 md:p-5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 sm:mb-4 border-b pb-2">Source Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Source</h4>
                    <a
                      href={selectedArticle.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-2 text-sm sm:text-base font-medium break-all"
                    >
                      <span className="break-words">{selectedArticle.source}</span>
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    </a>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Processed Date</h4>
                    <p className="text-sm sm:text-base text-slate-900">
                      {new Date(selectedArticle.updated_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedArticle.date && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-600 mb-1 sm:mb-2">Publication Date</h4>
                      <p className="text-sm sm:text-base text-slate-900">
                        {new Date(selectedArticle.date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 md:p-5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 sm:mb-4 border-b pb-2">Tags</h3>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {(selectedArticle.tags || []).map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{ backgroundColor: tag.color, color: "#fff" }}
                      className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {(!selectedArticle.tags || selectedArticle.tags.length === 0) && (
                    <p className="text-xs sm:text-sm text-slate-500">No tags assigned</p>
                  )}
                </div>
              </div>
            </div>
            {/* close scroll container */}
          </div>

          {/* Action Buttons - Fixed at bottom */}
            <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-2 sm:gap-3 sticky bottom-0 z-20">
              <Button 
                variant="default"
                onClick={() => window.open(selectedArticle.url, '_blank')}
                className="flex-1 cursor-pointer h-10 sm:h-11 text-sm sm:text-base"
              >
                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                View Original Source
              </Button>
              <Button 
                variant="outline"
                onClick={() => setSelectedArticle(null)}
                className="cursor-pointer h-10 sm:h-11 px-6 sm:px-8 text-sm sm:text-base"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
