import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, ExternalLink, Github, Calendar, User } from "lucide-react"
import Link from "next/link"
import { trackEvent } from "@/lib/analytics/actions"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface ProjectPageProps {
  params: {
    username: string
    slug: string
  }
}

async function getProjectData(username: string, slug: string) {
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

  // Get project by slug
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userData.id)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (projectError || !project) {
    return null
  }

  return {
    user: userData,
    project,
  }
}

function renderContentBlock(block: any) {
  switch (block.type) {
    case "text":
      return (
        <div className="prose prose-lg max-w-none">
          <p className="whitespace-pre-wrap">{block.content.text}</p>
        </div>
      )
    case "image":
      return (
        <div className="space-y-4">
          <img
            src={block.content.url || "/placeholder.svg"}
            alt={block.content.caption || "Project image"}
            className="w-full rounded-lg"
          />
          {block.content.caption && (
            <p className="text-sm text-muted-foreground text-center italic">{block.content.caption}</p>
          )}
        </div>
      )
    case "list":
      return (
        <ul className="space-y-2">
          {block.content.items?.map((item: string, index: number) => (
            <li key={index} className="flex items-start">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )
    case "quote":
      return (
        <blockquote className="border-l-4 border-primary pl-6 py-4 bg-muted/50 rounded-r-lg">
          <p className="text-lg italic mb-2">"{block.content.text}"</p>
          {block.content.author && <cite className="text-sm text-muted-foreground">— {block.content.author}</cite>}
        </blockquote>
      )
    default:
      return null
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const projectData = await getProjectData(params.username, params.slug)

  if (!projectData) {
    notFound()
  }

  const { user, project } = projectData

  // Track project view
  await trackEvent("project_view", user.id, project.id)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${params.username}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Portfolio
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

      {/* Project Hero */}
      <section className="py-16 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Project Cover Image */}
            {project.cover_image && (
              <div className="aspect-video mb-8 rounded-lg overflow-hidden">
                <img
                  src={project.cover_image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Project Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.title}</h1>
              <p className="text-xl text-muted-foreground mb-6">{project.description}</p>

              {/* Project Meta */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {project.project_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.project_date).toLocaleDateString()}
                  </div>
                )}
                {project.client && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    {project.client}
                  </div>
                )}
              </div>

              {/* Project Links */}
              <div className="flex justify-center gap-4 mb-8">
                {project.project_url && (
                  <Button variant="outline" asChild>
                    <Link href={project.project_url} target="_blank">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Live
                    </Link>
                  </Button>
                )}
                {project.github_url && (
                  <Button variant="outline" asChild>
                    <Link href={project.github_url} target="_blank">
                      <Github className="w-4 h-4 mr-2" />
                      View Code
                    </Link>
                  </Button>
                )}
              </div>

              {/* Tags and Tools */}
              <div className="space-y-4">
                {project.tags && project.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {project.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {project.tools && project.tools.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Tools Used</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {project.tools.map((tool: string) => (
                        <Badge key={tool} variant="outline">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {project.content?.blocks?.map((block: any, index: number) => (
                <div key={block.id || index}>{renderContentBlock(block)}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
                  <AvatarFallback className="text-lg">
                    {user.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{user.full_name}</h3>
                  {user.title && <p className="text-muted-foreground mb-2">{user.title}</p>}
                  {user.bio && <p className="text-sm text-muted-foreground">{user.bio}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/${params.username}`}>View Portfolio</Link>
                  </Button>
                  <form
                    action={async () => {
                      "use server"
                      await trackEvent("contact_click", user.id)
                    }}
                  >
                    <Button asChild>
                      <Link href={`mailto:${user.email}`}>Get In Touch</Link>
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {user.full_name}. Portfolio powered by{" "}
            <Link href="/" className="text-primary hover:underline">
              ProjectShelf
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
