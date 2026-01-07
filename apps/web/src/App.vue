<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner';
import Home from '@/views/home.vue';
</script>

<template>
  <Toaster position="top-right" :duration="4000" richColors />
  <Home />
</template>
