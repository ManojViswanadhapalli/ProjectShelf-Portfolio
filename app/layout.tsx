import type React from "react"
import type { Metadata } from "next"
import ClientRootLayout from "./client-layout"

export const metadata: Metadata = {
  title: "ProjectShelf - Creative Portfolio Platform",
  description: "Build personalized, dynamic portfolios with detailed case studies",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClientRootLayout>{children}</ClientRootLayout>
}


import './globals.css'
