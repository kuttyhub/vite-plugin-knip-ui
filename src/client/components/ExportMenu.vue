<script setup lang="ts">
import { ref } from 'vue'
import { VueIcon, VueDropdown, VueDropdownButton } from '@vue/devtools-ui'

const props = defineProps<{
  hasResults: boolean
  exportResults: (format: 'json' | 'csv') => Promise<string | null>
}>()

const isExporting = ref(false)

async function handleExport(format: 'json' | 'csv') {
  isExporting.value = true
  try {
    const content = await props.exportResults(format)
    if (content) {
      downloadFile(
        content,
        `knip-report.${format}`,
        format === 'json' ? 'application/json' : 'text/csv'
      )
    }
  } finally {
    isExporting.value = false
  }
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <VueDropdown :disabled="!hasResults" label="Export">
    <template #button-icon>
      <VueIcon icon="i-carbon-download" />
    </template>

    <template #popper>
      <div class="dropdown-menu">
        <VueDropdownButton :disabled="isExporting" @click="handleExport('json')">
          <template #icon>
            <VueIcon icon="i-carbon-json" class="mr-4px" />
          </template>
          JSON
        </VueDropdownButton>
        <VueDropdownButton :disabled="isExporting" @click="handleExport('csv')">
          <template #icon>
            <VueIcon icon="i-carbon-table" class="mr-4px" />
          </template>
          CSV
        </VueDropdownButton>
      </div>
    </template>
  </VueDropdown>
</template>

<style scoped>
.dropdown-menu {
  min-width: 120px;
}
</style>
