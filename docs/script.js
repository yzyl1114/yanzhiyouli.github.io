// Homepage: open countdown in a new tab
function openCountdown(page) {
    window.open(page, '_blank');
}

// Countdown Page: Countdown Timer Logic
function startCountdown(examTitle) {
    // 定义每个考试的目标时间
    var targetDate;
    if (examTitle.includes("2024年税务师考试")) {
        targetDate = new Date("2024-11-02T09:00:00");
    } else if (examTitle.includes("2025年国考")) {
        targetDate = new Date("2024-11-24T09:00:00");
    } else if (examTitle.includes("2024年教资面试")) {
        targetDate = new Date("2024-12-07T09:00:00");
    } else if (examTitle.includes("2024年英语四六级考试")) {
        targetDate = new Date("2024-12-14T09:00:00");
    } else if (examTitle.includes("2025年考研初试")) {
        targetDate = new Date("2024-12-21T09:00:00");
    } else if (examTitle.includes("2025年高考")) {
        targetDate = new Date("2025-06-07T09:00:00");
    } else if (examTitle.includes("2025年CPA考试")) {
        targetDate = new Date("2025-08-23T09:00:00");
    } else if (examTitle.includes("2025年法考")) {
        targetDate = new Date("2025-09-20T09:00:00");
    }

    var countDownDate = targetDate.getTime();
    var countdownfunction = setInterval(function() {
        var now = new Date().getTime();
        var distance = countDownDate - now;

        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("days").innerHTML = days;
        document.getElementById("hours").innerHTML = hours;
        document.getElementById("minutes").innerHTML = minutes;
        document.getElementById("seconds").innerHTML = seconds;

        if (distance < 0) {
            clearInterval(countdownfunction);
            document.getElementById("days").innerHTML = "00";
            document.getElementById("hours").innerHTML = "00";
            document.getElementById("minutes").innerHTML = "00";
            document.getElementById("seconds").innerHTML = "00";
        }
    }, 1000);
}

// Countdown Page: Close Ad
function closeAd() {
    document.querySelector('.ad-space').style.display = 'none';
}

// Example: Start countdown based on the exam title
var examTitle = document.title; // 假设标题和考试名称一致
startCountdown(examTitle);

