import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Content-Type': 'application/json',
}

serve(async (req) => {
  console.log('=== 收到请求 ===', req.method, new Date().toISOString())
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    console.log('处理 OPTIONS 请求')
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  try {
    console.log('处理 POST 请求')
    
    // 解析请求体
    const body = await req.json()
    console.log('请求数据:', body)
    
    const { plan, user_id } = body
    
    // 返回测试数据
    const response = {
      qr_url: 'https://yzyl1114.github.io/images/test-wechat-pay.png',
      order_id: 'test-order-' + Date.now(),
      test_mode: true,
      message: '公开函数测试成功',
      timestamp: new Date().toISOString()
    }
    
    console.log('返回响应:', response)
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('错误:', error)
    return new Response(JSON.stringify({ 
      error: '处理请求失败',
      details: error.message 
    }), {
      status: 500,
      headers: corsHeaders
    })
  }
})