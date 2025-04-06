// 获取当前日期
function updateDate() {
    const date = new Date();
    const dayOfWeek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const currentDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${dayOfWeek[date.getDay()]}`;
    document.getElementById('current-date').textContent = currentDate;
}

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

setInterval(changeBanner, 3000);
changeBanner();  // 初始化展示

// 活动弹窗控制
function closePopup() {
    document.getElementById('promo-popup').style.display = 'none';
}

// 页面加载时弹出活动弹窗
window.onload = function() {
    document.getElementById('promo-popup').style.display = 'flex';
};

// 页面加载时更新当前日期
updateDate();

// 设置倒计时目标时间
const targetDate = new Date("2025-03-08T09:00:00+08:00").getTime();

// 更新倒计时
function updateCountdown() {
    const now = new Date().getTime();
    const timeLeft = targetDate - now;

    if (timeLeft < 0) {
        document.getElementById("days").innerHTML = "00";
        document.getElementById("hours").innerHTML = "00";
        document.getElementById("minutes").innerHTML = "00";
        document.getElementById("seconds").innerHTML = "00";
    } else {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        document.getElementById("days").innerHTML = formatTime(days);
        document.getElementById("hours").innerHTML = formatTime(hours);
        document.getElementById("minutes").innerHTML = formatTime(minutes);
        document.getElementById("seconds").innerHTML = formatTime(seconds);
    }
}

// 格式化时间为两位数
function formatTime(time) {
    return time < 10 ? "0" + time : time;
}

// 每秒更新一次倒计时
setInterval(updateCountdown, 1000);

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
