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

// 获取当前用户-只从本地存储获取，不处理URL参数
export async function getUser() {
  try {
    const localUser = localStorage.getItem('user_info');
    if (localUser) {
      try {
        const user = JSON.parse(localUser);
        console.log('从本地存储获取用户:', user);
        return user;
      } catch (e) {
        console.error('解析本地用户信息失败:', e);
        localStorage.removeItem('user_info');
      }
    }
    return null;
  } catch (error) {
    console.error('getUser error:', error);
    return null;
  }
}