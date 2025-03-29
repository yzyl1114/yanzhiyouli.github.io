// Homepage: open countdown in a new tab
function openCountdown(exam) {
    window.open(`countdown.html?exam=${encodeURIComponent(exam)}`, '_blank');
}

// Countdown Page: Countdown Timer Logic
function startCountdown(exam) {
    // Define target dates for each exam in the new order
    const exams = {
        "中小学教师资格考试（笔试）": { date: new Date("2025-03-08T09:00:00") },
        "全国计算机等级考试": { date: new Date("2025-03-29T09:00:00") },
        "中小学教师资格考试（面试）": { date: new Date("2025-05-17T09:00:00") },
        "同等学力全国统考": { date: new Date("2025-05-18T09:00:00") },
        "英语四六级考试（口语）": { date: new Date("2025-05-24T09:00:00") },
        "高考": { date: new Date("2025-06-07T09:00:00") },
        "英语四六级考试（笔试）": { date: new Date("2025-06-14T09:00:00") },
        "注册会计师（CPA）考试": { date: new Date("2025-08-23T09:00:00") },
        "法律职业资格考试（客观题）": { date: new Date("2025-09-13T09:00:00") },
        "法律职业资格考试（主观题）": { date: new Date("2025-10-12T09:00:00") },
        "国家公务员考试（笔试）": { date: new Date("2025-11-29T09:00:00") },
        "硕士研究生招生考试（初试）": { date: new Date("2025-12-21T09:00:00") }
    };

    const targetDate = exams[exam].date;
    const countDownDate = targetDate.getTime();

    // Update the exam time display
    document.querySelector('.exam-time').textContent = 
        `${targetDate.getFullYear()}年${(targetDate.getMonth() + 1).toString().padStart(2, '0')}月${targetDate.getDate().toString().padStart(2, '0')}日${targetDate.getHours().toString().padStart(2, '0')}时${targetDate.getMinutes().toString().padStart(2, '0')}分`;

    var countdownInterval = setInterval(function() {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // 确保数字始终为两位
        document.getElementById('days').textContent = padZero(days);
        document.getElementById('hours').textContent = padZero(hours);
        document.getElementById('minutes').textContent = padZero(minutes);
        document.getElementById('seconds').textContent = padZero(seconds);

        // 当倒计时结束时，停止计时器
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }, 1000); // 每秒更新一次
}

// 补零函数
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// 初始化首页
function initHomepage() {
    // 设置当前日期
    const currentDate = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.querySelector('.current-date').textContent = currentDate.toLocaleDateString('zh-CN', options);

    // 轮播图
    let currentBanner = 1;
    const banners = document.querySelectorAll('.banner');
    const indicators = document.querySelectorAll('.indicator');
    
    function showBanner(index) {
        banners.forEach(banner => banner.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        banners[index - 1].classList.add('active');
        indicators[index - 1].classList.add('active');
        currentBanner = index;
    }
    
    function nextBanner() {
        currentBanner = currentBanner === banners.length ? 1 : currentBanner + 1;
        showBanner(currentBanner);
    }
    
    // 每3秒自动切换轮播图
    setInterval(nextBanner, 3000);
    
    // 初始化显示第一张轮播图
    showBanner(1);
    
    // 生成考试入口
    const exams = [
        { name: "中小学教师资格考试（笔试）", date: new Date("2025-03-08T09:00:00"), ended: false },
        { name: "全国计算机等级考试", date: new Date("2025-03-29T09:00:00"), ended: false },
        { name: "中小学教师资格考试（面试）", date: new Date("2025-05-17T09:00:00"), ended: false },
        { name: "同等学力全国统考", date: new Date("2025-05-18T09:00:00"), ended: false },
        { name: "英语四六级考试（口语）", date: new Date("2025-05-24T09:00:00"), ended: false },
        { name: "高考", date: new Date("2025-06-07T09:00:00"), ended: false },
        { name: "英语四六级考试（笔试）", date: new Date("2025-06-14T09:00:00"), ended: false },
        { name: "注册会计师（CPA）考试", date: new Date("2025-08-23T09:00:00"), ended: false },
        { name: "法律职业资格考试（客观题）", date: new Date("2025-09-13T09:00:00"), ended: false },
        { name: "法律职业资格考试（主观题）", date: new Date("2025-10-12T09:00:00"), ended: false },
        { name: "国家公务员考试（笔试）", date: new Date("2025-11-29T09:00:00"), ended: false },
        { name: "硕士研究生招生考试（初试）", date: new Date("2025-12-21T09:00:00"), ended: false }
    ];
    
    // 按考试日期排序
    exams.sort((a, b) => a.date - b.date);
    
    // 检查考试是否已结束
    const now = new Date();
    exams.forEach(exam => {
        exam.ended = exam.date <= now;
    });
    
    // 将已结束的考试移到末尾
    exams.sort((a, b) => {
        if (a.ended && !b.ended) return 1;
        if (!a.ended && b.ended) return -1;
        return 0;
    });
    
    // 创建考试入口
    const entriesSection = document.querySelector('.entries-section');
    exams.forEach(exam => {
        const entry = document.createElement('div');
        entry.className = `entry ${exam.ended ? 'ended' : ''}`;
        entry.onclick = () => openCountdown(exam.name);
        
        const img = document.createElement('img');
        img.src = `${exam.name.replace(/\(/g, '').replace(/\)/g, '').replace(/\s+/g, '')}.png`;
        img.alt = exam.name;
        
        const endedBadge = document.createElement('div');
        endedBadge.className = 'ended-badge';
        endedBadge.textContent = '已结束';
        
        const p = document.createElement('p');
        p.textContent = exam.name;
        
        entry.appendChild(img);
        if (exam.ended) {
            entry.appendChild(endedBadge);
        }
        entry.appendChild(p);
        entriesSection.appendChild(entry);
    });
    
    // 显示活动弹窗
    setTimeout(() => {
        document.querySelector('.activity-popup').style.display = 'flex';
    }, 1000);
}

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/index.html') {
        initHomepage();
    } else {
        initCountdownPage();
    }
});

