// script.js - 完整功能脚本

/********************
 *  通用工具函数
 ********************/
const utils = {
    // 时间格式化
    formatTime: (date, type = 'full') => {
      const pad = n => n.toString().padStart(2, '0');
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
  
      if (type === 'date') {
        return `${year}年${month}月${day}日`;
      }
      return `${year}年${month}月${day}日 ${hours}时${minutes}分`;
    },
  
    // 本地存储
    storage: {
      get: key => JSON.parse(localStorage.getItem(key)),
      set: (key, value) => localStorage.setItem(key, JSON.stringify(value))
    }
  };
  
  /********************
   *  首页功能模块
   ********************/
  if (document.querySelector('.header')) {
// 考试数据
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
  
    // 页面模块
    const homeModule = {
      init() {
        this.initDate();
        this.initBanner();
        this.renderExams();
        this.setupPopup();
        setInterval(() => this.initDate(), 1000);
      },
  
      // 初始化时间
      initDate() {
        const dateStr = new Date().toLocaleString('zh-CN', { 
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          weekday: 'long'
        });
        document.getElementById('currentDate').textContent = dateStr.replace(/\//g, '年').replace(/\//g, '月') + '日';
      },
  
      // 轮播图初始化
      initBanner() {
        const banner = document.querySelector('.banner-wrapper');
        const indicators = document.querySelector('.banner-indicator');
        let currentIndex = 0;
  
        // 初始化指示器
        indicators.innerHTML = exams.slice(0,2).map((_,i) => `
          <div class="${i === 0 ? 'active' : ''}"></div>
        `).join('');
  
        // 自动轮播
        this.bannerInterval = setInterval(() => {
          currentIndex = (currentIndex + 1) % 2;
          banner.style.transform = `translateX(-${currentIndex * 100}%)`;
          this.updateIndicators(currentIndex);
        }, 3000);
      },
  
      // 更新指示器
      updateIndicators(index) {
        document.querySelectorAll('.banner-indicator div').forEach((item, i) => {
          item.classList.toggle('active', i === index);
        });
      },
      // Banner点击事件
      setupBannerEvents() {  
        document.querySelectorAll('.banner-item').forEach((item, index) => {
          if(index === 1) {
            item.addEventListener('click', () => {
              window.open(item.dataset.link);
            });
          }
        });
      },

      // 渲染考试入口
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
  
      // 弹窗控制
      setupPopup() {
        const popup = document.getElementById('popupOverlay');
        const closeBtn = popup.querySelector('.popup-close');
        
        // 显示弹窗
        popup.style.display = 'flex';
        
  
        // 首页弹窗关闭动画
        function initPopupCloseAnimation() {
            const closeBtn = document.querySelector('.popup-close');
            let count = 3;
            const circle = document.createElement('div');
            circle.className = 'close-animation';
            closeBtn.appendChild(circle);
        
            // 允许用户提前点击关闭
        closeBtn.addEventListener('click', () => {
            document.getElementById('popup').style.display = 'none';
        });

            const timer = setInterval(() => {
                count--;
                circle.style.background = `conic-gradient(#33738D ${(3-count)*120}deg, transparent 0)`;
                if(count <= 0) {
                    clearInterval(timer);
                    document.getElementById('popup').style.display = 'none';
                }
            }, 1000);
        }

        // 调用初始化
        initPopupCloseAnimation();

        // 点击外部关闭
        popup.addEventListener('click', e => {
          if (e.target === popup) popup.style.display = 'none';
        });
      }
    };
  
    // 初始化首页
    window.addEventListener('DOMContentLoaded', () => homeModule.init());
  }
  
  /********************
   *  倒计时页功能模块
   ********************/
  if (document.querySelector('.countdown-container')) {
    // 页面配置
    const config = {
        backgrounds: [
            { 
                image: 'images/backgrounds/bg1.jpg',
                music: 'audio/music1.mp3' 
            },
            {
                image: 'images/backgrounds/bg2.jpg',
                music: 'audio/music2.mp3'
            },
            {
                image: 'images/backgrounds/bg3.jpg',
                music: 'audio/music3.mp3'
            },
            {
                image: 'images/backgrounds/bg4.jpg',
                music: 'audio/music4.mp3'
            }
        ],
        exams: {
            '中小学教师资格考试（笔试）': '2025-03-08T09:00+08:00',
            '全国计算机等级考试': '2025-03-29T09:00+08:00',
            '中小学教师资格考试（面试）': '2025-05-17T09:00+08:00',
            '同等学力全国统考': '2025-05-18T09:00+08:00',
            '英语四六级考试（口语）': '2025-05-24T09:00+08:00',
            '高考': '2025-06-07T09:00+08:00',
            '英语四六级考试（笔试）': '2025-06-14T09:00+08:00',
            '注册会计师（CPA）考试': '2025-08-23T09:00+08:00',
            '法律职业资格考试（客观题）': '2025-09-13T09:00+08:00',
            '法律职业资格考试（主观题）': '2025-10-12T09:00+08:00',
            '国家公务员考试（笔试）': '2025-11-29T09:00+08:00',
            '硕士研究生招生考试（初试）': '2025-12-21T09:00+08:00'
        }
    };
  
    // 倒计时模块
    const countdownModule = {
      init() {
        this.initParams();
        this.initAudio();
        this.initSettings();
        this.initAd();
        this.startTimer();
      },
  
      // 初始化参数
      initParams() {
        const params = new URLSearchParams(location.search);
        this.examName = decodeURIComponent(params.get('exam'));
        this.endDate = new Date(config.exams[this.examName]);
        
        document.getElementById('examTitle').textContent = this.examName;
        document.getElementById('examDate').textContent = utils.formatTime(this.endDate, 'full');
      },
  
      // 音频控制
      initAudio() {
        this.audio = document.getElementById('bgMusic');
        this.audio.src = config.backgrounds[0].music;
        this.audio.muted = utils.storage.get('isMuted') || false;
        
        // 自动播放处理
        document.body.addEventListener('click', () => {
          if (this.audio.paused) this.audio.play().catch(() => {});
        }, { once: true });
      },
  
      // 初始化设置
      initSettings() {
        const panel = document.getElementById('settingsPanel');
        document.querySelector('.bg-options').innerHTML = config.backgrounds
          .map((bg, i) => `
            <div class="bg-option ${i === 0 ? 'selected' : ''}" 
                 onclick="countdownModule.changeBackground(${i})">
              <img src="${bg.image}" alt="背景${i+1}">
            </div>
          `).join('');
        
        // 声音切换
        document.getElementById('soundToggle').addEventListener('click', () => {
          this.audio.muted = !this.audio.muted;
          utils.storage.set('isMuted', this.audio.muted);
          this.updateSoundButton();
        });
        
        this.updateSoundButton();
      },
  
      // 切换背景
      changeBackground(index) {
        document.body.style.backgroundImage = `url('${config.backgrounds[index].image}')`;
        this.audio.src = config.backgrounds[index].music;
        this.audio.play();
        
        document.querySelectorAll('.bg-option').forEach((item, i) => {
          item.classList.toggle('selected', i === index);
        });
      },
  
      // 更新声音按钮
      updateSoundButton() {
        const btn = document.getElementById('soundToggle');
        btn.textContent = this.audio.muted ? '🔇 音效关闭' : '🔊 音效开启';
      },
  
      // 倒计时页设置面板动画
      isSettingsOpen: false, // 改为对象属性
      toggleSettings() {     // 改为对象方法
        const panel = document.getElementById('settingsPanel');
        const trigger = document.querySelector('.settings-trigger img');
        this.isSettingsOpen = !this.isSettingsOpen; // 使用this访问
  
        panel.classList.toggle('open');
        trigger.src = this.isSettingsOpen ? 
            'images/settings-expand.png' : 
            'images/settings-collapse.png';
      },

      // 广告控制
      initAd() {
        if (utils.storage.get('adClosed')) {
          document.querySelector('.ad-container').style.display = 'none';
        }
      },
  
      // 启动倒计时
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
            </div>
            <div class="time-box">
              <span class="time-number">${hours.toString().padStart(2, '0')}</span>
            </div>
            <div class="time-box">
              <span class="time-number">${minutes.toString().padStart(2, '0')}</span>
            </div>
            <div class="time-box">
              <span class="time-number">${seconds.toString().padStart(2, '0')}</span>
            </div>
          `;
        };
        
        update();
        this.timerInterval = setInterval(update, 1000);
      }
    };
  
    // 全局方法
    window.toggleSettings = () => {
      document.getElementById('settingsPanel').classList.toggle('open');
    };
  
    window.closeAd = () => {
      utils.storage.set('adClosed', true);
      document.querySelector('.ad-container').style.display = 'none';
    };
  
    // 初始化倒计时页
    window.addEventListener('DOMContentLoaded', () => countdownModule.init());
  }