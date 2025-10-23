import { getCurrentUser } from './member.js'

// 新建目标 - 增强会员验证版本（保持原有逻辑）
export async function createCustomGoal({ name, date, category }) {
  try {
    // 获取当前用户完整信息（保持不变）
    const user = await getCurrentUser()
    if (!user) {
      alert('用户未登录')
      return null
    }

    // 严格检查会员状态（保持不变）
    const now = new Date()
    const isMemberExpired = user.member_expires_at && new Date(user.member_expires_at) < now
    const isValidMember = user.is_member && !isMemberExpired
    
    if (!isValidMember) {
      alert('请先开通会员才能创建自定义目标')
      window.location.href = 'member-buy.html'
      return null
    }

    // 检查目标数量限制（保持不变）
    const existingGoals = await getMyCustomGoals()
    const maxGoals = user.member_plan === 'month' ? 3 : 5
    
    if (existingGoals.length >= maxGoals) {
      alert(`会员目标数量已达上限（${maxGoals}个），无法创建新目标`)
      return null
    }

    // 🔥 关键修改：从 Supabase 迁移到自有服务器 API
    const response = await fetch('/api/custom-goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        date: date,
        category: category,
        user_id: user.id,        // 保持使用 user.id
        openid: user.openid      // 新增：用于服务器验证
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`创建失败: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || '创建失败')
    }
    
    alert('创建成功！')
    window.location.reload()
    return result.data
    
  } catch (error) {
    console.error('创建自定义目标异常:', error)
    alert('创建失败: ' + error.message)
    return null
  }
}

// 删除目标 - 修复版本（迁移到自有服务器）
export async function deleteCustomGoal(id) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      alert('用户未登录')
      return
    }

    // 🔥 关键修改：迁移到自有服务器 API
    const response = await fetch(`/api/custom-goals/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: user.id,    // 保持使用 user.id
        openid: user.openid  // 新增：用于服务器验证
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`删除失败: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || '删除失败')
    }
    
    console.log('删除成功')
    
  } catch (error) {
    console.error('删除失败:', error)
    throw error
  }
}

// 编辑目标 - 修复版本（迁移到自有服务器）
export async function updateCustomGoal(id, updates) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      alert('用户未登录')
      return
    }

    // 🔥 关键修改：迁移到自有服务器 API
    const response = await fetch(`/api/custom-goals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...updates,
        user_id: user.id,    // 保持使用 user.id  
        openid: user.openid  // 新增：用于服务器验证
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`更新失败: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || '更新失败')
    }
    
    console.log('更新成功')
    
  } catch (error) {
    console.error('更新失败:', error)
    throw error
  }
}

// 获取我的自定义目标 - 修复版本（迁移到自有服务器）
export async function getMyCustomGoals() {
  try {
    const user = await getCurrentUser()
    if (!user) return []

    // 🔥 关键修改：迁移到自有服务器 API
    const response = await fetch(`/api/custom-goals?user_id=${encodeURIComponent(user.id)}&openid=${encodeURIComponent(user.openid)}`)
    
    if (!response.ok) {
      console.error('获取目标失败: HTTP', response.status)
      return []
    }

    const result = await response.json()
    
    if (!result.success) {
      console.error('获取目标失败:', result.error)
      return []
    }
    
    return result.data || []
    
  } catch (error) {
    console.error('获取目标失败:', error)
    return []
  }
}