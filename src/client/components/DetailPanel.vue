<script setup lang="ts">
import { ref, watch, onUnmounted, shallowRef, nextTick, computed } from 'vue'
import { VueIcon, VueLoadingIndicator, VueButton, VueBadge } from '@vue/devtools-ui'
import { EditorView, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { oneDark } from '@codemirror/theme-one-dark'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import type { IssueItem } from '../composables/useFileTree'
import { CATEGORY_COLORS, CATEGORY_LABELS_SINGULAR } from '../constants/categories'

const props = defineProps<{
  issue: IssueItem | null
  isDark: boolean
  getFileContent: (file: string) => Promise<string | null>
}>()

const emit = defineEmits<{
  openInEditor: []
}>()

const editorContainer = ref<HTMLElement | null>(null)
const editorView = shallowRef<EditorView | null>(null)
const fileContent = ref<string | null>(null)
const isLoadingCode = ref(false)
const currentFile = ref<string | null>(null)

// Compartments for dynamic reconfiguration (avoids editor recreation)
const themeCompartment = new Compartment()
const languageCompartment = new Compartment()

const badgeLabel = computed(() => {
  if (!props.issue) return ''
  return CATEGORY_LABELS_SINGULAR[props.issue.category]
})

const badgeColor = computed(() => {
  if (!props.issue) return '#888'
  return CATEGORY_COLORS[props.issue.category]
})

const hasFile = computed(() => !!props.issue?.file)

function getLanguageExtension(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
      return javascript()
    case 'ts':
    case 'tsx':
    case 'mts':
      return javascript({ typescript: true })
    case 'vue':
      return javascript({ typescript: true })
    case 'json':
      return json()
    case 'css':
    case 'scss':
    case 'less':
      return css()
    case 'html':
      return html()
    default:
      return javascript({ typescript: true })
  }
}

const lightThemeStyles = EditorView.theme({
  '&': {
    backgroundColor: '#f8f8f8',
    color: '#1a1a1a',
  },
  '.cm-content': {
    caretColor: '#1a1a1a',
  },
  '.cm-gutters': {
    backgroundColor: '#f0f0f0',
    color: '#999',
    borderRight: '1px solid #e0e0e0',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#e8e8e8',
  },
  '.cm-activeLine': {
    backgroundColor: '#f0f0f0',
  },
  '.cm-highlightedLine': {
    backgroundColor: 'rgba(234, 179, 8, 0.15) !important',
    borderLeft: '3px solid #eab308',
    marginLeft: '-3px',
  },
  '.cm-highlightedLineGutter': {
    backgroundColor: 'rgba(234, 179, 8, 0.2) !important',
    color: '#b8860b !important',
  },
})

const lightTheme = [lightThemeStyles, syntaxHighlighting(defaultHighlightStyle, { fallback: true })]

// Create editor once, reuse it for subsequent file changes
function createEditor(content: string, filename: string) {
  if (!editorContainer.value) return

  const extensions = [
    lineNumbers({
      formatNumber: (n) => String(n),
    }),
    EditorView.editable.of(false),
    EditorState.readOnly.of(true),
    languageCompartment.of(getLanguageExtension(filename)),
    themeCompartment.of(props.isDark ? oneDark : lightTheme),
    EditorView.lineWrapping,
    highlightActiveLine(),
  ]

  const state = EditorState.create({
    doc: content,
    extensions,
  })

  editorView.value = new EditorView({
    state,
    parent: editorContainer.value,
  })
}

// Scroll to and highlight a specific line (used when navigating within same file)
function scrollToLine(highlightLine: number) {
  if (!editorView.value) return

  // Clear previous highlight classes
  editorContainer.value?.querySelectorAll('.cm-highlightedLine').forEach((el) => {
    el.classList.remove('cm-highlightedLine')
  })
  editorContainer.value?.querySelectorAll('.cm-highlightedLineGutter').forEach((el) => {
    el.classList.remove('cm-highlightedLineGutter')
  })

  if (highlightLine > 0) {
    setTimeout(() => {
      if (editorView.value) {
        const lineInfo = editorView.value.state.doc.line(
          Math.min(highlightLine, editorView.value.state.doc.lines)
        )
        editorView.value.dispatch({
          effects: EditorView.scrollIntoView(lineInfo.from, { y: 'center' }),
        })

        const lineElements = editorContainer.value?.querySelectorAll('.cm-line')
        const gutterElements = editorContainer.value?.querySelectorAll(
          '.cm-lineNumbers .cm-gutterElement'
        )
        if (lineElements && lineElements[highlightLine - 1]) {
          lineElements[highlightLine - 1].classList.add('cm-highlightedLine')
        }
        if (gutterElements && gutterElements[highlightLine]) {
          gutterElements[highlightLine].classList.add('cm-highlightedLineGutter')
        }
      }
    }, 20)
  } else {
    editorView.value.dispatch({
      effects: EditorView.scrollIntoView(0),
    })
  }
}

watch(
  () => props.isDark,
  (dark) => {
    if (editorView.value) {
      editorView.value.dispatch({
        effects: themeCompartment.reconfigure(dark ? oneDark : lightTheme),
      })
    }
  }
)

