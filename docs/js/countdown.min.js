// 引入考试数据
import { exams } from './exams.js';
import { supabase } from './supabase.js';
import { getUser } from './auth.js';
import dayjs from 'https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js';   // ① 直接引入 dayjs
import dayjsPluginUTC from 'https://cdn.jsdelivr.net/npm/dayjs@1/plugin/utc.js'; // 可选：UTC 插件
dayjs.extend(dayjsPluginUTC);

// 背景图片选项
const backgroundImages = [
  { id: 'bg1', url: 'images/bg1.jpg' },
  { id: 'bg2', url: 'images/bg2.jpg' },
  { id: 'bg3', url: 'images/bg3.jpg' },
  { id: 'bg4', url: 'images/bg4.jpg' },
  { id: 'bg5', url: 'images/bg5.jpg' },
  { id: 'bg6', url: 'images/bg6.jpg' }
];

// 获取考试数据
function getExamDataById(id) {
  return exams.find(exam => exam.id === id);
}

// 更新倒计时
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

// 主初始化
async function initCountdownPage() {
  const urlParams = new URLSearchParams(location.search);
  const customId = urlParams.get('custom');
  let exam;

  // 1. 自定义目标
  if (customId) {
    const { data, error } = await supabase
      .from('custom_goals')
      .select('*')
      .eq('id', customId)
      .single();
    if (error || !data) return location.href = 'index.html';
    exam = { name: data.name, date: data.date };
  } else {
    // 2. 系统考试
    const id = parseInt(urlParams.get('id')) || 1;
    exam = getExamDataById(id);
    if (!exam) return location.href = 'index.html';
  }

  // ③ 统一用 dayjs 格式化「考试时间」
  document.getElementById('exam-title').textContent = exam.name;
  document.getElementById('exam-time').textContent = dayjs(exam.date).tz('Asia/Shanghai').format('YYYY年MM月DD日 HH:mm');

  // 倒计时
  updateCountdownDisplay(exam);
  setInterval(() => updateCountdownDisplay(exam), 1000);

  // 背景图
  const bgSetting = localStorage.getItem('countdownBg') || 'bg1';
  document.getElementById('countdown-bg').style.backgroundImage = `url(${getBackgroundUrl(bgSetting)})`;

  // 弹窗/广告/设置
  initSettingsModal();
  showAdContainer();
  document.querySelector('.settings-entry').style.display = 'block';
}

function getBackgroundUrl(bgId) {
  const bg = backgroundImages.find(b => b.id === bgId);
  return bg ? bg.url : 'images/default-bg.jpg';
}

function initSettingsModal() {
  const modal = document.getElementById('settings-modal');

  // 打开
  document.querySelector('.settings-entry').addEventListener('click', () => modal.style.display = 'flex');

  // 关闭
  document.querySelector('.settings-modal .close-modal').addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // 背景图点击
  document.querySelectorAll('.bg-option').forEach(img => {
    img.addEventListener('click', async () => {
      const bgId = img.dataset.bg;
      // VIP 图拦截
      if (['bg5', 'bg6'].includes(bgId)) {
        const user = await getUser();
        if (!user || !user.is_member) {
          window.open('member-buy.html', '_blank', 'width=400,height=500,left=200,top=100');
          return;
        }
      }
      // 正常切换
      const bgUrl = getBackgroundUrl(bgId);
      document.getElementById('countdown-bg').style.backgroundImage = `url(${bgUrl})`;
      localStorage.setItem('countdownBg', bgId);
      document.querySelectorAll('.bg-option').forEach(i => i.classList.remove('active'));
      img.classList.add('active');
    });
  });
}

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