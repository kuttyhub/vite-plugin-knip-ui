<script setup lang="ts">
import type { KnipResult } from '../../node/types'

const props = defineProps<{
  results: KnipResult
  filter: string
}>()

const emit = defineEmits<{
  openFile: [file: string, line?: number, col?: number]
}>()

interface TableRow {
  file: string
  type: 'Unused File' | 'Unused Export'
  name?: string
  line?: number
  col?: number
}

function getFilteredRows(): TableRow[] {
  const rows: TableRow[] = []
  const filterLower = props.filter.toLowerCase()

  for (const file of props.results.files) {
    if (!filterLower || file.toLowerCase().includes(filterLower)) {
      rows.push({ file, type: 'Unused File' })
    }
  }

  for (const exp of props.results.exports) {
    if (
      !filterLower ||
      exp.file.toLowerCase().includes(filterLower) ||
      exp.name.toLowerCase().includes(filterLower)
    ) {
      rows.push({
        file: exp.file,
        type: 'Unused Export',
        name: exp.name,
        line: exp.line,
        col: exp.col,
      })
    }
  }

  return rows
}

function handleRowClick(row: TableRow) {
  emit('openFile', row.file, row.line, row.col)
}
</script>

<template>
  <div class="overflow-auto flex-1">
    <table class="w-full text-sm">
      <thead class="sticky top-0 bg-background border-b border-border">
        <tr class="text-left">
          <th class="p-3 font-medium opacity-60">File Path</th>
          <th class="p-3 font-medium opacity-60 w-40">Type</th>
          <th class="p-3 font-medium opacity-60 w-48">Export Name</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in getFilteredRows()"
          :key="`${row.file}-${row.name}-${i}`"
          class="border-b border-border/50 hover:bg-primary/10 cursor-pointer transition-colors"
          @click="handleRowClick(row)"
        >
          <td class="p-3 font-mono text-xs">
            {{ row.file }}
            <span v-if="row.line" class="opacity-50">:{{ row.line }}</span>
          </td>
          <td class="p-3">
            <span
              class="px-2 py-0.5 rounded text-xs"
              :class="
                row.type === 'Unused File'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              "
            >
              {{ row.type }}
            </span>
          </td>
          <td class="p-3 font-mono text-xs opacity-70">
            {{ row.name ?? '—' }}
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="getFilteredRows().length === 0" class="p-8 text-center opacity-50">
      No results match your filter
    </div>
  </div>
</template>
