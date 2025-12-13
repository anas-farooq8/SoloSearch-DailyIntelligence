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
import { ChevronLeft, ChevronRight, ExternalLink, Download, Plus } from "lucide-react"
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
  if (score >= 8) return { label: "Immediate outreach", emoji: "🔥", color: "bg-red-100 text-red-800" }
  if (score >= 6) return { label: "High interest", emoji: "✅", color: "bg-green-100 text-green-800" }
  if (score >= 4) return { label: "Monitor", emoji: "👀", color: "bg-amber-100 text-amber-800" }
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
  const pageSize = 20
  const totalPages = Math.ceil(total / pageSize)

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
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <p className="text-sm text-slate-600">
          Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, total)} of {total} leads
        </p>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Score</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Signals</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Processed Date</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => {
              const band = getScoreBand(article.lead_score)
              const articleTags = article.tags || []

              return (
                <TableRow 
                  key={article.id} 
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <TableCell>
                    <Badge className={band.color}>
                      {band.emoji} {article.lead_score}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">{band.label}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(article.sector || []).slice(0, 2).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                      {(article.sector || []).length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{article.sector.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(article.trigger_signal || []).slice(0, 2).map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                      {(article.trigger_signal || []).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{article.trigger_signal.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-600">{article.amount || "-"}</p>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                    >
                      {article.source}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-600">
                      {new Date(article.updated_at).toLocaleDateString()}
                    </p>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-wrap gap-1">
                      {articleTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          style={{ backgroundColor: tag.color, color: "#fff" }}
                          className="cursor-pointer"
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
                    <p className="text-sm text-slate-600">
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
      <div className="flex items-center justify-between p-4 border-t border-slate-200">
        <p className="text-sm text-slate-600">
          Page {page + 1} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 0}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <Dialog open onOpenChange={() => setSelectedArticle(null)}>
          <DialogContent className="max-w-[95vw] max-h-[85vh] overflow-hidden flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
              <DialogTitle className="text-xl pr-8">{selectedArticle.title}</DialogTitle>
            </DialogHeader>

            <div className="px-6 py-4 space-y-6 overflow-y-auto flex-1">
              {/* Lead Score */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Lead Score</h3>
                <Badge className={getScoreBand(selectedArticle.lead_score).color}>
                  {getScoreBand(selectedArticle.lead_score).emoji} {selectedArticle.lead_score} - {getScoreBand(selectedArticle.lead_score).label}
                </Badge>
              </div>

              {/* AI Summary */}
              {selectedArticle.ai_summary && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">AI Summary</h3>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedArticle.ai_summary}</p>
                </div>
              )}

              {/* Company & Buyer */}
              <div className="grid grid-cols-2 gap-4">
                {selectedArticle.company && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">Company</h3>
                    <p className="text-sm text-slate-900">{selectedArticle.company}</p>
                  </div>
                )}
                {selectedArticle.buyer && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">Buyer</h3>
                    <p className="text-sm text-slate-900">{selectedArticle.buyer}</p>
                  </div>
                )}
              </div>

              {/* Sector & Signals */}
              <div className="grid grid-cols-2 gap-4">
                {selectedArticle.sector && selectedArticle.sector.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Sectors</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedArticle.sector.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedArticle.trigger_signal && selectedArticle.trigger_signal.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Trigger Signals</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedArticle.trigger_signal.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Amount & Solution */}
              <div className="grid grid-cols-2 gap-4">
                {selectedArticle.amount && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">Amount</h3>
                    <p className="text-sm text-slate-900">{selectedArticle.amount}</p>
                  </div>
                )}
                {selectedArticle.solution && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">Solution</h3>
                    <p className="text-sm text-slate-900">{selectedArticle.solution}</p>
                  </div>
                )}
              </div>

              {/* Location */}
              {(selectedArticle.location_region || selectedArticle.location_country) && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Location</h3>
                  <p className="text-sm text-slate-900">
                    {selectedArticle.location_region && `${selectedArticle.location_region}, `}
                    {selectedArticle.location_country}
                  </p>
                </div>
              )}

              {/* Source & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Source</h3>
                  <a
                    href={selectedArticle.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                  >
                    {selectedArticle.source}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Processed Date</h3>
                  <p className="text-sm text-slate-900">
                    {new Date(selectedArticle.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedArticle.date && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Original Publication Date</h3>
                  <p className="text-sm text-slate-900">
                    {new Date(selectedArticle.date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Tags */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {(selectedArticle.tags || []).map((tag) => (
                    <Badge
                      key={tag.id}
                      style={{ backgroundColor: tag.color, color: "#fff" }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {(!selectedArticle.tags || selectedArticle.tags.length === 0) && (
                    <p className="text-sm text-slate-500">No tags</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="default"
                  onClick={() => window.open(selectedArticle.url, '_blank')}
                  className="flex-1 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Original Source
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedArticle(null)}
                  className="cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
