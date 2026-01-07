import type { KnipResult } from '../../node/types'

// Define categories as const array for runtime + type derivation
export const ISSUE_CATEGORIES = [
  'files',
  'exports',
  'types',
  'dependencies',
  'devDependencies',
  'unlisted',
  'binaries',
  'unresolved',
  'duplicates',
  'enumMembers',
  'classMembers',
] as const

// Derive type from const array
export type IssueCategory = (typeof ISSUE_CATEGORIES)[number]

// Derive Counts from KnipResult - maps each key to number
export type IssueCounts = {
  [K in keyof KnipResult]: number
}

// Category colors for UI badges and highlights
export const CATEGORY_COLORS: Record<IssueCategory, string> = {
  files: '#e54545',
  exports: '#eab308',
  types: '#3b82f6',
  dependencies: '#f97316',
  devDependencies: '#f97316',
  unlisted: '#a855f7',
  binaries: '#ec4899',
  unresolved: '#ef4444',
  duplicates: '#8b5cf6',
  enumMembers: '#14b8a6',
  classMembers: '#06b6d4',
}

// Category labels for list displays (plural form)
export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  files: 'Unused Files',
  exports: 'Unused Exports',
  types: 'Unused Types',
  dependencies: 'Unused Dependencies',
  devDependencies: 'Unused Dev Dependencies',
  unlisted: 'Unlisted Dependencies',
  binaries: 'Unused Binaries',
  unresolved: 'Unresolved Imports',
  duplicates: 'Duplicate Exports',
  enumMembers: 'Unused Enum Members',
  classMembers: 'Unused Class Members',
}

// Category labels for single item displays (singular form)
export const CATEGORY_LABELS_SINGULAR: Record<IssueCategory, string> = {
  files: 'Unused File',
  exports: 'Unused Export',
  types: 'Unused Type',
  dependencies: 'Unused Dependency',
  devDependencies: 'Unused Dev Dependency',
  unlisted: 'Unlisted Dependency',
  binaries: 'Unused Binary',
  unresolved: 'Unresolved Import',
  duplicates: 'Duplicate Export',
  enumMembers: 'Unused Enum Member',
  classMembers: 'Unused Class Member',
}

// Category icons (Carbon icons)
export const CATEGORY_ICONS: Record<IssueCategory, string> = {
  files: 'i-carbon-document',
  exports: 'i-carbon-export',
  types: 'i-carbon-type-pattern',
  dependencies: 'i-carbon-package',
  devDependencies: 'i-carbon-tool-box',
  unlisted: 'i-carbon-list-dropdown',
  binaries: 'i-carbon-terminal',
  unresolved: 'i-carbon-warning',
  duplicates: 'i-carbon-copy',
  enumMembers: 'i-carbon-list-numbered',
  classMembers: 'i-carbon-cube',
}
