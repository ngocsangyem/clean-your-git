<script setup lang="ts">
import { ref, computed } from 'vue';
import { GitBranch } from 'lucide-vue-next';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { BranchInfo } from '@/types';

const props = defineProps<{
  branches: BranchInfo[];
}>();

const emit = defineEmits<{
  selectionChange: [branches: string[]];
}>();

const selectedBranches = ref<Set<string>>(new Set());

// Computed properties
const isAllSelected = computed(() => {
  return props.branches.length > 0 && selectedBranches.value.size === props.branches.length;
});

const selectionCount = computed(() => selectedBranches.value.size);

/**
 * Toggle all branches selection
 */
function toggleAll(checked?: boolean) {
  if (checked === undefined) {
    // Toggle behavior
    if (isAllSelected.value) {
      selectedBranches.value.clear();
    } else {
      selectedBranches.value = new Set(props.branches.map((b) => b.name));
    }
  } else {
    // Direct set behavior
    if (checked) {
      selectedBranches.value = new Set(props.branches.map((b) => b.name));
    } else {
      selectedBranches.value.clear();
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
      <CardTitle class="flex items-center gap-2">
        <GitBranch class="w-5 h-5" />
        Merged Branches
        <Badge v-if="selectionCount > 0" variant="default" class="ml-2">
          {{ selectionCount }} selected
        </Badge>
      </CardTitle>
    </CardHeader>

    <!-- Empty state -->
    <CardContent v-if="branches.length === 0" class="px-6 py-12 text-center text-muted-foreground">
      <GitBranch class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <p>No merged branches found</p>
    </CardContent>

    <!-- Table -->
    <CardContent v-else class="p-0">
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-12">
                <Checkbox
                  :checked="isAllSelected"
                  @update:checked="toggleAll"
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Branch Name</TableHead>
              <TableHead>Last Commit</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="branch in branches"
              :key="branch.name"
              class="cursor-pointer"
              @click="toggleBranch(branch.name)"
            >
              <TableCell @click.stop>
                <Checkbox
                  :checked="selectedBranches.has(branch.name)"
                  @update:checked="() => toggleBranch(branch.name)"
                  aria-label="Select row"
                />
              </TableCell>
              <TableCell class="font-medium">{{ branch.name }}</TableCell>
              <TableCell class="font-mono text-muted-foreground">
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
