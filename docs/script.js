// script.js - 修正版 (第一部分)
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
if (document.querySelector('.header')) {
  const exams = [
    { 
      name: '中小学教师资格考试（笔试）',
      date: '2025-03-08T09:00+08:00',
      cover: 'images/exams/teacher.jpg'
    },
    {
      name: '全国计算机等级考试',
      date: '2025-03-29T09:00+08:00',
      cover: 'images/exams/computer.jpg'
    },
    {
      name: '中小学教师资格考试（面试）',
      date: '2025-05-17T09:00+08:00',
      cover: 'images/exams/interview.jpg'
    },
    {
      name: '同等学力全国统考',
      date: '2025-05-18T09:00+08:00',
      cover: 'images/exams/degree.jpg'
    },
    {
      name: '英语四六级考试（口语）',
      date: '2025-05-24T09:00+08:00',
      cover: 'images/exams/speaking.jpg'
    },
    {
      name: '高考',
      date: '2025-06-07T09:00+08:00',
      cover: 'images/exams/gaokao.jpg'
    },
    {
      name: '英语四六级考试（笔试）',
      date: '2025-06-14T09:00+08:00',
      cover: 'images/exams/writing.jpg'
    },
    {
      name: '注册会计师（CPA）考试',
      date: '2025-08-23T09:00+08:00',
      cover: 'images/exams/cpa.jpg'
    },
    {
      name: '法律职业资格考试（客观题）',
      date: '2025-09-13T09:00+08:00',
      cover: 'images/exams/law1.jpg'
    },
    {
      name: '法律职业资格考试（主观题）',
      date: '2025-10-12T09:00+08:00',
      cover: 'images/exams/law2.jpg'
    },
    {
      name: '国家公务员考试（笔试）',
      date: '2025-11-29T09:00+08:00',
      cover: 'images/exams/civil.jpg'
    },
    {
      name: '硕士研究生招生考试（初试）',
      date: '2025-12-21T09:00+08:00',
      cover: 'images/exams/master.jpg'
    }
  ];  

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

      indicators.innerHTML = exams.slice(0, 2).map((_, i) => `
        <div class="${i === 0 ? 'active' : ''}"></div>
      `).join('');

      this.bannerInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % 2;
        banner.style.transform = `translateX(-${currentIndex * 100}%)`;
        this.updateIndicators(currentIndex);
      }, 3000);
    },

    updateIndicators(index) {
      document.querySelectorAll('.banner-indicator div').forEach((item, i) => {
        item.classList.toggle('active', i === index);
      });
    },

    setupBannerEvents() {  
      document.querySelectorAll('.banner-item').forEach((item, index) => {
        if(index === 1) {
          item.addEventListener('click', () => {
            window.open('https://782d7rcbwv2kbxvn6epd9f64d1c6vpu.taobao.com');
          });
        }
      });
    },

    renderExams() {
      const now = new Date();
      const container = document.getElementById('examContainer');
      
      exams.sort((a, b) => {
        const aEnded = new Date(a.date) < now;
        const bEnded = new Date(b.date) < now;
        return aEnded - bEnded || new Date(a.date) - new Date(b.date);
      });

      container.innerHTML = exams.map(exam => {
        const ended = new Date(exam.date) < now;
        return `
          <div class="exam-card ${ended ? 'exam-ended' : ''}" 
               onclick="window.open('countdown.html?exam=${encodeURIComponent(exam.name)}')">
            ${ended ? '<img src="images/ended-badge.png" class="ended-badge">' : ''}
            <img src="${exam.cover}" class="exam-cover">
            <div class="exam-title">${exam.name}</div>
          </div>
        `;
      }).join('');
    },

    setupPopup() {
      const popup = document.getElementById('popupOverlay');
      popup.style.display = 'flex';
      this.initPopupCloseAnimation();

      popup.addEventListener('click', e => {
        if (e.target === popup) popup.style.display = 'none';
      });
    },

    initPopupCloseAnimation() {
      const closeBtn = document.querySelector('.popup-close');
      const circle = closeBtn.querySelector('.close-circle');
      let count = 3;
  
    // 动画效果
      const animate = () => {
        count--;
        const dashOffset = 62.8 * (count/3); // 圆形周长计算
        circle.style.strokeDashoffset = dashOffset;
    
        if(count <= 0) {
          document.getElementById('popupOverlay').style.display = 'none';
        } else {
          requestAnimationFrame(animate);
        }
      };
  
      closeBtn.addEventListener('click', () => {
        document.getElementById('popupOverlay').style.display = 'none';
      });
  
      animate();
    }
  };

  window.addEventListener('DOMContentLoaded', () => homeModule.init());
}

