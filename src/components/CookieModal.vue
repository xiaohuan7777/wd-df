<script setup>
import { ref, watch } from 'vue'
import { api, setCookie, hasCookie } from '../api.js'

const props = defineProps(['show'])
const emit = defineEmits(['close', 'done'])

const input = ref('')
const result = ref(null)
const saving = ref(false)

const save = async () => {
  const v = input.value.trim()
  if (!v) { result.value = { ok: false, msg: '请输入 Cookie' }; return }
  saving.value = true
  try {
    const r = await api('set-cookie', { method: 'POST', body: { cookie: v } })
    if (r.test_ok) {
      setCookie(v)
      result.value = { ok: true, msg: 'Cookie 有效，已保存到本地' }
      setTimeout(() => emit('done'), 800)
    } else {
      result.value = { ok: false, msg: r.message || 'Cookie 无效' }
    }
  } catch (e) {
    result.value = { ok: false, msg: e.message }
  } finally {
    saving.value = false
  }
}

const close = () => {
  emit('close')
  result.value = null
}

watch(() => props.show, (v) => { if (v) { input.value = ''; result.value = null } })
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="close">
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative bg-white rounded-2xl w-full max-w-md mx-4 p-6 max-h-[85vh] overflow-y-auto shadow-xl animate-[fadeIn_.2s]">
        <h3 class="text-lg font-bold mb-1">⚙️ 配置 Cookie</h3>
        <p class="text-sm text-slate-500 mb-4">从微信中获取 JSESSIONID 粘贴到下方。Cookie 仅保存在你的浏览器本地。</p>

        <div class="text-xs text-slate-600 space-y-2 mb-4 leading-relaxed">
          <div class="flex gap-2"><span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">1</span> 手机微信打开学校电费页</div>
          <div class="flex gap-2"><span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">2</span> 用 HttpCanary / Stream 抓包获取 Cookie</div>
          <div class="flex gap-2"><span class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center text-xs font-bold shrink-0">3</span> 复制 <code class="bg-slate-100 px-1 rounded text-xs">JSESSIONID=xxx</code> 粘贴到下面</div>
        </div>

        <label class="text-sm font-semibold block mb-1.5">Cookie 值</label>
        <textarea v-model="input" placeholder="JSESSIONID=请粘贴你的Cookie"
          class="w-full p-3 rounded-lg border border-slate-200 text-sm font-mono resize-y min-h-[70px] bg-slate-50 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"></textarea>

        <div class="flex gap-2.5 mt-4">
          <button @click="close" class="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition">取消</button>
          <button @click="save" :disabled="saving"
            class="flex-1 py-2.5 rounded-lg bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 transition disabled:opacity-50">
            {{ saving ? '测试中...' : '保存并测试' }}
          </button>
        </div>

        <div v-if="result" class="mt-3 text-sm p-2.5 rounded-lg"
          :class="result.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'">
          {{ result.ok ? '✅ ' : '❌ ' }}{{ result.msg }}
        </div>
      </div>
    </div>
  </Teleport>
</template>
