<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { useKnipRpc } from './composables/useKnipRpc'
import { useFileTree, type IssueCategory, type IssueItem } from './composables/useFileTree'
import { ISSUE_CATEGORIES } from './constants/categories'
import Sidebar from './components/Sidebar.vue'
import Toolbar from './components/Toolbar.vue'
import DetailPanel from './components/DetailPanel.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import ConfigBanner from './components/ConfigBanner.vue'
import ExportMenu from './components/ExportMenu.vue'

const {
  isConnected,
  isLoading,
  error,
  results,
  configInfo,
  connect,
  runAnalysis,
  openInEditor,
  getFileContent,
  fetchKnipConfig,
  exportResults,
} = useKnipRpc()

const search = ref('')
const isDarkTheme = ref(true)

const activeFilters = ref<Set<IssueCategory>>(new Set(ISSUE_CATEGORIES))

const { categoryGroups, totalIssues } = useFileTree(results, activeFilters, search)

const selectedIssue = ref<IssueItem | null>(null)
const selectedId = computed(() => selectedIssue.value?.id ?? null)

watch(
  isDarkTheme,
  (dark) => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  },
  { immediate: true }
)

watch(categoryGroups, (groups) => {
  if (groups.length > 0 && !selectedIssue.value) {
    const firstGroup = groups[0]
    if (firstGroup.items.length > 0) {
      selectedIssue.value = firstGroup.items[0]
    }
  }
})

onMounted(() => {
  connect(() => {
    fetchKnipConfig()
    runAnalysis()
  })

  if (import.meta.hot) {
    import.meta.hot.on('vite:afterUpdate', () => {
      runAnalysis()
    })
  }
})

function handleSelect(issue: IssueItem) {
  selectedIssue.value = issue
}

function handleOpenInEditor() {
  if (!selectedIssue.value) return
  openInEditor(selectedIssue.value.file ?? '', selectedIssue.value.line, selectedIssue.value.col)
}
</script>

<template>
  <div class="app" :class="{ dark: isDarkTheme, light: !isDarkTheme }">
    <Toolbar
      v-model:search="search"
      v-model:isDarkTheme="isDarkTheme"
      :is-connected="isConnected"
      :is-loading="isLoading"
      :total-issues="totalIssues"
      @run-analysis="runAnalysis"
    >
      <template #actions>
        <ExportMenu :has-results="!!results" :export-results="exportResults" />
      </template>
    </Toolbar>

    <ConfigBanner :config-info="configInfo" />

    <div class="main-content">
      <LoadingOverlay v-if="isLoading" />

      <Splitpanes class="main-splitpanes">
        <Pane :size="35" :min-size="20">
          <Sidebar
            :category-groups="categoryGroups"
            :is-loading="isLoading"
            :error="error"
            :has-results="!!results"
            :selected-id="selectedId"
            @select="handleSelect"
            @retry="runAnalysis"
          />
        </Pane>
        <Pane :size="65" :min-size="30">
          <DetailPanel
            v-if="selectedIssue"
            :issue="selectedIssue"
            :is-dark="isDarkTheme"
            :get-file-content="getFileContent"
            @open-in-editor="handleOpenInEditor"
          />
          <div v-else class="empty-detail">
            <span class="empty-icon">←</span>
            <p>Select an item from the list</p>
          </div>
        </Pane>
      </Splitpanes>
    </div>
  </div>
</template>

<style>
/* Dark theme (default) */
.app.dark {
  --vd-c-primary: #42b883;
  --vd-c-bg: #1a1a1a;
  --vd-c-bg-soft: #242424;
  --vd-c-bg-mute: #2f2f2f;
  --vd-c-text: #ffffffde;
  --vd-c-text-2: #ffffffa6;
  --vd-c-text-3: #ffffff66;
  --vd-c-border: #2e2e2e;
  --vd-c-divider: #ffffff1a;
  --vd-c-code-bg: #0d0d0d;
}

/* Light theme */
.app.light {
  --vd-c-primary: #42b883;
  --vd-c-bg: #ffffff;
  --vd-c-bg-soft: #f6f6f7;
  --vd-c-bg-mute: #e9e9eb;
  --vd-c-text: #1a1a1a;
  --vd-c-text-2: #3c3c43cc;
  --vd-c-text-3: #3c3c4399;
  --vd-c-border: #e2e2e5;
  --vd-c-divider: #0000001a;
  --vd-c-code-bg: #f8f8f8;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  height: 100%;
}

.app {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--vd-c-bg);
  color: var(--vd-c-text);
  font-family:
    Inter,
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 13px;
}

.main-content {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.main-splitpanes {
  height: 100%;
  overflow: hidden;
}

/* Splitpanes theme customization */
.splitpanes--vertical > .splitpanes__splitter {
  width: 4px;
  background: var(--vd-c-border);
  border: none;
  cursor: ew-resize;
}

.splitpanes--vertical > .splitpanes__splitter:hover,
.splitpanes--vertical > .splitpanes__splitter:active {
  background: var(--vd-c-primary);
}

.splitpanes__pane {
  overflow: hidden;
}

.empty-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--vd-c-text-3);
  background: var(--vd-c-bg-soft);
}

.empty-detail .empty-icon {
  font-size: 32px;
}
</style>
