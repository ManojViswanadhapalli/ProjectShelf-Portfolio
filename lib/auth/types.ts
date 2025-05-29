export interface User {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  title?: string
  location?: string
  website?: string
  social_github?: string
  social_linkedin?: string
  social_twitter?: string
  theme: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface SignUpData {
  email: string
  password: string
  username: string
  full_name: string
}

export interface SignInData {
  email: string
  password: string
}
