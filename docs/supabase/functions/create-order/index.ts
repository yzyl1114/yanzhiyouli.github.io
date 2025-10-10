import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { randomUUID } from 'https://deno.land/std@0.177.0/uuid/mod.ts'

const sup = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

// CORS 头设置
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yzyl1114.github.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Content-Type': 'application/json',
}

// 统一入口：测试 / 正式 一键切换
serve(async (req) => {
  // 处理预检请求 (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    })
  }

  try {
    // 检查请求方法
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: '方法不允许' }), {
        status: 405,
        headers: corsHeaders
      })
    }

    // 解析请求体
    let plan, user_id
    try {
      const body = await req.json()
      plan = body.plan
      user_id = body.user_id
    } catch (e) {
      return new Response(JSON.stringify({ error: '无效的JSON格式' }), {
        status: 400,
        headers: corsHeaders
      })
    }

    // 参数验证
    if (!plan || !user_id) {
      return new Response(JSON.stringify({ error: '缺少参数' }), {
        status: 400,
        headers: corsHeaders
      })
    }

    const out_trade_no = randomUUID()
    const body_desc = 'GoalCountdown会员'

    // ===== ① 读取开关 =====
    const TEST_MODE = Deno.env.get('TEST_MODE') === 'true'   // 环境变量控制，测试环境true，正式环境false
    const BASE_URL = Deno.env.get('BASE_URL')!

    if (TEST_MODE) {
      // ===== ② 测试模式：固定二维码 + 5 秒自动成功 =====
      const code_url = `${BASE_URL}/images/test-wechat-pay.png` // 你保存的个人收款码
      
      // 插入订单记录
      const { error: insertError } = await sup.from('orders').insert({ 
        id: out_trade_no, 
        user_id, 
        plan, 
        status: 'unpaid' 
      })

      if (insertError) {
        console.error('插入订单失败:', insertError)
        return new Response(JSON.stringify({ error: '创建订单失败' }), {
          status: 500,
          headers: corsHeaders
        })
      }

      // 5 秒后自动标记为已支付（仅测试）
      setTimeout(async () => {
        const { error: updateError } = await sup.from('orders')
          .update({ status: 'paid' })
          .eq('id', out_trade_no)
        
        if (updateError) {
          console.error('自动更新订单状态失败:', updateError)
        } else {
          console.log('测试订单自动支付完成:', out_trade_no)
        }
      }, 5000)

      return new Response(JSON.stringify({ 
        qr_url: code_url, 
        order_id: out_trade_no,
        test_mode: true 
      }), {
        headers: corsHeaders
      })
    }

    // ===== ③ 正式模式：微信 Native 支付 v3 =====
    const fee = plan === 'month' ? 900 : 4500   // 分
    const notify_url = `${BASE_URL}/api/wechat-notify`

    const url = 'https://api.mch.weixin.qq.com/v3/pay/transactions/native'
    
    // 生成微信支付签名
    const token = await wxV3Token('POST', url, JSON.stringify({
      mchid: Deno.env.get('WECHAT_MCH_ID'),
      out_trade_no,
      appid: Deno.env.get('WECHAT_APPID'),
      description: body_desc,
      notify_url,
      amount: { total: fee, currency: 'CNY' }
    }))

    // 调用微信支付API
    const wxRes = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `WECHATPAY2-SHA256-RSA2048 ${token}`, 
        'Content-Type': 'application/json',
        'User-Agent': 'GoalCountdown/1.0'
      },
      body: JSON.stringify({
        mchid: Deno.env.get('WECHAT_MCH_ID'),
        out_trade_no,
        appid: Deno.env.get('WECHAT_APPID'),
        description: body_desc,
        notify_url,
        amount: { total: fee, currency: 'CNY' }
      })
    })

    if (!wxRes.ok) {
      const errorText = await wxRes.text()
      console.error('微信支付API调用失败:', wxRes.status, errorText)
      return new Response(JSON.stringify({ 
        error: '微信支付服务暂时不可用',
        details: `微信API返回: ${wxRes.status}`
      }), {
        status: 500,
        headers: corsHeaders
      })
    }

    const wxData = await wxRes.json()
    
    if (!wxData.code_url) {
      console.error('微信返回数据缺少code_url:', wxData)
      return new Response(JSON.stringify({ 
        error: '微信支付二维码生成失败',
        details: wxData
      }), {
        status: 500,
        headers: corsHeaders
      })
    }

    // 插入订单记录
    const { error: insertError } = await sup.from('orders').insert({ 
      id: out_trade_no, 
      user_id, 
      plan, 
      status: 'unpaid',
      amount: fee
    })

    if (insertError) {
      console.error('插入订单失败:', insertError)
      return new Response(JSON.stringify({ error: '创建订单失败' }), {
        status: 500,
        headers: corsHeaders
      })
    }

    return new Response(JSON.stringify({ 
      qr_url: wxData.code_url, 
      order_id: out_trade_no,
      test_mode: false 
    }), {
      headers: corsHeaders
    })

  } catch (error) {
    console.error('服务器内部错误:', error)
    return new Response(JSON.stringify({ 
      error: '服务器内部错误',
      message: error.message 
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})

// ========== 微信 V3 签名工具 ==========
async function wxV3Token(method: string, url: string, body: string) {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const nonce = randomUUID()
    const mch_id = Deno.env.get('WECHAT_MCH_ID')!
    const serial_no = Deno.env.get('WECHAT_SERIAL_NO')!
    const privateKey = Deno.env.get('WECHAT_PRIVATE_KEY')!

    if (!mch_id || !serial_no || !privateKey) {
      throw new Error('微信支付配置不完整')
    }

    const message = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`
    const sig = await crypto.subtle.importKey(
      'pkcs8', 
      str2ab(privateKey), 
      { name: 'RSA-PSS', hash: 'SHA-256' }, 
      false, 
      ['sign']
    )
    const signature = await crypto.subtle.sign(
      { name: 'RSA-PSS', saltLength: 32 }, 
      sig, 
      new TextEncoder().encode(message)
    )
    const sign = btoa(String.fromCharCode(...new Uint8Array(signature)))

    return `mchid="${mch_id}",serial_no="${serial_no}",nonce_str="${nonce}",timestamp="${timestamp}",signature="${sign}"`
  } catch (error) {
    console.error('生成微信签名失败:', error)
    throw new Error('微信支付签名生成失败: ' + error.message)
  }
}

function str2ab(pem: string) {
  try {
    const b64 = pem.replace(/-----.*-----/g, '').replace(/\s/g, '')
    return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  } catch (error) {
    console.error('解析私钥失败:', error)
    throw new Error('私钥格式错误')
  }
}