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

// 动态生成每个考试的倒计时
function generateCountdown() {
    const countdownContainer = document.getElementById('countdown-container');
    exams.forEach(exam => {
        const countdownElement = document.createElement('div');
        countdownElement.classList.add('countdown-item');
        
        countdownElement.innerHTML = `
            <h2>${exam.title}</h2>
            <p class="exam-time">${exam.time}</p>
            <div class="countdown">
                <div class="time-box">
                    <p class="days">00</p>
                    <p>天</p>
                </div>
                <div class="time-box">
                    <p class="hours">00</p>
                    <p>时</p>
                </div>
                <div class="time-box">
                    <p class="minutes">00</p>
                    <p>分</p>
                </div>
                <div class="time-box">
                    <p class="seconds">00</p>
                    <p>秒</p>
                </div>
            </div>
        `;
        countdownContainer.appendChild(countdownElement);

        // 设置倒计时
        const targetDate = new Date(exam.time).getTime();
        setInterval(() => updateCountdown(targetDate, countdownElement), 1000);
    });
}

// 更新倒计时
function updateCountdown(targetDate, element) {
    const now = new Date().getTime();
    const timeLeft = targetDate - now;

    if (timeLeft < 0) {
        element.querySelector(".days").textContent = "00";
        element.querySelector(".hours").textContent = "00";
        element.querySelector(".minutes").textContent = "00";
        element.querySelector(".seconds").textContent = "00";
    } else {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        element.querySelector(".days").textContent = formatTime(days);
        element.querySelector(".hours").textContent = formatTime(hours);
        element.querySelector(".minutes").textContent = formatTime(minutes);
        element.querySelector(".seconds").textContent = formatTime(seconds);
    }
}

// 格式化时间为两位数
function formatTime(time) {
    return time < 10 ? "0" + time : time;
}

// 初始化页面
generateCountdown();

// 设置弹窗的显示
document.getElementById("settings-button").addEventListener("click", () => {
    document.getElementById("settings-popup").style.transform = "translateX(0)";
});

// 关闭设置弹窗
document.getElementById("settings-close").addEventListener("click", () => {
    document.getElementById("settings-popup").style.transform = "translateX(-100%)";
});

// 背景图切换
document.querySelectorAll(".background-item").forEach(item => {
    item.addEventListener("click", function() {
        document.body.style.backgroundImage = `url('${this.getAttribute("data-bg")}')`;
    });
});

// 背景音乐开关
document.getElementById("music-toggle").addEventListener("click", () => {
    const music = document.getElementById("sound-icon");
    if (music.src.includes("sound-icon.png")) {
        music.src = "mute-icon.png"; // 切换图标
        // 假设这里播放音乐
    } else {
        music.src = "sound-icon.png"; // 切换图标
        // 假设这里停止音乐
    }
});
