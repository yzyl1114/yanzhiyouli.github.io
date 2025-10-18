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

// 获取当前用户 - 从本地存储或后端API获取
export async function getUser() {
  try {
    // 先检查本地存储
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

    // 检查URL中是否有微信回调的code（且未被处理过）
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !localStorage.getItem('code_processed_' + code)) {
      console.log('检测到新的微信登录回调，处理中...', code);
      
      try {
        // 标记这个code正在处理，避免重复使用
        localStorage.setItem('code_processed_' + code, 'true');
        
        // 调用后端API完成登录
        const response = await fetch(`https://goalcountdown.com/api/wechat-login?code=${code}`);
        const result = await response.json();
        
        console.log('微信登录API响应:', result);
        
        if (result.success) {
          console.log('微信登录成功:', result.user_info);
          
          // 保存用户信息到本地存储
          localStorage.setItem('user_info', JSON.stringify(result.user_info));
          
          // 清除URL参数，避免重复处理
          const newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
          console.log('用户信息已保存，返回用户数据');
          return result.user_info;
        } else {
          console.error('微信登录失败:', result.error);
          // 清除处理标记，允许重试
          localStorage.removeItem('code_processed_' + code);
          return null;
        }
      } catch (error) {
        console.error('登录处理失败:', error);
        // 清除处理标记，允许重试
        localStorage.removeItem('code_processed_' + code);
        return null;
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('getUser error:', error);
    return null;
  }
}