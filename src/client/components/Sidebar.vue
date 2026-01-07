<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'
import { VueIcon, VueButton, VueLoadingIndicator } from '@vue/devtools-ui'
import type { CategoryGroup, IssueItem, IssueCategory } from '../composables/useFileTree'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants/categories'

// Row types for flattened virtual list
type VirtualRowHeader = {
  type: 'header'
  group: CategoryGroup
}
type VirtualRowItem = {
  type: 'item'
  item: IssueItem
}
type VirtualRow = VirtualRowHeader | VirtualRowItem

const props = defineProps<{
  categoryGroups: CategoryGroup[]
  isLoading: boolean
  error: string | null
  hasResults: boolean
  selectedId: string | null
}>()

const emit = defineEmits<{
  select: [issue: IssueItem]
  retry: []
}>()

const expandedCategories = ref<Set<IssueCategory>>(new Set())
const listContainerRef = ref<HTMLElement | null>(null)

// Auto-expand first category only (performance: don't expand all by default)
watch(
  () => props.categoryGroups,
  (groups) => {
    if (expandedCategories.value.size === 0 && groups.length > 0) {
      expandedCategories.value.add(groups[0].category)
    }
  },
  { immediate: true }
)

// Flatten categories and items into a single list for virtualization
const flattenedRows = computed<VirtualRow[]>(() => {
  const rows: VirtualRow[] = []
  for (const group of props.categoryGroups) {
    rows.push({ type: 'header', group })
    if (expandedCategories.value.has(group.category)) {
      for (const item of group.items) {
        rows.push({ type: 'item', item })
      }
    }
  }
  return rows
})

// Virtual scrolling with @tanstack/vue-virtual
const virtualizer = useVirtualizer({
  get count() {
    return flattenedRows.value.length
  },
  getScrollElement: () => listContainerRef.value,
  estimateSize: (index) => {
    // Headers are taller than items
    return flattenedRows.value[index]?.type === 'header' ? 36 : 42
  },
  overscan: 10,
})

const virtualRows = computed(() => virtualizer.value.getVirtualItems())
const totalSize = computed(() => virtualizer.value.getTotalSize())

function toggleCategory(category: IssueCategory) {
  if (expandedCategories.value.has(category)) {
    expandedCategories.value.delete(category)
  } else {
    expandedCategories.value.add(category)
  }
  expandedCategories.value = new Set(expandedCategories.value)
}

function getDisplayName(item: IssueItem): string {
  if (item.file && !item.name) {
    return item.file.split('/').pop() || item.file
  }
  if (item.name) {
    return item.name
  }
  if (item.specifier) {
    return item.specifier
  }
  return 'Unknown'
}

function getSubtext(item: IssueItem): string | null {
  if (item.category === 'dependencies' || item.category === 'devDependencies') {
    return 'package.json'
  }
  if (item.file && !item.name && !item.specifier) {
    const parts = item.file.split('/')
    if (parts.length > 1) {
      return parts.slice(0, -1).join('/')
    }
    return null
  }
  if (item.file && item.name) {
    return item.file
  }
  if (item.file && item.specifier) {
    return item.file
  }
  return null
}

const totalIssues = computed(() => {
  return props.categoryGroups.reduce((sum, g) => sum + g.count, 0)
})
</script>

