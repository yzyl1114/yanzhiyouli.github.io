import { exams } from './exams.js';
import { supabase } from './supabase.js';
import { getUser } from './auth.js';
import dayjs from 'https://cdn.jsdelivr.net/npm/dayjs@1/esm/index.js';
import utc from 'https://cdn.jsdelivr.net/npm/dayjs@1/esm/plugin/utc.js';
import tz from 'https://cdn.jsdelivr.net/npm/dayjs@1/esm/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(tz);

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

// 倒计时核心
function updateCountdownDisplay(exam) {
  const now = dayjs().tz('Asia/Shanghai');
  const examTime = dayjs(exam.date).tz('Asia/Shanghai');
  const diff = examTime.diff(now);
  
  if (diff <= 0) {
    ['days', 'hours', 'minutes', 'seconds'].forEach(k => 
      document.getElementById(k).textContent = '00'
    );
    return;
  }
  
  const dur = dayjs.duration(diff);
  document.getElementById('days').textContent = String(Math.floor(dur.asDays())).padStart(2, '0');
  document.getElementById('hours').textContent = String(dur.hours()).padStart(2, '0');
  document.getElementById('minutes').textContent = String(dur.minutes()).padStart(2, '0');
  document.getElementById('seconds').textContent = String(dur.seconds()).padStart(2, '0');
}

// 主初始化
async function initCountdownPage() {
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
    
    // 修复：正确处理TIMESTAMPTZ时间格式
    exam = { 
      name: data.name, 
      date: data.date // Supabase返回的已经是ISO格式，dayjs能正确处理
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
  
  // 修复：统一时间格式化，确保使用北京时间
  const examDate = dayjs(exam.date).tz('Asia/Shanghai');
  document.getElementById('exam-time').textContent = examDate.format('YYYY年MM月DD日 HH时mm分');

  // 倒计时 & 背景
  updateCountdownDisplay(exam);
  setInterval(() => updateCountdownDisplay(exam), 1000);
  
  const bgSetting = localStorage.getItem('countdownBg') || 'bg1';
  const bgImage = backgroundImages.find(b => b.id === bgSetting);
  document.getElementById('countdown-bg').style.backgroundImage = `url(${bgImage?.url || 'images/bg1.jpg'})`;

  // 弹窗 & 广告
  initSettingsModal();
  showAdContainer();
  document.querySelector('.settings-entry').style.display = 'block';
}

// 背景图切换 + VIP 拦截
function initSettingsModal() {
  const modal = document.getElementById('settings-modal');
  
  // 设置入口点击事件
  document.querySelector('.settings-entry').addEventListener('click', () => {
    modal.style.display = 'flex';
  });
  
  // 关闭按钮事件
  document.querySelector('.settings-modal .close-modal').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
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
}

// 广告
function showAdContainer() {
  const ad = document.querySelector('.ad-container');
  ad.style.display = 'block';
  document.getElementById('ad-close').addEventListener('click', () => {
    ad.style.display = 'none';
    setTimeout(() => ad.style.display = 'block', 600000);
  });
}

document.addEventListener('DOMContentLoaded', initCountdownPage);
if (top !== self) top.location = self.location;