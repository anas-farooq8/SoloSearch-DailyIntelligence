"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, Edit2, Plus, X, Loader2 } from "lucide-react"
import type { Tag } from "@/types/database"

interface TagsManagerProps {
  tags: Tag[]
  onClose: () => void
  onTagsChange: (updatedTags: Tag[]) => void
}

const colorOptions = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#EAB308", // Yellow
  "#84CC16", // Lime
  "#22C55E", // Green
  "#10B981", // Emerald
  "#14B8A6", // Teal
  "#06B6D4", // Cyan
  "#0EA5E9", // Sky
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#A855F7", // Violet
  "#D946EF", // Fuchsia
  "#EC4899", // Pink
  "#F43F5E", // Rose
  "#6B7280", // Gray
  "#78716C", // Stone
  "#57534E", // Warm Gray
]

export function TagsManager({ tags, onClose, onTagsChange }: TagsManagerProps) {
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(colorOptions[0])
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [creatingTag, setCreatingTag] = useState(false)
  const [updatingTagId, setUpdatingTagId] = useState<string | null>(null)
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null)
  const [localTags, setLocalTags] = useState<Tag[]>(tags)

  const handleCreateTag = async () => {
    if (!newTagName.trim() || creatingTag) return
    setCreatingTag(true)

    try {
      const response = await fetch("/api/dashboard/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      })

      if (!response.ok) throw new Error("Failed to create tag")
      
      const newTag = await response.json()
      
      // Update local state
      const updatedTags = [...localTags, newTag]
      setLocalTags(updatedTags)
      setNewTagName("")
      setNewTagColor(colorOptions[0])
      
      // Update parent component's state immediately
      onTagsChange(updatedTags)
    } catch (error) {
      console.error("Error creating tag:", error)
      alert("Failed to create tag. Please try again.")
    } finally {
      setCreatingTag(false)
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag) return
    setUpdatingTagId(editingTag.id)

    try {
      const response = await fetch("/api/dashboard/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTag.id,
          name: editingTag.name,
          color: editingTag.color,
        }),
      })

      if (!response.ok) throw new Error("Failed to update tag")

      // Update local state
      const updatedTags = localTags.map(t => t.id === editingTag.id ? editingTag : t)
      setLocalTags(updatedTags)
      setEditingTag(null)
      
      // Update parent component's state immediately
      onTagsChange(updatedTags)
    } catch (error) {
      console.error("Error updating tag:", error)
      alert("Failed to update tag. Please try again.")
    } finally {
      setUpdatingTagId(null)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    setDeletingTagId(tagId)

    try {
      const response = await fetch(`/api/dashboard/tags?id=${tagId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete tag")

      // Update local state
      const updatedTags = localTags.filter(t => t.id !== tagId)
      setLocalTags(updatedTags)
      
      // Update parent component's state immediately
      onTagsChange(updatedTags)
    } catch (error) {
      console.error("Error deleting tag:", error)
      alert("Failed to delete tag. Please try again.")
    } finally {
      setDeletingTagId(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !creatingTag) {
      handleCreateTag()
    }
  }

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editingTag && updatingTagId === null) {
      handleUpdateTag()
    }
  }

  const handleClose = () => {
    // Just close - no need to refetch since we updated state in real-time
    onClose()
  }

  return (
    <Dialog open onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Manage Tags</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Create new tag */}
          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-slate-50 rounded-lg">
            <Label className="text-sm sm:text-base">Create New Tag</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="Tag name" 
                value={newTagName} 
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={creatingTag}
                className="h-9 sm:h-10 text-sm sm:text-base"
              />
              <Button 
                onClick={handleCreateTag} 
                disabled={!newTagName.trim() || creatingTag} 
                className="cursor-pointer h-9 sm:h-10 px-3 sm:px-4"
              >
                {creatingTag ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-2">Select a color:</p>
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 sm:gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 cursor-pointer transition-all hover:scale-110 ${
                      newTagColor === color ? "border-slate-900 ring-2 ring-slate-900 ring-offset-2" : "border-slate-300 hover:border-slate-500"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Existing tags */}
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Existing Tags</Label>
            <div className="space-y-2 max-h-72 sm:max-h-96 overflow-y-auto">
              {localTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-start justify-between p-2.5 sm:p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  {editingTag?.id === tag.id ? (
                    <div className="flex-1 space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingTag.name}
                          onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                          onKeyPress={handleEditKeyPress}
                          className="h-8 sm:h-9 flex-1 text-sm sm:text-base"
                          autoFocus
                          disabled={updatingTagId === tag.id}
                        />
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={handleUpdateTag} 
                            disabled={updatingTagId === tag.id}
                            className="cursor-pointer h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3"
                          >
                            {updatingTagId === tag.id ? (
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                            ) : (
                              "Save"
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setEditingTag(null)} 
                            className="cursor-pointer h-8 sm:h-9 px-2"
                            disabled={updatingTagId === tag.id}
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-slate-600 mb-2">Select a color:</p>
                        <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 sm:gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border cursor-pointer transition-all hover:scale-110 ${
                                editingTag.color === color ? "border-slate-900 ring-2 ring-slate-900 ring-offset-1" : "border-slate-300 hover:border-slate-500"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setEditingTag({ ...editingTag, color })}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-slate-200 flex-shrink-0" style={{ backgroundColor: tag.color }} />
                        <div className="min-w-0">
                          <span className="font-medium text-slate-900 text-sm sm:text-base break-words">{tag.name}</span>
                          {tag.is_default && <span className="text-xs text-slate-500 ml-2">(default)</span>}
                        </div>
                      </div>
                      {!tag.is_default && (
                        <div className="flex gap-1 flex-shrink-0">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setEditingTag(tag)} 
                            className="cursor-pointer h-8 w-8 p-0"
                            disabled={deletingTagId === tag.id || updatingTagId !== null}
                          >
                            <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteTag(tag.id)} 
                            className="cursor-pointer h-8 w-8 p-0"
                            disabled={deletingTagId !== null || updatingTagId !== null}
                          >
                            {deletingTagId === tag.id ? (
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
