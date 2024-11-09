// Countdown Page: Start Countdown
function startCountdown(examTitle) {
    // Define target dates for each exam
    var targetDate;
    if (examTitle.includes("2025年计算机二级考试")) {
        targetDate = new Date("2025-03-23T09:00:00");
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

    // Ensure the targetDate is valid
    if (!targetDate || isNaN(targetDate.getTime())) {
        console.error("Invalid target date:", examTitle);
        return;  // Exit the function early
    }

    var countDownDate = targetDate.getTime();
    var countdownfunction = setInterval(function() {
        var now = new Date().getTime();
        var distance = countDownDate - now;

        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Ensure the numbers are always two digits using padStart()
        document.getElementById("days").innerHTML = String(days).padStart(2, '0');
        document.getElementById("hours").innerHTML = String(hours).padStart(2, '0');
        document.getElementById("minutes").innerHTML = String(minutes).padStart(2, '0');
        document.getElementById("seconds").innerHTML = String(seconds).padStart(2, '0');

        // When the countdown is finished, reset to "00:00:00:00"
        if (distance < 0) {
            clearInterval(countdownfunction);
            document.getElementById("days").innerHTML = "00";
            document.getElementById("hours").innerHTML = "00";
            document.getElementById("minutes").innerHTML = "00";
            document.getElementById("seconds").innerHTML = "00";
        }
    }, 1000);

    // Ensure countdown stops if the page is unloaded
    window.addEventListener('beforeunload', function() {
        clearInterval(countdownfunction);
    });
}

// Countdown Page: Close Ad
function closeAd() {
    var adSpace = document.querySelector('.ad-space');
    if (adSpace) {
        adSpace.style.display = 'none';
    } else {
        console.warn('Ad space element not found.');
    }
}

// Example: Start countdown based on the exam title
document.addEventListener('DOMContentLoaded', function() {
    var examTitle = document.title;
    startCountdown(examTitle);
});
