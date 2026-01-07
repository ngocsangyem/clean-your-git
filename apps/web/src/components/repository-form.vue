<script setup lang="ts">
import { ref, computed } from 'vue';
import { FolderGit2, Search, Filter, Check, ChevronsUpDown, CheckCircle, AlertCircle, Loader2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
      <CardTitle class="flex items-center gap-2 text-2xl font-heading">
        <FolderGit2 class="w-6 h-6 text-primary" />
        Repository Settings
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Repository Path -->
      <div class="space-y-2">
        <Label for="repoPath" class="text-sm font-medium">Repository Path</Label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <Input
              id="repoPath"
              v-model="repoPath"
              type="text"
              placeholder="/path/to/your/repo"
              class="pr-10 transition-colors duration-200"
              @blur="fetchBranches"
            />
            <div class="absolute right-3 top-1/2 -translate-y-1/2">
              <CheckCircle v-if="repoPath.trim()" class="w-4 h-4 text-success" />
              <AlertCircle v-else class="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          <Button
            @click="fetchBranches"
            :disabled="!repoPath.trim() || isLoadingBranches"
            variant="secondary"
            class="transition-colors duration-200"
          >
            <Loader2 v-if="isLoadingBranches" class="w-4 h-4 mr-2 animate-spin" />
            {{ isLoadingBranches ? 'Loading' : 'Load' }}
          </Button>
        </div>
      </div>

      <!-- Target Branch -->
      <div class="space-y-2">
        <Label for="targetBranch" class="text-sm font-medium">Target Branch</Label>
        <Input
          v-if="availableBranches.length === 0"
          id="targetBranch"
          v-model="targetBranch"
          type="text"
          placeholder="main"
          class="transition-colors duration-200"
        />
        <Popover v-else v-model:open="isComboboxOpen">
          <PopoverTrigger as-child>
            <Button
              id="targetBranch"
              variant="outline"
              role="combobox"
              :aria-expanded="isComboboxOpen"
              class="w-full justify-between transition-colors duration-200"
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

      <Separator />

      <!-- Filter Toggle -->
      <Button
        @click="showFilters = !showFilters"
        variant="ghost"
        class="w-full justify-start gap-2 transition-colors duration-200"
      >
        <Filter class="w-4 h-4" />
        {{ showFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters' }}
      </Button>

      <!-- Filters -->
      <div v-if="showFilters" class="space-y-4 pt-2">
        <div class="space-y-2">
          <Label for="pattern" class="text-sm font-medium">Branch Pattern (regex)</Label>
          <Input
            id="pattern"
            v-model="pattern"
            type="text"
            placeholder="feature/.*"
            class="font-mono text-sm transition-colors duration-200"
          />
        </div>

        <div class="space-y-2">
          <Label for="excludePattern" class="text-sm font-medium">Exclude Pattern (regex)</Label>
          <Input
            id="excludePattern"
            v-model="excludePattern"
            type="text"
            placeholder="important/.*"
            class="font-mono text-sm transition-colors duration-200"
          />
        </div>

        <div class="space-y-2">
          <Label for="olderThanDate" class="text-sm font-medium">Older Than</Label>
          <Input
            id="olderThanDate"
            v-model="olderThanDate"
            type="date"
            class="transition-colors duration-200"
          />
        </div>

        <Separator />
      </div>

      <!-- Dry Run Toggle -->
      <div class="flex items-center justify-between p-4 rounded-lg bg-muted/50">
        <div class="flex flex-col gap-1">
          <Label for="dryRun" class="text-sm font-medium cursor-pointer">
            Dry Run Mode
          </Label>
          <p class="text-xs text-muted-foreground">
            Preview deletion without making changes
          </p>
        </div>
        <Switch id="dryRun" v-model:checked="dryRun" />
      </div>

      <!-- Analyze Button -->
      <Button
        @click="handleAnalyze"
        :disabled="!isValid || isAnalyzing"
        class="w-full gap-2 transition-all duration-200 hover:shadow-md"
        size="lg"
      >
        <Loader2 v-if="isAnalyzing" class="w-5 h-5 animate-spin" />
        <Search v-else class="w-5 h-5" />
        {{ isAnalyzing ? 'Analyzing Branches...' : 'Analyze Branches' }}
      </Button>
    </CardContent>
  </Card>
</template>
