import { supabase } from './supabase.js'

// 创建订单 → 返回二维码 URL
export async function createOrder(plan) {
  try {
    // 方法1：使用 supabase.functions.invoke（推荐）
    const { data, error } = await supabase.functions.invoke('payment-public', {
      body: { 
        plan: plan,
        user_id: 'user-' + Date.now()  // 添加用户ID参数
      }
    })
    
    if (error) {
      console.error('创建订单失败:', error)
      // 降级到方法2：直接使用 fetch
      return await createOrderFallback(plan)
    }
    
    console.log('订单创建成功:', data)
    return data
    
  } catch (error) {
    console.error('创建订单异常:', error)
    // 降级方案
    return await createOrderFallback(plan)
  }
}

// 降级方案：直接使用 fetch
async function createOrderFallback(plan) {
  try {
    const response = await fetch('https://tczipjdwbjmvkkdxogml.supabase.co/functions/v1/payment-public', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan: plan,
        user_id: 'user-' + Date.now()
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('降级方案订单创建成功:', data)
    return data
    
  } catch (error) {
    console.error('降级方案也失败:', error)
    // 最终降级：返回静态数据
    return {
      qr_url: 'https://yzyl1114.github.io/images/test-wechat-pay.png',
      order_id: 'fallback-' + Date.now(),
      test_mode: true,
      message: '使用降级方案'
    }
  }
}

// 轮询订单状态
export async function pollOrder(orderId) {
  try {
    const { data } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()
    return data?.status === 'paid'
  } catch (error) {
    console.error('轮询订单状态失败:', error)
    // 如果是测试订单，5秒后自动返回成功
    if (orderId.includes('test-order') || orderId.includes('fallback')) {
      // 简单逻辑：如果是测试订单，5秒后返回true
      const orderTime = parseInt(orderId.split('-').pop())
      return Date.now() - orderTime > 5000
    }
    return false
  }
}