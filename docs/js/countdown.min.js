import { exams } from './exams.js';
import { supabase } from './supabase.js';
import { getUser } from './auth.js';

// 背景图表
const backgroundImages = [
  { id: 'bg1', url: 'images/bg1.jpg' },
  { id: 'bg2', url: 'images/bg2.jpg' },
  { id: 'bg3', url: 'images/bg3.jpg' },
  { id: 'bg4', url: 'images/bg4.jpg' },
  { id: 'bg5', url: 'images/bg5.jpg' },
  { id: 'bg6', url: 'images/bg6.jpg' }
];

// 取考试数据
function getExamDataById(id) {
  return exams.find(e => e.id === id);
}

// 简单的倒计时计算（不使用dayjs）
function updateCountdownDisplay(targetDate) {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;
  
  if (diff <= 0) {
    ['days', 'hours', 'minutes', 'seconds'].forEach(k => 
      document.getElementById(k).textContent = '00'
    );
    return;
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

// 格式化日期显示
function formatDateForDisplay(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}年${month}月${day}日 ${hours}时${minutes}分`;
}

// 主初始化
async function initCountdownPage() {
  console.log('开始初始化倒计时页面...');
  
  const urlParams = new URLSearchParams(window.location.search);
  const customId = urlParams.get('custom');
  const examId = urlParams.get('id');
  
  console.log('URL参数:', { customId, examId });

  let examData = null;

  try {
    // 优先处理自定义目标
    if (customId) {
      console.log('加载自定义目标:', customId);
      const { data, error } = await supabase
        .from('custom_goals')
        .select('*')
        .eq('id', customId)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('自定义目标不存在');
      
      examData = {
        name: data.name,
        date: data.date
      };
      console.log('自定义目标数据:', examData);
    } 
    // 然后是系统考试
    else if (examId) {
      const id = parseInt(examId);
      console.log('加载系统考试:', id);
      examData = getExamDataById(id);
      if (!examData) throw new Error('系统考试不存在');
      console.log('系统考试数据:', examData);
    }
    // 如果没有参数，使用默认考试（id=1）
    else {
      console.log('使用默认考试');
      examData = getExamDataById(1);
    }
  } catch (error) {
    console.error('加载考试数据失败:', error);
    // 跳转回首页
    window.location.href = 'index.html';
    return;
  }

  // 更新页面显示
  document.getElementById('exam-title').textContent = examData.name;
  document.getElementById('exam-time').textContent = formatDateForDisplay(examData.date);

  // 启动倒计时
  updateCountdownDisplay(examData.date);
  setInterval(() => updateCountdownDisplay(examData.date), 1000);

  // 设置背景图
  const bgSetting = localStorage.getItem('countdownBg') || 'bg1';
  const bgImage = backgroundImages.find(b => b.id === bgSetting);
  if (bgImage) {
    document.getElementById('countdown-bg').style.backgroundImage = `url(${bgImage.url})`;
  }

  // 初始化其他功能
  initSettingsModal();
  showAdContainer();
  
  // 修复：确保设置入口显示
  const settingsEntry = document.querySelector('.settings-entry');
  if (settingsEntry) {
    settingsEntry.style.display = 'block';
    console.log('设置入口已显示');
  } else {
    console.error('设置入口元素未找到');
  }
}

// 背景图切换 + VIP 拦截
function initSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const settingsEntry = document.querySelector('.settings-entry');
  const closeBtn = document.querySelector('.settings-modal .close-modal');

  // 设置入口点击事件
  if (settingsEntry) {
    settingsEntry.addEventListener('click', () => {
      console.log('打开背景图弹窗');
      
      // 修复：打开弹窗时同步当前选中的背景图
      const currentBg = localStorage.getItem('countdownBg') || 'bg1';
      document.querySelectorAll('.bg-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.bg === currentBg) {
          option.classList.add('active');
        }
      });
      
      modal.style.display = 'flex';
    });
  }

  // 关闭按钮事件
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // 点击背景关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // 背景图点击事件 - 使用事件委托确保绑定成功
  document.querySelector('.background-options').addEventListener('click', async (e) => {
      // 同时支持直接点击图片和点击容器内的图片
      let img = e.target.closest('.bg-option');
      if (!img) return;
      
      const bgId = img.dataset.bg;
      console.log('点击背景图:', bgId);
      
      // VIP图片拦截逻辑 - 修复登录状态判断
      if (['bg5', 'bg6'].includes(bgId)) {
          console.log('VIP图片检查');
          const user = await getUser();
          console.log('VIP检查用户状态:', user);
          
          // 修复：先检查是否登录，再检查会员状态
          if (!user) {
              console.log('未登录用户点击VIP图片，显示提示并跳转首页');
              showTips('请先点击首页头像登录');
              // 延迟跳转首页，让用户看到提示
              setTimeout(() => {
                  window.location.href = 'index.html';
              }, 2000);
              return;
          }
          
          // 已登录但不是会员 - 直接打开会员购买页，不跳转首页
          if (!user.is_member) {
              console.log('非会员点击VIP图片，弹出购买窗口');
              window.open('member-buy.html', '_blank', 'width=400,height=500,left=200,top=100');
              return; // 重要：这里直接return，不执行后面的跳转逻辑
          }
          
          // 已登录且是会员，继续执行切换逻辑
          console.log('会员用户可以使用VIP图片');
      }

    // 正常切换背景图
    const bgImage = backgroundImages.find(b => b.id === bgId);
    if (bgImage) {
      console.log('切换背景图:', bgImage.url);
      document.getElementById('countdown-bg').style.backgroundImage = `url(${bgImage.url})`;
      localStorage.setItem('countdownBg', bgId);
      
      // 更新active状态
      document.querySelectorAll('.bg-option').forEach(i => i.classList.remove('active'));
      img.classList.add('active');
      
      // 关闭弹窗
      modal.style.display = 'none';
    }
  });
}

// 新增提示函数
function showTips(message) {
  // 创建提示元素
  const tips = document.createElement('div');
  tips.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    z-index: 10000;
    font-size: 16px;
    text-align: center;
    max-width: 300px;
    animation: fadeInOut 2s ease-in-out;
  `;
  tips.textContent = message;
  
  // 添加动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(tips);
  
  // 2秒后自动移除
  setTimeout(() => {
    if (tips.parentNode) {
      tips.parentNode.removeChild(tips);
    }
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
  }, 2000);
}

// 广告
function showAdContainer() {
  const ad = document.querySelector('.ad-container');
  const closeBtn = document.getElementById('ad-close');
  
  if (ad) ad.style.display = 'block';
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (ad) ad.style.display = 'none';
      setTimeout(() => {
        if (ad) ad.style.display = 'block';
      }, 600000);
    });
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCountdownPage);
} else {
  initCountdownPage();
}

// 防止iframe嵌入
if (top !== self) top.location = self.location;