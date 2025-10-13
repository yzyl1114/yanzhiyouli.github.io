import { supabase } from './supabase.js'

// 新建目标 - 修复版本
export async function createCustomGoal({ name, date, category }) {
  // 获取当前用户
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    alert('用户未登录')
    return null
  }

  const { data, error } = await supabase
    .from('custom_goals')
    .insert([{ 
      name, 
      date, 
      category,
      user_id: user.id  // 添加用户ID关联
    }])
    .select()
    .single()
    
  if (error) {
    alert('创建失败：' + error.message)
    console.error('完整错误:', error)
    return null
  }
  return data
}

// 删除目标 - 修复版本
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
    throw error // 添加这行，让调用方知道删除失败
  }
}

// 编辑目标 - 修复版本
export async function updateCustomGoal(id, updates) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { error } = await supabase
    .from('custom_goals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)  // 确保只能更新自己的目标
    
  if (error) {
    console.error('更新失败:', error)
    throw error
  }
}

// 获取我的自定义目标 - 修复版本
export async function getMyCustomGoals() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  
  const { data, error } = await supabase
    .from('custom_goals')
    .select('*')
    .eq('user_id', user.id)  // 只获取当前用户的目标
    .order('date', { ascending: true })
    
  if (error) {
    console.error('获取目标失败:', error)
    return []
  }
  
  return data || []
}