<script setup>
import { computed } from 'vue'

const props = defineProps(['type', 'data'])

const records = computed(() => {
  if (props.type === 'usage') {
    return props.data.map(r => ({
      title: '用电 ' + r.usage.toFixed(1) + ' 度' + (r.count > 1 ? ` (${r.count}次)` : ''),
      date: r.date,
      right: r.usage.toFixed(1) + ' 度',
      rightClass: 'text-amber-500',
      dotClass: 'bg-amber-400',
    }))
  } else {
    return props.data.map(r => ({
      title: '充值 ¥' + Number(r.amount).toFixed(2),
      date: r.date + ' · ' + (r.method || '微信支付'),
      right: '+¥' + Number(r.amount).toFixed(2),
      rightClass: 'text-emerald-500',
      dotClass: 'bg-emerald-500',
    }))
  }
})
</script>

<template>
  <div v-if="!records.length" class="text-center py-12 text-slate-400">
    <div class="text-5xl mb-3 opacity-50">📭</div>
    <div class="text-sm">暂无记录</div>
  </div>
  <div v-else class="flex flex-col gap-2 mt-3">
    <div v-for="(r, i) in records" :key="i"
      class="bg-white rounded-xl px-4 py-3.5 flex items-center justify-between shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-default">
      <div class="flex items-center gap-3">
        <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="r.dotClass"></span>
        <div>
          <div class="text-sm font-semibold" v-text="r.title"></div>
          <div class="text-xs text-slate-400 mt-0.5" v-text="r.date"></div>
        </div>
      </div>
      <div class="text-base font-bold" :class="r.rightClass" v-text="r.right"></div>
    </div>
  </div>
</template>
