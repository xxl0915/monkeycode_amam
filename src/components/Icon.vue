<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-if="name === 'spark'" d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8L12 3z" />
    <path v-else-if="name === 'package'" d="M12 3l8 4.5v9L12 21 4 16.5v-9L12 3zm0 9l8-4.5M12 12v9M12 12L4 7.5" />
    <path v-else-if="name === 'refresh'" d="M4 12a8 8 0 0113.7-5.6M20 12a8 8 0 01-13.7 5.6M4 4v6h6M20 20v-6h-6" />
    <path v-else-if="name === 'files'" d="M8 7h10v12H8zM6 5h10" />
    <path v-else-if="name === 'test'" d="M9 3h6l1 4H8L9 3zm1 4v6l-3 7h10l-3-7V7" />
    <path v-else-if="name === 'users'" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm13 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    <path v-else-if="name === 'video'" d="M15 10l6-3.5v11L15 14M3 7h12v10H3z" />
    <path v-else-if="name === 'play'" d="M8 5v14l11-7z" />
    <path v-else-if="name === 'layers'" d="M12 3l9 5-9 5-9-5 9-5zm9 9l-9 5-9-5" />
    <path v-else-if="name === 'config'" d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    <path v-else-if="name === 'search'" d="M11 19a8 8 0 100-16 8 8 0 000 16zm10 2l-4.3-4.3" />
    <path v-else-if="name === 'chevron'" d="M6 9l6 6 6-6" />
    <path v-else-if="name === 'open'" d="M7 17L17 7M9 7h8v8" />
    <path v-else-if="name === 'globe'" d="M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3.6 3 14.4 0 18M12 3c-3 3.6-3 14.4 0 18" />
    <path v-else-if="name === 'book'" d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V5.5A2.5 2.5 0 016.5 3H20v14H6.5" />
    <path v-else-if="name === 'coins'" d="M8 14a6 6 0 100-12 6 6 0 000 12zm8 8a6 6 0 100-12 6 6 0 000 12z" />
    <path v-else-if="name === 'close'" d="M6 6l12 12M18 6L6 18" />
    <path v-else-if="name === 'user'" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
    <path v-else-if="name === 'mail'" d="M4 6h16v12H4zM4 8l8 6 8-6" />
    <path v-else-if="name === 'lock'" d="M7 11V8a5 5 0 0110 0v3M6 11h12v10H6z" />
    <path v-else-if="name === 'phone'" d="M6 3h4l2 5-3 2a12 12 0 006 6l2-3 5 2v4a2 2 0 01-2 2A16 16 0 014 5a2 2 0 012-2z" />
    <path v-else-if="name === 'download'" d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
    <path v-else-if="name === 'maximize'" d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    <path v-else-if="name === 'copy'" d="M8 8h12v12H8zM4 16V4h12" />
    <path v-else-if="name === 'shield'" d="M12 3l8 4v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V7l8-4z" />
    <path v-else-if="name === 'message'" d="M4 5h16v11H8l-4 4V5z" />
    <path v-else-if="name === 'list'" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    <path v-else-if="name === 'check'" d="M20 6L9 17l-5-5" />
    <path v-else-if="name === 'help'" d="M12 21a9 9 0 100-18 9 9 0 000 18zM9.1 9a3 3 0 015.8 1c0 2-3 3-3 3M12 17h.01" />
      <path v-else-if="name === 'upload'" d="M12 21V9m0 0l-4 4m4-4l4 4M5 5h14" />
      <path v-else-if="name === 'plus'" d="M12 5v14M5 12h14" />
      <path v-else-if="name === 'minus'" d="M5 12h14" />
    <path v-else d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8L12 3z" />
  </svg>
</template>

<script setup>
defineProps({
  name: { type: String, default: 'spark' },
  size: { type: [Number, String], default: 18 }
})
</script>
