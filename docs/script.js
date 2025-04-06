
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

// 设置倒计时入口
function setupCountdownEntries() {
    // 考试数据
    const exams = [
        {
            id: 'teacher-pen',
            title: '中小学教师资格考试（笔试）',
            date: new Date(2025, 2, 8, 9, 0), // 2025年3月8日09时
            ended: false
        },
        {
            id: 'computer',
            title: '全国计算机等级考试',
            date: new Date(2025, 2, 29, 9, 0), // 2025年3月29日09时
            ended: false
        },
        {
            id: 'teacher-interview',
            title: '中小学教师资格考试（面试）',
            date: new Date(2025, 4, 17, 9, 0), // 2025年5月17日09时
            ended: false
        },
        {
            id: 'degree',
            title: '同等学力全国统考',
            date: new Date(2025, 4, 18, 9, 0), // 2025年5月18日09时
            ended: false
        },
        {
            id: 'speaking',
            title: '英语四六级考试（口语）',
            date: new Date(2025, 4, 24, 9, 0), // 2025年5月24日09时
            ended: false
        },
        {
            id: 'gaokao',
            title: '高考',
            date: new Date(2025, 5, 7, 9, 0), // 2025年6月7日09时
            ended: false
        },
        {
            id: 'writing',
            title: '英语四六级考试（笔试）',
            date: new Date(2025, 5, 14, 9, 0), // 2025年6月14日09时
            ended: false
        },
        {
            id: 'cpa',
            title: '注册会计师（CPA）考试',
            date: new Date(2025, 7, 23, 9, 0), // 2025年8月23日09时
            ended: false
        },
        {
            id: 'law1',
            title: '法律职业资格考试（客观题）',
            date: new Date(2025, 8, 13, 9, 0), // 2025年9月13日09时
            ended: false
        },
        {
            id: 'law2',
            title: '法律职业资格考试（主观题）',
            date: new Date(2025, 9, 12, 9, 0), // 2025年10月12日09时
            ended: false
        },
        {
            id: 'civil',
            title: '国家公务员考试（笔试）',
            date: new Date(2025, 10, 29, 9, 0), // 2025年11月29日09时
            ended: false
        },
        {
            id: 'master',
            title: '硕士研究生招生考试（初试）',
            date: new Date(2025, 11, 21, 9, 0), // 2025年12月21日09时
            ended: false
        }
    ];

    // 计算当前时间
    const now = new Date();

    // 更新考试状态
    exams.forEach(exam => {
        if (now > exam.date) {
            exam.ended = true;
        }
    });

    // 排序：未结束的考试按时间最近排序，已结束的考试排在最后
    exams.sort((a, b) => {
        if (a.ended && !b.ended) return 1;
        if (!a.ended && b.ended) return -1;
        return a.date - b.date;
    });

    // 生成入口 HTML
    const entriesContainer = document.querySelector('.countdown-entries');
    entriesContainer.innerHTML = '';

    exams.forEach(exam => {
        const entry = document.createElement('div');
        entry.className = `entry ${exam.ended ? 'ended' : ''}`;
        entry.dataset.exam = exam.id;
        entry.innerHTML = `
            <img src="docs-images-exams-${exam.id}.jpg" alt="${exam.title}" class="entry-image">
            <h3>${exam.title}</h3>
            ${exam.ended ? '<div class="ended-badge">已结束</div>' : ''}
        `;
        entriesContainer.appendChild(entry);
    });
}

// 首页功能
document.addEventListener('DOMContentLoaded', function() {
    // 更新当前日期
    updateCurrentDate();
    
    // Banner 轮播
    setupBanner();
    
    // 活动弹窗
    setupPromoPopup();
    
    // 倒计时入口排序和展示
    setupCountdownEntries();
});

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
    const day = examTimeStr.match(/(\d+)日/)[1];
    
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