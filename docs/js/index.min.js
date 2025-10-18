import { getUser, logout, loginWechat } from './auth.js'  // 添加 loginWechat 导入
import { getMyCustomGoals, createCustomGoal, deleteCustomGoal, updateCustomGoal } from './custom.js'
import { checkMembershipAndCleanup, getCurrentUser } from './member.js'
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

// 渲染导航栏右侧头像/登录入口
function renderUserBar(user) {
    const container = document.getElementById('user-bar-container');
    if (!container) return;

    // 清空容器
    container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'user-bar';
    wrap.style.cssText = `
        margin-left: auto;
        margin-right: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
    `;

    if (user) {
        // 已登录用户的显示逻辑（保持原样）
        let userStatus = '普通用户';
        let statusStyle = 'color: #666; font-size: 12px;';
        
        if (user.is_member) {
            const now = new Date();
            const expiryDate = user.member_expires_at ? new Date(user.member_expires_at) : null;
            
            if (expiryDate && expiryDate < now) {
                userStatus = '会员已过期';
                statusStyle = 'color: #ff6b6b; font-size: 12px;';
            } else {
                userStatus = user.member_plan === 'month' ? '基础版会员' : '尊享版会员';
                statusStyle = 'color: #4a6bff; font-size: 12px;';
                
                if (expiryDate) {
                    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
                    userStatus += ` (${daysLeft}天)`;
                }
            }
        }
        
        wrap.innerHTML = `
            <div style="text-align: right;">
                <div style="font-size: 14px; font-weight: 500;">${user.username || '用户'}</div>
                <div style="${statusStyle}">${userStatus}</div>
            </div>
            <img src="${user.avatar_url || 'images/default-avatar.png'}" 
                 style="width:30px;height:30px;border-radius:50%;border: 2px solid ${user.is_member ? '#4a6bff' : '#ddd'};">
        `;
        wrap.onclick = () => toggleUserPopup(user);
    } else {
        // 未登录用户的显示逻辑
        wrap.innerHTML = `
            <div style="text-align: right;">
                <div style="font-size: 14px; font-weight: 500;">未登录</div>
                <div style="color: #666; font-size: 12px;">点击登录</div>
            </div>
            <img src="images/default-avatar.png" 
                 style="width:30px;height:30px;border-radius:50%;border: 2px solid #ddd;">
        `;
        wrap.onclick = () => loginWechat();
    }
    
    container.appendChild(wrap);
}

// 切换用户弹窗
function toggleUserPopup(user) {
    // 移除现有的弹窗
    const existingPopup = document.querySelector('.user-popup');
    if (existingPopup) {
        existingPopup.remove();
        return;
    }

    const popup = document.createElement('div');
    popup.className = 'user-popup';
    popup.style.cssText = `
        position: absolute;
        top: 60px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        padding: 16px;
        z-index: 1000;
        min-width: 200px;
        border: 1px solid #eee;
    `;

    let membershipInfo = '';
    if (user.is_member) {
        const expiryDate = user.member_expires_at ? new Date(user.member_expires_at) : null;
        const now = new Date();
        
        if (expiryDate && expiryDate < now) {
            membershipInfo = `
                <div style="color: #ff6b6b; font-size: 12px; margin: 8px 0; padding: 8px; background: #fff5f5; border-radius: 4px;">
                    ⚠️ 会员已过期
                </div>
            `;
        } else {
            const daysLeft = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : 0;
            membershipInfo = `
                <div style="color: #4a6bff; font-size: 12px; margin: 8px 0; padding: 8px; background: #f6f9ff; border-radius: 4px;">
                    ✅ ${user.member_plan === 'month' ? '基础版' : '尊享版'}会员
                    <br>剩余 ${daysLeft} 天
                </div>
            `;
        }
    }

    popup.innerHTML = `
        <div style="font-weight: 500; margin-bottom: 12px;">账户信息</div>
        ${membershipInfo}
        <div style="display: flex; gap: 8px; margin-top: 12px;">
            ${!user.is_member ? `
                <button onclick="location.href='member-buy.html'" 
                        style="flex:1; padding: 8px 12px; background: #4a6bff; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">
                    开通会员
                </button>
            ` : ''}
            <button onclick="handleLogout()" 
                    style="flex:1; padding: 8px 12px; background: #f5f5f5; color: #666; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">
                退出登录
            </button>
        </div>
    `;

    document.body.appendChild(popup);

    // 点击外部关闭弹窗
    setTimeout(() => {
        const closePopup = (e) => {
            if (!popup.contains(e.target) && !e.target.closest('.user-bar')) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        };
        document.addEventListener('click', closePopup);
    }, 100);
}

// 处理退出登录
async function handleLogout() {
    try {
        await logout();
        location.reload();
    } catch (error) {
        console.error('退出登录失败:', error);
    }
}

async function checkMembershipOnLogin() {
    try {
        console.log('登录时检查会员状态...')
        const user = await getCurrentUser()
        
        if (!user) {
            console.log('用户未登录，跳过检查')
            return
        }
        
        // 检查会员状态
        const now = new Date()
        const isMemberExpired = user.member_expires_at && new Date(user.member_expires_at) < now
        const isValidMember = user.is_member && !isMemberExpired
        
        console.log('会员状态检查结果:', {
            is_member: user.is_member,
            isMemberExpired: isMemberExpired,
            isValidMember: isValidMember
        })
        
    } catch (error) {
        console.error('会员状态检查失败:', error)
    }
}

