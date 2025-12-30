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
import { ChevronLeft, ChevronRight, ExternalLink, Download, Plus, ArrowUpDown, ArrowUp, ArrowDown, X, Loader2, MessageSquare } from "lucide-react"
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
  addingTagId: string | null
  removingTagId: string | null
  onNoteUpdate?: (articleId: string, note: any | null) => void
}

function getScoreBand(score: number) {
  if (score >= 8) return { label: "Immediate outreach", emoji: "", color: "bg-red-100 text-red-800" }
  if (score >= 6) return { label: "High interest", emoji: "", color: "bg-green-100 text-green-800" }
  if (score >= 4) return { label: "Monitor", emoji: "", color: "bg-amber-100 text-amber-800" }
  return { label: "Low", emoji: "", color: "bg-slate-100 text-slate-800" }
}

type SortField = 'score' | 'date' | 'company' | 'group' | 'location'

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
  addingTagId,
  removingTagId,
  onNoteUpdate,
}: LeadsTableProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [sortBy, setSortBy] = useState<SortField | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [hoveredArticleId, setHoveredArticleId] = useState<string | null>(null)
  const [noteContent, setNoteContent] = useState("")
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [isDeletingNote, setIsDeletingNote] = useState(false)
  const pageSize = 50
  const totalPages = Math.ceil(total / pageSize)

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const sortedArticles = [...articles].sort((a, b) => {
    if (!sortBy) return 0
    
    let diff = 0
    let aEmpty = false
    let bEmpty = false
    
    switch (sortBy) {
      case 'score':
        aEmpty = a.lead_score === null || a.lead_score === undefined
        bEmpty = b.lead_score === null || b.lead_score === undefined
        if (aEmpty && bEmpty) return 0
        if (aEmpty) return 1 // a goes to end
        if (bEmpty) return -1 // b goes to end
        diff = (a.lead_score || 0) - (b.lead_score || 0)
        break
      case 'date':
        aEmpty = !a.updated_at
        bEmpty = !b.updated_at
        if (aEmpty && bEmpty) return 0
        if (aEmpty) return 1
        if (bEmpty) return -1
        diff = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        break
      case 'company':
        aEmpty = !a.company || a.company.trim() === ''
        bEmpty = !b.company || b.company.trim() === ''
        if (aEmpty && bEmpty) return 0
        if (aEmpty) return 1
        if (bEmpty) return -1
        const companyA = (a.company || '').toLowerCase()
        const companyB = (b.company || '').toLowerCase()
        diff = companyA.localeCompare(companyB)
        break
      case 'group':
        aEmpty = !a.group_name || a.group_name.trim() === ''
        bEmpty = !b.group_name || b.group_name.trim() === ''
        if (aEmpty && bEmpty) return 0
        if (aEmpty) return 1
        if (bEmpty) return -1
        const groupA = (a.group_name || '').toLowerCase()
        const groupB = (b.group_name || '').toLowerCase()
        diff = groupA.localeCompare(groupB)
        break
      case 'location':
        const locationA = `${a.location_region || ''} ${a.location_country || ''}`.trim()
        const locationB = `${b.location_region || ''} ${b.location_country || ''}`.trim()
        aEmpty = locationA === ''
        bEmpty = locationB === ''
        if (aEmpty && bEmpty) return 0
        if (aEmpty) return 1
        if (bEmpty) return -1
        diff = locationA.toLowerCase().localeCompare(locationB.toLowerCase())
        break
    }
    
    return sortOrder === 'asc' ? diff : -diff
  })

  const displayArticles = sortBy ? sortedArticles : articles

  const handleExport = async () => {
    await exportToExcel(articles, filters)
  }

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article)
    setNoteContent(article.note?.content || "")
    setIsEditingNote(false)
  }

  const handleSaveNote = async () => {
    if (!selectedArticle || noteContent.trim().length === 0) return

    setIsSavingNote(true)
    try {
      const endpoint = "/api/dashboard/notes"
      let response

      if (selectedArticle.note) {
        // Update existing note
        response = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noteId: selectedArticle.note.id,
            content: noteContent.trim(),
          }),
        })
      } else {
        // Create new note
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleId: selectedArticle.id,
            content: noteContent.trim(),
          }),
        })
      }

      if (!response.ok) throw new Error("Failed to save note")

      const { note } = await response.json()
      
      // Update the article in the local state
      const updatedArticle = { ...selectedArticle, note }
      setSelectedArticle(updatedArticle)
      setIsEditingNote(false)

      // Update in parent context
      if (onNoteUpdate) {
        onNoteUpdate(selectedArticle.id, note)
      }
    } catch (error) {
      console.error("Error saving note:", error)
      alert("Failed to save note. Please try again.")
    } finally {
      setIsSavingNote(false)
    }
  }

  const handleDeleteNote = async () => {
    if (!selectedArticle?.note) return

    setIsDeletingNote(true)
    try {
      const response = await fetch(`/api/dashboard/notes?noteId=${selectedArticle.note.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete note")

      // Update the article in the local state
      const updatedArticle = { ...selectedArticle, note: null }
      setSelectedArticle(updatedArticle)
      setNoteContent("")
      setIsEditingNote(false)

      // Update in parent context
      if (onNoteUpdate) {
        onNoteUpdate(selectedArticle.id, null)
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      alert("Failed to delete note. Please try again.")
    } finally {
      setIsDeletingNote(false)
    }
  }

  const handleStartEdit = () => {
    setIsEditingNote(true)
  }

  const handleCancelEdit = () => {
    setNoteContent(selectedArticle?.note?.content || "")
    setIsEditingNote(false)
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-3 py-3 sm:py-4 border-b border-slate-200 gap-2 sm:gap-0">
        <p className="text-xs sm:text-sm text-slate-600">
          Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, total)} of {total} leads
        </p>
        <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm">
          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* Table with horizontal scroll */}
      <div className="overflow-x-auto -mx-px">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[85px] min-w-[85px] pl-4">
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
              <TableHead className="w-[145px] min-w-[125px] px-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('company')}
                  className="h-8 px-2 hover:bg-slate-100 cursor-pointer text-xs whitespace-nowrap"
                >
                  Company
                  {sortBy === 'company' ? (
                    sortOrder === 'asc' ? <ArrowUp className="ml-1 h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="w-[125px] min-w-[105px] px-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('group')}
                  className="h-8 px-2 hover:bg-slate-100 cursor-pointer text-xs whitespace-nowrap"
                >
                  Group
                  {sortBy === 'group' ? (
                    sortOrder === 'asc' ? <ArrowUp className="ml-1 h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="w-[115px] min-w-[100px] px-3">Sector</TableHead>
              <TableHead className="w-[115px] min-w-[100px] px-3">Signals</TableHead>
              <TableHead className="w-[105px] min-w-[90px] px-3">Amount</TableHead>
              <TableHead className="w-[105px] min-w-[90px] px-3">Source</TableHead>
              <TableHead className="w-[115px] min-w-[100px] px-3">
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
              <TableHead className="w-[125px] min-w-[105px] px-3">Tags</TableHead>
              <TableHead className="w-[115px] min-w-[100px] px-3 pr-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('location')}
                  className="h-8 px-2 hover:bg-slate-100 cursor-pointer text-xs whitespace-nowrap"
                >
                  Location
                  {sortBy === 'location' ? (
                    sortOrder === 'asc' ? <ArrowUp className="ml-1 h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <ArrowUpDown className="ml-1 h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
                  )}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayArticles.map((article) => {
              const band = getScoreBand(article.lead_score)
              const articleTags = article.tags || []

              const hasNote = !!article.note
              const isHovered = hoveredArticleId === article.id

              return (
                <TableRow 
                  key={article.id} 
                  className={`cursor-pointer ${
                    hasNote 
                      ? 'bg-amber-50 hover:bg-amber-100' 
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => handleOpenArticle(article)}
                  onMouseEnter={() => hasNote && setHoveredArticleId(article.id)}
                  onMouseLeave={() => setHoveredArticleId(null)}
                >
                  <TableCell className="pl-5">
                    <Badge className={`${band.color} text-xs`}>
                      {article.lead_score}
                    </Badge>
                    <p className="text-[10px] sm:text-xs text-slate-500 mt-1 leading-tight">{band.label}</p>
                  </TableCell>
                  <TableCell className="max-w-[145px] px-3">
                    <p className="text-xs sm:text-sm text-slate-900 font-medium truncate" title={article.company}>
                      {article.company || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-[125px] px-3">
                    <p className="text-xs sm:text-sm text-slate-600 truncate" title={article.group_name}>
                      {article.group_name || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="px-3">
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
                  <TableCell className="px-3">
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
                  <TableCell className="px-3">
                    <p className="text-xs sm:text-sm text-slate-600">{article.amount || "-"}</p>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} className="px-3">
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
                  <TableCell className="px-3">
                    <p className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                      {new Date(article.updated_at).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()} className="px-3">
                    <div className="flex flex-wrap gap-1">
                      {articleTags.map((tag) => {
                        const isRemoving = removingTagId === `${article.id}:${tag.id}`
                        return (
                          <Badge
                            key={tag.id}
                            style={{ backgroundColor: tag.color, color: "#fff" }}
                            className={`text-[10px] sm:text-xs ${
                              isRemoving ? "opacity-50 cursor-wait" : "cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!isRemoving) {
                                onTagUpdate(article.id, tag.id, "remove")
                              }
                            }}
                          >
                            {isRemoving ? (
                              <span className="flex items-center gap-1">
                                <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" />
                                {tag.name}
                              </span>
                            ) : (
                              `${tag.name} ×`
                            )}
                          </Badge>
                        )
                      })}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            disabled={
                              (addingTagId !== null && addingTagId.startsWith(`${article.id}:`)) ||
                              (removingTagId !== null && removingTagId.startsWith(`${article.id}:`))
                            }
                          >
                            {(addingTagId !== null && addingTagId.startsWith(`${article.id}:`)) ||
                            (removingTagId !== null && removingTagId.startsWith(`${article.id}:`)) ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {tags
                            .filter((t) => !articleTags.some((at) => at.id === t.id))
                            .map((tag) => {
                              const isAdding = addingTagId === `${article.id}:${tag.id}`
                              const isAnyOperationInProgress = 
                                (addingTagId !== null && addingTagId.startsWith(`${article.id}:`)) ||
                                (removingTagId !== null && removingTagId.startsWith(`${article.id}:`))
                              return (
                                <DropdownMenuCheckboxItem
                                  key={tag.id}
                                  onCheckedChange={() => {
                                    if (!isAdding && !isAnyOperationInProgress) {
                                      onTagUpdate(article.id, tag.id, "add")
                                    }
                                  }}
                                  disabled={isAdding || isAnyOperationInProgress}
                                >
                                  <span
                                    className="inline-block w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  {isAdding ? (
                                    <span className="flex items-center gap-2">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      {tag.name}
                                    </span>
                                  ) : (
                                    tag.name
                                  )}
                                </DropdownMenuCheckboxItem>
                              )
                            })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 pr-3">
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
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 sm:px-3 py-3 sm:py-4 border-t border-slate-200 gap-2 sm:gap-0">
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

      {/* Note Hover Tooltip - Right side */}
      {hoveredArticleId && (() => {
        const article = displayArticles.find(a => a.id === hoveredArticleId)
        if (!article?.note) return null
        
        return (
          <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[9999] w-80 p-4 bg-white border-2 border-amber-400 rounded-lg shadow-2xl pointer-events-none">
            <div className="flex items-start gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="font-bold text-slate-900 text-sm">Notes</p>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {article.note.content}
            </p>
            <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-200">
              Updated: {new Date(article.note.updated_at).toLocaleString()}
            </p>
          </div>
        )
      })()}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <Dialog open onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="max-w-[98vw] sm:max-w-none lg:max-w-3xl xl:max-w-4xl 2xl:max-w-[1100px] w-[94vw] sm:w-[90vw] lg:w-[85vw] max-h-[90vh] sm:max-h-[95vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="px-4 sm:px-6 md:px-8 pt-3 sm:pt-5 pb-1.5 sm:pb-2.5 border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <DialogTitle className="text-base sm:text-xl md:text-2xl font-bold pr-2 sm:pr-5 text-slate-900 leading-tight flex-1">
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
              <div className="px-4 sm:px-6 md:px-8 pt-2 sm:pt-3 pb-3 sm:pb-4 space-y-2.5 sm:space-y-3 md:space-y-4 overflow-y-auto flex-1">
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

              {/* Notes Section - Redesigned */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-4 sm:p-5 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 rounded-lg p-2.5">
                      <MessageSquare className="h-5 w-5 text-amber-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Notes</h3>
                  </div>
                  {!isEditingNote && selectedArticle.note && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleStartEdit}
                        disabled={isSavingNote || isDeletingNote}
                        className="text-xs h-8"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteNote}
                        disabled={isSavingNote || isDeletingNote}
                        className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {isDeletingNote ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                {isEditingNote || !selectedArticle.note ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Type your notes here..."
                        className="w-full min-h-[120px] p-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-y bg-slate-50"
                        disabled={isSavingNote}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSaveNote}
                        disabled={isSavingNote || noteContent.trim().length === 0}
                        className="text-sm h-9 px-6 bg-amber-600 hover:bg-amber-700"
                      >
                        {isSavingNote ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save"
                        )}
                      </Button>
                      {isEditingNote && selectedArticle.note && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={isSavingNote}
                          className="text-sm h-9 px-6"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {selectedArticle.note.content}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      Updated {new Date(selectedArticle.note.updated_at).toLocaleString()}
                    </p>
                  </div>
                )}
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
