import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const sup = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

// 微信扫码登录回调
serve(async (req) => {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  if (!code) return Response.redirect(`${Deno.env.get('BASE_URL')}/?error=no_code`)

  // 1. 用 code 换 access_token
  const tokenRes = await fetch(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${Deno.env.get('WECHAT_APPID')}&secret=${Deno.env.get('WECHAT_APPSECRET')}&code=${code}&grant_type=authorization_code`)
  const { access_token, openid, unionid } = await tokenRes.json()

  // 2. 拉取用户信息
  const userRes = await fetch(`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`)
  const { nickname, headimgurl } = await userRes.json()

  // 3. 写 / 更新 Supabase 用户表（用微信 openid 作为主键）
  await sup.from('profiles').upsert({
    id: openid,                      // 主键 = 微信 openid
    username: nickname,
    avatar_url: headimgurl,
    is_member: false,
    member_expires_at: null
  }, { onConflict: 'id' })

  // 4. 生成 Supabase 自定义 token（让前端能调用会员接口）
  const { data: token } = await sup.auth.signInWithPassword({ email: `${openid}@wechat.local`, password: openid })
  if (!token.session) return Response.redirect(`${Deno.env.get('BASE_URL')}/?error=sign_in_failed`)

  // 5. 跳回首页并带上 access_token
  return Response.redirect(`${Deno.env.get('BASE_URL')}/?token=${token.session.access_token}&openid=${openid}`)
})