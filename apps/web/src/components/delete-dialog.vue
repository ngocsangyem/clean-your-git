<script setup lang="ts">
import { ref, computed } from 'vue';
import { AlertTriangle } from 'lucide-vue-next';
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
import { buttonVariants } from '@/components/ui/button';
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
    <AlertDialogContent class="max-w-2xl max-h-[80vh] flex flex-col">
      <AlertDialogHeader>
        <AlertDialogTitle class="flex items-center gap-2">
          <AlertTriangle class="w-6 h-6" :class="dryRun ? 'text-primary' : 'text-destructive'" />
          {{ dialogTitle }}
        </AlertDialogTitle>
        <AlertDialogDescription>
          <div class="space-y-4">
            <!-- Warning -->
            <div
              class="p-4 rounded-lg"
              :class="dryRun ? 'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200' : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'"
            >
              <p class="font-medium">{{ warningMessage }}</p>
            </div>

            <!-- Branch List -->
            <div class="space-y-2">
              <p class="text-sm font-medium">
                {{ branches.length }} {{ branches.length === 1 ? 'branch' : 'branches' }}:
              </p>
              <div class="bg-muted rounded-lg p-4 max-h-60 overflow-y-auto">
                <ul class="space-y-1">
                  <li v-for="branch in branches" :key="branch" class="text-sm font-mono">
                    • {{ branch }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isDeleting">Cancel</AlertDialogCancel>
        <AlertDialogAction
          :disabled="isDeleting"
          :class="dryRun ? buttonVariants() : buttonVariants({ variant: 'destructive' })"
          @click="handleConfirm"
        >
          {{ confirmButtonText }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
