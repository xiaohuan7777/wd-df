<script setup>
defineProps(['monthUsage', 'monthRecharge'])
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <div class="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-default">
      <div class="w-11 h-11 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center text-xl shrink-0">📊</div>
      <div>
        <div class="text-xs text-slate-500">本月用电</div>
        <div class="text-xl font-bold mt-0.5">{{ monthUsage.toFixed(1) }}<span class="text-xs font-medium text-slate-400 ml-0.5">度</span></div>
      </div>
    </div>
    <div class="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-default">
      <div class="w-11 h-11 rounded-xl bg-red-100 text-red-500 flex items-center justify-center text-xl shrink-0">💰</div>
      <div>
        <div class="text-xs text-slate-500">本月充值</div>
        <div class="text-xl font-bold mt-0.5">{{ monthRecharge.toFixed(2) }}<span class="text-xs font-medium text-slate-400 ml-0.5">元</span></div>
      </div>
    </div>
  </div>
</template>
