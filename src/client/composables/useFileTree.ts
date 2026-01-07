import { computed, type Ref } from 'vue'
import type { KnipResult } from '../../node/types'
import { type IssueCategory, CATEGORY_LABELS } from '../constants/categories'

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
  const categoryGroups = computed<CategoryGroup[]>(() => {
    if (!results.value) return []

    const query = search.value.trim()
    const groups: CategoryGroup[] = []

    // Helper to add group if it has items after filtering
    function addGroup(category: IssueCategory, allItems: IssueItem[]) {
      if (!filters.value.has(category)) return
      const items = allItems.filter((item) => matchesSearch(item, query))
      if (items.length > 0) {
        groups.push({
          category,
          label: CATEGORY_LABELS[category],
          count: items.length,
          items,
        })
      }
    }

    // Unused Files
    addGroup(
      'files',
      results.value.files.map((file) => ({
        id: `files-${file}`,
        category: 'files' as const,
        file,
      }))
    )

    // Unused Exports
    addGroup(
      'exports',
      results.value.exports.map((exp) => ({
        id: `exports-${exp.file}-${exp.name}-${exp.line}`,
        category: 'exports' as const,
        file: exp.file,
        name: exp.name,
        line: exp.line,
        col: exp.col,
      }))
    )

    // Unused Types
    addGroup(
      'types',
      results.value.types.map((typ) => ({
        id: `types-${typ.file}-${typ.name}-${typ.line}`,
        category: 'types' as const,
        file: typ.file,
        name: typ.name,
        line: typ.line,
        col: typ.col,
      }))
    )

    // Unused Dependencies - show with package.json and line number
    addGroup(
      'dependencies',
      results.value.dependencies.map((dep) => ({
        id: `dependencies-${dep.name}`,
        category: 'dependencies' as const,
        name: dep.name,
        file: 'package.json',
        line: dep.line,
        col: dep.col,
      }))
    )

    // Unused Dev Dependencies - show with package.json and line number
    addGroup(
      'devDependencies',
      results.value.devDependencies.map((dep) => ({
        id: `devDependencies-${dep.name}`,
        category: 'devDependencies' as const,
        name: dep.name,
        file: 'package.json',
        line: dep.line,
        col: dep.col,
      }))
    )

    // Unlisted Dependencies
    addGroup(
      'unlisted',
      results.value.unlisted.map((item) => ({
        id: `unlisted-${item.file}-${item.specifier}`,
        category: 'unlisted' as const,
        file: item.file,
        specifier: item.specifier,
      }))
    )

    // Binaries
    addGroup(
      'binaries',
      results.value.binaries.map((item) => ({
        id: `binaries-${item.file}-${item.name}`,
        category: 'binaries' as const,
        file: item.file,
        name: item.name,
      }))
    )

    // Unresolved
    addGroup(
      'unresolved',
      results.value.unresolved.map((item) => ({
        id: `unresolved-${item.file}-${item.specifier}`,
        category: 'unresolved' as const,
        file: item.file,
        specifier: item.specifier,
      }))
    )

    // Duplicates
    addGroup(
      'duplicates',
      results.value.duplicates.map((item) => ({
        id: `duplicates-${item.file}-${item.name}`,
        category: 'duplicates' as const,
        file: item.file,
        name: item.name,
      }))
    )

    // Enum Members
    addGroup(
      'enumMembers',
      results.value.enumMembers.map((em) => ({
        id: `enumMembers-${em.file}-${em.name}-${em.line}`,
        category: 'enumMembers' as const,
        file: em.file,
        name: em.name,
        line: em.line,
        col: em.col,
      }))
    )

    // Class Members
    addGroup(
      'classMembers',
      results.value.classMembers.map((cm) => ({
        id: `classMembers-${cm.file}-${cm.name}-${cm.line}`,
        category: 'classMembers' as const,
        file: cm.file,
        name: cm.name,
        line: cm.line,
        col: cm.col,
      }))
    )

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
