<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps(['usageData', 'historyData'])
const canvas = ref(null)
let chartInstance = null
let animFrame = null

const draw = async () => {
  await nextTick()
  if (!canvas.value) return
  if (chartInstance) { chartInstance.destroy(); chartInstance = null }
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null }

  const useHistory = props.historyData && props.historyData.length >= 2

  if (useHistory) {
    drawHistory()
  } else if (props.usageData && props.usageData.length >= 2) {
    drawUsage()
  }
}

const drawUsage = () => {
  const raw = props.usageData.slice(0, 14).reverse()
  const labels = raw.map(d => d.date.length >= 10 ? d.date.substring(5) : d.date)
  const values = raw.map(d => d.usage)

  const ctx = canvas.value.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 0, 200)
  gradient.addColorStop(0, 'rgba(99,102,241,0.15)')
  gradient.addColorStop(1, 'rgba(99,102,241,0.0)')

  chartInstance = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: '#6366f1',
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#6366f1',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        order: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutCubic' },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ctx.parsed.y.toFixed(2) + ' 度' },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: '#94a3b8', maxRotation: 0 },
        },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            font: { size: 10 }, color: '#94a3b8',
            callback: v => v.toFixed(1),
          },
        },
      },
    },
  })
}

const drawHistory = () => {
  const raw = props.historyData.slice(-72)
  const labels = raw.map(d => d.time.substring(5, 16))
  const values = raw.map(d => d.balance)

  const ctx = canvas.value.getContext('2d')
  const gradient = ctx.createLinearGradient(0, 0, 0, 200)
  gradient.addColorStop(0, 'rgba(16,185,129,0.12)')
  gradient.addColorStop(1, 'rgba(16,185,129,0.0)')

  chartInstance = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: values,
        borderColor: '#10b981',
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#10b981',
        pointBorderWidth: 1.5,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
        order: 1,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600, easing: 'easeOutCubic' },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ctx.parsed.y.toFixed(2) + ' 度' },
        },
        subtitle: {
          display: true,
          text: '余额趋势 (最近36h)',
          align: 'end',
          font: { size: 11 },
          color: '#10b981',
          padding: { bottom: 4 },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 10 }, color: '#94a3b8', maxRotation: 0,
            callback: (_, i) => (i % Math.ceil(labels.length / 8) === 0 || i === labels.length - 1) ? labels[i] : '',
          },
        },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            font: { size: 10 }, color: '#94a3b8',
            callback: v => v.toFixed(0),
          },
        },
      },
    },
  })
}

watch(() => [props.usageData, props.historyData], draw, { deep: true })
onMounted(draw)
onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
  if (animFrame) cancelAnimationFrame(animFrame)
})
</script>

<template>
  <div v-if="(usageData && usageData.length >= 2) || (historyData && historyData.length >= 2)"
    class="bg-white rounded-2xl shadow-sm p-4 mt-3">
    <div style="height:210px">
      <canvas ref="canvas"></canvas>
    </div>
  </div>
</template>
