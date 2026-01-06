<script setup lang="ts">
import { ref } from 'vue';
import { CheckCircle, XCircle, Trash2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import RepositoryForm from '@/components/repository-form.vue';
import BranchTable from '@/components/branch-table.vue';
import DeleteDialog from '@/components/delete-dialog.vue';
import type { AnalyzeResult, DeleteResult } from '@/types';

// State
const analyzeResult = ref<AnalyzeResult | null>(null);
const selectedBranches = ref<string[]>([]);
const currentRepoPath = ref('');
const currentDryRun = ref(true);

// Dialog state
const isDeleteDialogOpen = ref(false);

// Message state
const successMessage = ref('');
const errorMessage = ref('');

/**
 * Handle analyze result
 */
function handleAnalyzed(result: AnalyzeResult, repoPath: string, dryRun: boolean) {
  analyzeResult.value = result;
  selectedBranches.value = [];
  currentRepoPath.value = repoPath;
  currentDryRun.value = dryRun;
  clearMessages();

  if (result.mergedBranches.length === 0) {
    successMessage.value = 'No merged branches found to delete.';
  } else {
    successMessage.value = `Found ${result.mergedBranches.length} merged ${
      result.mergedBranches.length === 1 ? 'branch' : 'branches'
    }.`;
  }
}

/**
 * Handle selection change from table
 */
function handleSelectionChange(branches: string[]) {
  selectedBranches.value = branches;
  clearMessages();
}

/**
 * Open delete confirmation dialog
 */
function openDeleteDialog() {
  if (selectedBranches.value.length === 0) {
    errorMessage.value = 'Please select at least one branch to delete.';
    return;
  }
  isDeleteDialogOpen.value = true;
}

/**
 * Handle successful deletion/preview
 */
function handleDeleteSuccess(result: DeleteResult) {
  const deletedCount = result.deleted.length;
  const failedCount = result.failed.length;

  if (currentDryRun.value) {
    successMessage.value = `Dry run: ${deletedCount} ${
      deletedCount === 1 ? 'branch' : 'branches'
    } would be deleted.`;
  } else {
    successMessage.value = `Successfully deleted ${deletedCount} ${
      deletedCount === 1 ? 'branch' : 'branches'
    }.`;
  }

  if (failedCount > 0) {
    errorMessage.value = `${failedCount} ${failedCount === 1 ? 'branch' : 'branches'} failed to delete.`;
  }

  // Remove deleted branches from result
  if (analyzeResult.value) {
    analyzeResult.value.mergedBranches = analyzeResult.value.mergedBranches.filter(
      (b) => !result.deleted.includes(b.name)
    );
  }

  selectedBranches.value = [];
}

/**
 * Handle error from any component
 */
function handleError(message: string) {
  errorMessage.value = message;
  successMessage.value = '';
}

/**
 * Clear all messages
 */
function clearMessages() {
  successMessage.value = '';
  errorMessage.value = '';
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-3xl font-bold text-gray-900">Git Branch Cleanup Tool</h1>
        <p class="text-gray-600 mt-1">Analyze and clean up merged branches in your repository</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Messages -->
      <Alert v-if="successMessage" class="mb-4">
        <CheckCircle class="w-5 h-5" />
        <AlertDescription>{{ successMessage }}</AlertDescription>
      </Alert>

      <Alert v-if="errorMessage" variant="destructive" class="mb-4">
        <XCircle class="w-5 h-5" />
        <AlertDescription>{{ errorMessage }}</AlertDescription>
      </Alert>

      <!-- Repository Form -->
      <repository-form
        @analyzed="handleAnalyzed"
        @error="handleError"
      />

      <!-- Results Section -->
      <div v-if="analyzeResult" class="mt-8 space-y-4">
        <!-- Stats -->
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="text-center p-4 bg-muted rounded-lg">
                <p class="text-3xl font-bold">{{ analyzeResult.totalBranches }}</p>
                <p class="text-sm text-muted-foreground mt-1">Total Branches</p>
              </div>
              <div class="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ analyzeResult.mergedBranches.length }}</p>
                <p class="text-sm text-muted-foreground mt-1">Merged Branches</p>
              </div>
              <div class="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ analyzeResult.unmergedBranches.length }}</p>
                <p class="text-sm text-muted-foreground mt-1">Unmerged Branches</p>
              </div>
            </div>
            <p class="text-sm text-muted-foreground mt-4">
              Target branch: <span class="font-mono font-semibold">{{ analyzeResult.targetBranch }}</span>
            </p>
          </CardContent>
        </Card>

        <!-- Branch Table -->
        <branch-table
          :branches="analyzeResult.mergedBranches"
          @selection-change="handleSelectionChange"
        />

        <!-- Delete Button -->
        <div v-if="analyzeResult.mergedBranches.length > 0" class="flex justify-end">
          <Button
            @click="openDeleteDialog"
            :disabled="selectedBranches.length === 0"
            variant="destructive"
            size="lg"
          >
            <Trash2 class="w-5 h-5" />
            {{ currentDryRun ? 'Preview Deletion' : 'Delete Selected' }}
            <span v-if="selectedBranches.length > 0" class="ml-1">({{ selectedBranches.length }})</span>
          </Button>
        </div>
      </div>
    </main>

    <!-- Delete Dialog -->
    <delete-dialog
      :is-open="isDeleteDialogOpen"
      :branches="selectedBranches"
      :repo-path="currentRepoPath"
      :dry-run="currentDryRun"
      @close="isDeleteDialogOpen = false"
      @success="handleDeleteSuccess"
      @error="handleError"
    />
  </div>
</template>
