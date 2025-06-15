export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  categoryId?: string
  tags: string[]
  isPinned: boolean
  isFloating: boolean
}

export interface Category {
  id: string
  name: string
  color: string
  createdAt: Date
}

export interface Tag {
  id: string
  name: string
  color: string
}