/*********************
 * 倒计时页 JS 逻辑
 *********************/
if (document.querySelector('.countdown-container')) {
  const config = {
    exams: {
      '中小学教师资格考试（笔试）': '2025-03-08T09:00:00+08:00',
      '全国计算机等级考试': '2025-03-29T09:00:00+08:00',
      '中小学教师资格考试（面试）': '2025-05-17T09:00:00+08:00',
      '同等学力全国统考': '2025-05-18T09:00:00+08:00',
      '英语四六级考试（口语）': '2025-05-24T09:00:00+08:00',
      '高考': '2025-06-07T09:00:00+08:00',
      '英语四六级考试（笔试）': '2025-06-14T09:00:00+08:00',
      '注册会计师（CPA）考试': '2025-08-23T09:00:00+08:00',
      '法律职业资格考试（客观题）': '2025-09-13T09:00:00+08:00',
      '法律职业资格考试（主观题）': '2025-10-12T09:00:00+08:00',
      '国家公务员考试（笔试）': '2025-11-29T09:00:00+08:00',
      '硕士研究生招生考试（初试）': '2025-12-21T09:00:00+08:00'
    },
    backgrounds: [
      { image: 'images/backgrounds/bg1.jpg', music: 'audio/music1.mp3' },
      { image: 'images/backgrounds/bg2.jpg', music: 'audio/music2.mp3' },
      { image: 'images/backgrounds/bg3.jpg', music: 'audio/music3.mp3' },
      { image: 'images/backgrounds/bg4.jpg', music: 'audio/music4.mp3' }
    ]
  };

  const state = {
    selectedIndex: 0,
    audio: document.getElementById('bgMusic')
  };

  const utils = {
    pad: n => n.toString().padStart(2, '0'),
    formatDate: (date) => {
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const h = date.getHours().toString().padStart(2, '0');
      const min = date.getMinutes().toString().padStart(2, '0');
      return `${y}年${m}月${d}日${h}时${min}分`;
    }
  };

  const getExamName = () => {
    const params = new URLSearchParams(location.search);
    return decodeURIComponent(params.get('exam') || '中小学教师资格考试（笔试）');
  };

  const startCountdown = (endTime) => {
    const timerEl = document.getElementById('timer');

    const update = () => {
      const now = new Date();
      let diff = new Date(endTime) - now;
      if (diff < 0) diff = 0;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
      const minutes = Math.floor(diff / (1000 * 60)) % 60;
      const seconds = Math.floor(diff / 1000) % 60;

      document.getElementById('days').textContent = utils.pad(days);
      document.getElementById('hours').textContent = utils.pad(hours);
      document.getElementById('minutes').textContent = utils.pad(minutes);
      document.getElementById('seconds').textContent = utils.pad(seconds);
    };

    update();
    setInterval(update, 1000);
  };

  const bindSettingsPanel = () => {
    const panel = document.getElementById('settingsPanel');
    const options = document.querySelectorAll('.bg-option');
    const toggleBtn = document.getElementById('soundToggle');

    document.querySelector('.bg-options').addEventListener('click', e => {
      const option = e.target.closest('.bg-option');
      if (!option) return;
      const index = parseInt(option.dataset.index);
      state.selectedIndex = index;

      document.body.style.backgroundImage = `url(${config.backgrounds[index].image})`;
      state.audio.src = config.backgrounds[index].music;
      state.audio.play();

      options.forEach(el => el.classList.remove('selected'));
      option.classList.add('selected');
    });

    toggleBtn.addEventListener('click', () => {
      state.audio.muted = !state.audio.muted;
      toggleBtn.textContent = state.audio.muted ? '🔇 音效关闭' : '🔊 音效开启';
    });
  };

  window.toggleSettings = () => {
    const panel = document.getElementById('settingsPanel');
    const trigger = document.querySelector('.settings-trigger img');
    panel.classList.toggle('open');
    trigger.src = panel.classList.contains('open') ?
      'images/settings-expand.png' : 'images/settings-collapse.png';
  };

  window.closeAd = () => {
    document.querySelector('.ad-container').style.display = 'none';
  };

  window.addEventListener('DOMContentLoaded', () => {
    const examName = getExamName();
    const examDate = config.exams[examName];

    document.getElementById('examTitle').textContent = examName;
    document.getElementById('examDate').textContent = utils.formatDate(new Date(examDate));

    document.body.style.backgroundImage = `url(${config.backgrounds[0].image})`;
    state.audio.src = config.backgrounds[0].music;
    state.audio.play();

    startCountdown(examDate);
    bindSettingsPanel();
  });
}
