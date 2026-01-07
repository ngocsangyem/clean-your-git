<script setup lang="ts">
import { ref } from 'vue';
import { CheckCircle, XCircle, Trash2, GitBranch, GitMerge, GitPullRequest } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b bg-card">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <GitBranch class="w-6 h-6 text-primary" />
          </div>
          <h1 class="text-4xl font-bold font-heading text-foreground">
            Git Branch Cleanup Tool
          </h1>
        </div>
        <p class="text-muted-foreground text-lg">
          Analyze and clean up merged branches in your repository
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Messages -->
      <div class="space-y-4 mb-8">
        <Alert v-if="successMessage" class="border-success/20 bg-success/5">
          <CheckCircle class="w-5 h-5 text-success" />
          <AlertDescription class="text-success">{{ successMessage }}</AlertDescription>
        </Alert>

        <Alert v-if="errorMessage" variant="destructive">
          <XCircle class="w-5 h-5" />
          <AlertDescription>{{ errorMessage }}</AlertDescription>
        </Alert>
      </div>

      <!-- Repository Form -->
      <repository-form
        @analyzed="handleAnalyzed"
        @error="handleError"
      />

      <!-- Results Section -->
      <div v-if="analyzeResult" class="mt-8 space-y-8">
        <Separator />

        <!-- Stats -->
        <Card>
          <CardHeader>
            <CardTitle class="text-2xl font-heading">Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <!-- Total Branches -->
              <div class="flex flex-col items-center gap-3 p-6 rounded-lg border bg-card hover:bg-muted/50 transition-colors duration-200">
                <div class="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                  <GitBranch class="w-6 h-6 text-muted-foreground" />
                </div>
                <div class="text-center">
                  <p class="text-4xl font-bold font-heading">{{ analyzeResult.totalBranches }}</p>
                  <p class="text-sm text-muted-foreground mt-2">Total Branches</p>
                </div>
              </div>

              <!-- Merged Branches -->
              <div class="flex flex-col items-center gap-3 p-6 rounded-lg border bg-success/5 border-success/20 hover:bg-success/10 transition-colors duration-200">
                <div class="flex items-center justify-center w-12 h-12 rounded-full bg-success/10">
                  <GitMerge class="w-6 h-6 text-success" />
                </div>
                <div class="text-center">
                  <p class="text-4xl font-bold font-heading text-success">{{ analyzeResult.mergedBranches.length }}</p>
                  <p class="text-sm text-muted-foreground mt-2">Merged Branches</p>
                </div>
              </div>

              <!-- Unmerged Branches -->
              <div class="flex flex-col items-center gap-3 p-6 rounded-lg border bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors duration-200">
                <div class="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  <GitPullRequest class="w-6 h-6 text-primary" />
                </div>
                <div class="text-center">
                  <p class="text-4xl font-bold font-heading text-primary">{{ analyzeResult.unmergedBranches.length }}</p>
                  <p class="text-sm text-muted-foreground mt-2">Unmerged Branches</p>
                </div>
              </div>
            </div>

            <Separator class="my-6" />

            <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Target branch:</span>
              <Badge variant="secondary" class="font-mono">
                {{ analyzeResult.targetBranch }}
              </Badge>
            </div>
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
            class="gap-2 transition-all duration-200 hover:shadow-lg"
          >
            <Trash2 class="w-5 h-5" />
            {{ currentDryRun ? 'Preview Deletion' : 'Delete Selected' }}
            <Badge v-if="selectedBranches.length > 0" variant="secondary" class="ml-2">
              {{ selectedBranches.length }}
            </Badge>
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
