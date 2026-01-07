<script setup lang="ts">
import { VueInput } from '@vue/devtools-ui'

const filter = defineModel<string>('filter', { default: '' })

defineProps<{
  totalFiles: number
  totalExports: number
}>()
</script>

<template>
  <div class="flex items-center justify-between p-3 border-b border-border bg-background/50">
    <div class="flex items-center gap-4 text-sm">
      <span class="px-2 py-1 rounded bg-red-500/20 text-red-400">
        {{ totalFiles }} unused files
      </span>
      <span class="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
        {{ totalExports }} unused exports
      </span>
    </div>

    <VueInput v-model="filter" placeholder="Filter by path..." class="w-64" />
  </div>
</template>
