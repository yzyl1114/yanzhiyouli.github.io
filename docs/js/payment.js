// 支付宝支付函数 - 修复版本
export async function createAlipayOrder(plan) {
    console.log('创建支付宝订单，计划:', plan);
    
    try {
        // 从 auth.js 获取用户，而不是 member.js
        const { getUser } = await import('./auth.js');
        const user = await getUser();
        
        const response = await fetch('/api/alipay/create', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                plan: plan,
                user_id: user?.id || 'user-' + Date.now()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }

        const data = await response.json();
        console.log('支付宝订单创建成功:', data);
        
        return data;

    } catch (error) {
        console.error('创建支付宝订单异常:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

export async function pollAlipayOrder(orderId) {
    console.log('轮询支付宝订单:', orderId);
    
    try {
        const response = await fetch(`/api/alipay/query/${orderId}`);
        const data = await response.json();
        
        console.log('支付宝订单状态:', data);
        
        if (data.status === 'paid') {
            console.log('✅ 支付宝支付成功');
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.log('支付宝查询异常:', error.message);
        return false;
    }
}