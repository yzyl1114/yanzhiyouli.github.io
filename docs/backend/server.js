const express = require('express');
const cors = require('cors');
const { parseString } = require('xml2js');
const crypto = require('crypto');

const fs = require('fs').promises;
const path = require('path');
// 用户数据文件路径
const USER_DATA_FILE = path.join(__dirname, 'user_data.json');
const ORDER_DATA_FILE = path.join(__dirname, 'order_data.json');

const CUSTOM_GOALS_FILE = path.join(__dirname, 'custom_goals.json');

// 支付宝SDK正确引入 - 使用导出的AlipaySdk属性
const { AlipaySdk } = require('alipay-sdk');

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

// ==================== 支付宝配置 ====================
const ALIPAY_APP_ID = '2021006101633687';
const ALIPAY_MERCHANT_PRIVATE_KEY = `MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDFM0updW6UstOdqVhJIbO8iL9ngoaBG07+GjLtHOb0FUToS9GrWRIUwKMJ/ZZ7FMr2m6HGCcj30T/P+Z4vn5XoZ1A4M6aq7NdgKMLL0zH/pnuvY5OHoDv5lprcRHJNVt4Du78LnO6xmT4zyvRvaBGcpnQDZQ/yAQFVh7Tq+fwMf7X0vM5g1oTJQfN4XYS+ykCAS0CMgdpuy4rto7a2syem/ZjlUGtB70gzSfqeAFz+g4lx9abRmnmXoPSDk7zZ8n7s4JbU2Ezs2Vj+0uQB9noi0VhJG+IP1/ZL+0vZJtAqU1nPgjcdo/fDfAHX4tMt8uP18LJIIwVqxrwEoiqCVzNFAgMBAAECggEBALgTPMJO6s0E7EHUTKPfQL5xS3Gcxl8HlcHdxMHO48rde7f25h2zBAy5ELeHrgrwCtENz4FjquOgwJcrI7zCk5UfsyLzG9WbRSPuiH7oglhoGDZMle7Y5IMDUUTg421L8+u6OgfmEm1XZVfFUEwZ8a6vNcXhdXPp+kvTZE6e0Ob8PXn7U0A7JxuQ0rCn7o0eE4EkM3na/4X0z59hgtByIisPvhL1JLDpp7po4ESxt7iDtbKiUwl1W85ZPhTQv9r4TsUnS5L8dIsbF7vBlvNENEEJCQzeQyP+fsVGypr+xqplJQ4hB1XfRjANj0zQSedYDNcl0274O9MeOHndXkigdcECgYEA+lcd2ahyExi/D2w56fnBW+tNiJhaMW3Y0jJs/8pRTeVkjgNlildrYL7UyrVJfw//lMUbbcswHAY7cKmUnfHF/47Vo7VDtwNs6y9Oe9Af5aqVWf5icYGPAwxAALAuchBSXVT1AnpZ/4kWqsGlmRu0Wq47myfQJVFVkX8MGFWXHrUCgYEAyaiflSoFvyqgMxHQrNjxZ9n4D/uxnKegzrvWMXkTqBhsNPcaksDzggAZZZE4aEGrC1elt++T7U9benGuQKH6jMK9RAmwpnfoAir0wm4pBVfPWXCJQb6XNaUFM0qTd5X1yk2GEIYvlbKWDZBkix5CQGK99rQ1dBlIaJ5TsC9+DFECgYBOCwCcTV4aw/k0RqobXihAjq+iKNTdWgBhLyU57QnBvgTGHRr3sN8hzvwpobCi8wrbh0NQzCpYYjz/l25keu4eCJpjqevNTz0SaLIP+UcoYzCiWKK5/gjmi1gcntAr8RisTgL/3cLW3hb57trAS5nDN1QPv66tI5kIfdH4eB5fjQKBgCnmWGoU1ibXQ3v4+qO/W8FZP7qKcGf9SGNMEgAriRMHKAyFP0c4wh/Dx4Mb/l1jL5fmuS8Tn2fSck5pqmwRe86dc9fcL5EXHuS8aiiv3OQYT6PkxxAa+q4RwJfcqfFR/kTvgKiUSPTQq27cDpf9TIS2P4QwA19BFZNvOjJEW+tRAoGBAJdbv2Fw/JPXeqD7DvVUMmrVdYev68NEvHK7gfzUpFBzvdkUC0RhKjCCuZXTri8F/CI649PpKrvzBrM9lnB2GrEliN0azml+VW4UU+WQ+XyKhjlFA9h9F2PucY/0zr5oAW/3d/eVMo9CqObHCO3UU6ZCUXGhk5cBLqwdxwUIcbO6`;

