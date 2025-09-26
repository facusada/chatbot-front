<template>
  <header class="sticky top-0 z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
      <div>
        <h1 class="text-lg font-semibold text-white">Chatbot</h1>
        <p class="text-xs text-slate-400">Inspirado en la experiencia de ChatGPT</p>
      </div>
      <slot name="actions" />
    </div>
  </header>
</template>
