<script setup>
defineProps(['balance', 'room', 'updateTime', 'hasCookie'])
defineEmits(['openCookie', 'openBg'])
</script>

<template>
  <div class="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg">
    <div class="absolute -top-12 -right-8 w-36 h-36 rounded-full bg-white/6"></div>
    <div class="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/4"></div>
    <div class="relative z-10">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-xl font-bold tracking-wide">⚡ 小幻电费查询</h1>
          <div class="inline-flex items-center gap-1.5 text-xs mt-1 bg-white/15 px-2.5 py-0.5 rounded-full">
            <span class="w-1.5 h-1.5 rounded-full" :class="hasCookie ? 'bg-green-400' : 'bg-amber-400'"></span>
            {{ hasCookie ? '已连接' : '未连接' }}
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="$emit('openBg')" class="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-base hover:bg-white/25 transition" title="背景图">🖼️</button>
          <button @click="$emit('openCookie')" class="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-base hover:bg-white/25 transition" title="设置">⚙️</button>
        </div>
      </div>
      <div class="mt-5">
        <div class="text-sm opacity-75">剩余购电</div>
        <div class="text-5xl font-extrabold tracking-tight mt-1">
          {{ balance != null ? balance.toFixed(2) : '--' }}<span class="text-xl font-medium ml-1">度</span>
        </div>
      </div>
      <div class="flex gap-5 mt-4 text-sm opacity-80">
        <div>更新时间 <span class="font-semibold">{{ updateTime || '--' }}</span></div>
      </div>
    </div>
  </div>
</template>
