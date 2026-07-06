# ⚡ 小幻电费查询系统

安徽文达信息工程学院 · ISIMS 智能收费系统 · 第三方电费查询工具

**纯前端 + EdgeOne Pages Edge Functions，无需服务器，无需数据库。**

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 (Composition API) + Vite |
| 样式 | Tailwind CSS v4 |
| 图表 | Chart.js v4 |
| 后端 | EdgeOne Pages Edge Functions (JavaScript) |
| 存储 | 浏览器 localStorage |

---

## 架构

```
浏览器                        EdgeOne Pages                  学校服务器
  │                              │                              │
  │  /api/data?cookie=xxx        │                              │
  ├─────────────────────────────→│                              │
  │                              │  GET /pay/home (带Cookie)    │
  │                              ├─────────────────────────────→│
  │                              │←──── HTML 页面 ─────────────┤
  │                              │  GET /pay/record             │
  │                              ├─────────────────────────────→│
  │                              │←──── HTML 页面 ─────────────┤
  │                              │  GET /use/record             │
  │                              ├─────────────────────────────→│
  │                              │←──── HTML 页面 ─────────────┤
  │                              │  正则解析 HTML → JSON         │
  │←──── JSON ──────────────────┤                              │
  │  Vue 渲染页面                │                              │
```

---

## 功能

- 查看电费余额、充值记录、用电明细
- 用量折线图（Chart.js 平滑曲线 + 入场动画）
- 余额历史趋势图（本地存储，访问次数越多越完整）
- 自定义背景图
- 手机 / 电脑自适应（桌面端双栏布局）

---

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建
npm run build
```

---

## 部署到 EdgeOne Pages

### 方式一：Git 仓库自动部署（推荐）

1. 将项目推送到 GitHub / GitLab
2. EdgeOne Pages 控制台 → 新建项目 → 关联仓库
3. 构建设置：

| 字段 | 值 |
|------|-----|
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| 函数目录 | `functions` |

4. 点击部署

### 方式二：手动上传

```bash
npm run build
```

将 `dist/` 和 `functions/` 两个目录上传到 EdgeOne Pages。

---

## 配置 Cookie

部署完成后打开页面 → 点击右上角 ⚙️ → 粘贴 `JSESSIONID` → 保存并测试。

Cookie 仅存储在浏览器本地，不会上传到任何服务器。

### 获取 Cookie

手机微信打开学校公众号电费页，用抓包工具获取：

| 手机 | 工具 | 方法 |
|------|------|------|
| Android | HttpCanary | 安装 → 微信打开电费页 → 找到 `www.wendasch.cn` → 复制 Cookie |
| iOS | Stream | 同上 |
| PC 微信 | F12 | 微信打开电费页 → Application → Cookies |

Cookie 格式：`JSESSIONID=AD6FEECC12CC...`

---

## 项目结构

```
小幻电费查询/
├── functions/
│   └── api.js                # Edge Function (API 代理 + HTML 解析)
├── src/
│   ├── main.js               # Vue 入口
│   ├── api.js                # 前端 API 封装 (localStorage)
│   ├── App.vue               # 主组件
│   └── components/
│       ├── HeaderSection.vue  # 余额头部
│       ├── SummaryCards.vue   # 本月统计
│       ├── RecordList.vue     # 记录列表
│       ├── UsageChart.vue     # Chart.js 图表
│       ├── CookieModal.vue    # Cookie 配置弹窗
│       └── BgModal.vue        # 背景图弹窗
├── package.json
├── vite.config.js
└── index.html                # Vite 入口
```

---

## API 接口

由 `functions/api.js` 处理，EdgeOne Pages 自动路由 `/api/*` 到该函数。

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/data?cookie=xxx` | GET | 获取电费数据（余额、充值记录、用量记录） |
| `/api/set-cookie` | POST | 测试 Cookie 是否有效 |

返回格式：

```json
{
  "balance": 120.65,
  "subsidy": 0,
  "room": "1-101",
  "meter": "1-101空调",
  "recharge": [{"date":"2026-06-10 07:51:52","amount":20}],
  "usage": [{"date":"2026-06-11","usage":6.22,"count":2}]
}
```

---

## 常见问题

| 问题 | 解决 |
|------|------|
| 显示"未连接" | Cookie 过期，重新抓包粘贴 |
| API 返回错误 | Cookie 格式不对或学校接口挂了 |
| 换浏览器 Cookie 丢失 | Cookie 存在 localStorage，换了浏览器需重新粘贴 |
| 图表没有历史趋势 | 需要多次打开页面，每次会自动记录一条 |
| 部署后页面空白 | 确认 EdgeOne Pages 函数目录设置为 `functions` |
