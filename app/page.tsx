import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Palette, BarChart3, Globe, Zap, Users, Star, ExternalLink } from "lucide-react"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"

async function getFeaturedPortfolios() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: portfolios, error } = await supabase
      .from("users")
      .select("username, full_name, title, avatar_url")
      .eq("is_public", true)
      .limit(6)

    if (error) {
      console.log("Error fetching featured portfolios:", error)
      return []
    }

    return portfolios || []
  } catch (error) {
    console.log("Failed to fetch featured portfolios:", error)
    return []
  }
}

export default async function HomePage() {
  const featuredPortfolios = await getFeaturedPortfolios()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ProjectShelf</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#examples" className="text-muted-foreground hover:text-foreground transition-colors">
              Examples
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          ✨ Now in Beta
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Build Your Creative Portfolio
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Create stunning, personalized portfolios with detailed case studies. Perfect for designers, developers, and
          writers who want to showcase their work professionally.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/signup">
              Start Building <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#examples">View Examples</Link>
          </Button>
        </div>
      </section>

      {/* Featured Portfolios Section */}
      {featuredPortfolios.length > 0 && (
        <section id="examples" className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Portfolios</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover amazing portfolios created by our community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredPortfolios.map((portfolio) => (
              <Card key={portfolio.username} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {portfolio.avatar_url ? (
                      <img
                        src={portfolio.avatar_url || "/placeholder.svg"}
                        alt={portfolio.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary-foreground font-semibold">
                        {portfolio.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg">{portfolio.full_name}</CardTitle>
                  {portfolio.title && <CardDescription>{portfolio.title}</CardDescription>}
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    <Link href={`/${portfolio.username}`}>
                      View Portfolio <ExternalLink className="ml-2 w-3 h-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/signup">Create Your Own Portfolio</Link>
            </Button>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed specifically for creative professionals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Globe className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Custom Domains</CardTitle>
              <CardDescription>Get your own /username URL or connect a custom domain</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Palette className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Visual Themes</CardTitle>
              <CardDescription>Choose from multiple themes with real-time preview</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Track engagement and views with detailed analytics</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Case Studies</CardTitle>
              <CardDescription>Detailed project breakdowns with timelines and results</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Media Galleries</CardTitle>
              <CardDescription>Upload and organize images, videos, and documents</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Star className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Responsive Design</CardTitle>
              <CardDescription>Looks perfect on desktop, tablet, and mobile devices</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Showcase Your Work?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of creatives who trust ProjectShelf with their portfolios
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">
                Create Your Portfolio <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <Palette className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold">ProjectShelf</span>
              </div>
              <p className="text-sm text-muted-foreground">The modern portfolio platform for creative professionals.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Examples
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 ProjectShelf. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