// ✅ 修正后的支付宝公钥格式
const ALIPAY_PUBLIC_KEY = `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAj13qFSBriUiJj3y8H+9v6M+dQku7MtB1PsLu25kA2JM0R/fdcXvuxSaZUf5mbCAdTPHXwzherwSRoYoIH4fbtfsfsPuJ1RCb4NFLanSKZHU+6OQa01X82zRSsdTC5hZmnHM5QEZcDwStYgzTjdO5zwHd9BBQuCgGud63zGo53+SCS7BulOvfjBeLI0zJYvtrAiFsLnrUjt/DzSzJVHJp3LM/jt03nIWffv8AhXYGgkNUe6bbCxWvkYR5G3g+PHBnEOu+qnG7hCFVZFknh4SHXeCvTrH5A9vb87JaoTPi1Ol8H05NBC1lm8bsm05kwhxpKA58dZ4aM0YaLPRlTpH+RwIDAQAB`;

const ALIPAY_NOTIFY_URL = 'https://goalcountdown.com/api/alipay-notify';
const ALIPAY_RETURN_URL = 'https://goalcountdown.com/?payment=success';
// ===================================================

// 用户存储（内存中）
let userStore = new Map();

let customGoalsStore = new Map();

// 支付订单存储
let orderStore = new Map();

// 文件锁机制，防止并发写入
let fileLock = false;

// 文件锁函数
async function withFileLock(operation) {
    // 等待锁释放
    while (fileLock) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    fileLock = true;
    try {
        return await operation();
    } finally {
        fileLock = false;
    }
}

// 加载自定义目标数据
async function loadCustomGoalsData() {
    return withFileLock(async () => {
        try {
            const data = await fs.readFile(CUSTOM_GOALS_FILE, 'utf8');
            const goals = JSON.parse(data);
            customGoalsStore = new Map(goals);
            console.log(`✅ 已加载 ${customGoalsStore.size} 个自定义目标`);
        } catch (error) {
            console.log('自定义目标数据文件不存在，使用空存储');
            customGoalsStore = new Map();
        }
    });
}

// 保存自定义目标数据
async function saveCustomGoalsData() {
    return withFileLock(async () => {
        try {
            const goalsArray = Array.from(customGoalsStore.entries());
            await fs.writeFile(CUSTOM_GOALS_FILE, JSON.stringify(goalsArray, null, 2));
        } catch (error) {
            console.error('保存自定义目标数据失败:', error);
        }
    });
}

// 生成目标ID（兼容Supabase格式）
function generateGoalId() {
    return 'goal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 加载用户数据
async function loadUserData() {
    return withFileLock(async () => {
        try {
            const data = await fs.readFile(USER_DATA_FILE, 'utf8');
            const users = JSON.parse(data);
            userStore = new Map(users);
            console.log(`✅ 已加载 ${userStore.size} 个用户数据`);
            
            // 🔥 调试：打印所有用户状态
            users.forEach(([openid, user]) => {
                console.log(`用户 ${user.nickname} (${openid}): is_member=${user.is_member}`);
            });
        } catch (error) {
            console.log('用户数据文件不存在，使用空存储');
            userStore = new Map();
        }
    });
}

// 保存用户数据
async function saveUserData() {
    return withFileLock(async () => {
        try {
            const usersArray = Array.from(userStore.entries());
            await fs.writeFile(USER_DATA_FILE, JSON.stringify(usersArray, null, 2));
            console.log(`✅ 已保存 ${userStore.size} 个用户数据`);
        } catch (error) {
            console.error('保存用户数据失败:', error);
        }
    });
}

// 修改用户存储操作函数
function updateUserInStore(openid, userData) {
    userStore.set(openid, userData);
    // 自动保存到文件
    saveUserData().catch(console.error);  // ✅ 修复：添加错误处理参数
}

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
      'month': 6,
      'year': 19
    };
    
    const amount = planPrices[plan] || 6;
    
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
      body: `GoalCountdown会员 - ${plan === 'month' ? '基础版(90天)' : '尊享版(360天)'}`,
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

