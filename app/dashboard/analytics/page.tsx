"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Eye, Users, MousePointer, TrendingUp, Calendar, ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getAnalytics } from "@/lib/analytics/actions"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user, timeRange])

  const loadAnalytics = async () => {
    if (!user) return

    setLoading(true)
    try {
      const data = await getAnalytics(user.id, timeRange)
      setAnalytics(data)
    } catch (error) {
      console.error("Failed to load analytics:", error)
    }
    setLoading(false)
  }

  const formatChartData = () => {
    if (!analytics?.dailyViews) return []

    const dailyData: { [key: string]: number } = {}

    analytics.dailyViews.forEach((view: any) => {
      const date = new Date(view.created_at).toLocaleDateString()
      dailyData[date] = (dailyData[date] || 0) + 1
    })

    return Object.entries(dailyData).map(([date, views]) => ({
      date,
      views,
    }))
  }

  const chartData = formatChartData()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
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
              <h1 className="text-xl font-semibold">Analytics</h1>
              <p className="text-sm text-muted-foreground">Track your portfolio performance</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={(value: "7d" | "30d" | "90d") => setTimeRange(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" asChild>
              <Link href={`/${user?.username}`} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Portfolio
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.totalViews || 0}</div>
              <p className="text-xs text-muted-foreground">All portfolio and project views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Views</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.portfolioViews || 0}</div>
              <p className="text-xs text-muted-foreground">Main portfolio page visits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Project Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.projectViews || 0}</div>
              <p className="text-xs text-muted-foreground">Individual project views</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contact Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.contactClicks || 0}</div>
              <p className="text-xs text-muted-foreground">Contact button interactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Views Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
            <CardDescription>Daily view count for the selected time period</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                views: {
                  label: "Views",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="views" stroke="var(--color-views)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Engagement Rate</span>
                <Badge variant="secondary">
                  {analytics?.totalViews > 0 ? Math.round((analytics.contactClicks / analytics.totalViews) * 100) : 0}%
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Avg. Daily Views</span>
                <Badge variant="outline">
                  {Math.round((analytics?.totalViews || 0) / (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90))}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Project vs Portfolio</span>
                <Badge variant="outline">
                  {analytics?.totalViews > 0 ? Math.round((analytics.projectViews / analytics.totalViews) * 100) : 0}%
                  projects
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Performance Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p className="font-medium">💡 Improve your portfolio:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Add more detailed case studies</li>
                  <li>• Include project outcomes and metrics</li>
                  <li>• Update your bio and skills regularly</li>
                  <li>• Share your portfolio on social media</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
