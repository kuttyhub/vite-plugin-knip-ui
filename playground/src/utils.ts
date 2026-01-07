// This file has both used and unused exports

export function usedHelper() {
  return 'I am used'
}

export function unusedHelper() {
  return 'I am not used'
}

export function anotherUnusedFn(x: number, y: number) {
  return x + y
}

export const usedValue = 'used'

export const unusedValue = 'not used'

export const UNUSED_CONSTANT = 42

export type UnusedType = {
  id: string
  name: string
}

export interface UnusedInterface {
  foo: string
  bar: number
}

// Enum with unused members (for enumMembers category)
// Usage in App.vue only uses Active and Inactive, leaving Pending and Archived unused
export enum Status {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
  Archived = 'archived',
}

// Class with unused methods (for classMembers category)
// Usage in App.vue only calls add(), leaving remove, clear, getCount unused
export class DataProcessor {
  private data: string[] = []

  add(item: string) {
    this.data.push(item)
  }

  remove(item: string) {
    this.data = this.data.filter((i) => i !== item)
  }

  clear() {
    this.data = []
  }

  getCount(): number {
    return this.data.length
  }
}
