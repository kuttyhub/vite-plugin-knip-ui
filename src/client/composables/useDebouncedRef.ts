import { ref, watch, type Ref } from 'vue'

/**
 * Creates a debounced ref that updates after a delay.
 * Useful for search inputs to avoid filtering on every keystroke.
 */
export function useDebouncedRef<T>(source: Ref<T>, delay = 250): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(source, (newValue) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      debounced.value = newValue
    }, delay)
  })

  return debounced
}
