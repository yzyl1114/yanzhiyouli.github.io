// auth.js - 使用后端微信登录系统
// 微信登录 - 跳转到你的后端微信登录
export async function loginWechat() {
  const redirectUri = encodeURIComponent('https://goalcountdown.com/api/wechat-login');
  window.location.href = `https://open.weixin.qq.com/connect/qrconnect?appid=wxd4e5f7a42fa74524&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=123#wechat_redirect`;
}

// 退出登录
export async function logout() {
  localStorage.removeItem('user_info');
  localStorage.removeItem('user_membership');
  location.reload();
}

// 获取当前用户-只从本地存储获取，不处理URL参数，添加本地会员支持
export async function getUser() {
    try {
        const localUser = localStorage.getItem('user_info');
        let user = null;
        
        if (localUser) {
            try {
                user = JSON.parse(localUser);
                console.log('从本地存储获取用户:', user);
            } catch (e) {
                console.error('解析本地用户信息失败:', e);
                localStorage.removeItem('user_info');
            }
        }
        
        // 🔥 关键修复：检查本地会员状态
        if (user) {
            const localMembership = localStorage.getItem('user_membership');
            if (localMembership) {
                try {
                    const membership = JSON.parse(localMembership);
                    console.log('发现本地会员状态:', membership);
                    
                    // 检查会员是否有效
                    if (membership.isMember && new Date(membership.expires) > new Date()) {
                        user.is_member = true;
                        user.member_plan = membership.plan;
                        user.member_expires_at = membership.expires;
                        user.local_membership = true;
                        console.log('✅ 已应用本地会员状态');
                    } else {
                        // 会员已过期，清理
                        localStorage.removeItem('user_membership');
                        user.is_member = false;
                        user.member_plan = null;
                        user.member_expires_at = null;
                        console.log('❌ 本地会员已过期，已清理');
                    }
                } catch (error) {
                    console.error('解析本地会员状态失败:', error);
                }
            }
        }
        
        return user;
    } catch (error) {
        console.error('getUser error:', error);
        return null;
    }
}