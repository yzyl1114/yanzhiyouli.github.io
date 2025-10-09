// 1. 引入依赖（dayjs 用 CDN 模块化，避免 window.dayjs 报错）
import { exams } from './exams.js';
import { supabase } from './supabase.js';
import { getUser } from './auth.js';
import dayjs from 'https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js';
import utc from 'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/utc.js';
import tz from 'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(tz);

// 2. 背景表
const backgroundImages = [
  { id: 'bg1', url: 'images/bg1.jpg' },
  { id: 'bg2', url: 'images/bg2.jpg' },
  { id: 'bg3', url: 'images/bg3.jpg' },
  { id: 'bg4', url: 'images/bg4.jpg' },
  { id: 'bg5', url: 'images/bg5.jpg' },
  { id: 'bg6', url: 'images/bg6.jpg' }
];

// 3. 取考试数据
function getExamDataById(id) {
  return exams.find(e => e.id === id);
}

// 4. 倒计时核心
function updateCountdownDisplay(exam) {
  const now = dayjs().tz('Asia/Shanghai');
  const examTime = dayjs(exam.date);
  const diff = examTime.diff(now);
  if (diff <= 0) {
    ['days', 'hours', 'minutes', 'seconds'].forEach(k => document.getElementById(k).textContent = '00');
    return;
  }
  const dur = dayjs.duration(diff);
  document.getElementById('days').textContent = String(Math.floor(dur.asDays())).padStart(2, '0');
  document.getElementById('hours').textContent = String(dur.hours()).padStart(2, '0');
  document.getElementById('minutes').textContent = String(dur.minutes()).padStart(2, '0');
  document.getElementById('seconds').textContent = String(dur.seconds()).padStart(2, '0');
}

// 5. 主初始化
async function initCountdownPage() {
  const urlParams = new URLSearchParams(location.search);
  const customId = urlParams.get('custom');
  let exam;

  // 5.1 自定义目标
  if (customId) {
    const { data, error } = await supabase
      .from('custom_goals')
      .select('*')
      .eq('id', customId)
      .single();
    if (error || !data) return location.href = 'index.html';
    exam = { name: data.name, date: data.date };
  } else {
    // 5.2 系统考试
    const id = parseInt(urlParams.get('id')) || 1;
    exam = getExamDataById(id);
    if (!exam) return location.href = 'index.html';
  }

  // 5.3 渲染标题 & 时间（用 dayjs 格式化）
  document.getElementById('exam-title').textContent = exam.name;
  document.getElementById('exam-time').textContent =
    dayjs(exam.date).tz('Asia/Shanghai').format('YYYY年MM月DD日 HH:mm');

  // 5.4 倒计时 & 背景
  updateCountdownDisplay(exam);
  setInterval(() => updateCountdownDisplay(exam), 1000);
  const bgSetting = localStorage.getItem('countdownBg') || 'bg1';
  document.getElementById('countdown-bg').style.backgroundImage = `url(${
    backgroundImages.find(b => b.id === bgSetting)?.url || 'images/bg1.jpg'
  })`;

  // 5.5 弹窗 & 广告
  initSettingsModal();
  showAdContainer();
  document.querySelector('.settings-entry').style.display = 'block';
}

// 6. 背景图切换 + VIP 拦截
function initSettingsModal() {
  const modal = document.getElementById('settings-modal');
  document.querySelector('.settings-entry').addEventListener('click', () => modal.style.display = 'flex');
  document.querySelector('.settings-modal .close-modal').addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

  document.querySelectorAll('.bg-option').forEach(img => {
    img.addEventListener('click', async () => {
      const bgId = img.dataset.bg;
      if (['bg5', 'bg6'].includes(bgId)) {
        const user = await getUser();
        if (!user || !user.is_member) {
          window.open('member-buy.html', '_blank', 'width=400,height=500,left=200,top=100');
          return;
        }
      }
      const bgUrl = backgroundImages.find(b => b.id === bgId)?.url || 'images/bg1.jpg';
      document.getElementById('countdown-bg').style.backgroundImage = `url(${bgUrl})`;
      localStorage.setItem('countdownBg', bgId);
      document.querySelectorAll('.bg-option').forEach(i => i.classList.remove('active'));
      img.classList.add('active');
    });
  });
}

// 7. 广告
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