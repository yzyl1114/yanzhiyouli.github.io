// 引入考试数据
import { exams } from './exams.js';
import { supabase } from './js/supabase.js';
import { getUser } from './js/auth.js';

// 当前考试ID
let currentExamId = parseInt(new URLSearchParams(window.location.search).get("id")) || 1;

// 背景图片选项
const backgroundImages = [
    { id: "bg1", url: "images/bg1.jpg" },
    { id: "bg2", url: "images/bg2.jpg" },
    { id: "bg3", url: "images/bg3.jpg" },
    { id: "bg4", url: "images/bg4.jpg" },
    { id: "bg5", url: "images/bg5.jpg" },
    { id: "bg6", url: "images/bg6.jpg" }  
];

// 获取考试数据
function getExamDataById(id) {
    return exams.find(exam => exam.id === id);
}

// 更新倒计时显示
function updateCountdownDisplay(exam) {
    const now = moment().tz("Asia/Shanghai");
    const examTime = moment(exam.date);
    const diff = examTime.diff(now);
    
    if (diff <= 0) {
        document.getElementById("days").textContent = "00";
        document.getElementById("hours").textContent = "00";
        document.getElementById("minutes").textContent = "00";
        document.getElementById("seconds").textContent = "00";
        return;
    }
    
    const duration = moment.duration(diff);
    
    const days = String(Math.floor(duration.asDays())).padStart(2, "0");
    const hours = String(duration.hours()).padStart(2, "0");
    const minutes = String(duration.minutes()).padStart(2, "0");
    const seconds = String(duration.seconds()).padStart(2, "0");
    
    document.getElementById("days").textContent = days;
    document.getElementById("hours").textContent = hours;
    document.getElementById("minutes").textContent = minutes;
    document.getElementById("seconds").textContent = seconds;
}

// 格式化考试时间显示
function formatExamTime(exam) {
    const examTime = moment(exam.date);
    return `${examTime.format("YYYY年MM月DD日")} ${examTime.format("HH:mm")}`;
}

// 把函数改成 async
async function initCountdownPage() {
    const urlParams = new URLSearchParams(location.search);
    const customId = urlParams.get('custom');
    let exam; // 统一 exam 变量

    // 自定义目标
    if (customId) {
        const { data, error } = await supabase
            .from('custom_goals')
            .select('*')
            .eq('id', customId)
            .single();
        if (error || !data) {
            location.href = 'index.html';
            return;
        }
        exam = { name: data.name, date: data.date }; // 统一格式
    } else {
        // 内置考试
        exam = getExamDataById(currentExamId);
        if (!exam) {
            location.href = 'index.html';
            return;
        }
    }

    // 统一渲染
    document.getElementById('exam-title').textContent = exam.name;
    document.getElementById('exam-time').textContent =
        window.dayjs(exam.date).format('YYYY年MM月DD日 HH:mm');

    // 倒计时
    updateCountdownDisplay(exam);
    setInterval(() => updateCountdownDisplay(exam), 1000);

    // 背景图
    const bgSetting = localStorage.getItem('countdownBg') || 'bg1';
    document.getElementById('countdown-bg').style.backgroundImage =
        `url(${getBackgroundUrl(bgSetting)})`;

    // 弹窗/广告/设置
    initSettingsModal();
    showAdContainer();
    document.querySelector('.settings-entry').style.display = 'block';
}

// 获取背景图片URL
function getBackgroundUrl(bgId) {
    const bg = backgroundImages.find(bg => bg.id === bgId);
    if (!bg) {
        console.error(`Background image with id ${bgId} not found.`);
        return "images/default-bg.jpg"; // 提供一个默认背景图
    }
    return bg.url;
}

// 初始化设置弹窗
function initSettingsModal() {
    const settingsModal = document.getElementById("settings-modal");
    
    // 点击设置入口显示弹窗
    document.querySelector(".settings-entry").addEventListener("click", () => {
        settingsModal.style.display = "flex";
    });
    
    // 关闭弹窗按钮
    document.querySelector(".settings-modal .close-modal").addEventListener("click", () => {
        settingsModal.style.display = "none";
    });
    
    // 背景选项点击事件
    document.querySelectorAll(".bg-option").forEach(option => {
      option.addEventListener("click", async () => {
        const bgId = option.dataset.bg;
        // 会员图判断（bg5/bg6 为会员图，按你实际命名改）
        if (['bg5', 'bg6'].includes(bgId)) {
          const user = await getUser(); // 先引入 auth.js
          if (!user || !user.is_member) {
            // 非会员 → 弹出支付
            window.open('member-buy.html', '_blank', 'width=400,height=500,left=200,top=100');
            return;
          }
        }
        const bgUrl = getBackgroundUrl(bgId);
        document.getElementById("countdown-bg").style.backgroundImage = `url(${bgUrl})`;
        localStorage.setItem("countdownBg", bgId);
        document.querySelectorAll(".bg-option").forEach(opt => opt.classList.remove("active"));
        option.classList.add("active");
      });
    });
    
    // 点击弹窗外部关闭弹窗
    window.addEventListener("click", (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = "none";
        }
    });
}

// 显示广告位
function showAdContainer() {
    const adContainer = document.querySelector(".ad-container");
    adContainer.style.display = "block";
    
    // 广告关闭按钮
    document.getElementById("ad-close").addEventListener("click", () => {
        adContainer.style.display = "none";
        // 可以设置定时重新显示
        setTimeout(() => {
            adContainer.style.display = "block";
        }, 600000); // 10分钟后重新显示
    });
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", initCountdownPage);

// 防止页面被嵌套
if (top !== self) {
    top.location = self.location;
}