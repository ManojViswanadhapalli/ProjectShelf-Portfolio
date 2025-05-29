import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Mail, Globe, Github, Linkedin, Twitter, ExternalLink, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { trackEvent } from "@/lib/analytics/actions"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface PortfolioPageProps {
  params: {
    username: string
  }
}

async function getPortfolioData(username: string) {
  const supabase = await createServerSupabaseClient()

  // Get user data by username
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .eq("is_public", true)
    .single()

  if (userError || !userData) {
    return null
  }

  // Get user's published projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userData.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  return {
    user: userData,
    projects: projects || [],
  }
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const portfolioData = await getPortfolioData(params.username)

  if (!portfolioData) {
    notFound()
  }

  const { user: portfolio, projects } = portfolioData

  // Track portfolio view (server-side)
  await trackEvent("portfolio_view", portfolio.id)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to ProjectShelf
            </Link>
          </Button>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-background to-muted/20 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Avatar className="w-32 h-32 mx-auto mb-6">
              <AvatarImage src={portfolio.avatar_url || "/placeholder.svg"} alt={portfolio.full_name} />
              <AvatarFallback className="text-2xl">
                {portfolio.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">{portfolio.full_name}</h1>
            {portfolio.title && <p className="text-xl text-muted-foreground mb-6">{portfolio.title}</p>}
            {portfolio.bio && <p className="text-lg max-w-2xl mx-auto mb-8">{portfolio.bio}</p>}

            {/* Contact Info */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-muted-foreground">
              {portfolio.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {portfolio.location}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {portfolio.email}
              </div>
              {portfolio.website && (
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <Link href={portfolio.website} target="_blank" className="hover:underline">
                    {portfolio.website}
                  </Link>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-8">
              {portfolio.social_github && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`https://github.com/${portfolio.social_github}`} target="_blank">
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Link>
                </Button>
              )}
              {portfolio.social_linkedin && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`https://linkedin.com/in/${portfolio.social_linkedin}`} target="_blank">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Link>
                </Button>
              )}
              {portfolio.social_twitter && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`https://twitter.com/${portfolio.social_twitter}`} target="_blank">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Link>
                </Button>
              )}
            </div>

            <form
              action={async () => {
                "use server"
                await trackEvent("contact_click", portfolio.id)
              }}
            >
              <Button size="lg" asChild>
                <Link href={`mailto:${portfolio.email}`}>Get In Touch</Link>
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      {projects.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
                <p className="text-lg text-muted-foreground">A selection of recent work and case studies</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <Link key={project.id} href={`/${params.username}/${project.slug}`}>
                    <Card className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                        <img
                          src={project.cover_image || "/placeholder.svg"}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-semibold">{project.title}</h3>
                          {project.project_date && (
                            <Badge variant="outline">{new Date(project.project_date).getFullYear()}</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags?.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {project.tags?.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{project.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{"Let's Work Together"}</h2>
          <p className="text-xl mb-8 opacity-90">Have a project in mind? {"I'd"} love to hear about it.</p>
          <form
            action={async () => {
              "use server"
              await trackEvent("contact_click", portfolio.id)
            }}
          >
            <Button size="lg" variant="secondary" asChild>
              <Link href={`mailto:${portfolio.email}`}>Start a Conversation</Link>
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {portfolio.full_name}. Portfolio powered by{" "}
            <Link href="/" className="text-primary hover:underline">
              ProjectShelf
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
