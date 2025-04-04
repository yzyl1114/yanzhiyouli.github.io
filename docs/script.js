/********************
 *  通用工具函数
 ********************/
const utils = {
  formatTime: (date, type = 'full') => {
    const pad = n => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return type === 'date' 
      ? `${year}年${month}月${day}日`
      : `${year}年${month}月${day}日 ${hours}时${minutes}分`;
  },

  storage: {
    get: key => JSON.parse(localStorage.getItem(key)),
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value))
  }
};

/********************
 *  首页功能模块
 ********************/
const homeModule = {
  init() {
    this.initDate();
    this.initBanner();
    this.setupBannerEvents();
    this.renderExams();
    this.setupPopup();
    setInterval(() => this.initDate(), 1000);
  },

  initDate() {
    const dateStr = new Date().toLocaleString('zh-CN', { 
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'long'
    });
    document.getElementById('currentDate').textContent = 
      dateStr.replace(/\//g, '年').replace(/\//g, '月') + '日';
  },

  initBanner() {
    const banner = document.querySelector('.banner-wrapper');
    const indicators = document.querySelector('.banner-indicator');
    let currentIndex = 0;

    indicators.innerHTML = [...document.querySelectorAll('.banner-item')].map((_, i) => `
      <div class="indicator ${i === 0 ? 'active' : ''}"></div>
    `).join('');

    this.bannerInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % 2;
      banner.style.transform = `translateX(-${currentIndex * 100}%)`;
      this.updateIndicators(currentIndex);
    }, 3000);
  },

  updateIndicators(index) {
    document.querySelectorAll('.banner-indicator .indicator').forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  },

  setupBannerEvents() {
    const banner2 = document.querySelectorAll('.banner-item')[1];
    banner2.addEventListener('click', () => {
      window.open('https://782d7rcbwv2kbxvn6epd9f64d1c6vpu.taobao.com');
    });
  },

  renderExams() {
    const exams = [
      { name: '中小学教师资格考试（笔试）', date: '2025-03-08T09:00+08:00', cover: 'images/exams/teacher.jpg' },
      { name: '全国计算机等级考试', date: '2025-03-29T09:00+08:00', cover: 'images/exams/computer.jpg' },
      { name: '中小学教师资格考试（面试）', date: '2025-05-17T09:00+08:00', cover: 'images/exams/interview.jpg' },
      { name: '同等学力全国统考', date: '2025-05-18T09:00+08:00', cover: 'images/exams/degree.jpg' },
      { name: '英语四六级考试（口语）', date: '2025-05-24T09:00+08:00', cover: 'images/exams/speaking.jpg' },
      { name: '高考', date: '2025-06-07T09:00+08:00', cover: 'images/exams/gaokao.jpg' },
      { name: '英语四六级考试（笔试）', date: '2025-06-14T09:00+08:00', cover: 'images/exams/writing.jpg' },
      { name: '注册会计师（CPA）考试', date: '2025-08-23T09:00+08:00', cover: 'images/exams/cpa.jpg' },
      { name: '法律职业资格考试（客观题）', date: '2025-09-13T09:00+08:00', cover: 'images/exams/law1.jpg' },
      { name: '法律职业资格考试（主观题）', date: '2025-10-12T09:00+08:00', cover: 'images/exams/law2.jpg' },
      { name: '国家公务员考试（笔试）', date: '2025-11-29T09:00+08:00', cover: 'images/exams/civil.jpg' },
      { name: '硕士研究生招生考试（初试）', date: '2025-12-21T09:00+08:00', cover: 'images/exams/master.jpg' }
    ];

    const container = document.getElementById('examContainer');
    const now = new Date();

    exams.sort((a, b) => {
      const aEnded = new Date(a.date) < now;
      const bEnded = new Date(b.date) < now;
      return aEnded - bEnded || new Date(a.date) - new Date(b.date);
    });

    container.innerHTML = exams.map(exam => {
      const ended = new Date(exam.date) < now;
      return `
        <div class="exam-card ${ended ? 'exam-ended' : ''}" onclick="window.open('countdown.html?exam=${encodeURIComponent(exam.name)}', '_blank')">
          ${ended ? '<div class="exam-cover-overlay"></div><div class="ended-badge">已结束</div>' : ''}
          <img src="${exam.cover}" class="exam-cover">
          <div class="exam-title">${exam.name}</div>
        </div>
      `;
    }).join('');
  },

  setupPopup() {
    const popup = document.getElementById('popupOverlay');
    popup.style.display = 'flex';
    const closeBtn = document.querySelector('.popup-close-btn');

    closeBtn.addEventListener('click', () => {
      popup.style.display = 'none';
    });
  }
};

/********************
 *  倒计时页功能模块
 ********************/
const countdownModule = {
  init() {
    this.initParams();
    this.initAudio();
    this.startTimer();
    this.setupSettingsPanel();
  },

  initParams() {
    const params = new URLSearchParams(location.search);
    this.examName = decodeURIComponent(params.get('exam'));
    this.endDate = new Date('2025-03-08T09:00+08:00'); // 默认时间
    document.getElementById('examTitle').textContent = this.examName;
    document.getElementById('examDate').textContent = 
      utils.formatTime(this.endDate, 'full');
  },

  initAudio() {
    this.audio = document.getElementById('bgMusic');
    this.audio.src = 'audio/music1.mp3'; // 默认音频
    this.audio.muted = false;

    document.body.addEventListener('click', () => {
      if (this.audio.paused){
        this.audio.preload = 'auto';
        this.audio.play().catch(e => console.log('自动播放失败:', e));
      }
    }, { once: true });
  },

  startTimer() {
    const update = () => {
      const now = new Date();
      let diff = this.endDate - now;
      if (diff < 0) diff = 0;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      document.getElementById('timer').innerHTML = `
        <div class="time-box">
          <span class="time-number">${days.toString().padStart(2, '0')}</span>
          <span class="time-unit">天</span>
        </div>
        <div class="time-box">
          <span class="time-number">${hours.toString().padStart(2, '0')}</span>
          <span class="time-unit">时</span>
        </div>
        <div class="time-box">
          <span class="time-number">${minutes.toString().padStart(2, '0')}</span>
          <span class="time-unit">分</span>
        </div>
        <div class="time-box">
          <span class="time-number">${seconds.toString().padStart(2, '0')}</span>
          <span class="time-unit">秒</span>
        </div>
      `;
    };

    update();
    this.timerInterval = setInterval(update, 1000);
  },

  setupSettingsPanel() {
    // 设置面板逻辑
    const panel = document.getElementById('settingsPanel');
    document.querySelector('.bg-options').innerHTML = `
      <div class="bg-option">
        <img src="images/backgrounds/bg1.jpg" alt="背景1">
      </div>
      <div class="bg-option">
        <img src="images/backgrounds/bg2.jpg" alt="背景2">
      </div>
    `;

    document.querySelector('.bg-options').addEventListener('click', e => {
      if (e.target.closest('.bg-option')) {
        const index = Array.from(e.target.closest('.bg-options').children).indexOf(e.target.closest('.bg-option'));
        this.changeBackground(index);
      }
    });
  },

  changeBackground(index) {
    const backgrounds = ['images/backgrounds/bg1.jpg', 'images/backgrounds/bg2.jpg'];
    document.body.style.backgroundImage = `url('${backgrounds[index]}')`;
    this.audio.src = `audio/music${index + 1}.mp3`;
    this.audio.play();
  }
};

window.addEventListener('DOMContentLoaded', () => countdownModule.init());
