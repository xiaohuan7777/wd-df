/**
 * 小幻电费查询系统 - EdgeOne Pages Edge Function
 * ===============================================
 * 处理 /api/* 请求，代理到学校 ISIMS 系统，解析 HTML 返回 JSON。
 * 零依赖，纯 JavaScript。
 */

// ==================== HTML 解析 ====================

function parseBalance(html) {
  const result = { balance: null, subsidy: null, room: null, meter: null, roomShort: null };

  const roomMatch = html.match(/当前房间.*?<div\s+class="item-title">([^<]+)<\/div>/s);
  if (roomMatch) {
    result.room = roomMatch[1].trim();
    const short = result.room.match(/(\d+-\d+)/);
    result.roomShort = short ? short[1] : result.room.split('/').pop();
  }

  const meterMatch = html.match(/list-group-title">([^<]+)<\/li>/);
  if (meterMatch) result.meter = meterMatch[1].trim();

  const balanceMatch = html.match(/剩余购电<\/div>\s*<div\s+class="item-after">([\d.]+)度<\/div>/s);
  if (balanceMatch) result.balance = parseFloat(balanceMatch[1]);

  const subsidyMatch = html.match(/剩余补助<\/div>\s*<div\s+class="item-after">([\d.]+)度<\/div>/s);
  if (subsidyMatch) result.subsidy = parseFloat(subsidyMatch[1]);

  return result;
}

function parseRecordList(html) {
  const records = [];
  const re = /<li\s+class="item-content">\s*<div\s+class="item-inner">\s*<div\s+class="item-title-row">\s*<div\s+class="item-title">([^<]*)<\/div>\s*<div\s+class="item-after">([^<]*)<\/div>/gs;
  let m;
  while ((m = re.exec(html)) !== null) {
    const title = m[1].trim();
    const value = m[2].trim();
    // 跳过 JS 模板
    if (title.includes('data[') || value.includes('data[')) continue;
    if (title.includes("' +") || value.includes("' +")) continue;
    if (title.includes('.result') || value.includes('.result')) continue;
    records.push({ title, value });
  }
  return records;
}

function parseRechargeRecords(html) {
  return parseRecordList(html)
    .filter(r => !r.title.includes('剩余') && !r.title.includes('购电') && !r.title.includes('补助'))
    .filter(r => !r.title.includes('空调') && !r.title.includes('照明') && !r.title.includes('插座'))
    .map(r => {
      const m = r.value.match(/([\d.]+)元/);
      return { date: r.title, amount: m ? parseFloat(m[1]) : null, value_raw: r.value };
    });
}

function parseUsageRecords(html) {
  const list = parseRecordList(html)
    .filter(r => !r.title.includes('剩余') && !r.title.includes('购电') && !r.title.includes('补助'))
    .filter(r => !r.title.includes('空调') && !r.title.includes('照明') && !r.title.includes('插座'));

  // 按天合并
  const daily = {};
  list.forEach(r => {
    const m = r.value.match(/([\d.]+)度/);
    const usage = m ? parseFloat(m[1]) : 0;
    const day = r.title.substring(0, 10);
    if (!daily[day]) daily[day] = { usage: 0, count: 0 };
    daily[day].usage += usage;
    daily[day].count++;
  });

  return Object.entries(daily).map(([date, d]) => ({
    date,
    usage: Math.round(d.usage * 100) / 100,
    count: d.count,
    value_raw: `${d.usage}度 (${d.count}条)`,
  }));
}

function parseBalanceFromRecords(html) {
  const result = { balance: null, subsidy: null, meter: null };
  const meterMatch = html.match(/list-group-title">([^<]+)<\/li>/);
  if (meterMatch) result.meter = meterMatch[1].trim();
  const bal = html.match(/剩余购电<\/div>\s*<div\s+class="item-after">([\d.]+)度<\/div>/s);
  if (bal) result.balance = parseFloat(bal[1]);
  const sub = html.match(/剩余补助<\/div>\s*<div\s+class="item-after">([\d.]+)度<\/div>/s);
  if (sub) result.subsidy = parseFloat(sub[1]);
  return result;
}

// ==================== 数据聚合 ====================

async function fetchAllData(cookie) {
  const result = {
    balance: null, subsidy: null, room: null, room_full: null,
    meter: null, recharge: [], usage: [],
  };

  const headers = {
    'Cookie': cookie,
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.38',
  };

  // 1. 余额页
  const r1 = await fetch('http://www.wendasch.cn/pay/home', { headers });
  const h1 = await r1.text();
  if (r1.status === 200) {
    const p = parseBalance(h1);
    result.balance = p.balance;
    result.subsidy = p.subsidy;
    result.room = p.roomShort || p.room;
    result.room_full = p.room;
    result.meter = p.meter;
  }

  // 2. 充值记录
  const r2 = await fetch('http://www.wendasch.cn/pay/record', { headers });
  const h2 = await r2.text();
  if (r2.status === 200) {
    if (result.balance === null) {
      const b = parseBalanceFromRecords(h2);
      if (b.balance !== null) result.balance = b.balance;
      if (b.subsidy !== null) result.subsidy = b.subsidy;
      result.meter = result.meter || b.meter;
    }
    result.recharge = parseRechargeRecords(h2);
  }

  // 3. 用量记录
  const r3 = await fetch('http://www.wendasch.cn/use/record', { headers });
  const h3 = await r3.text();
  if (r3.status === 200) {
    if (result.balance === null) {
      const b = parseBalanceFromRecords(h3);
      if (b.balance !== null) result.balance = b.balance;
      if (b.subsidy !== null) result.subsidy = b.subsidy;
      result.meter = result.meter || b.meter;
    }
    result.usage = parseUsageRecords(h3);
  }

  return result;
}

// ==================== 路由 ====================

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const json = (data, status = 200) =>
    new Response(JSON.stringify(data, null, 2), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders },
    });

  try {
    // GET /api/data?cookie=xxx
    if (path === '/api/data' && request.method === 'GET') {
      const cookie = url.searchParams.get('cookie');
      if (!cookie) return json({ error: 'no_cookie' }, 401);
      const data = await fetchAllData(cookie);
      return json(data);
    }

    // GET /api/status
    if (path === '/api/status' && request.method === 'GET') {
      return json({ has_cookie: false }); // Cookie 存在浏览器端
    }

    // POST /api/set-cookie
    if (path === '/api/set-cookie' && request.method === 'POST') {
      try {
        const { cookie } = await request.json();
        if (!cookie) return json({ error: 'missing cookie' }, 400);
        // 测试 Cookie 是否有效
        const r = await fetch('http://www.wendasch.cn/pay/home', {
          headers: {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.38',
          },
        });
        const body = await r.text();
        const ok = r.status === 200 && !body.includes('weixin.qq.com') && body.length > 100;
        return json({
          ok: true,
          test_ok: ok,
          message: ok ? 'Cookie 有效！' : `Cookie 已保存但测试失败 (status=${r.status})`,
        });
      } catch (e) {
        return json({ ok: false, message: e.message }, 400);
      }
    }

    return json({ error: 'not found' }, 404);

  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

// EdgeOne Pages Functions 入口
export async function onRequest(context) {
  return handleRequest(context.request);
}
