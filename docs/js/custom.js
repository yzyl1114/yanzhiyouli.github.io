import { supabase } from './supabase.js'
import { getCurrentUser } from './member.js'

// 新建目标 - 增强会员验证版本
export async function createCustomGoal({ name, date, category }) {
  try {
    // 获取当前用户完整信息
    const user = await getCurrentUser()
    if (!user) {
      alert('用户未登录')
      return null
    }

    // 严格检查会员状态
    const now = new Date()
    const isMemberExpired = user.member_expires_at && new Date(user.member_expires_at) < now
    const isValidMember = user.is_member && !isMemberExpired
    
    if (!isValidMember) {
      alert('请先开通会员才能创建自定义目标')
      window.location.href = 'member-buy.html'
      return null
    }

    // 检查目标数量限制
    const existingGoals = await getMyCustomGoals()
    const maxGoals = user.member_plan === 'month' ? 3 : 5
    
    if (existingGoals.length >= maxGoals) {
      alert(`会员目标数量已达上限（${maxGoals}个），无法创建新目标`)
      return null
    }

    const { data, error } = await supabase
      .from('custom_goals')
      .insert([{ 
        name, 
        date, 
        category,
        user_id: user.id
      }])
      .select()
      .single()
      
    if (error) {
      alert('创建失败：' + error.message)
      console.error('完整错误:', error)
      return null
    }
    
    alert('创建成功！')
    window.location.reload()
    return data
    
  } catch (error) {
    console.error('创建自定义目标异常:', error)
    alert('创建失败: ' + error.message)
    return null
  }
}

// 删除目标 - 修复版本（保持不变）
export async function deleteCustomGoal(id) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { error } = await supabase
    .from('custom_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    
  if (error) {
    console.error('删除失败:', error)
    throw error
  }
}

// 编辑目标 - 修复版本（保持不变）
export async function updateCustomGoal(id, updates) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { error } = await supabase
    .from('custom_goals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    
  if (error) {
    console.error('更新失败:', error)
    throw error
  }
}

// 获取我的自定义目标 - 修复版本（保持不变）
export async function getMyCustomGoals() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  const { data, error } = await supabase
    .from('custom_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })
    
  if (error) {
    console.error('获取目标失败:', error)
    return []
  }
  
  return data || []
}