// 首页功能
document.addEventListener('DOMContentLoaded', function() {
  // 更新当前日期
  updateCurrentDate();
  
  // Banner 轮播
  setupBanner();
  
  // 活动弹窗
  setupPromoPopup();
});

// 更新当前日期
function updateCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[now.getDay()];
  
  document.getElementById('current-date').textContent = 
      `${year}年${month}月${day}日 星期${weekday}`;
}

// 设置 Banner 轮播
function setupBanner() {
  const slides = document.querySelectorAll('.banner-slide');
  const indicators = document.querySelectorAll('.indicator');
  let currentIndex = 0;
  
  // 自动轮播
  setInterval(() => {
      slides[currentIndex].classList.remove('active');
      indicators[currentIndex].classList.remove('active');
      
      currentIndex = (currentIndex + 1) % slides.length;
      
      slides[currentIndex].classList.add('active');
      indicators[currentIndex].classList.add('active');
  }, 3000);
  
  // 点击指示器切换
  indicators.forEach(indicator => {
      indicator.addEventListener('click', () => {
          const index = parseInt(indicator.dataset.index);
          
          slides[currentIndex].classList.remove('active');
          indicators[currentIndex].classList.remove('active');
          
          currentIndex = index;
          
          slides[currentIndex].classList.add('active');
          indicators[currentIndex].classList.add('active');
      });
  });
}

// 设置活动弹窗
function setupPromoPopup() {
  const popup = document.getElementById('promo-popup');
  const closeBtn = document.getElementById('popup-close');
  const promoBtn = document.getElementById('promo-button');
  
  // 点击关闭按钮
  closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
  });
  
  // 点击立即抢按钮
  promoBtn.addEventListener('click', () => {
      window.open('https://782d7rcbwv2kbxvn6epd9f64d1c6vpu.taobao.com', '_blank');
  });
}

// 倒计时页面功能
document.addEventListener('DOMContentLoaded', function() {
  // 设置倒计时
  setupCountdown();
  
  // 设置背景和音乐
  setupSettings();
  
  // 设置广告位
  setupAdSpace();
});

// 设置倒计时
function setupCountdown() {
  const examTitle = document.getElementById('exam-title').textContent;
  const examTimeStr = document.getElementById('exam-time').textContent;
  
  // 解析考试时间
  const [datePart, timePart] = examTimeStr.split('日');
  const [year, month] = datePart.match(/\d+/g);
  const [hour, minute] = timePart.match(/\d+/g);
  
  const examDate = new Date(year, month - 1, day, hour, minute);
  
  // 更新倒计时
  function updateCountdown() {
      const now = new Date();
      const diff = examDate - now;
      
      if (diff <= 0) {
          document.getElementById('days').textContent = '00';
          document.getElementById('hours').textContent = '00';
          document.getElementById('minutes').textContent = '00';
          document.getElementById('seconds').textContent = '00';
          return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      document.getElementById('days').textContent = days.toString().padStart(2, '0');
      document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
      document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
      document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// 设置背景和音乐
function setupSettings() {
  const settingsPopup = document.getElementById('settings-popup');
  const soundControl = document.getElementById('sound-control');
  const settingsClose = document.getElementById('settings-close');
  const backgroundOptions = document.querySelectorAll('.background-option');
  
  // 打开设置弹窗
  document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
          settingsPopup.style.left = '-300px';
      }
  });
  
  // 声音控制
  let isSoundOn = false;
  soundControl.addEventListener('click', () => {
      isSoundOn = !isSoundOn;
      // 这里可以添加音乐播放/暂停逻辑
  });
  
  // 关闭设置弹窗
  settingsClose.addEventListener('click', () => {
      settingsPopup.style.left = '-300px';
  });
  
  // 切换背景
  backgroundOptions.forEach(option => {
      option.addEventListener('click', () => {
          backgroundOptions.forEach(opt => opt.classList.remove('active'));
          option.classList.add('active');
          // 这里可以添加背景切换逻辑
      });
  });
}

// 设置广告位
function setupAdSpace() {
  const adClose = document.getElementById('ad-close');
  
  adClose.addEventListener('click', () => {
      document.querySelector('.ad-space').style.display = 'none';
  });
}