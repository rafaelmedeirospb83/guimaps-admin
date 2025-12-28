import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listTourCategories, listTourTags } from '../api/taxonomy'
import type { CategoryTour, TagTour } from '../types/taxonomy'

type TaxonomyValue = {
  categoryIds: string[]
  tagIds: string[]
}

type Props = {
  value: TaxonomyValue
  onChange: (next: TaxonomyValue) => void
  errors?: {
    categoryIds?: string
    tagIds?: string
  }
  disabled?: boolean
}

/**
 * Componente reutilizável para seleção de categorias e tags (subcategorias) de tours
 * - Multi-select de categorias
 * - Multi-select de tags (chamadas de "Subcategorias" no UI)
 */
export function TourTaxonomySelect({
  value,
  onChange,
  errors,
  disabled = false,
}: Props) {
  const { categoryIds, tagIds } = value

  // Buscar categorias e tags
  const { data: categories = [], isLoading: isLoadingCategories, error: categoriesError } = useQuery({
    queryKey: ['tour-categories'],
    queryFn: async () => {
      console.log('[TourTaxonomySelect] Buscando categorias...')
      try {
        const result = await listTourCategories(false)
        console.log('[TourTaxonomySelect] Categorias recebidas:', result.length, 'itens')
        return result
      } catch (error) {
        console.error('[TourTaxonomySelect] Erro ao buscar categorias:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2, // Tentar novamente 2 vezes em caso de erro
  })

  const { data: allTags = [], isLoading: isLoadingTags, error: tagsError } = useQuery({
    queryKey: ['tour-tags'],
    queryFn: async () => {
      console.log('[TourTaxonomySelect] Buscando tags...')
      try {
        const result = await listTourTags(null, false)
        console.log('[TourTaxonomySelect] Tags recebidas:', result.length, 'itens')
        return result
      } catch (error) {
        console.error('[TourTaxonomySelect] Erro ao buscar tags:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 2, // Tentar novamente 2 vezes em caso de erro
  })

  // Organizar categorias por hierarquia (pais e filhos)
  const { parentCategories, childCategoriesMap } = useMemo(() => {
    const parents: CategoryTour[] = []
    const childrenMap = new Map<string, CategoryTour[]>()
    
    categories.forEach((cat) => {
      if (!cat.parent_id) {
        parents.push(cat)
      } else {
        const children = childrenMap.get(cat.parent_id) || []
        children.push(cat)
        childrenMap.set(cat.parent_id, children)
      }
    })

    // Ordenar pais por display_order
    parents.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    
    // Ordenar filhos por display_order
    childrenMap.forEach((children) => {
      children.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    })

    return { parentCategories: parents, childCategoriesMap: childrenMap }
  }, [categories])

  // Organizar tags por grupo
  const tagsByGroup = useMemo(() => {
    const grouped = new Map<string, TagTour[]>()
    const noGroup: TagTour[] = []
    
    allTags.forEach((tag) => {
      if (tag.group) {
        const groupTags = grouped.get(tag.group) || []
        groupTags.push(tag)
        grouped.set(tag.group, groupTags)
      } else {
        noGroup.push(tag)
      }
    })

    return { grouped, noGroup }
  }, [allTags])

  const handleCategoryToggle = (categoryId: string) => {
    if (disabled) return
    
    const newCategoryIds = categoryIds.includes(categoryId)
      ? categoryIds.filter((id) => id !== categoryId)
      : [...categoryIds, categoryId]
    
    onChange({
      categoryIds: newCategoryIds,
      tagIds, // Manter tags selecionadas
    })
  }

  const handleTagToggle = (tagId: string) => {
    if (disabled) return
    
    const newTagIds = tagIds.includes(tagId)
      ? tagIds.filter((id) => id !== tagId)
      : [...tagIds, tagId]
    
    onChange({
      categoryIds,
      tagIds: newTagIds,
    })
  }

  const isCategorySelected = (categoryId: string) => categoryIds.includes(categoryId)
  const isTagSelected = (tagId: string) => tagIds.includes(tagId)

  // Exibir erros se houver
  if (categoriesError) {
    console.error('Error loading categories:', categoriesError)
  }
  if (tagsError) {
    console.error('Error loading tags:', tagsError)
  }

  if (isLoadingCategories || isLoadingTags) {
    return (
      <div className="text-sm text-gray-500">Carregando categorias e tags...</div>
    )
  }

  if (categoriesError || tagsError) {
    return (
      <div className="text-sm text-red-600">
        Erro ao carregar categorias ou tags. Verifique o console para mais detalhes.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Seleção de Categorias */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categorias *
        </label>
        <div className="space-y-3">
          {parentCategories.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma categoria disponível</p>
          ) : (
            parentCategories.map((category) => {
              const children = childCategoriesMap.get(category.id) || []
              const hasChildren = children.length > 0
              
              return (
                <div key={category.id} className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={isCategorySelected(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      disabled={disabled}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      {category.name}
                      {category.icon && <span className="ml-2">{category.icon}</span>}
                    </span>
                  </label>
                  
                  {/* Subcategorias (filhas) */}
                  {hasChildren && (
                    <div className="ml-6 space-y-1">
                      {children.map((child) => (
                        <label
                          key={child.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={isCategorySelected(child.id)}
                            onChange={() => handleCategoryToggle(child.id)}
                            disabled={disabled}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <span className="text-sm text-gray-600">
                            {child.name}
                            {child.icon && <span className="ml-2">{child.icon}</span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
        {errors?.categoryIds && (
          <p className="mt-1 text-sm text-red-600">{errors.categoryIds}</p>
        )}
      </div>

      {/* Seleção de Tags (Subcategorias) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subcategorias (Tags)
        </label>
        {allTags.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma tag disponível</p>
        ) : (
          <div className="space-y-4">
            {/* Tags agrupadas */}
            {Array.from(tagsByGroup.grouped.entries()).map(([group, tags]) => (
              <div key={group}>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  {group === 'mood' && 'Humor'}
                  {group === 'audience' && 'Audiência'}
                  {group === 'time' && 'Horário'}
                  {group === 'profile' && 'Perfil'}
                  {!['mood', 'audience', 'time', 'profile'].includes(group) && group}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 cursor-pointer px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-primary transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isTagSelected(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        disabled={disabled}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Tags sem grupo */}
            {tagsByGroup.noGroup.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Outras
                </p>
                <div className="flex flex-wrap gap-2">
                  {tagsByGroup.noGroup.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 cursor-pointer px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-primary transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isTagSelected(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        disabled={disabled}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">{tag.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {errors?.tagIds && (
          <p className="mt-1 text-sm text-red-600">{errors.tagIds}</p>
        )}
      </div>

      {/* Resumo das seleções */}
      {(categoryIds.length > 0 || tagIds.length > 0) && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-2">Selecionado:</p>
          <div className="flex flex-wrap gap-2">
            {categoryIds.length > 0 && (
              <>
                <span className="text-xs text-gray-500">
                  {categoryIds.length} categoria{categoryIds.length > 1 ? 's' : ''}
                </span>
              </>
            )}
            {tagIds.length > 0 && (
              <>
                <span className="text-xs text-gray-500">
                  {tagIds.length} subcategoria{tagIds.length > 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

