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

// 轮询订单状态 - 修复版本
export async function pollOrder(orderId, plan = null) {
    console.log('轮询订单:', orderId, '套餐:', plan)

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
        console.log('测试订单已过去: ' + elapsed + 'ms')

        // 5秒后自动成功
        if (elapsed > 5000) {
            console.log('测试订单自动支付成功')

            // 尝试更新会员状态，但不阻塞主流程
            try {
                if (plan) {
                    await updateUserMembership(plan)
                } else {
                    console.log('未提供plan参数，跳过会员状态更新')
                }
            } catch (error) {
                console.log('会员状态更新失败，但继续支付成功流程:', error)
            }

            return true // 确保返回 true
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
      // 支付成功，设置会员状态
      setLocalMembership(data.plan)
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
        console.log('=== 开始更新会员状态 ===')
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
            console.log('❌ 用户认证失败，无法更新会员状态:', userError)
            return false
        }

        console.log('✅ 用户认证成功，用户ID:', user.id)
        
        // 强制等待一下确保DOM就绪
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // 获取用户当前会员信息
        const { data: currentProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('member_expires_at, member_plan, is_member')
            .eq('id', user.id)
            .single()

        // 检查会员状态变化：从会员变成非会员时清理目标
        if (currentProfile && currentProfile.is_member) {
            const now = new Date()
            const currentExpiry = currentProfile.member_expires_at ? new Date(currentProfile.member_expires_at) : null
            
            // 如果当前会员已过期，清理目标
            if (currentExpiry && currentExpiry < now) {
                console.log('检测到会员已过期，清理自定义目标...')
                await cleanupExpiredMembership(user.id)
            }
        }

        let expiryDate
        const now = new Date()
        
        // 计算新的到期时间（续期逻辑保持不变）
        if (currentProfile && currentProfile.member_expires_at && 
            new Date(currentProfile.member_expires_at) > now) {
            // 已有会员，在现有基础上续期
            const currentExpiry = new Date(currentProfile.member_expires_at)
            const extensionDays = plan === 'month' ? 30 : 180
            expiryDate = new Date(currentExpiry.getTime() + extensionDays * 24 * 60 * 60 * 1000)
            console.log('会员续期，原到期时间:', currentExpiry, '新到期时间:', expiryDate)
        } else {
            // 新会员或已过期，从当前时间开始
            const days = plan === 'month' ? 30 : 180
            expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
            console.log('新开通会员，到期时间:', expiryDate)
        }

        console.log('会员到期时间:', expiryDate.toISOString())

        // 准备更新数据
        const updateData = {
            is_member: true,
            member_plan: plan,
            member_expires_at: expiryDate.toISOString(),
            updated_at: new Date().toISOString()
        }

        // 更新数据库
        const { data, error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)
            .select()

        if (error) {
            console.error('❌ 数据库更新失败:', error)
            return false
        }

        console.log('✅ 会员状态更新成功:', data)
        return true

    } catch (error) {
        console.error('❌ 更新会员状态异常:', error)
        return false
    }
}

// 计算到期时间
function getExpiryDate(plan) {
    const days = plan === 'month' ? 30 : 180
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

// 设置本地会员状态（确保即使数据库更新失败也有反馈）
function setLocalMembership(plan) {
    // 这里可以保持简单，因为主要逻辑在数据库更新中
    const membership = {
        plan: plan,
        expires: new Date(Date.now() + (plan === 'month' ? 30 : 180) * 24 * 60 * 60 * 1000).toISOString(),
        isMember: true,
        timestamp: new Date().toISOString()
    }
    localStorage.setItem('user_membership', JSON.stringify(membership))
    console.log('本地会员状态已设置:', membership)
    
    if (window.userMembership) {
        window.userMembership = membership
    }
}

// 清理会员状态（用于测试或管理）
export async function clearMembership() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { error } = await supabase
            .from('profiles')
            .update({
                is_member: false,
                member_plan: null,
                member_expires_at: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (error) {
            console.error('清理会员状态失败:', error)
            return false
        }

        // 同时清理本地存储
        localStorage.removeItem('user_membership')
        if (window.userMembership) {
            window.userMembership = null
        }
        
        console.log('会员状态已清理')
        return true
    } catch (error) {
        console.error('清理会员状态异常:', error)
        return false
    }
}

async function cleanupExpiredMembership(userId) {
    try {
        console.log('检查并清理过期会员的自定义目标...')
        
        const { data: goals, error } = await supabase
            .from('custom_goals')
            .select('id')
            .eq('user_id', userId)
            
        if (error) {
            console.error('查询自定义目标失败:', error)
            return
        }
        
        if (goals && goals.length > 0) {
            const { error: deleteError } = await supabase
                .from('custom_goals')
                .delete()
                .eq('user_id', userId)
                
            if (deleteError) {
                console.error('删除自定义目标失败:', deleteError)
            } else {
                console.log(`已删除 ${goals.length} 个自定义目标`)
            }
        }
    } catch (error) {
        console.error('清理会员目标异常:', error)
    }
}