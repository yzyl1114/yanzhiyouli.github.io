// Homepage: open countdown in a new tab
function openCountdown(exam) {
    window.open(`#${exam}`, '_blank');
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
    document.querySelector('.countdown-time').textContent = 
        `${targetDate.getFullYear()}年${(targetDate.getMonth() + 1).toString().padStart(2, '0')}月${targetDate.getDate().toString().padStart(2, '0')}日${targetDate.getHours().toString().padStart(2, '0')}时${targetDate.getMinutes().toString().padStart(2, '0')}分`;

    var countdownfunction = setInterval(function() {
        const currentTime = new Date().getTime();
        var distance = countDownDate - currentTime;

        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Ensure the numbers are always two digits using padStart()
        document.getElementById("days").innerHTML = String(days).padStart(2, '0');
        document.getElementById("hours").innerHTML = String(hours).padStart(2, '0');
        document.getElementById("minutes").innerHTML = String(minutes).padStart(2, '0');
        document.getElementById("seconds").innerHTML = String(seconds).padStart(2, '0');

        // When the countdown is finished, reset to "00:00:00:00"
        if (distance < 0) {
            clearInterval(countdownfunction);
            document.getElementById("days").innerHTML = "00";
            document.getElementById("hours").innerHTML = "00";
            document.getElementById("minutes").innerHTML = "00";
            document.getElementById("seconds").innerHTML = "00";
        }
    }, 1000); // Update every second
}

// Countdown Page: Close Ad
function closeAd() {
    document.querySelector('.ad-space').style.display = 'none';
}

// Countdown Page: Toggle Settings
function toggleSettings() {
    const settingsPopup = document.querySelector('.settings-popup');
    settingsPopup.classList.toggle('open');
}

// Countdown Page: Toggle Sound
function toggleSound() {
    const soundIcon = document.querySelector('.sound-icon');
    const soundOn = soundIcon.classList.toggle('sound-on');
    if (soundOn) {
        soundIcon.textContent = '🔊';
    } else {
        soundIcon.textContent = '🔇';
    }
}

// Countdown Page: Change Background
function changeBackground(backgroundIndex) {
    const backgroundOptions = document.querySelectorAll('.background-option');
    backgroundOptions.forEach(option => option.classList.remove('selected'));
    document.querySelector(`.background-option:nth-child(${backgroundIndex + 1})`).classList.add('selected');
    
    // Change background and play corresponding music
    document.body.style.backgroundImage = `url('background${backgroundIndex + 1}.jpg')`;
    
    // Stop current music if any
    const currentAudio = document.querySelector('audio');
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.remove();
    }
    
    // Add new audio element
    const audio = document.createElement('audio');
    audio.src = `music${backgroundIndex + 1}.mp3`;
    audio.loop = true;
    audio.volume = 0.5;
    document.body.appendChild(audio);
    audio.play();
}

// Initialize Homepage
function initHomepage() {
    // Set current date
    const currentDate = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    document.querySelector('.current-date').textContent = currentDate.toLocaleDateString('zh-CN', options);

    // Banner carousel
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
    
    // Auto change banner every 3 seconds
    setInterval(nextBanner, 3000);
    
    // Initialize with first banner
    showBanner(1);
    
    // Generate exam entries
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
    
    // Sort exams by date
    exams.sort((a, b) => a.date - b.date);
    
    // Check which exams have ended
    const now = new Date();
    exams.forEach(exam => {
        exam.ended = exam.date <= now;
    });
    
    // Move ended exams to the end
    exams.sort((a, b) => {
        if (a.ended && !b.ended) return 1;
        if (!a.ended && b.ended) return -1;
        return 0;
    });
    
    // Create exam entries
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
    
    // Show activity popup
    setTimeout(() => {
        document.querySelector('.activity-popup').style.display = 'flex';
    }, 1000);
}

// Initialize Countdown Page
function initCountdownPage() {
    // Get exam name from URL hash
    const urlParams = new URLSearchParams(window.location.search);
    const exam = urlParams.get('exam');
    
    // Show settings popup button
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'settings-btn';
    settingsBtn.innerHTML = '☰';
    settingsBtn.style.position = 'fixed';
    settingsBtn.style.top = '20px';
    settingsBtn.style.left = '20px';
    settingsBtn.style.zIndex = '1000';
    settingsBtn.style.background = 'none';
    settingsBtn.style.border = 'none';
    settingsBtn.style.fontSize = '24px';
    settingsBtn.style.cursor = 'pointer';
    settingsBtn.onclick = toggleSettings;
    document.body.appendChild(settingsBtn);
    
    // Create settings popup
    const settingsPopup = document.createElement('div');
    settingsPopup.className = 'settings-popup';
    
    const settingsTitle = document.createElement('h3');
    settingsTitle.textContent = '设置';
    
    const soundSection = document.createElement('div');
    soundSection.className = 'sound-toggle';
    
    const soundText = document.createElement('span');
    soundText.textContent = '背景音乐';
    
    const soundIcon = document.createElement('span');
    soundIcon.className = 'sound-icon sound-on';
    soundIcon.textContent = '🔊';
    soundIcon.onclick = toggleSound;
    
    soundSection.appendChild(soundText);
    soundSection.appendChild(soundIcon);
    
    const backgroundSection = document.createElement('div');
    backgroundSection.className = 'background-options';
    
    for (let i = 0; i < 4; i++) {
        const backgroundOption = document.createElement('div');
        backgroundOption.className = 'background-option';
        if (i === 0) {
            backgroundOption.classList.add('selected');
        }
        
        const backgroundImg = document.createElement('img');
        backgroundImg.src = `background${i + 1}.jpg`;
        backgroundImg.alt = `背景${i + 1}`;
        
        backgroundOption.appendChild(backgroundImg);
        backgroundOption.onclick = () => changeBackground(i);
        
        backgroundSection.appendChild(backgroundOption);
    }
    
    settingsPopup.appendChild(settingsTitle);
    settingsPopup.appendChild(soundSection);
    settingsPopup.appendChild(backgroundSection);
    document.body.appendChild(settingsPopup);
    
    // Start countdown
    startCountdown(exam);
    
    // Play default background music
    const audio = document.createElement('audio');
    audio.src = 'music1.mp3';
    audio.loop = true;
    audio.volume = 0.5;
    audio.play();
    document.body.appendChild(audio);
}

// Initialize the correct page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/index.html') {
        initHomepage();
    } else {
        initCountdownPage();
    }
});