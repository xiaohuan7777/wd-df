<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps(['show'])
const emit = defineEmits(['close'])

const url = ref('')

const apply = (u) => {
  if (u) {
    document.body.style.setProperty('--bg-img', `url(${u})`)
    document.body.classList.add('has-bg')
    localStorage.setItem('xiaohuan_bg_url', u)
  } else {
    document.body.style.removeProperty('--bg-img')
    document.body.classList.remove('has-bg')
    localStorage.removeItem('xiaohuan_bg_url')
  }
}

const save = () => {
  apply(url.value.trim())
  emit('close')
}

const clear = () => {
  url.value = ''
  apply('')
  emit('close')
}

const close = () => emit('close')

watch(() => props.show, (v) => {
  if (v) {
    url.value = localStorage.getItem('xiaohuan_bg_url') || ''
  }
})

onMounted(() => {
  const saved = localStorage.getItem('xiaohuan_bg_url')
  if (saved) apply(saved)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center" @click.self="close">
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative bg-white rounded-2xl w-full max-w-md mx-4 p-6 shadow-xl animate-[fadeIn_.2s]">
        <h3 class="text-lg font-bold mb-1">🖼️ 背景图设置</h3>
        <p class="text-sm text-slate-500 mb-4">粘贴图片 URL 即可更换背景。</p>

        <label class="text-sm font-semibold block mb-1.5">图片 URL</label>
        <input v-model="url" placeholder="https://picsum.photos/1920/1080"
          class="w-full p-2.5 rounded-lg border border-slate-200 text-sm bg-slate-50 focus:outline-none focus:border-indigo-400 mb-3">

        <div class="flex gap-2.5">
          <button @click="clear" class="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition">清除背景</button>
          <button @click="save" class="flex-1 py-2.5 rounded-lg bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 transition">应用</button>
        </div>

        <div class="text-xs text-slate-400 mt-3 leading-relaxed">
          💡 推荐 Unsplash、Lorem Picsum<br>💡 深色图片文字更清晰
        </div>
      </div>
    </div>
  </Teleport>
</template>
