// 获取当前日期
function updateDate() {
    const date = new Date();
    const dayOfWeek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const currentDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${dayOfWeek[date.getDay()]}`;
    document.getElementById('current-date').textContent = currentDate;
}

// 页面加载时更新当前日期
updateDate();

// 更新Banner轮播
let currentBanner = 0;
const banners = document.querySelectorAll('.banner .carousel img');
const indicators = document.querySelectorAll('.carousel-indicators span');

function changeBanner() {
    banners.forEach((banner, index) => {
        banner.style.display = index === currentBanner ? 'block' : 'none';
    });
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentBanner);
    });
    currentBanner = (currentBanner + 1) % banners.length;
}

// 活动弹窗控制
function closePopup() {
    document.getElementById('promo-popup').style.display = 'none';
}

// 页面加载时弹出活动弹窗
window.onload = function() {
    document.getElementById('promo-popup').style.display = 'flex';
};

// 各大考试倒计时数据
const exams = [
    { title: "中小学教师资格考试（笔试）", time: "2025-03-08T09:00:00+08:00" },
    { title: "全国计算机等级考试", time: "2025-03-29T09:00:00+08:00" },
    { title: "中小学教师资格考试（面试）", time: "2025-05-17T09:00:00+08:00" },
    { title: "同等学力全国统考", time: "2025-05-18T09:00:00+08:00" },
    { title: "英语四六级考试（口语）", time: "2025-05-24T09:00:00+08:00" },
    { title: "高考", time: "2025-06-07T09:00:00+08:00" },
    { title: "英语四六级考试（笔试）", time: "2025-06-14T09:00:00+08:00" },
    { title: "注册会计师（CPA）考试", time: "2025-08-23T09:00:00+08:00" },
    { title: "法律职业资格考试（客观题）", time: "2025-09-13T09:00:00+08:00" },
    { title: "法律职业资格考试（主观题）", time: "2025-10-12T09:00:00+08:00" },
    { title: "国家公务员考试（笔试）", time: "2025-11-29T09:00:00+08:00" },
    { title: "硕士研究生招生考试（初试）", time: "2025-12-21T09:00:00+08:00" }
];
  
  /********************
   *  倒计时页功能模块
   ********************/
  if (document.querySelector('.countdown-container')) {
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
  
    const countdownModule = {
      isSettingsOpen: false,
  
      init() {
        this.initParams();
        this.initAudio();
        this.initSettings();
        this.initAd();
        this.startTimer();
      },
  
      initParams() {
        const params = new URLSearchParams(location.search);
        this.examName = decodeURIComponent(params.get('exam'));
        this.endDate = new Date(config.exams[this.examName]);
        
        document.getElementById('examTitle').textContent = this.examName;
        document.getElementById('examDate').textContent = 
          utils.formatTime(this.endDate, 'full');
      },
  
      initAudio() {
        this.audio = document.getElementById('bgMusic');
        this.audio.src = config.backgrounds[0].music;
        this.audio.muted = false;
        
        document.body.addEventListener('click', () => {
          if (this.audio.paused){
            this.audio.preload = 'auto';
            this.audio.play().catch(e => console.log('自动播放失败:', e));
          }
        }, { once: true });
      },
  
      initSettings() {
        const panel = document.getElementById('settingsPanel');
        document.querySelector('.bg-options').innerHTML = config.backgrounds
          .map((bg, i) => `
            <div class="bg-option ${i === 0 ? 'selected' : ''}" data-index="${i}">
              <img src="${bg.image}" alt="背景${i+1}">
            </div>
          `).join('');
  
        // 事件委托处理背景切换
        document.querySelector('.bg-options').addEventListener('click', (e) => {
          const option = e.target.closest('.bg-option');
          if (option) this.changeBackground(parseInt(option.dataset.index));
        });
  
        document.getElementById('soundToggle').addEventListener('click', () => {
          this.audio.muted = !this.audio.muted;
          utils.storage.set('isMuted', this.audio.muted);
          this.updateSoundButton();
        });
        
        this.updateSoundButton();
      },
  
      changeBackground(index) {
        const colors = ['#fff', '#333', '#fff', '#333']; // 预设颜色
        document.body.style.backgroundImage = `url('${config.backgrounds[index].image}')`;
        
        // 设置文字颜色
        document.querySelectorAll('.time-number, .time-unit').forEach(el => {
          el.style.color = colors[index];
        });
      },
  
      updateSoundButton() {
        const btn = document.getElementById('soundToggle');
        btn.textContent = this.audio.muted ? '🔇 音效关闭' : '🔊 音效开启';
      },
  
      toggleSettings() {
        const panel = document.getElementById('settingsPanel');
        const trigger = document.querySelector('.settings-trigger img');
        this.isSettingsOpen = !this.isSettingsOpen;
  
        panel.classList.toggle('open');
        trigger.src = this.isSettingsOpen 
          ? 'images/settings-expand.png' 
          : 'images/settings-collapse.png';
      },
  
      initAd() {
        if (utils.storage.get('adClosed')) {
          document.querySelector('.ad-container').style.display = 'none';
        }
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
      }
    };
  
    // 全局方法绑定
    window.toggleSettings = () => countdownModule.toggleSettings();
    window.closeAd = () => {
      utils.storage.set('adClosed', true);
      document.querySelector('.ad-container').style.display = 'none';
    };
  
    window.addEventListener('DOMContentLoaded', () => countdownModule.init());
  }