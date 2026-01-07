import { ref, computed, type Ref } from 'vue'
import type { BranchInfo } from '@/types'

export interface TableFilterOptions {
  searchQuery: string
  authorFilter: string
}

export function useTableFilters(branches: Ref<BranchInfo[]>) {
  const searchQuery = ref('')
  const authorFilter = ref('')

  // Debounced search (300ms)
  let debounceTimer: ReturnType<typeof setTimeout>
  const debouncedSearch = ref('')

  function setSearch(query: string) {
    searchQuery.value = query
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debouncedSearch.value = query
    }, 300)
  }

  // Unique authors for dropdown
  const uniqueAuthors = computed(() => {
    const authors = new Set<string>()
    branches.value.forEach((b) => {
      if (b.createdBy) authors.add(b.createdBy)
    })
    return Array.from(authors).sort()
  })

  // Filtered branches
  const filteredBranches = computed(() => {
    return branches.value.filter((branch) => {
      // Search filter
      if (debouncedSearch.value) {
        const query = debouncedSearch.value.toLowerCase()
        if (!branch.name.toLowerCase().includes(query)) {
          return false
        }
      }

      // Author filter
      if (authorFilter.value && branch.createdBy !== authorFilter.value) {
        return false
      }

      return true
    })
  })

  function clearFilters() {
    searchQuery.value = ''
    debouncedSearch.value = ''
    authorFilter.value = ''
  }

  return {
    searchQuery,
    authorFilter,
    uniqueAuthors,
    filteredBranches,
    setSearch,
    clearFilters,
  }
}
