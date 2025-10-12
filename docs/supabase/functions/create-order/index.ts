import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { randomUUID } from 'https://deno.land/std@0.177.0/uuid/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yzyl1114.github.io',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Content-Type': 'application/json',
}

serve(async (req) => {
  console.log('收到请求:', req.method, req.headers.get('authorization'))
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  // 检查认证头，如果没有就跳过（模拟公开访问）
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    console.log('无认证头，继续处理')
    // 不返回错误，继续处理请求
  }

  try {
    const { plan, user_id } = await req.json()
    
    if (!plan || !user_id) {
      return new Response(JSON.stringify({ error: '缺少参数' }), {
        status: 400,
        headers: corsHeaders
      })
    }

    const out_trade_no = randomUUID()
    const BASE_URL = 'https://yzyl1114.github.io'
    
    return new Response(JSON.stringify({
      qr_url: `${BASE_URL}/images/test-wechat-pay.png`,
      order_id: out_trade_no,
      test_mode: true,
      message: '测试成功 - 无需认证'
    }), {
      headers: corsHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: '处理请求失败',
      message: error.message 
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})