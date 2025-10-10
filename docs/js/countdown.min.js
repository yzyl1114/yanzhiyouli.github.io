import { exams } from './exams.js';
import { supabase } from './supabase.js';
import { getUser } from './auth.js';

// 使用本地dayjs文件
import dayjs from './js/dayjs/dayjs.min.js';
import utc from './js/dayjs/utc.min.js';
import timezone from './js/dayjs/timezone.min.js';
import duration from './js/dayjs/duration.min.js';
import timezoneData from './js/dayjs/timezone-data.min.js';

// 注册插件
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
// 时区数据插件需要特殊注册
dayjs.extend(timezoneData);

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

// 倒计时核心 - 修复时间处理
function updateCountdownDisplay(exam) {
  try {
    const now = dayjs().tz('Asia/Shanghai');
    let examTime;
    
    // 处理不同来源的时间数据
    if (exam.date instanceof Date) {
      examTime = dayjs(exam.date).tz('Asia/Shanghai');
    } else if (typeof exam.date === 'string') {
      examTime = dayjs(exam.date).tz('Asia/Shanghai');
    } else {
      console.error('未知的时间格式:', exam.date);
      return;
    }
    
    const diff = examTime.diff(now);
    
    if (diff <= 0) {
      ['days', 'hours', 'minutes', 'seconds'].forEach(k => 
        document.getElementById(k).textContent = '00'
      );
      return;
    }
    
    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = String(totalDays).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  } catch (error) {
    console.error('更新倒计时显示错误:', error);
  }
}

// 主初始化
async function initCountdownPage() {
  try {
    const urlParams = new URLSearchParams(location.search);
    const customId = urlParams.get('custom');
    let exam;

    console.log('URL参数:', { customId, id: urlParams.get('id') });

    // 自定义目标
    if (customId) {
      console.log('加载自定义目标:', customId);
      const { data, error } = await supabase
        .from('custom_goals')
        .select('*')
        .eq('id', customId)
        .single();
      
      console.log('自定义目标查询结果:', { data, error });
      
      if (error || !data) {
        console.error('自定义目标加载失败:', error);
        location.href = 'index.html';
        return;
      }
      
      // 修复：处理Supabase返回的时间戳
      exam = { 
        name: data.name, 
        date: data.date // TIMESTAMPTZ格式，dayjs可以直接处理
      };
    } else {
      // 系统考试
      const id = parseInt(urlParams.get('id')) || 1;
      console.log('加载系统考试:', id);
      exam = getExamDataById(id);
      if (!exam) {
        console.error('系统考试不存在:', id);
        location.href = 'index.html';
        return;
      }
    }

    console.log('最终考试数据:', exam);

    // 渲染标题 & 时间
    document.getElementById('exam-title').textContent = exam.name;
    
    // 修复：统一时间格式化
    let displayDate;
    try {
      displayDate = dayjs(exam.date).tz('Asia/Shanghai');
      if (!displayDate.isValid()) {
        throw new Error('日期解析无效');
      }
    } catch (error) {
      console.error('日期解析错误，使用原始值:', exam.date);
      displayDate = dayjs(exam.date); // 降级处理
    }
    
    document.getElementById('exam-time').textContent = displayDate.format('YYYY年MM月DD日 HH时mm分');

    // 倒计时 & 背景
    updateCountdownDisplay(exam);
    setInterval(() => updateCountdownDisplay(exam), 1000);
    
    const bgSetting = localStorage.getItem('countdownBg') || 'bg1';
    const bgImage = backgroundImages.find(b => b.id === bgSetting);
    if (bgImage) {
      document.getElementById('countdown-bg').style.backgroundImage = `url(${bgImage.url})`;
    }

    // 弹窗 & 广告
    initSettingsModal();
    showAdContainer();
    document.querySelector('.settings-entry').style.display = 'block';
  } catch (error) {
    console.error('初始化页面错误:', error);
  }
}

// 背景图切换 + VIP 拦截
function initSettingsModal() {
  try {
    const modal = document.getElementById('settings-modal');
    if (!modal) {
      console.error('设置弹窗元素未找到');
      return;
    }
    
    // 设置入口点击事件
    const settingsEntry = document.querySelector('.settings-entry');
    if (settingsEntry) {
      settingsEntry.addEventListener('click', () => {
        modal.style.display = 'flex';
      });
    }
    
    // 关闭按钮事件
    const closeBtn = document.querySelector('.settings-modal .close-modal');
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

    // 修复：背景图点击事件
    document.querySelectorAll('.bg-option').forEach(img => {
      img.addEventListener('click', async () => {
        const bgId = img.dataset.bg;
        console.log('点击背景图:', bgId);
        
        // VIP图片拦截逻辑
        if (['bg5', 'bg6'].includes(bgId)) {
          console.log('VIP图片检查');
          const user = await getUser();
          console.log('用户状态:', user);
          
          // 修复：正确的条件判断
          if (!user || !user.is_member) {
            console.log('非会员点击VIP图片，弹出购买窗口');
            window.open('member-buy.html', '_blank', 'width=400,height=500,left=200,top=100');
            return;
          }
        }
        
        // 正常切换背景图逻辑
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
    });
  } catch (error) {
    console.error('初始化设置弹窗错误:', error);
  }
}

// 广告
function showAdContainer() {
  try {
    const ad = document.querySelector('.ad-container');
    const closeBtn = document.getElementById('ad-close');
    
    if (ad) {
      ad.style.display = 'block';
    }
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (ad) ad.style.display = 'none';
        setTimeout(() => {
          if (ad) ad.style.display = 'block';
        }, 600000);
      });
    }
  } catch (error) {
    console.error('广告容器初始化错误:', error);
  }
}

document.addEventListener('DOMContentLoaded', initCountdownPage);
if (top !== self) top.location = self.location;