watch(
  () => props.issue,
  async (newIssue) => {
    if (!newIssue) {
      fileContent.value = null
      currentFile.value = null
      return
    }

    // Only load file content if we have a file path
    if (!newIssue.file) {
      fileContent.value = null
      currentFile.value = null
      isLoadingCode.value = false
      return
    }

    // If same file and editor exists, just scroll to the new line
    if (currentFile.value === newIssue.file && fileContent.value && editorView.value) {
      scrollToLine(newIssue.line ?? 0)
      return
    }

    isLoadingCode.value = true
    try {
      const content = await props.getFileContent(newIssue.file)
      fileContent.value = content
      currentFile.value = newIssue.file
      isLoadingCode.value = false

      if (content) {
        await nextTick()

        // Destroy old editor if it exists (DOM may have changed)
        if (editorView.value) {
          editorView.value.destroy()
          editorView.value = null
        }

        // Create fresh editor for new file
        if (editorContainer.value) {
          createEditor(content, newIssue.file)
          scrollToLine(newIssue.line ?? 0)
        }
      }
    } catch (err) {
      console.error('[knip-ui] Error loading file content:', err)
      fileContent.value = null
      currentFile.value = null
      isLoadingCode.value = false
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (editorView.value) {
    editorView.value.destroy()
  }
})
</script>

<template>
  <main class="detail-panel">
    <div class="detail-content">
      <div class="detail-header">
        <div class="detail-title">
          <VueIcon :icon="hasFile ? 'i-carbon-document' : 'i-carbon-package'" class="detail-icon" />
          <span class="detail-path">{{ issue?.file || issue?.name || issue?.specifier }}</span>
          <span v-if="issue?.line" class="detail-location">:{{ issue.line }}</span>
        </div>
        <div class="header-actions">
          <VueBadge
            class="type-badge"
            :style="{
              '--vue-badge-bg': badgeColor + '33',
              '--vue-badge-color': badgeColor,
              backgroundColor: badgeColor + '33',
              color: badgeColor,
            }"
          >
            {{ badgeLabel }}
          </VueBadge>
          <VueButton v-if="hasFile" @click="emit('openInEditor')">
            <template #icon>
              <VueIcon icon="i-carbon-launch" />
            </template>
            Open in Editor
          </VueButton>
        </div>
      </div>

      <!-- Issue Info -->
      <div
        v-if="issue?.name && hasFile"
        class="issue-info"
        :style="{ backgroundColor: badgeColor + '1a' }"
      >
        <span class="issue-label">{{ badgeLabel }}:</span>
        <code class="issue-name" :style="{ backgroundColor: badgeColor + '33', color: badgeColor }">
          {{ issue.name }}
        </code>
        <span v-if="issue.line" class="issue-location">at line {{ issue.line }}</span>
      </div>

      <!-- Dependency Info (no file) -->
      <div v-if="!hasFile && issue?.name" class="dependency-info">
        <VueIcon icon="i-carbon-package" class="dep-icon" />
        <div class="dep-details">
          <code class="dep-name">{{ issue.name }}</code>
          <p class="dep-hint">
            This dependency is declared in package.json but not used in the codebase.
          </p>
        </div>
      </div>

      <!-- Code Preview -->
      <div v-if="hasFile" class="code-container">
        <div v-if="isLoadingCode" class="code-loading">
          <VueLoadingIndicator />
          <span>Loading file...</span>
        </div>

        <div v-else-if="!fileContent" class="code-error">
          <VueIcon icon="i-carbon-warning" />
          <span>Unable to load file content</span>
        </div>

        <div v-else ref="editorContainer" class="editor-container"></div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.detail-panel {
  height: 100%;
  background: var(--vd-c-bg-soft);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: var(--vd-c-bg);
  border-bottom: 1px solid var(--vd-c-border);
  gap: 12px;
}

.detail-title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.detail-icon {
  font-size: 16px;
  flex-shrink: 0;
  opacity: 0.7;
}

.detail-path {
  font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: 12px;
  color: var(--vd-c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-location {
  font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: 12px;
  color: var(--vd-c-text-3);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.type-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.issue-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--vd-c-border);
  font-size: 12px;
}

.issue-label {
  color: var(--vd-c-text-2);
}

.issue-name {
  font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
  padding: 2px 6px;
  border-radius: 3px;
}

.issue-location {
  color: var(--vd-c-text-3);
}

.dependency-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  flex: 1;
}

.dep-icon {
  font-size: 48px;
  opacity: 0.3;
}

.dep-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dep-name {
  font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: 18px;
  color: var(--vd-c-text);
}

.dep-hint {
  color: var(--vd-c-text-3);
  font-size: 13px;
}

.code-container {
  flex: 1;
  overflow: hidden;
  background: var(--vd-c-code-bg, #0d0d0d);
}

.code-loading,
.code-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: var(--vd-c-text-3);
  font-size: 13px;
}

.editor-container {
  height: 100%;
  overflow: auto;
}

.editor-container :deep(.cm-editor) {
  height: 100%;
}

.editor-container :deep(.cm-scroller) {
  overflow: auto;
  font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: 13px;
  line-height: 1.5;
}

.editor-container :deep(.cm-highlightedLine) {
  background: rgba(234, 179, 8, 0.15) !important;
  border-left: 3px solid #eab308;
  margin-left: -3px;
  padding-left: 3px;
}

.editor-container :deep(.cm-highlightedLineGutter) {
  background: rgba(234, 179, 8, 0.2) !important;
  color: #eab308 !important;
}
</style>
