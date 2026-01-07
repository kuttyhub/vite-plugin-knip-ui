import { execa, ExecaError } from 'execa'
import type {
  KnipResult,
  KnipExport,
  KnipDependency,
  KnipUnlisted,
  KnipBinary,
  KnipUnresolved,
  KnipDuplicate,
} from './types'

interface KnipExportItem {
  name: string
  line: number
  col: number
  pos: number
}

interface KnipDependencyItem {
  name: string
  line: number
  col: number
  pos: number
}

interface KnipIssue {
  file: string
  dependencies?: (string | KnipDependencyItem)[]
  devDependencies?: (string | KnipDependencyItem)[]
  optionalPeerDependencies?: (string | KnipDependencyItem)[]
  unlisted?: string[]
  binaries?: string[]
  unresolved?: string[]
  exports?: KnipExportItem[]
  types?: KnipExportItem[]
  duplicates?: KnipExportItem[]
  enumMembers?: KnipExportItem[] | Record<string, KnipExportItem[]>
  classMembers?: KnipExportItem[] | Record<string, KnipExportItem[]>
}

interface KnipJsonOutput {
  files?: string[]
  issues?: KnipIssue[]
}

const KNIP_TIMEOUT_MS = 5 * 60 * 1000

export async function runKnipCli(cwd: string): Promise<KnipResult> {
  try {
    const result = await execa('npx', ['knip', '--cache', '--reporter', 'json'], {
      cwd,
      reject: false,
      timeout: KNIP_TIMEOUT_MS,
      env: {
        ...process.env,
        FORCE_COLOR: '0',
      },
      maxBuffer: 50 * 1024 * 1024,
    })

    const { stdout, stderr, exitCode, timedOut } = result

    if (timedOut) {
      throw new Error(
        `Knip analysis timed out after ${KNIP_TIMEOUT_MS / 1000}s. Try running 'npx knip --reporter json' directly.`
      )
    }

    if (stderr && stderr.trim()) {
      console.warn('[knip-ui] Knip stderr:', stderr.substring(0, 500))
    }

    if (!stdout.trim()) {
      if (exitCode !== 0 && exitCode !== 1) {
        throw new Error(`Knip exited with code ${exitCode}. stderr: ${stderr || '(empty)'}`)
      }
      return createEmptyResult()
    }

    let jsonStr = stdout.trim()
    const jsonStart = jsonStr.indexOf('{')
    if (jsonStart > 0) {
      console.warn('[knip-ui] Non-JSON prefix in output:', jsonStr.substring(0, jsonStart))
      jsonStr = jsonStr.substring(jsonStart)
    }

    const json: KnipJsonOutput = JSON.parse(jsonStr)
    return parseKnipOutput(json)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Knip output is not valid JSON. Run 'npx knip --reporter json' manually to debug.`
      )
    }
    if ((error as ExecaError).timedOut) {
      throw new Error(`Knip analysis timed out after ${KNIP_TIMEOUT_MS / 1000}s.`)
    }
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Knip analysis failed: ${message}`)
  }
}

function createEmptyResult(): KnipResult {
  return {
    files: [],
    exports: [],
    types: [],
    dependencies: [],
    devDependencies: [],
    optionalPeerDependencies: [],
    unlisted: [],
    binaries: [],
    unresolved: [],
    duplicates: [],
    enumMembers: [],
    classMembers: [],
  }
}

