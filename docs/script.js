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
