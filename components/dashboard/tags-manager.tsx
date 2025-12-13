"use client"

import { useState } from "react"
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
  "#EAB308", // Yellow
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#6B7280", // Gray
]

export function TagsManager({ tags, onClose, onUpdate }: TagsManagerProps) {
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState(colorOptions[0])
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    setLoading(true)

    try {
      await fetch("/api/dashboard/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTagName.trim(),
          color: newTagColor,
        }),
      })

      setNewTagName("")
      setNewTagColor(colorOptions[0])
      onUpdate()
    } catch (error) {
      console.error("Error creating tag:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag) return
    setLoading(true)

    try {
      await fetch("/api/dashboard/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTag.id,
          name: editingTag.name,
          color: editingTag.color,
        }),
      })

      setEditingTag(null)
      onUpdate()
    } catch (error) {
      console.error("Error updating tag:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    setLoading(true)
    
    try {
      await fetch(`/api/dashboard/tags?id=${tagId}`, {
        method: "DELETE",
      })
      
      onUpdate()
    } catch (error) {
      console.error("Error deleting tag:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new tag */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
            <Label>Create New Tag</Label>
            <div className="flex gap-2">
              <Input placeholder="Tag name" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
              <Button onClick={handleCreateTag} disabled={loading || !newTagName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 ${
                    newTagColor === color ? "border-slate-900" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewTagColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Existing tags */}
          <div className="space-y-2">
            <Label>Existing Tags</Label>
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded"
              >
                {editingTag?.id === tag.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editingTag.name}
                      onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                      className="h-8"
                    />
                    <div className="flex gap-1">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          className={`w-5 h-5 rounded-full border ${
                            editingTag.color === color ? "border-slate-900" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setEditingTag({ ...editingTag, color })}
                        />
                      ))}
                    </div>
                    <Button size="sm" onClick={handleUpdateTag} disabled={loading}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingTag(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span className="font-medium">{tag.name}</span>
                      {tag.is_default && <span className="text-xs text-slate-500">(default)</span>}
                    </div>
                    {!tag.is_default && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditingTag(tag)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteTag(tag.id)} disabled={loading}>
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
      </DialogContent>
    </Dialog>
  )
}
