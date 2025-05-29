import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle>Portfolio Not Found</CardTitle>
          <CardDescription>The portfolio you're looking for doesn't exist or has been set to private.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>This could happen if:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>The username is incorrect</li>
              <li>The portfolio has been set to private</li>
              <li>The account has been deleted</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to ProjectShelf
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/signup">Create Your Portfolio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
