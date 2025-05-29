"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X, Plus, Save, Eye, Loader2, ImageIcon, Type, List, Quote } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createProject } from "@/lib/projects/actions"
import { uploadFile } from "@/lib/storage/client"

interface ContentBlock {
  id: string
  type: "text" | "image" | "list" | "quote"
  content: any
}

export default function NewProjectPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverImageUploading, setCoverImageUploading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverImage: "",
    status: "draft" as "draft" | "published",
    tags: [] as string[],
    tools: [] as string[],
    projectDate: "",
    client: "",
    projectUrl: "",
    githubUrl: "",
  })

  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      id: "1",
      type: "text",
      content: { text: "" },
    },
  ])

  const [newTag, setNewTag] = useState("")
  const [newTool, setNewTool] = useState("")

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const addTool = () => {
    if (newTool.trim() && !formData.tools.includes(newTool.trim())) {
      setFormData((prev) => ({
        ...prev,
        tools: [...prev.tools, newTool.trim()],
      }))
      setNewTool("")
    }
  }

  const removeTool = (tool: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.filter((t) => t !== tool),
    }))
  }

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCoverImageUploading(true)
    try {
      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.name}`
      const { url } = await uploadFile(file, "project-images", fileName)

      setFormData((prev) => ({
        ...prev,
        coverImage: url,
      }))
    } catch (error) {
      setError("Failed to upload cover image")
    }
    setCoverImageUploading(false)
  }

  const addContentBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content:
        type === "text"
          ? { text: "" }
          : type === "image"
            ? { url: "", caption: "" }
            : type === "list"
              ? { items: [""] }
              : { text: "", author: "" },
    }
    setContentBlocks((prev) => [...prev, newBlock])
  }

  const updateContentBlock = (id: string, content: any) => {
    setContentBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, content } : block)))
  }

  const removeContentBlock = (id: string) => {
    setContentBlocks((prev) => prev.filter((block) => block.id !== id))
  }

  const handleSubmit = async (status: "draft" | "published") => {
    setLoading(true)
    setError(null)

    try {
      await createProject({
        ...formData,
        status,
        content: { blocks: contentBlocks },
      })

      router.push("/dashboard")
    } catch (error) {
      setError("Failed to create project")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">New Project</h1>
              <p className="text-sm text-muted-foreground">Create a new case study</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={loading || !formData.title}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
            <Button onClick={() => handleSubmit("published")} disabled={loading || !formData.title}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
              Publish
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Basic information about your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="Enter project title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your project"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  {formData.coverImage ? (
                    <div className="relative">
                      <img
                        src={formData.coverImage || "/placeholder.svg"}
                        alt="Cover"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData((prev) => ({ ...prev, coverImage: "" }))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Upload a cover image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        className="hidden"
                        id="cover-upload"
                      />
                      <Button variant="outline" asChild disabled={coverImageUploading}>
                        <label htmlFor="cover-upload" className="cursor-pointer">
                          {coverImageUploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          Choose File
                        </label>
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Input
                    id="client"
                    placeholder="Client name (optional)"
                    value={formData.client}
                    onChange={(e) => setFormData((prev) => ({ ...prev, client: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDate">Project Date</Label>
                  <Input
                    id="projectDate"
                    type="date"
                    value={formData.projectDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, projectDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectUrl">Live URL</Label>
                  <Input
                    id="projectUrl"
                    placeholder="https://example.com"
                    value={formData.projectUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, projectUrl: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    placeholder="https://github.com/username/repo"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, githubUrl: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags and Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Tags & Tools</CardTitle>
              <CardDescription>Categorize your project and list the tools used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tools Used</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tools.map((tool) => (
                    <Badge key={tool} variant="outline" className="flex items-center gap-1">
                      {tool}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeTool(tool)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tool"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTool())}
                  />
                  <Button type="button" onClick={addTool}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Project Content</CardTitle>
              <CardDescription>Build your case study with rich content blocks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contentBlocks.map((block, index) => (
                <div key={block.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Select
                      value={block.type}
                      onValueChange={(type: ContentBlock["type"]) => {
                        const newContent =
                          type === "text"
                            ? { text: "" }
                            : type === "image"
                              ? { url: "", caption: "" }
                              : type === "list"
                                ? { items: [""] }
                                : { text: "", author: "" }
                        updateContentBlock(block.id, newContent)
                        setContentBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, type } : b)))
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="list">List</SelectItem>
                        <SelectItem value="quote">Quote</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeContentBlock(block.id)}
                      disabled={contentBlocks.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {block.type === "text" && (
                    <Textarea
                      placeholder="Enter your text content..."
                      value={block.content.text || ""}
                      onChange={(e) => updateContentBlock(block.id, { text: e.target.value })}
                      rows={4}
                    />
                  )}

                  {block.type === "image" && (
                    <div className="space-y-2">
                      <Input
                        placeholder="Image URL"
                        value={block.content.url || ""}
                        onChange={(e) =>
                          updateContentBlock(block.id, {
                            ...block.content,
                            url: e.target.value,
                          })
                        }
                      />
                      <Input
                        placeholder="Caption (optional)"
                        value={block.content.caption || ""}
                        onChange={(e) =>
                          updateContentBlock(block.id, {
                            ...block.content,
                            caption: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  {block.type === "list" && (
                    <div className="space-y-2">
                      {block.content.items?.map((item: string, itemIndex: number) => (
                        <div key={itemIndex} className="flex gap-2">
                          <Input
                            placeholder={`List item ${itemIndex + 1}`}
                            value={item}
                            onChange={(e) => {
                              const newItems = [...block.content.items]
                              newItems[itemIndex] = e.target.value
                              updateContentBlock(block.id, { items: newItems })
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = block.content.items.filter((_: any, i: number) => i !== itemIndex)
                              updateContentBlock(block.id, { items: newItems })
                            }}
                            disabled={block.content.items.length === 1}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newItems = [...(block.content.items || []), ""]
                          updateContentBlock(block.id, { items: newItems })
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  )}

                  {block.type === "quote" && (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Quote text"
                        value={block.content.text || ""}
                        onChange={(e) =>
                          updateContentBlock(block.id, {
                            ...block.content,
                            text: e.target.value,
                          })
                        }
                        rows={3}
                      />
                      <Input
                        placeholder="Author (optional)"
                        value={block.content.author || ""}
                        onChange={(e) =>
                          updateContentBlock(block.id, {
                            ...block.content,
                            author: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={() => addContentBlock("text")}>
                  <Type className="w-4 h-4 mr-2" />
                  Text
                </Button>
                <Button variant="outline" size="sm" onClick={() => addContentBlock("image")}>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image
                </Button>
                <Button variant="outline" size="sm" onClick={() => addContentBlock("list")}>
                  <List className="w-4 h-4 mr-2" />
                  List
                </Button>
                <Button variant="outline" size="sm" onClick={() => addContentBlock("quote")}>
                  <Quote className="w-4 h-4 mr-2" />
                  Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
