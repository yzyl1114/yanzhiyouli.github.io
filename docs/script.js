// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 设置当前日期
    setCurrentDate();
    
    // 初始化轮播图
    initBannerCarousel();
    
    // 创建倒计时入口
    createCountdownEntries();
    
    // 显示活动弹窗
    setTimeout(showActivityPopup, 2000);
    
    // 显示广告位
    setTimeout(showAdSpace, 5000);
});

// 设置当前日期
function setCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long',
        timeZone: 'Asia/Shanghai' 
    };
    const currentDateElement = document.querySelector('.current-date');
    currentDateElement.textContent = now.toLocaleDateString('zh-CN', options);
}

// 初始化轮播图
function initBannerCarousel() {
    const banners = document.querySelectorAll('.banner');
    const indicators = document.querySelectorAll('.indicator');
    let currentBannerIndex = 0;
    
    function showBanner(index) {
        banners.forEach((banner, i) => {
            if (i === index) {
                banner.style.left = '0';
                banner.style.opacity = '1';
                banner.classList.add('active');
            } else {
                banner.style.left = '100%';
                banner.style.opacity = '0';
                banner.classList.remove('active');
            }
        });
        
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        currentBannerIndex = index;
    }
    
    function nextBanner() {
        let nextIndex = (currentBannerIndex + 1) % banners.length;
        showBanner(nextIndex);
    }
    
    // 自动轮播
    setInterval(nextBanner, 3000);
    
    // 点击指示器切换
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showBanner(index));
    });
}

// 创建倒计时入口
function createCountdownEntries() {
    const entriesSection = document.querySelector('.entries-section');
    const exams = getExamData();
    
    // 按考试时间排序
    exams.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 将已结束的考试移到末尾
    const now = new Date();
    exams.forEach(exam => {
        exam.ended = new Date(exam.date) < now;
    });
    exams.sort((a, b) => {
        if (a.ended && !b.ended) return 1;
        if (!a.ended && b.ended) return -1;
        return 0;
    });
    
    // 创建入口元素
    exams.forEach(exam => {
        const entry = document.createElement('div');
        entry.className = `entry ${exam.ended ? 'ended' : ''}`;
        entry.dataset.examName = exam.name;
        
        entry.innerHTML = `
            <img src="${exam.image}" alt="${exam.name}">
            ${exam.ended ? '<div class="ended-badge">已结束</div>' : ''}
            <p>${exam.name}</p>
        `;
        
        entry.addEventListener('click', () => openCountdownPage(exam.name));
        entriesSection.appendChild(entry);
    });
}

// 获取考试数据
function getExamData() {
    return [
        {
            name: "中小学教师资格考试（笔试）",
            date: "2025-03-08T09:00:00",
            image: "exam1.png"
        },
        {
            name: "全国计算机等级考试",
            date: "2025-03-29T09:00:00",
            image: "exam2.png"
        },
        {
            name: "中小学教师资格考试（面试）",
            date: "2025-05-17T09:00:00",
            image: "exam3.png"
        },
        {
            name: "同等学力全国统考",
            date: "2025-05-18T09:00:00",
            image: "exam4.png"
        },
        {
            name: "英语四六级考试（口语）",
            date: "2025-05-24T09:00:00",
            image: "exam5.png"
        },
        {
            name: "高考",
            date: "2025-06-07T09:00:00",
            image: "exam6.png"
        },
        {
            name: "英语四六级考试（笔试）",
            date: "2025-06-14T09:00:00",
            image: "exam7.png"
        },
        {
            name: "注册会计师（CPA）考试",
            date: "2025-08-23T09:00:00",
            image: "exam8.png"
        },
        {
            name: "法律职业资格考试（客观题）",
            date: "2025-09-13T09:00:00",
            image: "exam9.png"
        },
        {
            name: "法律职业资格考试（主观题）",
            date: "2025-10-12T09:00:00",
            image: "exam10.png"
        },
        {
            name: "国家公务员考试（笔试）",
            date: "2025-11-29T09:00:00",
            image: "exam11.png"
        },
        {
            name: "硕士研究生招生考试（初试）",
            date: "2025-12-21T09:00:00",
            image: "exam12.png"
        }
    ];
}

// 打开倒计时页面
function openCountdownPage(examName) {
    const exam = getExamData().find(e => e.name === examName);
    if (exam) {
        const url = `countdown.html?exam=${encodeURIComponent(exam.name)}`;
        window.open(url, '_blank');
    }
}

// 显示活动弹窗
function showActivityPopup() {
    const activityPopup = document.querySelector('.activity-popup');
    activityPopup.classList.add('show');
    
    const closePopup = document.querySelector('.close-popup');
    closePopup.addEventListener('click', () => {
        activityPopup.classList.remove('show');
    });
    
    const popupBtn = document.querySelector('.popup-btn');
    popupBtn.addEventListener('click', () => {
        window.open('https://782d7rcbwv2kbxvn6epd9f64d1c6vpu.taobao.com', '_blank');
    });
}

// 显示广告位
function showAdSpace() {
    const adSpace = document.querySelector('.ad-space');
    adSpace.classList.add('show');
    
    const closeAd = document.querySelector('.close-ad');
    closeAd.addEventListener('click', () => {
        adSpace.classList.remove('show');
    });
}

// 轮播图左右切换效果
function initBannerCarousel() {
    const banners = document.querySelectorAll('.banner');
    const indicators = document.querySelectorAll('.indicator');
    let currentBannerIndex = 0;
    const bannerCount = banners.length;
    
    function showBanner(index) {
        // 隐藏当前轮播图
        banners.forEach((banner, i) => {
            banner.style.opacity = '0';
            banner.style.left = i < index ? '-100%' : '100%';
        });
        
        // 显示目标轮播图
        banners[index].style.opacity = '1';
        banners[index].style.left = '0';
        
        // 更新指示器
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        currentBannerIndex = index;
    }
    
    function nextBanner() {
        let nextIndex = (currentBannerIndex + 1) % bannerCount;
        showBanner(nextIndex);
    }
    
    // 自动轮播
    setInterval(nextBanner, 3000);
    
    // 点击指示器切换
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showBanner(index));
    });
    
    // 初始显示第一张轮播图
    showBanner(0);
}