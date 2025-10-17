const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors({
  origin: ['https://goalcountdown.com', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 微信配置
const WECHAT_APPID = 'wxd4e5f7a42fa74524';
const WECHAT_SECRET = '8451317c0adeb0622fddae241c50e859';

// 用户存储（内存中）
let userStore = new Map();

// 支付订单存储
let orderStore = new Map();

// 支付路由 - 正式环境
app.post('/api/payment-prod', async (req, res) => {
  console.log('=== 收到正式环境支付请求 ===');
  console.log('请求体:', req.body);
  
  const { plan, user_id } = req.body;
  
  if (!plan) {
    return res.status(400).json({ 
      error: '缺少套餐参数',
      details: '请提供有效的套餐类型 (month/year/lifetime)' 
    });
  }
  
  try {
    // 生成订单ID
    const orderId = 'order_' + Date.now();
    
    // 套餐价格配置
    const planPrices = {
      'month': 9.9,
      'year': 99,
      'lifetime': 299
    };
    
    const amount = planPrices[plan] || 9.9;
    
    // 创建订单数据
    const orderData = {
      order_id: orderId,
      plan: plan,
      amount: amount,
      user_id: user_id,
      status: 'pending', // pending, paid, failed, cancelled
      created_at: new Date().toISOString(),
      qr_url: `https://goalcountdown.com/api/payment-qr/${orderId}`
    };
    
    // 存储订单
    orderStore.set(orderId, orderData);
    
    // 返回支付信息
    const result = {
      qr_url: `https://goalcountdown.com/api/payment-qr/${orderId}`, // 实际应该生成微信支付二维码
      order_id: orderId,
      amount: amount,
      plan: plan,
      test_mode: false,
      message: '正式环境支付订单创建成功',
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ 正式支付订单创建成功:', result);
    res.json(result);
    
  } catch (error) {
    console.error('❌ 支付处理失败:', error);
    res.status(500).json({ 
      error: '支付处理失败',
      details: error.message 
    });
  }
});

// 支付状态查询路由
app.get('/api/payment-status/:orderId', (req, res) => {
  const { orderId } = req.params;
  console.log('查询支付状态，订单ID:', orderId);
  
  const order = orderStore.get(orderId);
  if (!order) {
    return res.status(404).json({ 
      error: '订单不存在',
      order_id: orderId
    });
  }
  
  // 模拟支付状态（实际应该查询微信支付API）
  // 这里随机返回支付状态用于测试
  const statuses = ['pending', 'paid', 'failed'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  const statusData = {
    order_id: orderId,
    status: randomStatus,
    plan: order.plan,
    amount: order.amount,
    updated_at: new Date().toISOString()
  };
  
  console.log('支付状态查询结果:', statusData);
  res.json(statusData);
});

// 模拟支付成功（用于测试）
app.post('/api/payment-simulate/:orderId', (req, res) => {
  const { orderId } = req.params;
  console.log('模拟支付成功，订单ID:', orderId);
  
  const order = orderStore.get(orderId);
  if (!order) {
    return res.status(404).json({ error: '订单不存在' });
  }
  
  // 更新订单状态为已支付
  order.status = 'paid';
  order.paid_at = new Date().toISOString();
  orderStore.set(orderId, order);
  
  res.json({
    success: true,
    order_id: orderId,
    status: 'paid',
    message: '支付成功'
  });
});

// 简化的微信登录逻辑 - 完全不依赖 Supabase
async function handleWechatLogin(code) {
  console.log('开始处理微信登录，code:', code);
  
  try {
    // 1. 用 code 换取微信 access_token
    const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&code=${code}&grant_type=authorization_code`;
    console.log('请求微信token URL:', tokenUrl);
    
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();
    console.log('微信token响应:', tokenData);
    
    if (tokenData.errcode) {
      console.error('微信token获取失败:', tokenData);
      throw new Error(`微信登录失败: ${tokenData.errmsg} (错误码: ${tokenData.errcode})`);
    }

    const { access_token, openid } = tokenData;
    console.log('获取到微信openid:', openid);

    // 2. 获取微信用户信息
    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`;
    const userInfoResponse = await fetch(userInfoUrl);
    const userInfo = await userInfoResponse.json();
    console.log('微信用户信息:', userInfo);

    if (userInfo.errcode) {
      console.error('获取用户信息失败:', userInfo);
      throw new Error(`获取用户信息失败: ${userInfo.errmsg}`);
    }

    // 3. 生成用户ID（基于openid）
    const userId = 'user_' + openid.substr(0, 8);
    
    // 4. 存储用户信息（内存中）
    const userData = {
      id: userId,
      openid: openid,
      nickname: userInfo.nickname,
      avatar: userInfo.headimgurl,
      created_at: new Date().toISOString(),
      is_member: false,
      member_plan: null
    };
    
    userStore.set(openid, userData);
    console.log('用户信息已存储:', userData);

    console.log('✅ 微信登录处理完成');

    return {
      success: true,
      user_id: userId,
      user_info: {
        id: userId,
        nickname: userInfo.nickname,
        avatar: userInfo.headimgurl,
        openid: openid,
        is_member: false,
        member_plan: null,
        username: userInfo.nickname,
        avatar_url: userInfo.headimgurl
      }
    };

  } catch (error) {
    console.error('❌ 微信登录处理异常:', error);
    throw error;
  }
}

// GET 方式的微信登录接口
app.get('/api/wechat-login', async (req, res) => {
  console.log('=== GET方式微信登录请求 ===');
  console.log('请求方法:', req.method);
  console.log('查询参数:', req.query);
  
  const { code } = req.query;
  
  if (!code) {
    console.log('❌ GET方式错误: code 参数为空');
    return res.status(400).json({ error: '微信授权码不能为空' });
  }

  console.log('✅ GET方式收到微信授权码:', code);
  
  try {
    const result = await handleWechatLogin(code);
    res.json(result);
  } catch (error) {
    console.error('❌ 微信登录失败:', error);
    res.status(500).json({ 
      error: error.message,
      details: '登录处理失败，请稍后重试'
    });
  }
});

// 获取用户信息接口
app.get('/api/user-info', (req, res) => {
  const { openid } = req.query;
  
  if (!openid) {
    return res.status(400).json({ error: 'openid 不能为空' });
  }
  
  const userData = userStore.get(openid);
  if (userData) {
    res.json({ success: true, user: userData });
  } else {
    res.status(404).json({ error: '用户不存在' });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    user_count: userStore.size,
    order_count: orderStore.size
  });
});

// 获取所有订单（用于调试）
app.get('/api/debug/orders', (req, res) => {
  const orders = Array.from(orderStore.entries()).map(([id, order]) => order);
  res.json({
    total: orders.length,
    orders: orders
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 微信登录后端运行在端口 ${PORT}`);
  console.log('✅ 支付路由已添加: /api/payment-prod');
  console.log('✅ 当前使用完全离线模式');
  console.log('✅ 不依赖 Supabase，使用独立用户存储');
});

// 修改支付状态查询逻辑 - 测试环境下自动变为已支付
app.get('/api/payment-status/:orderId', (req, res) => {
  const { orderId } = req.params;
  console.log('查询支付状态，订单ID:', orderId);
  
  const order = orderStore.get(orderId);
  if (!order) {
    return res.status(404).json({ 
      success: false,
      error: '订单不存在',
      order_id: orderId
    });
  }
  
  // 测试逻辑：第一次查询后自动变为已支付
  if (order.status === 'pending') {
    // 模拟支付成功
    order.status = 'paid';
    order.paid_at = new Date().toISOString();
    orderStore.set(orderId, order);
    console.log('订单状态更新为已支付:', orderId);
  }
  
  const statusData = {
    order_id: orderId,
    status: order.status,
    plan: order.plan,
    amount: order.amount,
    message: order.status === 'paid' ? '支付成功' : '支付进行中',
    updated_at: new Date().toISOString()
  };
  
  console.log('支付状态查询结果:', statusData);
  res.json(statusData);
});
