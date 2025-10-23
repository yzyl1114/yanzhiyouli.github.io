
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

// 从服务器获取用户信息
async function fetchUserFromServer(openid) {
    try {
        const response = await fetch(`/api/user/current?openid=${encodeURIComponent(openid)}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
                console.log('✅ 从服务器获取到最新用户信息:', data.user);
                // 保存到本地存储
                localStorage.setItem('user_info', JSON.stringify(data.user));
                return data.user;
            }
        }
    } catch (error) {
        console.error('从服务器获取用户信息失败:', error);
    }
    return null;
}

// 获取当前用户 - 支持服务器同步
export async function getUser() {
    try {
        const localUser = localStorage.getItem('user_info');
        let user = null;
        
        if (localUser) {
            try {
                user = JSON.parse(localUser);
                console.log('从本地存储获取用户:', user);
                
                // 🔥 关键：如果是支付成功后的页面，强制从服务器同步
                const urlParams = new URLSearchParams(window.location.search);
                const paymentSuccess = urlParams.get('payment') === 'success';
                const forceRefresh = localStorage.getItem('force_refresh_user') === 'true';
                
                if ((paymentSuccess || forceRefresh) && user.openid) {
                    console.log('🔥 支付成功/强制刷新，从服务器同步用户信息');
                    localStorage.removeItem('force_refresh_user');
                    
                    const serverUser = await fetchUserFromServer(user.openid);
                    if (serverUser) {
                        user = serverUser;
                    }
                }
                
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

// 强制刷新用户信息
export async function refreshUserInfo() {
    localStorage.setItem('force_refresh_user', 'true');
    location.reload();
}