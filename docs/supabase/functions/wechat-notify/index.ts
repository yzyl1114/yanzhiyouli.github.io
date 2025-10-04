import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const sup = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))

serve(async (req) => {
  const xml = await req.text()
  const obj = Object.fromEntries(
    [...xml.matchAll(/<([a-zA-Z0-9_]+)><!\[CDATA\[(.+?)\]\]><\/\1>/g)].map(m => [m[1], m[2]])
  )
  if (obj.result_code === 'SUCCESS') {
    await sup.from('orders').update({ status: 'paid' }).eq('out_trade_no', obj.out_trade_no)
    // 更新用户会员
    const { data: o } = await sup.from('orders').select('user_id,plan').eq('out_trade_no', obj.out_trade_no).single()
    const expires = new Date()
    expires.setDate(expires.getDate() + (o.plan === 'month' ? 30 : 180))
    await sup.from('profiles').update({
      is_member: true,
      member_plan: o.plan,
      member_expires_at: expires.toISOString()
    }).eq('id', o.user_id)
  }
  return new Response(`<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>`, {
    headers: { 'content-type': 'application/xml' }
  })
})