// 引入考试数据
import { exams } from './exams.js';

// 确保 moment 和 moment-timezone 在全局范围内可用
const moment = window.moment;

// 更新当前日期
function updateCurrentDate() {
    const now = moment().tz("Asia/Shanghai");
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const dateStr = `${now.year()}年${now.month() + 1}月${now.date()}日，星期${weekdays[now.day()]}`;
    document.getElementById("current-date").textContent = dateStr;
}

// 根据距离考试时间排序
function sortExamsByProximity(exams) {
    const now = moment().tz("Asia/Shanghai");
    return exams.slice().sort((a, b) => {
        const diffA = moment(a.date).diff(now);
        const diffB = moment(b.date).diff(now);
        return diffA - diffB;
    });
}

// 渲染倒计时入口
function renderCountdownEntries() {
    const entryGrid = document.querySelector(".entry-grid");
    entryGrid.innerHTML = "";
    
    // 排序考试
    const sortedExams = sortExamsByProximity(exams);
    
    sortedExams.forEach(exam => {
        const now = moment().tz("Asia/Shanghai");
        const examTime = moment(exam.date);
        const diff = examTime.diff(now);
        
        const entryItem = document.createElement("div");
        entryItem.className = "entry-item";
        
        if (diff <= 0) {
            entryItem.classList.add("entry-ended");
            
            entryItem.innerHTML = `
                <div class="overlay"></div>
                <div class="ended-badge">已结束</div>
                <img src="${exam.image}" alt="${exam.name}" class="entry-image">
                <h3 class="entry-title">${exam.name}</h3>
            `;
        } else {
            entryItem.innerHTML = `
                <img src="${exam.image}" alt="${exam.name}" class="entry-image">
                <h3 class="entry-title">${exam.name}</h3>
            `;
        }
        
        // 添加点击事件
        entryItem.addEventListener("click", () => {
            window.location.href = `countdown.html?id=${exam.id}`;
        });
        
        entryGrid.appendChild(entryItem);
    });
}

// 显示活动弹窗
function showActivityModal() {
    const activityModal = document.getElementById("activity-modal");
    // 随机决定是否显示弹窗，避免每次访问都弹出
    if (Math.random() > 0.3 && !localStorage.getItem("activityModalShown")) {
        activityModal.style.display = "flex";
        localStorage.setItem("activityModalShown", "true");
    }
}

// 初始化首页
function initHomePage() {
    if (typeof moment === 'undefined' || typeof moment.tz === 'undefined') {
        console.error('Moment.js 或 Moment-Timezone 未正确加载');
        return;
    }
    
    updateCurrentDate();
    renderCountdownEntries();
    showActivityModal();
    
    // 关闭弹窗事件
    document.querySelectorAll(".close-modal").forEach(closeBtn => {
        closeBtn.addEventListener("click", () => {
            document.querySelectorAll(".modal").forEach(modal => {
                modal.style.display = "none";
            });
        });
    });
    
    // 点击弹窗外部关闭弹窗
    window.addEventListener("click", (e) => {
        document.querySelectorAll(".modal").forEach(modal => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    });
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", initHomePage);

// 每分钟更新一次日期
setInterval(updateCurrentDate, 60000);