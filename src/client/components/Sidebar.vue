<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VueIcon, VueButton, VueLoadingIndicator } from '@vue/devtools-ui'
import type { CategoryGroup, IssueItem, IssueCategory } from '../composables/useFileTree'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../constants/categories'

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

// Auto-expand categories with issues
watch(
  () => props.categoryGroups,
  (groups) => {
    for (const group of groups) {
      if (group.count > 0) {
        expandedCategories.value.add(group.category)
      }
    }
  },
  { immediate: true }
)

function toggleCategory(category: IssueCategory) {
  if (expandedCategories.value.has(category)) {
    expandedCategories.value.delete(category)
  } else {
    expandedCategories.value.add(category)
  }
  expandedCategories.value = new Set(expandedCategories.value)
}

function getDisplayName(item: IssueItem): string {
  // For files, show just the filename
  if (item.file && !item.name) {
    return item.file.split('/').pop() || item.file
  }
  // For exports/types with name
  if (item.name) {
    return item.name
  }
  // For specifiers (unlisted/unresolved)
  if (item.specifier) {
    return item.specifier
  }
  return 'Unknown'
}

function getSubtext(item: IssueItem): string | null {
  // For dependencies (no file, just name)
  if (item.category === 'dependencies' || item.category === 'devDependencies') {
    return 'package.json'
  }
  // For files, show the directory path
  if (item.file && !item.name && !item.specifier) {
    const parts = item.file.split('/')
    if (parts.length > 1) {
      return parts.slice(0, -1).join('/')
    }
    return null
  }
  // For exports/types, show file path
  if (item.file && item.name) {
    return item.file
  }
  // For specifiers, show file path
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

    <!-- Flat List View -->
    <div v-else class="list-container">
      <div v-for="group in categoryGroups" :key="group.category" class="category-group">
        <button type="button" class="category-header" @click="toggleCategory(group.category)">
          <VueIcon
            :icon="
              expandedCategories.has(group.category)
                ? 'i-carbon-chevron-down'
                : 'i-carbon-chevron-right'
            "
            class="expand-icon"
          />
          <VueIcon :icon="CATEGORY_ICONS[group.category]" class="category-icon" />
          <span class="category-label">{{ group.label }}</span>
          <span
            class="category-count"
            :style="{ backgroundColor: CATEGORY_COLORS[group.category] }"
          >
            {{ group.count }}
          </span>
        </button>

        <div v-if="expandedCategories.has(group.category)" class="category-items">
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            class="item-row"
            :class="{ selected: selectedId === item.id }"
            @click="emit('select', item)"
          >
            <div class="item-content">
              <span class="item-name">{{ getDisplayName(item) }}</span>
              <span v-if="getSubtext(item)" class="item-subtext">{{ getSubtext(item) }}</span>
            </div>
            <span v-if="item.line" class="item-line">:{{ item.line }}</span>
          </button>
        </div>
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

.category-group {
  margin-bottom: 2px;
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

.category-items {
  display: flex;
  flex-direction: column;
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