function parseKnipOutput(json: KnipJsonOutput): KnipResult {
  const result = createEmptyResult()
  result.files = json.files ?? []

  if (!json.issues) return result

  const allDeps = new Map<string, KnipDependency>()
  const allDevDeps = new Map<string, KnipDependency>()
  const allOptionalPeerDeps = new Map<string, KnipDependency>()

  for (const issue of json.issues) {
    // Unused dependencies (collected from all files)
    if (issue.dependencies) {
      for (const dep of issue.dependencies) {
        if (typeof dep === 'string') {
          allDeps.set(dep, { name: dep })
        } else {
          allDeps.set(dep.name, { name: dep.name, line: dep.line, col: dep.col })
        }
      }
    }

    if (issue.devDependencies) {
      for (const dep of issue.devDependencies) {
        if (typeof dep === 'string') {
          allDevDeps.set(dep, { name: dep })
        } else {
          allDevDeps.set(dep.name, { name: dep.name, line: dep.line, col: dep.col })
        }
      }
    }

    if (issue.optionalPeerDependencies) {
      for (const dep of issue.optionalPeerDependencies) {
        if (typeof dep === 'string') {
          allOptionalPeerDeps.set(dep, { name: dep })
        } else {
          allOptionalPeerDeps.set(dep.name, { name: dep.name, line: dep.line, col: dep.col })
        }
      }
    }

    // Unlisted dependencies
    if (issue.unlisted) {
      for (const specifier of issue.unlisted) {
        result.unlisted.push({ file: issue.file, specifier } as KnipUnlisted)
      }
    }

    // Binaries
    if (issue.binaries) {
      for (const name of issue.binaries) {
        result.binaries.push({ file: issue.file, name } as KnipBinary)
      }
    }

    // Unresolved imports
    if (issue.unresolved) {
      for (const specifier of issue.unresolved) {
        result.unresolved.push({ file: issue.file, specifier } as KnipUnresolved)
      }
    }

    // Unused exports
    if (issue.exports) {
      for (const exp of issue.exports) {
        result.exports.push({
          file: issue.file,
          name: exp.name,
          line: exp.line,
          col: exp.col,
        } as KnipExport)
      }
    }

    // Unused types
    if (issue.types) {
      for (const typ of issue.types) {
        result.types.push({
          file: issue.file,
          name: typ.name,
          line: typ.line,
          col: typ.col,
        } as KnipExport)
      }
    }

    // Duplicates
    if (issue.duplicates) {
      for (const dup of issue.duplicates) {
        result.duplicates.push({ file: issue.file, name: dup.name } as KnipDuplicate)
      }
    }

    // Enum members - Knip returns {EnumName: [{name, line, col, pos}, ...]}
    if (issue.enumMembers) {
      if (typeof issue.enumMembers === 'object' && !Array.isArray(issue.enumMembers)) {
        for (const [, membersObj] of Object.entries(issue.enumMembers)) {
          if (Array.isArray(membersObj)) {
            for (const em of membersObj) {
              result.enumMembers.push({
                file: issue.file,
                name: em.name,
                line: em.line,
                col: em.col,
              } as KnipExport)
            }
          } else if (typeof membersObj === 'object' && membersObj !== null) {
            for (const [memberName, memberInfo] of Object.entries(
              membersObj as Record<string, { line: number; col: number; pos: number }>
            )) {
              result.enumMembers.push({
                file: issue.file,
                name: memberName,
                line: memberInfo.line,
                col: memberInfo.col,
              } as KnipExport)
            }
          }
        }
      }
    }

    // Class members - Knip returns {ClassName: [{name, line, col, pos}, ...]}
    if (issue.classMembers) {
      if (typeof issue.classMembers === 'object' && !Array.isArray(issue.classMembers)) {
        for (const [, membersObj] of Object.entries(issue.classMembers)) {
          if (Array.isArray(membersObj)) {
            for (const cm of membersObj) {
              result.classMembers.push({
                file: issue.file,
                name: cm.name,
                line: cm.line,
                col: cm.col,
              } as KnipExport)
            }
          } else if (typeof membersObj === 'object' && membersObj !== null) {
            for (const [memberName, memberInfo] of Object.entries(
              membersObj as Record<string, { line: number; col: number; pos: number }>
            )) {
              result.classMembers.push({
                file: issue.file,
                name: memberName,
                line: memberInfo.line,
                col: memberInfo.col,
              } as KnipExport)
            }
          }
        }
      }
    }
  }

  result.dependencies = Array.from(allDeps.values())
  result.devDependencies = Array.from(allDevDeps.values())
  result.optionalPeerDependencies = Array.from(allOptionalPeerDeps.values())

  return result
}
