<script setup lang="ts">
import { ref, computed, toRef } from 'vue';
import { GitBranch, Search, X, Trash2, User } from 'lucide-vue-next';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTableFilters } from '@/composables/use-table-filters';
import type { BranchInfo } from '@/types';

const props = defineProps<{
  branches: BranchInfo[];
}>();

const emit = defineEmits<{
  selectionChange: [branches: string[]];
  deleteSelected: [];
}>();

const selectedBranches = ref<Set<string>>(new Set());

// Table filters
const branchesRef = toRef(props, 'branches');
const {
  searchQuery,
  authorFilter,
  uniqueAuthors,
  filteredBranches,
  setSearch,
} = useTableFilters(branchesRef);

// Computed properties
const isAllSelected = computed(() => {
  return filteredBranches.value.length > 0 &&
    filteredBranches.value.every((b) => selectedBranches.value.has(b.name));
});

const selectionCount = computed(() => selectedBranches.value.size);

/**
 * Toggle all branches selection (only visible/filtered branches)
 */
function toggleAll(checked?: boolean) {
  if (checked === undefined) {
    // Toggle behavior
    if (isAllSelected.value) {
      // Deselect only visible branches
      filteredBranches.value.forEach((b) => selectedBranches.value.delete(b.name));
    } else {
      // Select only visible branches
      filteredBranches.value.forEach((b) => selectedBranches.value.add(b.name));
    }
  } else {
    // Direct set behavior
    if (checked) {
      // Select only visible branches
      filteredBranches.value.forEach((b) => selectedBranches.value.add(b.name));
    } else {
      // Deselect only visible branches
      filteredBranches.value.forEach((b) => selectedBranches.value.delete(b.name));
    }
  }
  emitSelection();
}

/**
 * Toggle single branch selection
 */
function toggleBranch(branchName: string) {
  if (selectedBranches.value.has(branchName)) {
    selectedBranches.value.delete(branchName);
  } else {
    selectedBranches.value.add(branchName);
  }
  emitSelection();
}

/**
 * Emit selection change event
 */
function emitSelection() {
  emit('selectionChange', Array.from(selectedBranches.value));
}

/**
 * Format date to readable string
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<template>
  <Card>
    <!-- Header -->
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-2xl font-heading">
        <GitBranch class="w-5 h-5 text-primary" />
        Merged Branches
        <Badge v-if="selectionCount > 0" variant="default" class="ml-auto">
          {{ selectionCount }} selected
        </Badge>
      </CardTitle>
    </CardHeader>

    <!-- Toolbar -->
    <div v-if="branches.length > 0" class="flex flex-col sm:flex-row gap-4 px-6 py-4 border-b">
      <!-- Search -->
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          :model-value="searchQuery"
          @update:model-value="(value) => setSearch(String(value))"
          placeholder="Search branch name..."
          class="pl-9 pr-9"
        />
        <button
          v-if="searchQuery"
          @click="setSearch('')"
          class="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X class="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
      </div>

      <!-- Author Filter -->
      <Select v-model="authorFilter">
        <SelectTrigger class="w-full sm:w-48">
          <div class="flex items-center gap-2">
            <User class="w-4 h-4" />
            <SelectValue placeholder="All authors" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All authors</SelectItem>
          <SelectItem v-for="author in uniqueAuthors" :key="author" :value="author">
            {{ author }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Delete Button -->
      <Button
        v-if="selectionCount > 0"
        variant="destructive"
        @click="emit('deleteSelected')"
        class="gap-2 whitespace-nowrap"
      >
        <Trash2 class="w-4 h-4" />
        Delete ({{ selectionCount }})
      </Button>
    </div>

    <!-- Empty state -->
    <CardContent v-if="branches.length === 0" class="px-6 py-16 text-center">
      <div class="flex flex-col items-center gap-3">
        <div class="rounded-full bg-muted p-4">
          <GitBranch class="w-8 h-8 text-muted-foreground" />
        </div>
        <p class="text-muted-foreground font-medium">No merged branches found</p>
        <p class="text-sm text-muted-foreground">
          All branches are either unmerged or already cleaned up
        </p>
      </div>
    </CardContent>

    <!-- Table -->
    <CardContent v-else class="p-0">
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="hover:bg-transparent">
              <TableHead class="w-12 pl-6">
                <Checkbox
                  :checked="isAllSelected"
                  @update:checked="toggleAll"
                  aria-label="Select all branches"
                />
              </TableHead>
              <TableHead class="font-semibold">Branch Name</TableHead>
              <TableHead class="font-semibold">Author</TableHead>
              <TableHead class="font-semibold">Last Commit</TableHead>
              <TableHead class="font-semibold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="branch in filteredBranches"
              :key="branch.name"
              class="cursor-pointer transition-colors duration-200 hover:bg-muted/50"
              @click="toggleBranch(branch.name)"
            >
              <TableCell class="pl-6" @click.stop>
                <Checkbox
                  :checked="selectedBranches.has(branch.name)"
                  @update:checked="() => toggleBranch(branch.name)"
                  :aria-label="`Select ${branch.name}`"
                />
              </TableCell>
              <TableCell class="font-medium">
                <div class="flex items-center gap-2">
                  <GitBranch class="w-4 h-4 text-muted-foreground" />
                  {{ branch.name }}
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground">
                {{ branch.createdBy || 'Unknown' }}
              </TableCell>
              <TableCell class="font-mono text-sm text-muted-foreground">
                {{ branch.lastCommitHash.substring(0, 8) }}
              </TableCell>
              <TableCell class="text-muted-foreground">
                {{ formatDate(branch.lastCommitDate) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>
