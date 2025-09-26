<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMessage } from '@/utils/types'

const props = defineProps<{
  message: ChatMessage
}>()

const isUser = computed(() => props.message.role === 'user')
const bubbleClasses = computed(() =>
  [
    'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-colors',
    isUser.value ? 'bg-sky-500/90 text-white' : 'bg-slate-800/80 text-slate-100'
  ].join(' ')
)
</script>

<template>
  <li :class="['flex w-full gap-3', isUser ? 'justify-end' : 'justify-start']">
    <div
      v-if="!isUser"
      class="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/90 text-xs font-semibold text-white shadow"
    >
      AI
    </div>
    <div :class="bubbleClasses">
      <div class="whitespace-pre-wrap">{{ message.content }}</div>
      <div class="mt-2 text-[10px] uppercase tracking-wide text-slate-400" v-if="message.pending">Generando…</div>
    </div>
    <div
      v-if="isUser"
      class="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-500/80 text-xs font-semibold text-white shadow"
    >
      Tú
    </div>
  </li>
</template>
