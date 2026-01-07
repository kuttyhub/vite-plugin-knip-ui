export interface KnipExport {
  file: string
  name: string
  line: number
  col: number
}

export interface KnipUnlisted {
  file: string
  specifier: string
}

export interface KnipBinary {
  file: string
  name: string
}

export interface KnipUnresolved {
  file: string
  specifier: string
}

export interface KnipDuplicate {
  file: string
  name: string
}

export interface KnipDependency {
  name: string
  line?: number
  col?: number
}

export interface KnipResult {
  files: string[]
  exports: KnipExport[]
  types: KnipExport[]
  dependencies: KnipDependency[]
  devDependencies: KnipDependency[]
  optionalPeerDependencies: KnipDependency[]
  unlisted: KnipUnlisted[]
  binaries: KnipBinary[]
  unresolved: KnipUnresolved[]
  duplicates: KnipDuplicate[]
  enumMembers: KnipExport[]
  classMembers: KnipExport[]
}

export interface KnipConfigInfo {
  exists: boolean
  path?: string
  source?: 'knip.json' | 'knip.jsonc' | 'package.json'
}

export interface ServerFunctions {
  runKnip(): Promise<KnipResult>
  openInEditor(file: string, line?: number, col?: number): Promise<void>
  getFileContent(file: string): Promise<string>
  getKnipConfig(): Promise<KnipConfigInfo>
  exportResults(format: 'json' | 'csv'): Promise<string>
}

export type ClientFunctions = Record<string, never>
