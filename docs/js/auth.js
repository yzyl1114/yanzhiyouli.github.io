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
    
    // 先尝试获取完整的用户资料
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('获取用户资料失败:', error)
      
      // 如果查询失败，返回基础用户信息
      return {
        id: user.id,
        username: user.user_metadata?.user_name || '用户',
        avatar_url: user.user_metadata?.avatar_url || 'images/default-avatar.png',
        is_member: false, // 默认非会员
        member_plan: null,
        member_expires_at: null
      }
    }
    
    // 修复：处理可能不存在的字段
    return {
      id: profile.id,
      username: profile.username || user.user_metadata?.user_name || '用户',
      avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || 'images/default-avatar.png',
      is_member: Boolean(profile.is_member),
      member_plan: profile.member_plan || null,
      member_expires_at: profile.member_expires_at ? new Date(profile.member_expires_at) : null
    }
  } catch (error) {
    console.error('getUser error:', error)
    return null
  }
}