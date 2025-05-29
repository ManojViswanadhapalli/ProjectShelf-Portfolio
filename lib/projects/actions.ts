"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface ProjectData {
  title: string
  description: string
  content: any
  coverImage?: string
  status: "draft" | "published"
  tags: string[]
  tools: string[]
  projectDate?: string
  client?: string
  projectUrl?: string
  githubUrl?: string
}

export async function createProject(data: ProjectData) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  // Generate slug from title
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: data.title,
      slug,
      description: data.description,
      content: data.content,
      cover_image: data.coverImage,
      status: data.status,
      tags: data.tags,
      tools: data.tools,
      project_date: data.projectDate,
      client: data.client,
      project_url: data.projectUrl,
      github_url: data.githubUrl,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return project
}

export async function updateProject(id: string, data: Partial<ProjectData>) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  const updateData: any = { ...data }

  // Update slug if title changed
  if (data.title) {
    updateData.slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const { data: project, error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return project
}

export async function deleteProject(id: string) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function getUserProjects(userId: string) {
  const supabase = await createServerSupabaseClient()

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return projects
}

export async function getProject(id: string) {
  const supabase = await createServerSupabaseClient()

  const { data: project, error } = await supabase.from("projects").select("*").eq("id", id).single()

  if (error) {
    throw new Error(error.message)
  }

  return project
}