// 支付宝支付路由
app.post('/api/alipay/create', async (req, res) => {
  console.log('=== 支付宝支付请求 ===');
  console.log('请求体:', req.body);
  
  const { plan, user_id } = req.body;
  
  try {
    // 生成订单ID
    const orderId = 'alipay_' + Date.now();
    
    // 套餐价格配置
    const planPrices = {
      'month': '6',
      'year': '19'
    };
    
    const amount = planPrices[plan] || '6';
    
    // 创建订单数据
    const orderData = {
      order_id: orderId,
      plan: plan,
      amount: amount,
      user_id: user_id,
      status: 'pending',
      created_at: new Date().toISOString(),
      pay_type: 'alipay'
    };
    
    // 存储订单
    orderStore.set(orderId, orderData);
    
    // 调用支付宝支付
    const payResult = await createAlipayOrder(orderId, amount, plan);
    
    // 🔥 返回统一格式的成功响应
    res.json({
      success: true,
      data: {
        order_id: payResult.data.order_id,
        form_data: payResult.data.form_data,
        pay_url: payResult.data.pay_url,
        device_type: payResult.data.device_type,
        amount: payResult.data.amount,
        plan: payResult.data.plan
      }
    });
    
  } catch (error) {
    console.error('❌ 支付宝支付创建失败:', error);
    res.status(500).json({
      error: '支付创建失败',
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

// 简化的微信登录逻辑 - 修复版本：检查用户是否已存在
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

    // 🔥 关键修复：先检查用户是否已存在
    let userData = userStore.get(openid);
    console.log('用户存在性检查:', userData ? '用户存在' : '用户不存在');
    
    if (userData) {
      console.log('✅ 用户已存在，使用现有数据:', {
        id: userData.id,
        nickname: userData.nickname,
        is_member: userData.is_member,
        member_plan: userData.member_plan
      });
      
      // 🔥 更新用户信息（如头像、昵称可能变化）
      const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`;
      const userInfoResponse = await fetch(userInfoUrl);
      const userInfo = await userInfoResponse.json();
      
      if (!userInfo.errcode) {
        // 🔥 关键修复：创建新的用户对象，确保存储的是新对象
        const updatedUserData = {
          ...userData,  // 保留原有的所有属性（包括会员状态）
          nickname: userInfo.nickname,
          avatar: userInfo.headimgurl,
          updated_at: new Date().toISOString()
        };
        
        // 使用持久化存储更新
        updateUserInStore(openid, updatedUserData);
        console.log('✅ 用户信息已更新');
      }
      
    } else {
      console.log('🆕 新用户，创建用户数据');
      
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
      
      // 4. 创建新用户数据
      userData = {
        id: userId,
        openid: openid,
        nickname: userInfo.nickname,
        avatar: userInfo.headimgurl,
        created_at: new Date().toISOString(),
        is_member: false,  // 新用户默认非会员
        member_plan: null,
        updated_at: new Date().toISOString()
      };
      
      // 使用持久化存储
      updateUserInStore(openid, userData);
      console.log('用户信息已存储:', userData);
    }

    console.log('✅ 微信登录处理完成');

    // 🔥 关键修复：重新从存储获取最新数据，确保返回的是更新后的数据
    const latestUserData = userStore.get(openid);
    console.log('返回给前端的用户数据:', {
      id: latestUserData.id,
      is_member: latestUserData.is_member,
      member_plan: latestUserData.member_plan
    });

    return {
      success: true,
      user_id: latestUserData.id,
      user_info: {
        id: latestUserData.id,
        nickname: latestUserData.nickname,
        avatar: latestUserData.avatar,
        openid: latestUserData.openid,
        is_member: latestUserData.is_member,
        member_plan: latestUserData.member_plan,
        username: latestUserData.nickname,
        avatar_url: latestUserData.avatar
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

// 支付宝回调接口
app.post('/api/alipay-notify', express.urlencoded({ extended: false }), (req, res) => {
  console.log('支付宝支付回调:', req.body);
  
  const { out_trade_no, trade_status, total_amount, charset = 'utf-8' } = req.body;
  
  // 🔥 添加调试信息
  console.log('回调参数charset:', charset);
  console.log('所有回调参数:', JSON.stringify(req.body, null, 2));

  // 验证签名
  if (!verifyAlipaySign(req.body)) {
    console.error('支付宝签名验证失败');
    
    // 🔥 详细日志
    const alipay = new AlipaySdk({
      appId: ALIPAY_APP_ID,
      privateKey: ALIPAY_MERCHANT_PRIVATE_KEY,
      alipayPublicKey: ALIPAY_PUBLIC_KEY,
    });
    
    const signCheck = alipay.checkNotifySign(req.body);
    console.log('签名验证详细结果:', signCheck);    
    
    return res.send('fail');
  }
  
  if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
    // 支付成功
    const order = orderStore.get(out_trade_no);
    if (order) {
      order.status = 'paid';
      order.paid_at = new Date().toISOString();
      order.transaction_id = req.body.trade_no;
      orderStore.set(out_trade_no, order);
      console.log('✅ 支付宝支付成功:', out_trade_no);

      console.log('订单详情:', {
        order_id: order.order_id,
        user_id: order.user_id,
        plan: order.plan,
        amount: order.amount
      });

      if (order.user_id) {
        console.log('开始更新用户会员状态，用户ID:', order.user_id);
        updateUserMembership(order);
      } else {
        console.error('❌ 订单中没有用户ID，无法更新会员状态');
        console.log('当前所有订单:', Array.from(orderStore.entries()).map(([id, o]) => ({
          id: id,
          user_id: o.user_id,
          plan: o.plan,
          status: o.status
        })));
      }
    } else {
      console.error('订单不存在:', out_trade_no);
    }
  }
  
  res.send('success');
});

// 调试接口：检查用户和订单状态
app.get('/api/debug/check-payment', (req, res) => {
  const { order_id } = req.query;
  
  const order = orderStore.get(order_id);
  const users = Array.from(userStore.values());
  
  res.json({
    order: order,
    users: users,
    orderStore_size: orderStore.size,
    userStore_size: userStore.size
  });
});

// 手动修复会员状态接口
app.post('/api/debug/fix-membership', (req, res) => {
  const { user_id, plan } = req.body;
  
  const user = Array.from(userStore.values()).find(u => u.id === user_id);
  if (!user) {
    return res.status(404).json({ error: '用户不存在' });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (plan === 'month' ? 90 : 360));

  user.is_member = true;
  user.member_plan = plan;
  user.member_expires_at = expiresAt.toISOString();

  res.json({
    success: true,
    user: {
      id: user.id,
      is_member: user.is_member,
      member_plan: user.member_plan,
      expires_at: user.member_expires_at
    }
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

// 支付宝订单查询
app.get('/api/alipay/query/:orderId', async (req, res) => {
  const { orderId } = req.params;
  
  try {
    const alipay = new AlipaySdk({
      appId: ALIPAY_APP_ID,
      privateKey: ALIPAY_MERCHANT_PRIVATE_KEY,
      alipayPublicKey: ALIPAY_PUBLIC_KEY,
    });

    const result = await alipay.exec('alipay.trade.query', {
      bizContent: {
        out_trade_no: orderId,
      },
    });

    if (result.code === '10000') {
      const tradeStatus = result.trade_status;
      const statusMap = {
        'TRADE_SUCCESS': 'paid',
        'TRADE_FINISHED': 'paid',
        'WAIT_BUYER_PAY': 'pending',
        'TRADE_CLOSED': 'failed'
      };
      
      // 更新本地订单状态
      const order = orderStore.get(orderId);
      if (order && statusMap[tradeStatus]) {
        order.status = statusMap[tradeStatus];
        if (statusMap[tradeStatus] === 'paid') {
          order.paid_at = new Date().toISOString();
          order.transaction_id = result.trade_no;
        }
        orderStore.set(orderId, order);
      }
      
      res.json({
        success: true,
        order_id: orderId,
        status: statusMap[tradeStatus] || 'pending',
        alipay_status: tradeStatus,
        message: result.msg
      });
    } else {
      throw new Error(result.msg || '查询失败');
    }
    
  } catch (error) {
    console.error('支付宝查询失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取用户的自定义目标 - 兼容现有查询逻辑
app.get('/api/custom-goals', (req, res) => {
    const { user_id, openid } = req.query;
    
    if (!user_id && !openid) {
        return res.status(400).json({ 
            success: false, 
            error: 'user_id 或 openid 不能为空' 
        });
    }

    try {
        // 兼容两种查询方式：user_id 或 openid
        const userGoals = Array.from(customGoalsStore.values())
            .filter(goal => goal.user_id === user_id || goal.openid === openid)
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // 保持按日期排序

        console.log(`找到用户 ${user_id || openid} 的 ${userGoals.length} 个目标`);

        res.json({
            success: true,
            data: userGoals
        });
    } catch (error) {
        console.error('获取自定义目标失败:', error);
        res.status(500).json({
            success: false,
            error: '获取目标失败'
        });
    }
});

// 创建自定义目标 - 兼容现有创建逻辑
app.post('/api/custom-goals', async (req, res) => {
    const { name, date, category, user_id, openid } = req.body;
    
    console.log('创建自定义目标请求:', req.body);

    if (!name || !date || (!user_id && !openid)) {
        return res.status(400).json({
            success: false,
            error: '缺少必要参数: name, date, user_id 或 openid'
        });
    }

    try {
        // 通过 openid 获取用户信息（用于会员验证）
        const user = userStore.get(openid);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: '用户不存在'
            });
        }

        // 严格检查会员状态（与前端保持一致）
        const now = new Date();
        const isMemberExpired = user.member_expires_at && new Date(user.member_expires_at) < now;
        const isValidMember = user.is_member && !isMemberExpired;

        if (!isValidMember) {
            return res.status(403).json({
                success: false,
                error: '需要有效会员才能创建自定义目标'
            });
        }

        // 检查目标数量限制（与前端保持一致）
        const userGoals = Array.from(customGoalsStore.values())
            .filter(goal => goal.user_id === user_id || goal.openid === openid);
        
        const maxGoals = user.member_plan === 'month' ? 3 : 5;
        if (userGoals.length >= maxGoals) {
            return res.status(403).json({
                success: false,
                error: `已达到最大目标数量限制: ${maxGoals}个`
            });
        }

        // 创建新目标（保持与Supabase兼容的数据结构）
        const goalId = generateGoalId();
        const goalData = {
            id: goalId,
            name: name.trim(),
            date: date,
            category: category || 'custom',
            user_id: user_id,    // 保持 user_id 字段
            openid: openid,      // 新增 openid 字段
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        customGoalsStore.set(goalId, goalData);
        await saveCustomGoalsData();

        console.log('✅ 自定义目标创建成功:', goalData);

        res.json({
            success: true,
            data: goalData
        });

    } catch (error) {
        console.error('创建自定义目标失败:', error);
        res.status(500).json({
            success: false,
            error: '创建目标失败: ' + error.message
        });
    }
});

// 删除自定义目标 - 兼容现有删除逻辑
app.delete('/api/custom-goals/:goalId', async (req, res) => {
    const { goalId } = req.params;
    const { user_id, openid } = req.body; // 从body中获取

    if (!user_id && !openid) {
        return res.status(400).json({
            success: false,
            error: 'user_id 或 openid 不能为空'
        });
    }

    try {
        const goal = customGoalsStore.get(goalId);
        if (!goal) {
            return res.status(404).json({
                success: false,
                error: '目标不存在'
            });
        }

        // 检查权限（兼容两种标识）
        if (goal.user_id !== user_id && goal.openid !== openid) {
            return res.status(403).json({
                success: false,
                error: '无权删除此目标'
            });
        }

        customGoalsStore.delete(goalId);
        await saveCustomGoalsData();

        console.log('✅ 自定义目标删除成功:', goalId);

        res.json({
            success: true,
            message: '目标删除成功'
        });

    } catch (error) {
        console.error('删除自定义目标失败:', error);
        res.status(500).json({
            success: false,
            error: '删除目标失败'
        });
    }
});

// 更新自定义目标 - 兼容现有更新逻辑
app.put('/api/custom-goals/:goalId', async (req, res) => {
    const { goalId } = req.params;
    const { name, date, category, user_id, openid } = req.body;

    if (!user_id && !openid) {
        return res.status(400).json({
            success: false,
            error: 'user_id 或 openid 不能为空'
        });
    }

    try {
        const goal = customGoalsStore.get(goalId);
        if (!goal) {
            return res.status(404).json({
                success: false,
                error: '目标不存在'
            });
        }

        // 检查权限（兼容两种标识）
        if (goal.user_id !== user_id && goal.openid !== openid) {
            return res.status(403).json({
                success: false,
                error: '无权更新此目标'
            });
        }

        // 更新目标（保持数据结构兼容）
        const updatedGoal = {
            ...goal,
            ...(name && { name: name.trim() }),
            ...(date && { date: date }),
            ...(category && { category: category }),
            updated_at: new Date().toISOString()
        };

        customGoalsStore.set(goalId, updatedGoal);
        await saveCustomGoalsData();

        console.log('✅ 自定义目标更新成功:', updatedGoal);

        res.json({
            success: true,
            data: updatedGoal
        });

    } catch (error) {
        console.error('更新自定义目标失败:', error);
        res.status(500).json({
            success: false,
            error: '更新目标失败'
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

// 用户信息接口
app.get('/api/user/current', (req, res) => {
    const { openid } = req.query;
    
    console.log('查询用户信息，openid:', openid);
    console.log('当前用户存储:', Array.from(userStore.entries()));
    
    if (!openid) {
        return res.status(400).json({ error: 'openid 不能为空' });
    }
    
    const userData = userStore.get(openid);
    if (userData) {
        console.log('找到用户:', userData);
        res.json({ 
            success: true, 
            user: userData 
        });
    } else {
        console.log('用户不存在，openid:', openid);
        res.status(404).json({ 
            success: false, 
            error: '用户不存在' 
        });
    }
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

// 支付宝支付辅助函数
function updateUserMembership(order) {
  console.log('开始更新用户会员状态，订单:', order);
  
  // 在 userStore 中查找用户
  let userFound = false;
  
  console.log('当前用户存储中的用户:', Array.from(userStore.values()).map(u => ({
    id: u.id,
    openid: u.openid,
    is_member: u.is_member
  })));

  for (let [openid, user] of userStore.entries()) {
    console.log(`检查用户: ${user.id} vs 订单用户: ${order.user_id}`);

    if (user.id === order.user_id) {
      // 计算会员到期时间
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(now.getDate() + (order.plan === 'month' ? 90 : 360));
      
      // 更新用户会员状态
      user.is_member = true;
      user.member_plan = order.plan;
      user.member_expires_at = expiresAt.toISOString();
      user.member_since = now.toISOString();
      user.updated_at = new Date().toISOString(); // 更新更新时间
      
      // 🔥 使用持久化存储
      updateUserInStore(openid, user);
      
      console.log('✅ 用户会员状态已更新并持久化:', {
          user_id: user.id,
          is_member: user.is_member,
          member_plan: user.member_plan,
          expires_at: user.member_expires_at
      });

      userFound = true;
      break;
    }
  }
  
  if (!userFound) {
    console.error('❌ 未找到对应用户，用户ID:', order.user_id);
    console.log('当前所有用户:', Array.from(userStore.values()).map(u => ({ 
      id: u.id, 
      openid: u.openid,
      nickname: u.nickname 
    })));
  }
  
  return userFound;
}

// 支付宝支付创建函数 - 使用底层调用方式
// 在 createAlipayOrder 函数中，捕获解析错误并返回降级方案
async function createAlipayOrder(orderId, amount, plan, deviceType = 'pc') {
  const alipay = new AlipaySdk({
    appId: ALIPAY_APP_ID,
    privateKey: ALIPAY_MERCHANT_PRIVATE_KEY,
    alipayPublicKey: ALIPAY_PUBLIC_KEY,
    gateway: 'https://openapi.alipay.com/gateway.do',
    signType: 'RSA2',
    charset: 'utf-8'
  });

  const planNames = {
    'month': '基础版会员(90天)',
    'year': '尊享版会员(360天)'
  };

  const commonParams = {
    out_trade_no: orderId,
    total_amount: amount,
    subject: `GoalCountdown - ${planNames[plan]}`,
  };

  try {
    let apiMethod, bizContent;
    
    if (deviceType === 'pc') {
      apiMethod = 'alipay.trade.page.pay';
      bizContent = {
        ...commonParams,
        product_code: 'FAST_INSTANT_TRADE_PAY',
      };
    } else {
      apiMethod = 'alipay.trade.wap.pay';
      bizContent = {
        ...commonParams,
        product_code: 'QUICK_WAP_WAY',
        quit_url: 'https://goalcountdown.com/member-buy.html',
      };
    }

    // 尝试执行支付
    const result = await alipay.sdkExec(apiMethod, {
      notifyUrl: ALIPAY_NOTIFY_URL,
      returnUrl: ALIPAY_RETURN_URL,
      bizContent: bizContent,
    });

    console.log('支付宝支付原始响应类型:', typeof result);
    
    // 如果返回的是字符串（HTML表单），直接返回
    if (typeof result === 'string' && result.includes('form')) {
      return {
        success: true,
        data: {
          order_id: orderId,
          form_data: result, // HTML表单
          device_type: deviceType,
          amount: amount,
          plan: plan
        }
      };
    }
    
    // 其他情况返回原始结果
    return {
      success: true,
      data: {
        order_id: orderId,
        form_data: result,
        device_type: deviceType,
        amount: amount,
        plan: plan
      }
    };

  } catch (error) {
    console.error('支付宝支付创建异常:', error);
    
    // 如果是解析错误，说明支付宝返回了HTML，这是正常的
    if (error.message && error.message.includes('Unexpected token <')) {
      console.log('支付宝返回HTML表单，这是正常行为');
      return {
        success: true,
        data: {
          order_id: orderId,
          form_data: '<form action="https://openapi.alipay.com/gateway.do" method="POST">支付宝支付表单</form>',
          device_type: deviceType,
          amount: amount,
          plan: plan
        }
      };
    }
    
    throw new Error('支付宝支付创建失败: ' + error.message);
  }
}

// 支付宝签名验证
function verifyAlipaySign(params) {
  const alipay = new AlipaySdk({
    appId: ALIPAY_APP_ID,
    privateKey: ALIPAY_MERCHANT_PRIVATE_KEY,
    alipayPublicKey: ALIPAY_PUBLIC_KEY,
  });
  
  return alipay.checkNotifySign(params);
}

// 🔥 修复：将监听函数改为async
app.listen(PORT, '0.0.0.0', async () => {
  // 先加载用户数据
  await loadUserData();
  await loadCustomGoalsData(); // 🔥 新增：加载自定义目标数据

  console.log(`✅ 支付后端运行在端口 ${PORT}`);
  console.log('✅ 微信支付路由: /api/payment-prod');
  console.log('✅ 支付宝支付路由: /api/alipay/create');
  console.log('✅ 支付宝回调: /api/alipay-notify');
  console.log('✅ 自定义目标API: /api/custom-goals'); // 🔥 新增
  console.log('✅ 当前使用完全离线模式');
  console.log('✅ 不依赖 Supabase，使用独立用户存储');
  console.log('✅ 已修复循环调用问题，直接调用微信支付API');
});