// 关闭活动弹窗
function closeActivityPopup() {
    document.querySelector('.activity-popup').style.display = 'none';
}

// 切换设置弹窗
function toggleSettings() {
    const settingsPopup = document.querySelector('.settings-popup');
    settingsPopup.classList.toggle('open');
}

// 切换背景
function changeBackground(backgroundIndex) {
    const backgroundOptions = document.querySelectorAll('.background-option');
    backgroundOptions.forEach(option => option.classList.remove('selected'));
    document.querySelector(`.background-option:nth-child(${backgroundIndex + 1})`).classList.add('selected');
    
    // 更改背景图
    document.body.style.backgroundImage = `url('background${backgroundIndex + 1}.jpg')`;
    
    // 停止当前音乐
    const currentAudio = document.querySelector('audio');
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.remove();
    }
    
    // 播放新背景对应的音乐
    const audio = document.createElement('audio');
    audio.src = `music${backgroundIndex + 1}.mp3`;
    audio.loop = true;
    audio.volume = 0.5;
    document.body.appendChild(audio);
    audio.play();
}

// 初始化倒计时页面
function initCountdownPage() {
    // 获取URL中的考试名称
    const urlParams = new URLSearchParams(window.location.search);
    const exam = urlParams.get('exam');
    
    // 显示设置按钮
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'settings-btn';
    settingsBtn.innerHTML = '⚙️';
    settingsBtn.style.position = 'fixed';
    settingsBtn.style.top = '50%';
    settingsBtn.style.left = '0';
    settingsBtn.style.transform = 'translateY(-50%)';
    settingsBtn.style.zIndex = '1000';
    settingsBtn.style.background = 'none';
    settingsBtn.style.border = 'none';
    settingsBtn.style.fontSize = '24px';
    settingsBtn.style.cursor = 'pointer';
    settingsBtn.onclick = toggleSettings;
    document.body.appendChild(settingsBtn);
    
    // 创建设置弹窗
    const settingsPopup = document.createElement('div');
    settingsPopup.className = 'settings-popup';
    
    const settingsHeader = document.createElement('div');
    settingsHeader.className = 'settings-header';
    settingsHeader.innerHTML = `
        <h3>设置</h3>
        <span class="sound-icon sound-on">🔊</span>
    `;
    
    const backgroundOptions = document.createElement('div');
    backgroundOptions.className = 'background-options';
    backgroundOptions.innerHTML = `
        <div class="background-option selected">
            <img src="background1.jpg" alt="背景1">
        </div>
        <div class="background-option">
            <img src="background2.jpg" alt="背景2">
        </div>
        <div class="background-option">
            <img src="background3.jpg" alt="背景3">
        </div>
        <div class="background-option">
            <img src="background4.jpg" alt="背景4">
        </div>
    `;
    
    settingsPopup.appendChild(settingsHeader);
    settingsPopup.appendChild(backgroundOptions);
    document.body.appendChild(settingsPopup);
    
    // 启动倒计时
    startCountdown(exam);
    
    // 播放默认背景音乐
    const audio = document.createElement('audio');
    audio.src = 'music1.mp3';
    audio.loop = true;
    audio.volume = 0.5;
    audio.play();
    document.body.appendChild(audio);
    
    // 显示广告位
    setTimeout(showAdSpace, 5000);
}

// 显示广告位
function showAdSpace() {
    document.querySelector('.ad-space').style.display = 'flex';
}

// 关闭广告
function closeAd() {
    document.querySelector('.ad-space').style.display = 'none';
}