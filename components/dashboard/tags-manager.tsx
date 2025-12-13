"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Trash2, Edit2, Plus, X } from "lucide-react"
import type { Tag } from "@/types/database"

interface TagsManagerProps {
  tags: Tag[]
  onClose: () => void
  onUpdate: () => void
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

export function TagsManager({ tags, onClose, onUpdate }: TagsManagerProps) {
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(colorOptions[0])
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [loading, setLoading] = useState(false)
  const [optimisticTags, setOptimisticTags] = useState<Tag[]>(tags)

  // Sync with props when tags change from server
  useEffect(() => {
    setOptimisticTags(tags)
  }, [tags])

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    
    // Optimistic update - add tag immediately
    const tempId = `temp-${Date.now()}`
    const newTag: Tag = {
      id: tempId,
      name: newTagName.trim(),
      color: newTagColor,
      is_default: false,
    }
    setOptimisticTags([...optimisticTags, newTag])
    
    const tagName = newTagName.trim()
    const tagColor = newTagColor
    setNewTagName("")
    setNewTagColor(colorOptions[0])

    try {
      const response = await fetch("/api/dashboard/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tagName,
          color: tagColor,
        }),
      })
      
      if (!response.ok) throw new Error("Failed to create tag")
      
      // Background update - will sync via useEffect
      onUpdate()
    } catch (error) {
      console.error("Error creating tag:", error)
      // Rollback on error
      setOptimisticTags(optimisticTags.filter(t => t.id !== tempId))
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag) return
    
    // Don't allow updating temporary tags
    if (editingTag.id.startsWith('temp-')) {
      return
    }
    
    // Optimistic update - update tag immediately
    const oldTags = [...optimisticTags]
    setOptimisticTags(optimisticTags.map(t => 
      t.id === editingTag.id ? editingTag : t
    ))
    
    const tagToUpdate = { ...editingTag }
    setEditingTag(null)

    try {
      const response = await fetch("/api/dashboard/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tagToUpdate.id,
          name: tagToUpdate.name,
          color: tagToUpdate.color,
        }),
      })
      
      if (!response.ok) throw new Error("Failed to update tag")
      
      // Background update
      onUpdate()
    } catch (error) {
      console.error("Error updating tag:", error)
      // Rollback on error
      setOptimisticTags(oldTags)
      setEditingTag(tagToUpdate)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    // Don't allow deleting temporary tags
    if (tagId.startsWith('temp-')) {
      return
    }
    
    // Optimistic update - remove tag immediately
    const oldTags = [...optimisticTags]
    setOptimisticTags(optimisticTags.filter(t => t.id !== tagId))
    
    try {
      const response = await fetch(`/api/dashboard/tags?id=${tagId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) throw new Error("Failed to delete tag")
      
      // Background update
      onUpdate()
    } catch (error) {
      console.error("Error deleting tag:", error)
      // Rollback on error
      setOptimisticTags(oldTags)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new tag */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
            <Label>Create New Tag</Label>
            <div className="flex gap-2">
              <Input placeholder="Tag name" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
              <Button onClick={handleCreateTag} disabled={!newTagName.trim()} className="cursor-pointer">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <p className="text-xs text-slate-600 mb-2">Select a color:</p>
              <div className="grid grid-cols-10 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all hover:scale-110 ${
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
            <Label>Existing Tags</Label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {optimisticTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-start justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  {editingTag?.id === tag.id ? (
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingTag.name}
                          onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                          className="h-8 flex-1"
                        />
                        <div className="flex gap-1">
                          <Button size="sm" onClick={handleUpdateTag} className="cursor-pointer">
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingTag(null)} className="cursor-pointer">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-2">Select a color:</p>
                        <div className="grid grid-cols-10 gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              className={`w-7 h-7 rounded-full border cursor-pointer transition-all hover:scale-110 ${
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
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full border border-slate-200" style={{ backgroundColor: tag.color }} />
                        <div>
                          <span className="font-medium text-slate-900">{tag.name}</span>
                          {tag.is_default && <span className="text-xs text-slate-500 ml-2">(default)</span>}
                          {tag.id.startsWith('temp-') && <span className="text-xs text-slate-400 ml-2">(saving...)</span>}
                        </div>
                      </div>
                      {!tag.is_default && !tag.id.startsWith('temp-') && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setEditingTag(tag)} className="cursor-pointer">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteTag(tag.id)} className="cursor-pointer">
                            <Trash2 className="h-4 w-4 text-red-500" />
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
