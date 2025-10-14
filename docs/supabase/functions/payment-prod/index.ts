import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { randomUUID } from 'https://deno.land/std@0.177.0/uuid/mod.ts'

const sup = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

// 正式环境：微信 Native 支付 v3
serve(async (req) => {
  const { plan, user_id } = await req.json()
  if (!plan || !user_id) return new Response('缺少参数', { status: 400 })

  const fee = plan === 'month' ? 900 : 4500   // 分
  const out_trade_no = randomUUID()
  const body = 'GoalCountdown会员'
  const notify_url = `${Deno.env.get('BASE_URL')}/api/wechat-notify`

  // 微信 V3 签名
  const url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/native'
  const token = await wxV3Token('POST', url, JSON.stringify({
    mchid: Deno.env.get('WECHAT_MCH_ID'),
    out_trade_no,
    appid: Deno.env.get('WECHAT_APPID'),
    description: body,
    notify_url,
    amount: { total: fee, currency: 'CNY' }
  }))

  const wxRes = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `WECHATPAY2-SHA256-RSA2048 ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mchid: Deno.env.get('WECHAT_MCH_ID'),
      out_trade_no,
      appid: Deno.env.get('WECHAT_APPID'),
      description: body,
      notify_url,
      amount: { total: fee, currency: 'CNY' }
    })
  })

  const { code_url } = await wxRes.json()
  await sup.from('orders').insert({ id: out_trade_no, user_id, plan, status: 'unpaid' })
  return new Response(JSON.stringify({ qr_url: code_url, order_id: out_trade_no }))
})

// ========== 微信 V3 签名工具 ==========
async function wxV3Token(method: string, url: string, body: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = randomUUID()
  const mch_id = Deno.env.get('WECHAT_MCH_ID')!
  const serial_no = Deno.env.get('WECHAT_SERIAL_NO')!
  const privateKey = Deno.env.get('WECHAT_PRIVATE_KEY')!

  const message = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`
  const sig = await crypto.subtle.importKey('pkcs8', str2ab(privateKey), { name: 'RSA-PSS', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign({ name: 'RSA-PSS', saltLength: 32 }, sig, new TextEncoder().encode(message))
  const sign = btoa(String.fromCharCode(...new Uint8Array(signature)))

  return `mchid="${mch_id}",serial_no="${serial_no}",nonce_str="${nonce}",timestamp="${timestamp}",signature="${sign}"`
}

function str2ab(pem: string) {
  const b64 = pem.replace(/-----.*-----/g, '').replace(/\s/g, '')
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}