<template>
  <aside class="sidebar">
    <!-- Loading State -->
    <div v-if="isLoading" class="state-container">
      <VueLoadingIndicator />
      <p class="state-text">Running Knip analysis...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="state-container">
      <VueIcon icon="i-carbon-warning" class="state-icon error-icon" />
      <p class="state-text error">{{ error }}</p>
      <VueButton type="primary" @click="emit('retry')">Retry</VueButton>
    </div>

    <!-- Empty State -->
    <div v-else-if="!hasResults" class="state-container">
      <VueIcon icon="i-carbon-search" class="state-icon" />
      <p class="state-text">Click ▶ to run analysis</p>
    </div>

    <!-- No Results -->
    <div v-else-if="totalIssues === 0" class="state-container">
      <VueIcon icon="i-carbon-checkmark-filled" class="state-icon success-icon" />
      <p class="state-text">No dead code found!</p>
    </div>

    <!-- Virtualized List View -->
    <div v-else ref="listContainerRef" class="list-container">
      <div class="virtual-list" :style="{ height: `${totalSize}px` }">
        <template v-for="virtualRow in virtualRows" :key="virtualRow.key">
          <!-- Category Header -->
          <button
            v-if="flattenedRows[virtualRow.index].type === 'header'"
            type="button"
            class="category-header"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }"
            @click="
              toggleCategory((flattenedRows[virtualRow.index] as VirtualRowHeader).group.category)
            "
          >
            <VueIcon
              :icon="
                expandedCategories.has(
                  (flattenedRows[virtualRow.index] as VirtualRowHeader).group.category
                )
                  ? 'i-carbon-chevron-down'
                  : 'i-carbon-chevron-right'
              "
              class="expand-icon"
            />
            <VueIcon
              :icon="
                CATEGORY_ICONS[(flattenedRows[virtualRow.index] as VirtualRowHeader).group.category]
              "
              class="category-icon"
            />
            <span class="category-label">{{
              (flattenedRows[virtualRow.index] as VirtualRowHeader).group.label
            }}</span>
            <span
              class="category-count"
              :style="{
                backgroundColor:
                  CATEGORY_COLORS[
                    (flattenedRows[virtualRow.index] as VirtualRowHeader).group.category
                  ],
              }"
            >
              {{ (flattenedRows[virtualRow.index] as VirtualRowHeader).group.count }}
            </span>
          </button>

          <!-- Issue Item -->
          <button
            v-else
            type="button"
            class="item-row"
            :class="{
              selected: selectedId === (flattenedRows[virtualRow.index] as VirtualRowItem).item.id,
            }"
            :style="{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }"
            @click="emit('select', (flattenedRows[virtualRow.index] as VirtualRowItem).item)"
          >
            <div class="item-content">
              <span class="item-name">{{
                getDisplayName((flattenedRows[virtualRow.index] as VirtualRowItem).item)
              }}</span>
              <span
                v-if="getSubtext((flattenedRows[virtualRow.index] as VirtualRowItem).item)"
                class="item-subtext"
              >
                {{ getSubtext((flattenedRows[virtualRow.index] as VirtualRowItem).item) }}
              </span>
            </div>
            <span
              v-if="(flattenedRows[virtualRow.index] as VirtualRowItem).item.line"
              class="item-line"
            >
              :{{ (flattenedRows[virtualRow.index] as VirtualRowItem).item.line }}
            </span>
          </button>
        </template>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  height: 100%;
  background: var(--vd-c-bg);
  border-right: 1px solid var(--vd-c-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  padding: 24px;
  text-align: center;
}

.state-icon {
  font-size: 32px;
  opacity: 0.5;
}

.error-icon {
  color: #e54545;
  opacity: 1;
}

.success-icon {
  color: #42b883;
  opacity: 1;
}

.state-text {
  color: var(--vd-c-text-2);
  font-size: 13px;
}

.state-text.error {
  color: #e54545;
}

.list-container {
  flex: 1;
  overflow: auto;
  padding: 4px 0;
}

.virtual-list {
  position: relative;
  width: 100%;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--vd-c-text);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
}

.category-header:hover {
  background: var(--vd-c-bg-soft);
}

.expand-icon {
  opacity: 0.5;
  flex-shrink: 0;
  font-size: 12px;
}

.category-icon {
  opacity: 0.7;
  flex-shrink: 0;
  font-size: 14px;
}

.category-label {
  flex: 1;
}

.category-count {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  color: white;
  min-width: 24px;
  text-align: center;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 6px 12px 6px 36px;
  border: none;
  background: transparent;
  color: var(--vd-c-text);
  font: inherit;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
}

.item-row:hover {
  background: var(--vd-c-bg-soft);
}

.item-row.selected {
  background: var(--vd-c-primary);
  color: white;
}

.item-row.selected .item-subtext {
  color: rgba(255, 255, 255, 0.7);
}

.item-row.selected .item-line {
  color: rgba(255, 255, 255, 0.7);
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.item-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-subtext {
  font-size: 10px;
  color: var(--vd-c-text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-line {
  font-size: 10px;
  color: var(--vd-c-text-3);
  flex-shrink: 0;
}
</style>
