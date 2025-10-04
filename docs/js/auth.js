import { supabase } from './supabase.js'

// 微信登录
export async function loginWechat() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'wechat',
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return profile
}