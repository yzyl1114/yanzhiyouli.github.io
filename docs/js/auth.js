import { supabase } from './supabase.js'

// 微信登录
export async function loginWechat() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: `${location.origin}/index.html` }
  })
  if (error) {
    alert('登录失败：' + error.message)
  }
}

// 退出登录
export async function logout() {
  await supabase.auth.signOut()
  location.reload()
}

// 获取当前用户（含会员状态）
export async function getUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, is_member, member_plan, member_expires_at')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('获取用户资料失败:', error)
      return null
    }
    
    // 修复：确保布尔值处理
    return {
      ...profile,
      is_member: Boolean(profile.is_member), // 确保转换为布尔值
      member_expires_at: profile.member_expires_at ? new Date(profile.member_expires_at) : null
    }
  } catch (error) {
    console.error('getUser error:', error)
    return null
  }
}