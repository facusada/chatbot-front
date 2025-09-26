<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import ChatHeader from '@/components/ChatHeader.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
import { useChatStore } from '@/store/chat.store'

const chatStore = useChatStore()
const { messages, isLoading, isStreaming, error, canAbortStreaming } = storeToRefs(chatStore)
const scrollAnchor = ref<HTMLDivElement | null>(null)

const pushWelcomeMessage = () => {
  chatStore.appendMessage({
    id: 'welcome-message',
    role: 'assistant',
    content: 'Hola 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
    createdAt: Date.now()
  })
}

const handleSend = async (payload: { content: string; stream: boolean }) => {
  await chatStore.sendMessage(payload.content, { stream: payload.stream })
}

const handleStop = () => {
  chatStore.abortStream()
}

const handleNewChat = () => {
  chatStore.reset()
  pushWelcomeMessage()
}

watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollAnchor.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }
)

onMounted(() => {
  if (!messages.value.length) {
    pushWelcomeMessage()
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <ChatHeader>
      <template #actions>
        <button
          class="rounded-full border border-slate-800/80 px-4 py-1.5 text-xs text-slate-300 transition hover:border-slate-700 hover:text-slate-100"
          @click="handleNewChat"
        >
          Nuevo chat
        </button>
      </template>
    </ChatHeader>

    <main class="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-28 pt-6 sm:px-6">
      <section class="flex-1 overflow-y-auto pb-6 scrollbar-thin">
        <ul class="flex flex-col gap-6">
          <ChatMessage v-for="message in messages" :key="message.id" :message="message" />
        </ul>
        <div ref="scrollAnchor" class="h-0 w-full" aria-hidden="true" />
      </section>

      <div v-if="error" class="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
        {{ error }}
      </div>

      <ChatInput
        :disabled="isLoading && !isStreaming"
        :streaming="isStreaming"
        :can-abort="canAbortStreaming"
        @send="handleSend"
        @stop="handleStop"
      />
    </main>
  </div>
</template>
