import { computed, type Ref } from 'vue'
import type { KnipResult } from '../../node/types'
import { type IssueCategory, CATEGORY_LABELS, ISSUE_CATEGORIES } from '../constants/categories'

// Re-export for convenience
export type { IssueCategory } from '../constants/categories'

export interface IssueItem {
  id: string
  category: IssueCategory
  file?: string
  name?: string
  line?: number
  col?: number
  specifier?: string
}

export interface CategoryGroup {
  category: IssueCategory
  label: string
  count: number
  items: IssueItem[]
}

// Pre-computed items indexed by category for fast lookup
type PrecomputedItems = Record<IssueCategory, IssueItem[]>

function matchesSearch(item: IssueItem, query: string): boolean {
  if (!query) return true
  const lowerQuery = query.toLowerCase()
  return (
    (item.file?.toLowerCase().includes(lowerQuery) ?? false) ||
    (item.name?.toLowerCase().includes(lowerQuery) ?? false) ||
    (item.specifier?.toLowerCase().includes(lowerQuery) ?? false)
  )
}

export function useFileTree(
  results: Ref<KnipResult | null>,
  filters: Ref<Set<IssueCategory>>,
  search: Ref<string> = { value: '' } as Ref<string>
) {
  // Pre-compute all issue items ONCE when results change.
  // This avoids creating new objects on every search/filter change.
  const precomputedItems = computed<PrecomputedItems | null>(() => {
    if (!results.value) return null

    return {
      files: results.value.files.map((file) => ({
        id: `files-${file}`,
        category: 'files' as const,
        file,
      })),
      exports: results.value.exports.map((exp) => ({
        id: `exports-${exp.file}-${exp.name}-${exp.line}`,
        category: 'exports' as const,
        file: exp.file,
        name: exp.name,
        line: exp.line,
        col: exp.col,
      })),
      types: results.value.types.map((typ) => ({
        id: `types-${typ.file}-${typ.name}-${typ.line}`,
        category: 'types' as const,
        file: typ.file,
        name: typ.name,
        line: typ.line,
        col: typ.col,
      })),
      dependencies: results.value.dependencies.map((dep) => ({
        id: `dependencies-${dep.name}`,
        category: 'dependencies' as const,
        name: dep.name,
        file: 'package.json',
        line: dep.line,
        col: dep.col,
      })),
      devDependencies: results.value.devDependencies.map((dep) => ({
        id: `devDependencies-${dep.name}`,
        category: 'devDependencies' as const,
        name: dep.name,
        file: 'package.json',
        line: dep.line,
        col: dep.col,
      })),
      unlisted: results.value.unlisted.map((item) => ({
        id: `unlisted-${item.file}-${item.specifier}`,
        category: 'unlisted' as const,
        file: item.file,
        specifier: item.specifier,
      })),
      binaries: results.value.binaries.map((item) => ({
        id: `binaries-${item.file}-${item.name}`,
        category: 'binaries' as const,
        file: item.file,
        name: item.name,
      })),
      unresolved: results.value.unresolved.map((item) => ({
        id: `unresolved-${item.file}-${item.specifier}`,
        category: 'unresolved' as const,
        file: item.file,
        specifier: item.specifier,
      })),
      duplicates: results.value.duplicates.map((item) => ({
        id: `duplicates-${item.file}-${item.name}`,
        category: 'duplicates' as const,
        file: item.file,
        name: item.name,
      })),
      enumMembers: results.value.enumMembers.map((em) => ({
        id: `enumMembers-${em.file}-${em.name}-${em.line}`,
        category: 'enumMembers' as const,
        file: em.file,
        name: em.name,
        line: em.line,
        col: em.col,
      })),
      classMembers: results.value.classMembers.map((cm) => ({
        id: `classMembers-${cm.file}-${cm.name}-${cm.line}`,
        category: 'classMembers' as const,
        file: cm.file,
        name: cm.name,
        line: cm.line,
        col: cm.col,
      })),
    }
  })

  // Filter pre-computed items based on search and category filters.
  const categoryGroups = computed<CategoryGroup[]>(() => {
    if (!precomputedItems.value) return []

    const query = search.value.trim()
    const groups: CategoryGroup[] = []

    for (const category of ISSUE_CATEGORIES) {
      if (!filters.value.has(category)) continue

      const allItems = precomputedItems.value[category]
      const items = query ? allItems.filter((item) => matchesSearch(item, query)) : allItems

      if (items.length > 0) {
        groups.push({
          category,
          label: CATEGORY_LABELS[category],
          count: items.length,
          items,
        })
      }
    }

    return groups
  })

  const totalIssues = computed(() => {
    if (!results.value) return 0
    return (
      results.value.files.length +
      results.value.exports.length +
      results.value.types.length +
      results.value.dependencies.length +
      results.value.devDependencies.length +
      results.value.unlisted.length +
      results.value.binaries.length +
      results.value.unresolved.length +
      results.value.duplicates.length +
      results.value.enumMembers.length +
      results.value.classMembers.length
    )
  })

  return {
    categoryGroups,
    totalIssues,
  }
}
