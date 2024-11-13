// Khi trang được tải, popup phải ẩn đi
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("info-popup").style.display = "none";
    document.getElementById("support-popup").style.display = "none";  // Ẩn popup hỗ trợ khi tải trang
});

// Mở popup Tìm hiểu khi nhấn vào "Tìm hiểu"
document.getElementById("learn-more").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("info-popup").style.display = "flex"; // Hiển thị popup Tìm hiểu
});

// Mở popup Hỗ trợ khi nhấn vào "Hỗ trợ"
document.getElementById("support-link").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("support-popup").style.display = "flex"; // Hiển thị popup hỗ trợ
});

// Đóng popup Tìm hiểu
function closePopup() {
    document.getElementById("info-popup").style.display = "none";
}

// Đóng popup Hỗ trợ
function closeSupportPopup() {
    document.getElementById("support-popup").style.display = "none";
}
