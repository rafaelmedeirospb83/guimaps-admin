/**
 * Tipos para taxonomia de tours (categorias e tags)
 * Baseado no Swagger: CategoryTourResponse e TagTourResponse
 */

export type CategoryTour = {
  id: string
  slug: string
  name: string
  parent_id?: string | null
  icon?: string | null
  display_order?: number
}

export type TagTour = {
  id: string
  slug: string
  name: string
  group?: string | null
}

