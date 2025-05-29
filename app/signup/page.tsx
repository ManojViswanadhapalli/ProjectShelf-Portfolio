"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Palette, Github, Mail, Eye, EyeOff, Check, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { signUp, signInWithProvider, checkUsernameAvailability } from "@/lib/auth/actions"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean
    message: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  })

  const router = useRouter()

  // Debounced username check
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length >= 3) {
        setUsernameChecking(true)
        try {
          const result = await checkUsernameAvailability(formData.username)
          setUsernameStatus(result)
        } catch (error) {
          setUsernameStatus({ available: false, message: "Error checking username" })
        }
        setUsernameChecking(false)
      } else {
        setUsernameStatus(null)
      }
    }

    const timeoutId = setTimeout(checkUsername, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        username: formData.username,
        full_name: formData.name,
      })

      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(result.message || "Account created successfully!")

        if (result.shouldRedirect) {
          // Auto-signed in, redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard")
          }, 1500)
        } else {
          // Need to sign in manually, redirect to login
          setTimeout(() => {
            router.push("/login")
          }, 1500)
        }
      }
    } catch (error) {
      setError("An unexpected error occurred")
    }

    setLoading(false)
  }

  const handleSocialSignIn = async (provider: "github" | "google") => {
    setSocialLoading(provider)
    try {
      const result = await signInWithProvider(provider)
      if (result?.error) {
        setError(result.error)
      }
    } catch (error) {
      setError("Failed to sign in with " + provider)
    }
    setSocialLoading(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ProjectShelf</span>
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-muted-foreground">Start building your creative portfolio today</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center">Sign up</CardTitle>
            <CardDescription className="text-center">Choose your preferred sign up method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alerts */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => handleSocialSignIn("github")}
                disabled={socialLoading === "github" || loading}
              >
                {socialLoading === "github" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                GitHub
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialSignIn("google")}
                disabled={socialLoading === "google" || loading}
              >
                {socialLoading === "google" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    required
                    disabled={loading}
                    className={usernameStatus ? (usernameStatus.available ? "border-green-500" : "border-red-500") : ""}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                    {usernameChecking && <Loader2 className="h-4 w-4 animate-spin" />}
                    {usernameStatus &&
                      !usernameChecking &&
                      (usernameStatus.available ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      ))}
                  </div>
                </div>
                {formData.username && (
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      projectshelf.com/{formData.username || "username"}
                    </Badge>
                    {usernameStatus && (
                      <span className={`text-xs ${usernameStatus.available ? "text-green-600" : "text-red-600"}`}>
                        {usernameStatus.message}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">This will be your public portfolio URL</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !usernameStatus?.available}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
