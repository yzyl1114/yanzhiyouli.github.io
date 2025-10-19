const express = require('express');
const cors = require('cors');
const { parseString } = require('xml2js');
const crypto = require('crypto');

const app = express();
const PORT = 3007;

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

// 微信支付配置
const WECHAT_MCH_ID = '1729491957'; // 商户号
const WECHAT_PAY_KEY = 'Qyug1hJLDRbT9V0zAfXw8nMKBr7UWusP'; // 支付密钥
const WECHAT_NOTIFY_URL = 'https://goalcountdown.com/api/wechat-notify';

// 用户存储（内存中）
let userStore = new Map();

// 支付订单存储
let orderStore = new Map();

// 支付路由 - 正式环境（使用真实微信支付）
app.post('/api/payment-prod', async (req, res) => {
  console.log('=== 收到正式环境支付请求 ===');
  console.log('请求体:', req.body);
  
  const { plan, user_id } = req.body;
  
  if (!plan) {
    return res.status(400).json({ 
      error: '缺少套餐参数',
      details: '请提供有效的套餐类型 (month/year)' 
    });
  }
  
  try {
    // 生成订单ID
    const orderId = 'order_' + Date.now();
    
    // 套餐价格配置
    const planPrices = {
      'month': 9.9,
      'year': 99
    };
    
    const amount = planPrices[plan] || 9.9;
    
    // 创建订单数据
    const orderData = {
      order_id: orderId,
      plan: plan,
      amount: amount,
      user_id: user_id,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    // 存储订单
    orderStore.set(orderId, orderData);
    
    // 直接调用微信支付统一下单，而不是调用自己的接口
    const wechatParams = {
      appid: WECHAT_APPID,
      mch_id: WECHAT_MCH_ID,
      nonce_str: generateNonceStr(),
      body: `GoalCountdown会员 - ${plan === 'month' ? '基础版(30天)' : '尊享版(180天)'}`,
      out_trade_no: orderId,
      total_fee: Math.round(amount * 100), // 微信支付单位为分
      spbill_create_ip: req.ip || '127.0.0.1',
      notify_url: WECHAT_NOTIFY_URL,
      trade_type: 'NATIVE', // 扫码支付
      product_id: plan
    };
    
    console.log('微信支付参数:', wechatParams);
    
    // 生成签名
    wechatParams.sign = generateWechatSign(wechatParams, WECHAT_PAY_KEY);
    
    // 调用微信支付统一下单API
    const wechatResult = await wechatUnifiedOrder(wechatParams);
    console.log('微信支付下单响应:', wechatResult);
    
    if (wechatResult.return_code === 'SUCCESS' && wechatResult.result_code === 'SUCCESS') {
      // 更新订单的二维码URL
      orderData.wechat_qr_url = wechatResult.code_url;
      orderStore.set(orderId, orderData);
      
      // 返回支付信息
      const result = {
        qr_url: wechatResult.code_url, // 真实的微信支付二维码
        order_id: orderId,
        amount: amount,
        plan: plan,
        test_mode: false,
        message: '微信支付订单创建成功',
        timestamp: new Date().toISOString()
      };
      
      console.log('✅ 微信支付订单创建成功:', result);
      res.json(result);
    } else {
      throw new Error(wechatResult.return_msg || wechatResult.err_code_des || '微信支付下单失败');
    }
    
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

  const statusData = {
    order_id: orderId,
    status: order.status, // 保持原始状态
    plan: order.plan,
    amount: order.amount,
    message: getStatusMessage(order.status),
    updated_at: new Date().toISOString()
  };
  
  console.log('支付状态查询结果:', statusData);
  res.json(statusData);
});

// 状态消息映射
function getStatusMessage(status) {
  const messages = {
    'pending': '等待支付',
    'paid': '支付成功', 
    'failed': '支付失败',
    'cancelled': '已取消'
  };
  return messages[status] || '未知状态';
}

/*
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
*/

// 简化的微信登录逻辑 - 不依赖 Supabase
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

// GET 方式的微信登录接口 - 修复重定向问题
app.get('/api/wechat-login', async (req, res) => {
    console.log('=== GET方式微信登录请求 ===');
    const { code } = req.query;
    
    if (!code) {
        return res.status(400).json({ error: '微信授权码不能为空' });
    }

    try {
        const result = await handleWechatLogin(code);
        console.log('✅ 微信登录成功，重定向到首页');
        
        // 🔥 关键：重定向到首页并携带用户信息
        const userData = encodeURIComponent(JSON.stringify(result.user_info));
        const redirectUrl = `https://goalcountdown.com/?login_success=true&user_data=${userData}`;
        
        res.redirect(redirectUrl);
        
    } catch (error) {
        console.error('❌ 微信登录失败:', error);
        
        // 登录失败也重定向到首页
        const errorMsg = encodeURIComponent(error.message);
        const redirectUrl = `https://goalcountdown.com/?login_error=${errorMsg}`;
        
        res.redirect(redirectUrl);
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

// 微信支付回调通知接口
app.post('/api/wechat-notify', express.raw({type: 'application/xml'}), (req, res) => {
  console.log('收到微信支付回调通知');
  
  const xmlData = req.body.toString();
  console.log('回调XML数据:', xmlData);
  
  // 解析XML数据
  parseString(xmlData, { explicitArray: false }, async (err, result) => {
    if (err) {
      console.error('解析XML失败:', err);
      return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[XML解析失败]]></return_msg></xml>');
    }
    
    const notifyData = result.xml;
    console.log('解析后的回调数据:', notifyData);
    
    // 验证签名
    if (!verifyWechatSign(notifyData, WECHAT_PAY_KEY)) {
      console.error('签名验证失败');
      return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名失败]]></return_msg></xml>');
    }
    
    const { out_trade_no, result_code, transaction_id } = notifyData;
    
    if (result_code === 'SUCCESS') {
      // 支付成功，更新订单状态
      const order = orderStore.get(out_trade_no);
      if (order) {
        order.status = 'paid';
        order.paid_at = new Date().toISOString();
        order.transaction_id = transaction_id;
        orderStore.set(out_trade_no, order);
        console.log('✅ 订单支付成功:', out_trade_no, '微信交易号:', transaction_id);
      } else {
        console.error('订单不存在:', out_trade_no);
      }
    } else {
      console.log('支付失败:', out_trade_no, '结果码:', result_code);
    }
    
    // 返回成功响应给微信
    res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
  });
});

// 查询微信支付状态
app.get('/api/wechat-pay/orderquery/:orderId', async (req, res) => {
  const { orderId } = req.params;
  console.log('查询微信支付状态，订单ID:', orderId);
  
  try {
    const params = {
      appid: WECHAT_APPID,
      mch_id: WECHAT_MCH_ID,
      out_trade_no: orderId,
      nonce_str: generateNonceStr()
    };
    
    params.sign = generateWechatSign(params, WECHAT_PAY_KEY);
    
    const result = await wechatOrderQuery(params);
    console.log('微信支付查询响应:', result);
    
    if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
      const wechatStatus = result.trade_state; // SUCCESS, REFUND, NOTPAY, CLOSED, REVOKED, USERPAYING, PAYERROR
      
      // 更新本地订单状态
      const order = orderStore.get(orderId);
      if (order) {
        if (wechatStatus === 'SUCCESS') {
          order.status = 'paid';
          order.paid_at = new Date().toISOString();
          order.transaction_id = result.transaction_id;
        } else if (['CLOSED', 'REVOKED', 'PAYERROR'].includes(wechatStatus)) {
          order.status = 'failed';
        }
        orderStore.set(orderId, order);
      }
      
      res.json({
        success: true,
        order_id: orderId,
        status: mapWechatStatus(wechatStatus),
        wechat_status: wechatStatus,
        message: result.trade_state_desc,
        transaction_id: result.transaction_id
      });
    } else {
      throw new Error(result.return_msg || '查询失败');
    }
    
  } catch (error) {
    console.error('查询微信支付状态失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
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

// 工具函数

// 生成随机字符串
function generateNonceStr(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 生成微信支付签名
function generateWechatSign(params, key) {
  // 1. 过滤空值和sign字段，按参数名ASCII码从小到大排序
  const sortedParams = Object.keys(params)
    .filter(key => params[key] && key !== 'sign' && params[key] !== '')
    .sort();
  
  // 2. 拼接成URL键值对格式
  let signStr = '';
  sortedParams.forEach(key => {
    signStr += `${key}=${params[key]}&`;
  });
  
  // 3. 最后加上key
  signStr += `key=${key}`;
  
  console.log('签名原串:', signStr);
  
  // 4. MD5加密并转为大写
  const sign = crypto.createHash('md5').update(signStr, 'utf8').digest('hex').toUpperCase();
  
  console.log('生成签名:', sign);
  return sign;
}

// 验证微信支付签名
function verifyWechatSign(params, key) {
  const sign = params.sign;
  const calculatedSign = generateWechatSign(params, key);
  return sign === calculatedSign;
}

// 微信状态映射
function mapWechatStatus(wechatStatus) {
  const statusMap = {
    'SUCCESS': 'paid',
    'NOTPAY': 'pending', 
    'USERPAYING': 'pending',
    'REFUND': 'refunded',
    'CLOSED': 'failed',
    'REVOKED': 'failed',
    'PAYERROR': 'failed'
  };
  return statusMap[wechatStatus] || 'failed';
}

// 微信支付统一下单
async function wechatUnifiedOrder(params) {
  const xmlData = buildXml(params);
  console.log('发送微信支付请求XML:', xmlData);
  
  const response = await fetch('https://api.mch.weixin.qq.com/pay/unifiedorder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml'
    },
    body: xmlData
  });
  
  const responseText = await response.text();
  console.log('微信支付响应XML:', responseText);
  
  return new Promise((resolve, reject) => {
    parseString(responseText, { explicitArray: false }, (err, result) => {
      if (err) reject(err);
      else resolve(result.xml);
    });
  });
}

// 微信支付订单查询
async function wechatOrderQuery(params) {
  const xmlData = buildXml(params);
  
  const response = await fetch('https://api.mch.weixin.qq.com/pay/orderquery', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml'
    },
    body: xmlData
  });
  
  const responseText = await response.text();
  
  return new Promise((resolve, reject) => {
    parseString(responseText, { explicitArray: false }, (err, result) => {
      if (err) reject(err);
      else resolve(result.xml);
    });
  });
}

// 构建XML数据
function buildXml(params) {
  let xml = '<xml>';
  Object.keys(params).forEach(key => {
    xml += `<${key}><![CDATA[${params[key]}]]></${key}>`;
  });
  xml += '</xml>';
  return xml;
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ 微信登录后端运行在端口 ${PORT}`);
  console.log('✅ 支付路由已添加: /api/payment-prod');
  console.log('✅ 当前使用完全离线模式');
  console.log('✅ 不依赖 Supabase，使用独立用户存储');
  console.log('✅ 已修复循环调用问题，直接调用微信支付API');
});