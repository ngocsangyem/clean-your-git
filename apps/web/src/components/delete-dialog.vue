<script setup lang="ts">
import { ref, computed } from 'vue';
import { AlertTriangle, AlertCircle, Loader2 } from 'lucide-vue-next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useApi } from '@/composables/use-api';
import type { DeleteResult } from '@/types';

const props = defineProps<{
  isOpen: boolean;
  branches: string[];
  repoPath: string;
  dryRun: boolean;
}>();

const emit = defineEmits<{
  close: [];
  success: [result: DeleteResult];
  error: [message: string];
}>();

const api = useApi();
const isDeleting = ref(false);

const dialogTitle = computed(() => {
  return props.dryRun ? 'Preview Branch Deletion' : 'Confirm Branch Deletion';
});

const confirmButtonText = computed(() => {
  if (isDeleting.value) return 'Processing...';
  return props.dryRun ? 'Preview Deletion' : 'Delete Branches';
});

const warningMessage = computed(() => {
  if (props.dryRun) {
    return 'This will show what would be deleted without actually deleting anything.';
  }
  return 'This action cannot be undone. The following branches will be permanently deleted:';
});

/**
 * Handle delete/preview action
 */
async function handleConfirm() {
  isDeleting.value = true;
  try {
    const result = await api.deleteBranches({
      repoPath: props.repoPath,
      branches: props.branches,
      dryRun: props.dryRun,
    });
    emit('success', result);
    emit('close');
  } catch (error) {
    emit('error', error instanceof Error ? error.message : 'Failed to delete branches');
  } finally {
    isDeleting.value = false;
  }
}

/**
 * Handle dialog close
 */
function handleClose() {
  if (!isDeleting.value) {
    emit('close');
  }
}
</script>

<template>
  <AlertDialog :open="isOpen" @update:open="(open) => !open && handleClose()">
    <AlertDialogContent class="max-w-2xl">
      <AlertDialogHeader>
        <AlertDialogTitle class="flex items-center gap-3 text-xl font-heading">
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200"
            :class="dryRun ? 'bg-primary/10' : 'bg-destructive/10'"
          >
            <AlertCircle
              class="w-5 h-5"
              :class="dryRun ? 'text-primary' : 'text-destructive'"
            />
          </div>
          {{ dialogTitle }}
        </AlertDialogTitle>
        <AlertDialogDescription class="space-y-5 pt-2">
          <!-- Warning Message -->
          <div
            class="flex items-start gap-3 p-4 rounded-lg border transition-colors duration-200"
            :class="dryRun
              ? 'bg-primary/5 border-primary/20 text-primary'
              : 'bg-destructive/5 border-destructive/20 text-destructive'"
          >
            <AlertTriangle class="w-5 h-5 mt-0.5 shrink-0" />
            <p class="font-medium text-sm">{{ warningMessage }}</p>
          </div>

          <!-- Branch Count & List -->
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-foreground">
                Selected branches
              </p>
              <Badge variant="secondary">
                {{ branches.length }} {{ branches.length === 1 ? 'branch' : 'branches' }}
              </Badge>
            </div>
            <div class="bg-muted/50 rounded-lg border border-border p-4 max-h-60 overflow-y-auto">
              <ul class="space-y-2">
                <li
                  v-for="branch in branches"
                  :key="branch"
                  class="flex items-center gap-2 text-sm font-mono text-foreground"
                >
                  <div class="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                  {{ branch }}
                </li>
              </ul>
            </div>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter class="gap-2">
        <AlertDialogCancel
          :disabled="isDeleting"
          class="transition-colors duration-200"
        >
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          :disabled="isDeleting"
          :class="cn(
            'gap-2 transition-all duration-200',
            dryRun ? buttonVariants() : buttonVariants({ variant: 'destructive' })
          )"
          @click="handleConfirm"
        >
          <Loader2 v-if="isDeleting" class="w-4 h-4 animate-spin" />
          {{ confirmButtonText }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
