import { supabase } from './supabase.js'

// 创建订单 → 返回二维码 URL
export async function createOrder(plan) {
  const { data, error } = await supabase.functions.invoke('create-order', {
    body: { plan } // 'month' | 'halfyear'
  })
  if (error) {
    alert('网络错误')
    return null
  }
  return data.qr_url // 微信二维码链接
}

// 轮询订单状态
export async function pollOrder(orderId) {
  const { data } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .single()
  return data?.status === 'paid'
}