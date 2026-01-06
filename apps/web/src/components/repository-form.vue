<script setup lang="ts">
import { ref, computed } from 'vue';
import { FolderGit2, Search, Filter, Check, ChevronsUpDown } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useApi } from '@/composables/use-api';
import type { AnalyzeResult } from '@/types';

const emit = defineEmits<{
  analyzed: [result: AnalyzeResult, repoPath: string, dryRun: boolean];
  error: [message: string];
}>();

const api = useApi();

// Form state
const repoPath = ref('');
const targetBranch = ref('main');
const pattern = ref('');
const excludePattern = ref('');
const olderThanDate = ref('');
const dryRun = ref(true);

// UI state
const isAnalyzing = ref(false);
const isLoadingBranches = ref(false);
const availableBranches = ref<string[]>([]);
const showFilters = ref(false);
const isComboboxOpen = ref(false);

// Validation
const isValid = computed(() => repoPath.value.trim().length > 0 && targetBranch.value.trim().length > 0);

/**
 * Fetch available branches from repository
 */
async function fetchBranches() {
  if (!repoPath.value.trim()) return;

  isLoadingBranches.value = true;
  try {
    const result = await api.getBranches(repoPath.value);
    availableBranches.value = result.branches;
    if (result.current) {
      targetBranch.value = result.current;
    }
  } catch (error) {
    emit('error', error instanceof Error ? error.message : 'Failed to fetch branches');
  } finally {
    isLoadingBranches.value = false;
  }
}

/**
 * Analyze branches in repository
 */
async function handleAnalyze() {
  if (!isValid.value) return;

  isAnalyzing.value = true;
  try {
    // Build filters object
    const filters: { pattern?: string; excludePattern?: string; olderThan?: string } = {};
    if (pattern.value.trim()) filters.pattern = pattern.value.trim();
    if (excludePattern.value.trim()) filters.excludePattern = excludePattern.value.trim();
    if (olderThanDate.value) filters.olderThan = new Date(olderThanDate.value).toISOString();

    const result = await api.analyzeBranches({
      repoPath: repoPath.value,
      targetBranch: targetBranch.value,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });

    emit('analyzed', result, repoPath.value, dryRun.value);
  } catch (error) {
    emit('error', error instanceof Error ? error.message : 'Failed to analyze branches');
  } finally {
    isAnalyzing.value = false;
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <FolderGit2 class="w-6 h-6" />
        Repository Settings
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-4">
      <!-- Repository Path -->
      <div>
        <Label for="repoPath">Repository Path</Label>
        <div class="flex gap-2 mt-1">
          <Input
            id="repoPath"
            v-model="repoPath"
            type="text"
            placeholder="/path/to/your/repo"
            class="flex-1"
            @blur="fetchBranches"
          />
          <Button
            @click="fetchBranches"
            :disabled="!repoPath.trim() || isLoadingBranches"
            variant="secondary"
          >
            {{ isLoadingBranches ? 'Loading...' : 'Load Branches' }}
          </Button>
        </div>
      </div>

      <!-- Target Branch -->
      <div>
        <Label for="targetBranch">Target Branch</Label>
        <Input
          v-if="availableBranches.length === 0"
          id="targetBranch"
          v-model="targetBranch"
          type="text"
          placeholder="main"
          class="mt-1"
        />
        <Popover v-else v-model:open="isComboboxOpen">
          <PopoverTrigger as-child>
            <Button
              id="targetBranch"
              variant="outline"
              role="combobox"
              :aria-expanded="isComboboxOpen"
              class="w-full justify-between mt-1"
            >
              {{ targetBranch || 'Select a branch...' }}
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-full p-0" :style="{ width: 'var(--radix-popover-trigger-width)' }">
            <Command>
              <CommandInput placeholder="Search branch..." />
              <CommandList>
                <CommandEmpty>No branch found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    v-for="branch in availableBranches"
                    :key="branch"
                    :value="branch"
                    @select="() => {
                      targetBranch = branch;
                      isComboboxOpen = false;
                    }"
                  >
                    <Check
                      :class="cn(
                        'mr-2 h-4 w-4',
                        targetBranch === branch ? 'opacity-100' : 'opacity-0',
                      )"
                    />
                    {{ branch }}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <!-- Filter Toggle -->
      <Button
        @click="showFilters = !showFilters"
        variant="ghost"
        class="flex items-center gap-2"
      >
        <Filter class="w-4 h-4" />
        {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
      </Button>

      <!-- Filters -->
      <div v-if="showFilters" class="space-y-3 pt-2 border-t">
        <div>
          <Label for="pattern">Branch Pattern (regex)</Label>
          <Input
            id="pattern"
            v-model="pattern"
            type="text"
            placeholder="feature/.*"
            class="mt-1"
          />
        </div>

        <div>
          <Label for="excludePattern">Exclude Pattern (regex)</Label>
          <Input
            id="excludePattern"
            v-model="excludePattern"
            type="text"
            placeholder="important/.*"
            class="mt-1"
          />
        </div>

        <div>
          <Label for="olderThanDate">Older Than</Label>
          <Input
            id="olderThanDate"
            v-model="olderThanDate"
            type="date"
            class="mt-1"
          />
        </div>
      </div>

      <!-- Dry Run Toggle -->
      <div class="flex items-center gap-2">
        <Checkbox id="dryRun" v-model="dryRun" />
        <Label for="dryRun" class="cursor-pointer">
          Dry run (preview only, no actual deletion)
        </Label>
      </div>

      <!-- Analyze Button -->
      <Button
        @click="handleAnalyze"
        :disabled="!isValid || isAnalyzing"
        class="w-full"
        size="lg"
      >
        <Search class="w-5 h-5" />
        {{ isAnalyzing ? 'Analyzing...' : 'Analyze Branches' }}
      </Button>
    </CardContent>
  </Card>
</template>
