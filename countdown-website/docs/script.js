// Homepage: open countdown in a new tab
function openCountdown(page) {
    window.open(page, '_blank');
}

// Countdown Page: Countdown Timer Logic
function startCountdown(targetDate) {
    var countDownDate = new Date(targetDate).getTime();
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

// Example: Start countdown for a specific exam date
// For each countdown page, call the function with the relevant date
startCountdown('Dec 21, 2024 09:00:00');
