<script setup>
import { ref, onMounted } from 'vue'
import { api, setCookie, hasCookie } from './api.js'
import HeaderSection from './components/HeaderSection.vue'
import SummaryCards from './components/SummaryCards.vue'
import RecordList from './components/RecordList.vue'
import UsageChart from './components/UsageChart.vue'
import CookieModal from './components/CookieModal.vue'
import BgModal from './components/BgModal.vue'

// ---- 状态 ----
const connected = ref(false)
const loading = ref(false)
const currentTab = ref('usage')
const balance = ref(null)
const room = ref(null)
const updateTime = ref('')
const monthUsage = ref(0)
const monthRecharge = ref(0)
const usageData = ref([])
const rechargeData = ref([])
const historyData = ref([])
const showCookieModal = ref(false)
const showBgModal = ref(false)
const cookieAlert = ref(true)

// ---- 加载数据 ----
const fetchData = async () => {
  loading.value = true
  try {
    const data = await api('data')
    if (data.error) {
      if (data.error === 'no_cookie') {
        cookieAlert.value = true
        connected.value = false
      }
      return
    }
    balance.value = data.balance
    room.value = data.room
    updateTime.value = new Date().toLocaleString()
    usageData.value = (data.usage || []).map(r => ({
      date: r.date, usage: r.usage || 0, count: r.count || 1,
    }))
    rechargeData.value = (data.recharge || []).map(r => ({
      date: r.date, amount: r.amount || 0, method: '微信支付',
    }))

    const now = new Date()
    const mp = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
    monthUsage.value = usageData.value.filter(r => r.date.startsWith(mp)).reduce((s, r) => s + r.usage, 0)
    monthRecharge.value = rechargeData.value.filter(r => r.date.startsWith(mp)).reduce((s, r) => s + r.amount, 0)

    connected.value = true
    cookieAlert.value = false

    // 加载本地历史
    try {
      const h = JSON.parse(localStorage.getItem('xiaohuan_history') || '[]')
      // 追加本次数据
      const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
      h.push({ time: now, balance: data.balance, today_usage: monthUsage.value })
      if (h.length > 720) h.splice(0, h.length - 720)
      localStorage.setItem('xiaohuan_history', JSON.stringify(h))
      if (h.length >= 2) historyData.value = h
    } catch {}
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// ---- 初始化 ----
onMounted(async () => {
  if (hasCookie()) {
    connected.value = true
    cookieAlert.value = false
    await fetchData()
  }
  // 加载历史
  try {
    const h = JSON.parse(localStorage.getItem('xiaohuan_history') || '[]')
    if (h.length >= 2) historyData.value = h.slice(-72)
  } catch {}
})

const onCookieSet = async () => {
  showCookieModal.value = false
  await fetchData()
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 pb-10 lg:max-w-5xl">
    <div class="lg:grid lg:grid-cols-[340px_1fr] lg:gap-5 lg:items-start">
      <div class="flex flex-col gap-4 lg:sticky lg:top-8">
        <HeaderSection
          :balance="balance" :room="room" :updateTime="updateTime"
          :hasCookie="connected"
          @open-cookie="showCookieModal = true" @open-bg="showBgModal = true"
        />
        <SummaryCards :monthUsage="monthUsage" :monthRecharge="monthRecharge" />
        <div v-if="cookieAlert" class="bg-amber-50 border border-amber-300 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
          <span class="text-xl shrink-0">🔑</span>
          <div>
            <strong class="block text-sm mb-1">尚未配置连接</strong>
            从微信抓包获取 JSESSIONID Cookie 并粘贴。
            <br><button @click="showCookieModal = true" class="mt-2 px-4 py-1.5 bg-indigo-500 text-white text-xs rounded-full font-semibold hover:bg-indigo-600 transition">立即配置 →</button>
          </div>
        </div>
      </div>

      <div class="min-w-0">
        <div class="flex mt-5 lg:mt-0 bg-white rounded-xl p-1 shadow-sm">
          <button v-for="tab in [{k:'usage',t:'📈 用量记录'},{k:'recharge',t:'💳 充值记录'}]" :key="tab.k"
            @click="currentTab = tab.k"
            class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
            :class="currentTab === tab.k ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-500 hover:text-indigo-500'"
          >{{ tab.t }}</button>
        </div>

        <UsageChart v-if="currentTab === 'usage'" :usageData="usageData" :historyData="historyData" />

        <div v-if="loading" class="flex flex-col items-center py-12 text-slate-400">
          <div class="w-8 h-8 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
          <span class="text-sm">加载中...</span>
        </div>
        <RecordList v-else :type="currentTab" :data="currentTab === 'usage' ? usageData : rechargeData" />
      </div>
    </div>

    <div class="text-center pt-8 pb-2 text-xs text-slate-400">小幻电费查询系统 · Powered by EdgeOne Pages</div>
  </div>

  <CookieModal :show="showCookieModal" @close="showCookieModal = false" @done="onCookieSet" />
  <BgModal :show="showBgModal" @close="showBgModal = false" />
</template>