// 渲染自定义目标卡片
async function renderCustomCards(user) {
    const grid = document.querySelector('.entry-grid')
    
    // 清理现有的自定义目标卡片
    document.querySelectorAll('.custom-goal, .custom-plus').forEach(el => el.remove())
    
    if (!user) return

    try {
        // 严格的会员验证：检查是否有效会员
        const now = new Date()
        const isMemberExpired = user.member_expires_at && new Date(user.member_expires_at) < now
        const isValidMember = user.is_member && !isMemberExpired
        
        console.log('渲染自定义目标前的会员验证:', {
            isValidMember: isValidMember,
            is_member: user.is_member, 
            isMemberExpired: isMemberExpired
        })
        
        // 如果不是有效会员，完全不渲染任何自定义目标
        if (!isValidMember) {
            console.log('用户不是有效会员，跳过渲染所有自定义目标')
            return
        }

        const customGoals = await getMyCustomGoals()
        console.log('获取到的自定义目标:', customGoals)
        
        // 1. 渲染已创建的目标（只有有效会员才会执行到这里）
        customGoals.forEach(goal => {
            const item = document.createElement('div')
            item.className = 'entry-item custom-goal'
            item.setAttribute('data-goal-id', goal.id)
            item.innerHTML = `
                <img src="images/custom-plus.jpg" class="entry-image">
                <h3 class="entry-title">${goal.name}</h3>
                <i class="edit-icon" style="display:none">✏️</i>
                <i class="del-icon" style="display:none">🗑️</i>
            `
            
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('del-icon')) {
                    e.stopPropagation()
                    deleteCustomGoal(goal.id)
                    return
                }
                if (e.target.classList.contains('edit-icon')) {
                    e.stopPropagation()
                    editCustomGoal(goal)
                    return
                }
                window.location.href = `countdown.html?custom=${goal.id}`
            })
            
            item.addEventListener('mouseenter', () => {
                const editIcon = item.querySelector('.edit-icon')
                const delIcon = item.querySelector('.del-icon')
                if (editIcon) editIcon.style.display = 'block'
                if (delIcon) delIcon.style.display = 'block'
            })
            
            item.addEventListener('mouseleave', () => {
                const editIcon = item.querySelector('.edit-icon')
                const delIcon = item.querySelector('.del-icon')
                if (editIcon) editIcon.style.display = 'none'
                if (delIcon) delIcon.style.display = 'none'
            })

            grid.prepend(item)
        })

        // 2. 检查是否可以创建新目标（只有有效会员才会显示+号）
        const maxGoals = user.member_plan === 'month' ? 3 : 5
        const canCreate = customGoals.length < maxGoals
        
        if (canCreate) {
            const plus = document.createElement('div')
            plus.className = 'entry-item custom-plus'
            plus.innerHTML = `
                <img src="images/plus.svg" class="entry-image">
                <h3 class="entry-title">自定义目标</h3>
            `
            plus.onclick = () => openCustomGoalDialog()
            grid.prepend(plus)
        }
        
    } catch (error) {
        console.error('渲染自定义目标失败:', error)
    }
}

// 打开自定义目标对话框
function openCustomGoalDialog() {
    // 这里实现打开创建自定义目标的对话框
    const goalName = prompt('请输入目标名称:');
    if (goalName && goalName.trim()) {
        createCustomGoal(goalName.trim());
    }
}

// 编辑自定义目标
function editCustomGoal(goal) {
    const newName = prompt('修改目标名称:', goal.name);
    if (newName && newName.trim() && newName !== goal.name) {
        // 这里需要实现更新自定义目标的函数
        console.log('编辑目标:', goal.id, '新名称:', newName);
        // updateCustomGoal(goal.id, { name: newName });
    }
}

// 会员状态监控
async function monitorMembershipStatus() {
    try {
        console.log('开始监控会员状态...');
        const cleanupPerformed = await checkMembershipAndCleanup();
        
        if (cleanupPerformed) {
            // 如果执行了清理操作，刷新页面
            console.log('会员状态变化，刷新页面...');
            setTimeout(() => {
                location.reload();
            }, 1000);
        }
    } catch (error) {
        console.error('会员状态监控失败:', error);
    }
}

// 初始化首页
async function initHomePage() {
    if (typeof moment === 'undefined' || typeof moment.tz === 'undefined') {
        console.error('Moment.js 或 Moment-Timezone 未正确加载');
        return;
    }

    console.log('开始初始化首页...');

    try {
        // 1. 获取用户信息
        const user = await getUser();
        console.log('用户信息:', user);

        // 2. 渲染导航栏用户信息
        renderUserBar(user);

        // 3. 检查会员状态并清理过期目标
        await checkMembershipOnLogin();

        // 4. 渲染自定义目标卡片
        await renderCustomCards(user);

        // 5. 渲染基础内容
        updateCurrentDate();
        renderCountdownEntries();
        showActivityModal();

        // 6. 绑定事件
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

        // ① 立即执行一次会员过期检查 & 清理
        await monitorMembershipStatus();
        // ② 每 60 秒轮询一次（可自己改）
        setInterval(monitorMembershipStatus, 60_000);

        console.log('首页初始化完成');

    } catch (error) {
        console.error('首页初始化失败:', error);
    }
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", initHomePage);

// 每分钟更新一次日期
setInterval(updateCurrentDate, 60000);

// 防止页面被嵌套
if (top !== self) {
    top.location = self.location;
}

// 全局函数供HTML调用
window.handleLogout = handleLogout;
window.openCustomGoalDialog = openCustomGoalDialog;