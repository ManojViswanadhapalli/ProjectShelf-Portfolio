"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Upload, Save, Loader2, User, Palette, Globe, Shield, Check } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { uploadFile } from "@/lib/storage/client"

const themes = [
  { id: "default", name: "Default", description: "Clean and minimal design" },
  { id: "modern", name: "Modern", description: "Bold typography and gradients" },
  { id: "creative", name: "Creative", description: "Artistic and colorful layout" },
  { id: "professional", name: "Professional", description: "Corporate and structured" },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    title: "",
    location: "",
    website: "",
    social_github: "",
    social_linkedin: "",
    social_twitter: "",
    theme: "default",
    is_public: true,
    avatar_url: "",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        bio: user.bio || "",
        title: user.title || "",
        location: user.location || "",
        website: user.website || "",
        social_github: user.social_github || "",
        social_linkedin: user.social_linkedin || "",
        social_twitter: user.social_twitter || "",
        theme: user.theme || "default",
        is_public: user.is_public ?? true,
        avatar_url: user.avatar_url || "",
      })
    }
  }, [user])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setAvatarUploading(true)
    try {
      const timestamp = Date.now()
      const fileName = `${user.id}-${timestamp}-${file.name}`
      const { url } = await uploadFile(file, "avatars", fileName)

      setFormData((prev) => ({
        ...prev,
        avatar_url: url,
      }))
    } catch (error) {
      setError("Failed to upload avatar")
    }
    setAvatarUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("users").update(formData).eq("id", user.id)

      if (error) {
        throw new Error(error.message)
      }

      setSuccess("Settings updated successfully!")
    } catch (error) {
      setError("Failed to update settings")
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
              <h1 className="text-xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {success && (
          <Alert className="mb-6">
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={formData.avatar_url || "/placeholder.svg"} alt="Profile" />
                    <AvatarFallback className="text-lg">
                      {formData.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Button variant="outline" asChild disabled={avatarUploading}>
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        {avatarUploading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Upload New
                      </label>
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max size 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Senior Product Designer"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell visitors about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    value={formData.website}
                    onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Social Links
              </CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="social_github">GitHub Username</Label>
                <Input
                  id="social_github"
                  placeholder="username"
                  value={formData.social_github}
                  onChange={(e) => setFormData((prev) => ({ ...prev, social_github: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_linkedin">LinkedIn Username</Label>
                <Input
                  id="social_linkedin"
                  placeholder="username"
                  value={formData.social_linkedin}
                  onChange={(e) => setFormData((prev) => ({ ...prev, social_linkedin: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_twitter">Twitter Username</Label>
                <Input
                  id="social_twitter"
                  placeholder="username"
                  value={formData.social_twitter}
                  onChange={(e) => setFormData((prev) => ({ ...prev, social_twitter: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Portfolio Theme
              </CardTitle>
              <CardDescription>Choose how your portfolio looks to visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.theme === theme.id
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, theme: theme.id }))}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{theme.name}</h3>
                      {formData.theme === theme.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control who can see your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Portfolio</Label>
                  <p className="text-sm text-muted-foreground">Make your portfolio visible to everyone</p>
                </div>
                <Switch
                  checked={formData.is_public}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_public: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
