// 获取当前日期
function updateDate() {
    const date = new Date();
    const dayOfWeek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    const currentDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${dayOfWeek[date.getDay()]}`;
    document.getElementById('current-date').textContent = currentDate;
}

// 倒计时入口的考试时间和状态处理
const examEntries = [
    { title: "中小学教师资格考试（笔试）", image: "docs-images-exams-teacher.jpg", date: "2025-03-08T09:00:00" },
    { title: "全国计算机等级考试", image: "docs-images-exams-computer.jpg", date: "2025-03-29T09:00:00" },
    { title: "中小学教师资格考试（面试）", image: "docs-images-exams-interview.jpg", date: "2025-05-17T09:00:00" },
    { title: "同等学力全国统考", image: "docs-images-exams-degree.jpg", date: "2025-05-18T09:00:00" },
    { title: "英语四六级考试（口语）", image: "docs-images-exams-speaking.jpg", date: "2025-05-24T09:00:00" },
    { title: "高考", image: "docs-images-exams-gaokao.jpg", date: "2025-06-07T09:00:00" },
    { title: "英语四六级考试（笔试）", image: "docs-images-exams-writing.jpg", date: "2025-06-14T09:00:00" },
    { title: "注册会计师（CPA）考试", image: "docs-images-exams-cpa.jpg", date: "2025-08-23T09:00:00" },
    { title: "法律职业资格考试（客观题）", image: "docs-images-exams-law1.jpg", date: "2025-09-13T09:00:00" },
    { title: "法律职业资格考试（主观题）", image: "docs-images-exams-law2.jpg", date: "2025-10-12T09:00:00" },
    { title: "国家公务员考试（笔试）", image: "docs-images-exams-civil.jpg", date: "2025-11-29T09:00:00" },
    { title: "硕士研究生招生考试（初试）", image: "docs-images-exams-master.jpg", date: "2025-12-21T09:00:00" }
];

// 排序并渲染倒计时入口
function renderExamEntries() {
    const now = new Date();
    const sortedEntries = examEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    const entriesContainer = document.getElementById('countdown-entries');
    entriesContainer.innerHTML = '';

    sortedEntries.forEach((entry) => {
        const entryDiv = document.createElement('div');
        entryDiv.classList.add('entry');
        const examDate = new Date(entry.date);
        const isEnded = examDate <= now;
        const entryCard = `
            <div class="entry-card ${isEnded ? 'ended' : ''}">
                <div class="entry-image" style="background-image: url('${entry.image}');"></div>
                <p>${entry.title}</p>
            </div>
        `;
        entryDiv.innerHTML = entryCard;
        entriesContainer.appendChild(entryDiv);
    });
}

// 初始化页面
window.onload = function() {
    renderExamEntries();
    updateDate();
};

// 弹窗控制
function closePopup() {
    document.getElementById('promo-popup').style.display = 'none';
}

// 页面加载时弹出活动弹窗
window.onload = function() {
    document.getElementById('promo-popup').style.display = 'flex';
};
