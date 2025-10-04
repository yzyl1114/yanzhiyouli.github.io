import { supabase } from './supabase.js'

// 新建目标
export async function createCustomGoal({ name, date, category }) {
  const { data, error } = await supabase
    .from('custom_goals')
    .insert([{ name, date, category }])
    .select()
    .single()
  if (error) {
    alert('创建失败：' + error.message)
    return null
  }
  return data
}

// 删除目标
export async function deleteCustomGoal(id) {
  await supabase.from('custom_goals').delete().eq('id', id)
}

// 编辑目标
export async function updateCustomGoal(id, updates) {
  await supabase.from('custom_goals').update(updates).eq('id', id)
}

// 获取我的自定义目标
export async function getMyCustomGoals() {
  const { data } = await supabase
    .from('custom_goals')
    .select('*')
    .order('date', { ascending: true })
  return data || []
}