import { supabase } from './supabase.js'

// 创建订单 → 返回二维码 URL
export async function createOrder(plan) {
  try {
    // 方法1：使用 supabase.functions.invoke
    const { data, error } = await supabase.functions.invoke('payment-public', {
      body: { 
        plan: plan,
        user_id: 'user-' + Date.now()
      }
    })
    
    if (error) {
      console.error('创建订单失败:', error)
      return await createOrderFallback(plan)
    }
    
    console.log('订单创建成功:', data)
    return data
    
  } catch (error) {
    console.error('创建订单异常:', error)
    return await createOrderFallback(plan)
  }
}

// 降级方案
async function createOrderFallback(plan) {
  try {
    const response = await fetch('https://tczipjdwbjmvkkdxogml.supabase.co/functions/v1/payment-public', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({plan: plan, user_id: 'user-' + Date.now()})
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const data = await response.json()
    console.log('降级方案成功:', data)
    return data
    
  } catch (error) {
    console.error('降级方案失败:', error)
    return {
      qr_url: 'https://yzyl1114.github.io/yanzhiyouli.github.io/images/test-wechat-pay.png',
      order_id: 'test-order-' + Date.now(),
      test_mode: true
    }
  }
}


// 轮询订单状态 - 增强版
export async function pollOrder(orderId) {
  console.log('轮询订单:', orderId)
  
  // 检查 orderId 是否有效
  if (!orderId || typeof orderId !== 'string') {
    console.error('无效的订单ID:', orderId)
    return false
  }
  
  // 如果是测试订单，模拟支付成功
  if (orderId.includes('test-order') || orderId.includes('fallback') || orderId.includes('user-')) {
    const parts = orderId.split('-')
    const orderTime = parseInt(parts[parts.length - 1])
    
    if (isNaN(orderTime)) {
      console.log('测试订单，但无法解析时间，5秒后自动成功')
      return true
    }
    
    const elapsed = Date.now() - orderTime
    console.log(`测试订单已过去: ${elapsed}ms`)
    
    // 5秒后自动成功
    if (elapsed > 5000) {
      console.log('测试订单自动支付成功')
      
      // 更新用户会员状态（测试模式）
      await updateUserMembership('test')
      
      return true
    }
    return false
  }
  
  // 真实订单查询
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status, plan')
      .eq('id', orderId)
      .single()
    
    if (error) {
      console.log('查询订单失败:', error.message)
      return false
    }
    
    console.log('订单状态:', data?.status)
    
    if (data?.status === 'paid') {
      // 支付成功，更新用户会员状态
      await updateUserMembership(data.plan)
      return true
    }
    
    return false
    
  } catch (error) {
    console.log('查询订单异常:', error.message)
    return false
  }
}

// 更新用户会员状态
async function updateUserMembership(plan) {
  try {
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('未找到用户信息')
      return
    }
    
    // 更新用户会员信息
    const { error } = await supabase
      .from('profiles')
      .update({
        membership: plan,
        membership_expires: getExpiryDate(plan),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (error) {
      console.error('更新会员状态失败:', error)
    } else {
      console.log('会员状态更新成功:', plan)
    }
    
  } catch (error) {
    console.error('更新会员状态异常:', error)
  }
}

// 计算会员到期时间
function getExpiryDate(plan) {
  const now = new Date()
  if (plan === 'month') {
    now.setMonth(now.getMonth() + 1)
  } else if (plan === 'halfyear') {
    now.setMonth(now.getMonth() + 6)
  }
  return now.toISOString()
}