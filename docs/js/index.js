import { getUser, logout } from './auth.js'
import { getMyCustomGoals, createCustomGoal, deleteCustomGoal } from './custom.js'
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
async function initHomePage() {
    if (typeof moment === 'undefined' || typeof moment.tz === 'undefined') {
        console.error('Moment.js 或 Moment-Timezone 未正确加载');
        return;
    }

    /******************** 新增开始 ********************/
    // 1. 拉取用户信息（含会员状态）
    const user = await getUser();   // 从 auth.js 来

    // 2. 渲染导航栏右侧头像/登录入口
    renderUserBar(user);

    // 3. 渲染自定义目标卡片（会员且额度内才显示“+”卡片）
    await renderCustomCards(user);
    /******************** 新增结束 ********************/

    // 以下是你原有逻辑，一点不动
    updateCurrentDate();
    renderCountdownEntries();
    showActivityModal();

    document.querySelectorAll(".close-modal").forEach(closeBtn => {
        closeBtn.addEventListener("click", () => {
            document.querySelectorAll(".modal").forEach(modal => {
                modal.style.display = "none";
            });
        });
    });

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

// 防止页面被嵌套
if (top !== self) {
    top.location = self.location;
}

// 渲染导航栏右侧头像/登录入口
function renderUserBar(user) {
    const dateContainer = document.querySelector('.date-container');
    const wrap = document.createElement('div');
    wrap.className = 'user-bar';
    wrap.style.marginLeft = 'auto';
    wrap.style.marginRight = '20px';
    wrap.style.cursor = 'pointer';

    if (user) {
        // 已登录
        wrap.innerHTML = `<img src="${user.avatar_url}" style="width:30px;height:30px;border-radius:50%">`;
        wrap.onclick = () => toggleUserPopup(user); // 你后面实现
    } else {
        // 未登录
        wrap.innerHTML = `<img src="images/default-avatar.png" style="width:30px;height:30px;border-radius:50%">`;
        wrap.onclick = () => loginWechat();        // 从 auth.js 来
    }
    dateContainer.after(wrap);
}

// 渲染自定义目标卡片
async function renderCustomCards(user) {
    const grid = document.querySelector('.entry-grid');
    const canCreate = user && user.is_member &&
        (await getMyCustomGoals()).length < (user.member_plan === 'month' ? 3 : 5);

    // 1. 已创建的目标
    const list = await getMyCustomGoals();
    list.forEach(g => {
        const item = document.createElement('div');
        item.className = 'entry-item custom-goal';
        item.innerHTML = `
            <img src="images/custom-plus.jpg" class="entry-image">
            <h3 class="entry-title">${g.name}</h3>
            <i class="edit-icon" style="display:none">✏️</i>
            <i class="del-icon"  style="display:none">🗑️</i>
        `;
        item.onclick = () => location.href = `countdown.html?custom=${g.id}`;
        item.onmouseenter = () => {
            item.querySelector('.edit-icon').style.display = 'block';
            item.querySelector('.del-icon').style.display = 'block';
        };
        item.onmouseleave = () => {
            item.querySelector('.edit-icon').style.display = 'none';
            item.querySelector('.del-icon').style.display = 'none';
        };
        grid.prepend(item);
    });

    // 2. “+” 新建卡片（只有会员且额度内才显示）
    if (canCreate) {
        const plus = document.createElement('div');
        plus.className = 'entry-item custom-plus';
        plus.innerHTML = `
            <img src="images/plus.svg" class="entry-image">
            <h3 class="entry-title">自定义目标</h3>
        `;
        plus.onclick = () => openCustomGoalDialog(); // 你后面实现
        grid.prepend(plus);
    }
}