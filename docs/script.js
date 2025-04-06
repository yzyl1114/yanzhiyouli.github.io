// 获取当前日期
function updateDate() {
    const date = new Date();
    const dayOfWeek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const currentDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${dayOfWeek[date.getDay()]}`;
    document.getElementById('current-date').textContent = currentDate;
}

// 弹窗控制
function closePopup() {
    document.getElementById('promo-popup').style.display = 'none';
}

// 更新倒计时
function updateCountdown(targetDate) {
    const target = new Date(targetDate).getTime();
    const interval = setInterval(function () {
        const now = new Date().getTime();
        const timeLeft = target - now;

        if (timeLeft <= 0) {
            clearInterval(interval);
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        } else {
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        }
    }, 1000);
}

// 初始化
updateDate();
updateCountdown('2025-03-08T09:00:00'); // 示例倒计时，使用你具体的考试时间

// 弹窗显示
document.getElementById('promo-popup').style.display = 'flex';
