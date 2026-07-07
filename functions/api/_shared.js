// 共享逻辑：HTML 解析 + 数据聚合
// 被各路由函数引用

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
    const title = m[1].trim(), value = m[2].trim();
    if (title.includes('data[') || value.includes('data[')) continue;
    if (title.includes("' +") || value.includes("' +")) continue;
    if (title.includes('.result') || value.includes('.result')) continue;
    records.push({ title, value });
  }
  return records;
}

export function parseRechargeRecords(html) {
  return parseRecordList(html)
    .filter(r => !r.title.includes('剩余') && !r.title.includes('购电') && !r.title.includes('补助'))
    .filter(r => !r.title.includes('空调') && !r.title.includes('照明') && !r.title.includes('插座'))
    .map(r => { const m = r.value.match(/([\d.]+)元/); return { date: r.title, amount: m ? parseFloat(m[1]) : null, value_raw: r.value }; });
}

export function parseUsageRecords(html) {
  const list = parseRecordList(html)
    .filter(r => !r.title.includes('剩余') && !r.title.includes('购电') && !r.title.includes('补助'))
    .filter(r => !r.title.includes('空调') && !r.title.includes('照明') && !r.title.includes('插座'));
  const daily = {};
  list.forEach(r => {
    const m = r.value.match(/([\d.]+)度/), usage = m ? parseFloat(m[1]) : 0;
    const day = r.title.substring(0, 10);
    if (!daily[day]) daily[day] = { usage: 0, count: 0 };
    daily[day].usage += usage; daily[day].count++;
  });
  return Object.entries(daily).map(([date, d]) => ({ date, usage: Math.round(d.usage * 100) / 100, count: d.count, value_raw: d.usage + '度 (' + d.count + '条)' }));
}

function parseBalanceFromRecords(html) {
  const r = { balance: null, subsidy: null, meter: null };
  const m1 = html.match(/list-group-title">([^<]+)<\/li>/); if (m1) r.meter = m1[1].trim();
  const m2 = html.match(/剩余购电<\/div>\s*<div\s+class="item-after">([\d.]+)度<\/div>/s); if (m2) r.balance = parseFloat(m2[1]);
  const m3 = html.match(/剩余补助<\/div>\s*<div\s+class="item-after">([\d.]+)度<\/div>/s); if (m3) r.subsidy = parseFloat(m3[1]);
  return r;
}

export async function fetchAllData(cookie) {
  const result = { balance: null, subsidy: null, room: null, room_full: null, meter: null, recharge: [], usage: [] };
  const headers = { 'Cookie': cookie, 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.38' };

  const r1 = await fetch('http://www.wendasch.cn/pay/home', { headers });
  const h1 = await r1.text();
  if (r1.status === 200) {
    const p = parseBalance(h1);
    result.balance = p.balance; result.subsidy = p.subsidy;
    result.room = p.roomShort || p.room; result.room_full = p.room; result.meter = p.meter;
  }
  const r2 = await fetch('http://www.wendasch.cn/pay/record', { headers });
  const h2 = await r2.text();
  if (r2.status === 200) {
    if (result.balance === null) { const b = parseBalanceFromRecords(h2); if (b.balance !== null) result.balance = b.balance; if (b.subsidy !== null) result.subsidy = b.subsidy; result.meter = result.meter || b.meter; }
    result.recharge = parseRechargeRecords(h2);
  }
  const r3 = await fetch('http://www.wendasch.cn/use/record', { headers });
  const h3 = await r3.text();
  if (r3.status === 200) {
    if (result.balance === null) { const b = parseBalanceFromRecords(h3); if (b.balance !== null) result.balance = b.balance; if (b.subsidy !== null) result.subsidy = b.subsidy; result.meter = result.meter || b.meter; }
    result.usage = parseUsageRecords(h3);
  }
  return result;
}

export function corsHeaders() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders() } });
}
