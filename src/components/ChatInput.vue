<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  disabled?: boolean
  streaming?: boolean
  canAbort?: boolean
}>()

const emit = defineEmits<{
  (e: 'send', payload: { content: string; stream: boolean }): void
  (e: 'stop'): void
}>()

const message = ref('')
const streamEnabled = ref(true)

const isDisabled = computed(() => props.disabled || !message.value.trim())

const handleSend = () => {
  if (isDisabled.value) return
  emit('send', { content: message.value, stream: streamEnabled.value })
  message.value = ''
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

const toggleStreaming = () => {
  streamEnabled.value = !streamEnabled.value
}

const stopStreaming = () => {
  if (props.canAbort) {
    emit('stop')
  }
}
</script>

<template>
  <div class="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-3 shadow-xl shadow-black/30">
    <div class="flex items-end gap-3">
      <textarea
        v-model="message"
        rows="1"
        placeholder="Escribe tu mensaje"
        class="scrollbar-thin max-h-40 min-h-[56px] flex-1 resize-none rounded-xl border border-transparent bg-slate-900/40 px-4 py-3 text-sm text-slate-100 outline-none focus:border-slate-700 focus:bg-slate-900"
        :disabled="props.disabled"
        @keydown="handleKeydown"
      />
      <div class="flex flex-col items-end gap-2">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full border border-slate-800/60 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-700 hover:text-slate-200"
          @click="toggleStreaming"
        >
          <span class="size-2 rounded-full" :class="streamEnabled ? 'bg-emerald-400' : 'bg-slate-600'" />
          <span>Streaming {{ streamEnabled ? 'on' : 'off' }}</span>
        </button>
        <div class="flex gap-2">
          <button
            v-if="props.streaming"
            type="button"
            class="rounded-full bg-amber-500/90 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-400"
            :disabled="!props.canAbort"
            @click="stopStreaming"
          >
            Detener
          </button>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-700/50"
            :disabled="isDisabled"
            @click="handleSend"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="size-4" fill="currentColor">
              <path d="M15.854.146a.5.5 0 0 0-.53-.109l-14 5a.5.5 0 0 0-.02.934l6.173 2.47 2.47 6.173a.5.5 0 0 0 .934-.02l5-14a.5.5 0 0 0-.106-.531zM6.64 7.64 2.229 5.912 13.5 2.5 10.088 13.771 8.36 9.36l3.147-3.147a.25.25 0 1 0-.354-.354z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <p class="mt-2 text-[10px] text-slate-500">Presiona Enter para enviar, Shift + Enter para nueva línea</p>
  </div>
</template>
